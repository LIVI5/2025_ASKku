import os
import json
from typing import List, Set, Dict, Callable
from dotenv import load_dotenv

# 환경변수 로드
current_file_path = os.path.abspath(__file__)
project_root = os.path.abspath(os.path.join(os.path.dirname(current_file_path), '..', '..'))
dotenv_path = os.path.join(project_root, '.env')
load_dotenv(dotenv_path)

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

# 크롤러 모듈 import
from crawler.cse_notice import crawl_notices as crawl_cse, notices_to_documents as cse_ntd
from crawler.sw_notice import crawl_notices as crawl_sw, notices_to_documents as sw_ntd

PDF_PATH = "26_2_ex.pdf"
PERSIST_DIR = "chroma_db"
CRAWLED_DATA_FILE = "crawled_data.json"  # 게시판별 post_num 저장
LATEST_NOTICES_FILE = "latest_notices.json" # 최신 공지사항 저장

def clean_text(text: str) -> str:
    """텍스트 인코딩 정리"""
    if text is None:
        return ""
    return text.encode("utf-8", "ignore").decode("utf-8", "ignore")

def load_crawled_data() -> Dict[str, Set[str]]:
    """
    이미 크롤링한 데이터 로드
    
    Returns:
        dict: {"소프트웨어학과": {"909", "908", ...}, "기숙사": {...}, ...}
    """
    if os.path.exists(CRAWLED_DATA_FILE):
        try:
            with open(CRAWLED_DATA_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # list를 set으로 변환
                return {board: set(nums) for board, nums in data.items()}
        except Exception as e:
            print(f"⚠️ Error loading crawled data: {e}")
            return {}
    return {}

def save_crawled_data(crawled_data: Dict[str, Set[str]]):
    """
    크롤링한 데이터 저장
    
    Args:
        crawled_data: {"소프트웨어학과": {"909", "908", ...}, ...}
    """
    try:
        # set을 list로 변환하여 JSON 저장
        data_to_save = {board: list(nums) for board, nums in crawled_data.items()}
        
        with open(CRAWLED_DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data_to_save, f, ensure_ascii=False, indent=2)
        
        total_count = sum(len(nums) for nums in crawled_data.values())
        print(f"💾 Saved crawled data: {total_count} posts from {len(crawled_data)} boards")
        
    except Exception as e:
        print(f"❌ Error saving crawled data: {e}")
        
def update_latest_notices(board_name: str, notices: List[dict], top_n: int = 3):
    """
    최신 공지사항 업데이트
    
    Args:
        board_name: 게시판 이름
        notices: 크롤링한 공지사항 리스트
        top_n: 저장할 최신 공지 개수
    """
    try:
        # 기존 데이터 로드
        if os.path.exists(LATEST_NOTICES_FILE):
            with open(LATEST_NOTICES_FILE, 'r', encoding='utf-8') as f:
                latest_data = json.load(f)
        else:
            latest_data = {}
        
        # 날짜순 정렬 (최신순)
        sorted_notices = sorted(
            notices,
            key=lambda x: x.get('date', '1970-01-01'),
            reverse=True
        )
        
        # 상위 top_n개만 선택
        top_notices = []
        for notice in sorted_notices[:top_n]:
            top_notices.append({
                'title': notice.get('title', ''),
                'date': notice.get('date', ''),
                'post_num': notice.get('post_num', ''),
                'link': notice.get('link', '')
            })
        
        # 해당 게시판 데이터 업데이트
        latest_data[board_name] = top_notices
        
        # 저장
        with open(LATEST_NOTICES_FILE, 'w', encoding='utf-8') as f:
            json.dump(latest_data, f, ensure_ascii=False, indent=2)
        
        print(f"📌 Updated latest {top_n} notices for {board_name}")
        
    except Exception as e:
        print(f"⚠️ Error updating latest notices: {e}")

def load_pdf_documents() -> List:
    """PDF 파일을 LangChain Document로 변환"""
    if not os.path.exists(PDF_PATH):
        print(f"PDF {PDF_PATH} not found, skipping.")
        return []
    
    print(f"Loading PDF: {PDF_PATH}")
    pdf_loader = PyPDFLoader(PDF_PATH)
    pdf_docs = pdf_loader.load()
    
    for d in pdf_docs:
        d.page_content = clean_text(d.page_content)
        d.metadata["source_type"] = "pdf"
    
    print(f"Loaded {len(pdf_docs)} pages from PDF")
    return pdf_docs

def process_crawler(
    board_name: str,
    crawl_func: Callable,
    notices_to_docs_func: Callable,
    existing_post_nums: Set[str],
    crawl_kwargs: dict = None
) -> tuple[List[Document], Set[str]]:
    """
    범용 크롤러 처리 함수
    
    Args:
        board_name: 게시판 이름 (예: "소프트웨어학과", "기숙사")
        crawl_func: 크롤링 함수
        notices_to_docs_func: notices를 Document로 변환하는 함수
        existing_post_nums: 기존에 크롤링한 post_num set
        crawl_kwargs: 크롤러에 전달할 추가 인자
    
    Returns:
        tuple: (documents, new_post_nums)
    """
    print(f"\n{'='*60}")
    print(f"🔍 Crawling {board_name} Notices...")
    print(f"{'='*60}")
    
    if crawl_kwargs is None:
        crawl_kwargs = {}
    
    try:
        # 크롤링 실행
        notices = crawl_func(existing_post_nums=existing_post_nums, **crawl_kwargs)
        
        if not notices:
            print(f"⚠️ No new {board_name} notices found")
            return [], set()
        
        # 최신 공지사항 업데이트 (최신 3개)
        update_latest_notices(board_name, notices, top_n=3)
        
        # Document로 변환
        docs = notices_to_docs_func(notices)
        
        # 텍스트 정리 및 메타데이터 추가
        for d in docs:
            d.page_content = clean_text(d.page_content)
            # source_type에 게시판 정보 추가
            d.metadata["source_type"] = f"{board_name}_notice"
            d.metadata["board_name"] = board_name
        
        # 새로 크롤링한 post_num 수집
        new_post_nums = {n['post_num'] for n in notices}
        
        print(f"✅ Successfully crawled {len(notices)} {board_name} notices")
        return docs, new_post_nums
        
    except Exception as e:
        print(f"❌ Error crawling {board_name} notices: {e}")
        import traceback
        traceback.print_exc()
        return [], set()

def load_crawler_documents(crawled_data: Dict[str, Set[str]]) -> tuple[List[Document], Dict[str, Set[str]]]:
    """
    여러 크롤러에서 데이터 수집 및 Document 변환
    
    Args:
        crawled_data: {"소프트웨어학과": {"909", ...}, "기숙사": {...}, ...}
    
    Returns:
        tuple: (all_documents, updated_crawled_data)
    """
    all_docs = []
    updated_data = crawled_data.copy()
    
    # 크롤러 설정 리스트
    crawlers = [
        {
            "board_name": "소프트웨어학과",
            "crawl_func": crawl_cse,
            "notices_to_docs_func": cse_ntd,
            "crawl_kwargs": {
                "max_pages": 3,
                "delay": 2
            }
        },
        {
            "board_name": "소프트웨어융합대학",
            "crawl_func": crawl_sw,
            "notices_to_docs_func": sw_ntd,
            "crawl_kwargs": {
                "max_pages": 3,
                "delay": 2
            }
        },
        # 기숙사 크롤러 추가 시 (예시)
        # {
        #     "board_name": "기숙사",
        #     "crawl_func": crawl_dorm_notices,
        #     "notices_to_docs_func": dorm_notices_to_documents,
        #     "crawl_kwargs": {
        #         "max_pages": 20,
        #         "delay": 2
        #     }
        # },
        # 도서관 크롤러 추가 시 (예시)
        # {
        #     "board_name": "도서관",
        #     "crawl_func": crawl_library_notices,
        #     "notices_to_docs_func": library_notices_to_documents,
        #     "crawl_kwargs": {
        #         "max_pages": 15,
        #         "delay": 2
        #     }
        # },
    ]
    
    # 각 크롤러 실행
    for crawler_config in crawlers:
        board_name = crawler_config["board_name"]
        existing_nums = updated_data.get(board_name, set())
        
        docs, new_nums = process_crawler(
            board_name=board_name,
            crawl_func=crawler_config["crawl_func"],
            notices_to_docs_func=crawler_config["notices_to_docs_func"],
            existing_post_nums=existing_nums,
            crawl_kwargs=crawler_config["crawl_kwargs"]
        )
        
        if docs:
            all_docs.extend(docs)
            # 기존 번호 + 새 번호 합치기
            updated_data[board_name] = existing_nums | new_nums
    
    return all_docs, updated_data

def split_documents(docs: List) -> List:
    """문서를 작은 청크로 분할"""
    print(f"\n📄 Splitting documents into chunks...")
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=100,
    )
    chunks = splitter.split_documents(docs)
    print(f"Created {len(chunks)} chunks from {len(docs)} documents")
    return chunks

def build_vectorstore(chunks: List, mode: str = "create"):
    """
    벡터스토어 생성 또는 업데이트
    
    Args:
        chunks: 문서 청크 리스트
        mode: "create" (새로 만들기) 또는 "update" (기존에 추가)
    """
    print(f"\n🔮 Building vector store...")
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    
    if mode == "update" and os.path.exists(PERSIST_DIR):
        # 기존 벡터스토어에 추가
        print(f"Updating existing vector store at {PERSIST_DIR}")
        vectordb = Chroma(
            embedding_function=embeddings,
            persist_directory=PERSIST_DIR,
        )
        vectordb.add_documents(chunks)
    else:
        # 새로 생성
        print(f"Creating new vector store at {PERSIST_DIR}")
        vectordb = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=PERSIST_DIR,
        )
    
    vectordb.persist()
    print(f"✅ Vector store saved to: {PERSIST_DIR}")
    return vectordb

def main(
    include_pdf: bool = False,
    include_crawlers: bool = True,
    update_mode: bool = True
):
    """
    메인 실행 함수
    
    Args:
        include_pdf: PDF 문서 포함 여부
        include_crawlers: 크롤러 실행 여부
        update_mode: True면 기존 DB에 추가, False면 새로 생성
    """
    print(f"\n{'='*60}")
    print("🚀 Starting SKKU RAG Ingest Pipeline")
    print(f"{'='*60}")
    
    all_docs = []
    
    # 1. 기존 크롤링 데이터 로드
    crawled_data = load_crawled_data()
    total_existing = sum(len(nums) for nums in crawled_data.values())
    print(f"\n📋 Loaded existing crawled data:")
    for board, nums in crawled_data.items():
        print(f"  - {board}: {len(nums)} posts")
    print(f"  Total: {total_existing} posts")
    
    # 2. PDF 로드 (선택사항)
    if include_pdf:
        docs_pdf = load_pdf_documents()
        all_docs.extend(docs_pdf)
    
    # 3. 크롤러 실행
    if include_crawlers:
        docs_crawler, updated_data = load_crawler_documents(crawled_data)
        all_docs.extend(docs_crawler)
        
        # 데이터가 업데이트되었으면 저장
        if updated_data != crawled_data:
            save_crawled_data(updated_data)
    
    # 4. 문서가 없으면 종료
    if not all_docs:
        print(f"\n⚠️ No new documents to process. Exiting.")
        return
    
    print(f"\n📚 Total new documents loaded: {len(all_docs)}")
    
    # 5. 청크 분할
    chunks = split_documents(all_docs)
    
    # 6. 벡터스토어 생성/업데이트
    mode = "update" if update_mode else "create"
    build_vectorstore(chunks, mode=mode)
    
    print(f"\n{'='*60}")
    print("✨ Ingest pipeline completed successfully!")
    print(f"{'='*60}")
    print(f"📊 Summary:")
    print(f"  - New documents: {len(all_docs)}")
    print(f"  - Chunks: {len(chunks)}")
    print(f"  - Vector DB: {PERSIST_DIR}")
    print(f"  - Mode: {mode}")
    print(f"\n💡 You can now run chatbot.py to test the RAG system!")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="SKKU RAG Ingest Pipeline")
    parser.add_argument("--pdf", action="store_true", help="Include PDF documents")
    parser.add_argument("--no-crawl", action="store_true", help="Skip crawling")
    parser.add_argument("--create", action="store_true", help="Create new DB (default: update)")
    
    args = parser.parse_args()
    
    main(
        include_pdf=args.pdf,
        include_crawlers=not args.no_crawl,
        update_mode=not args.create
    )