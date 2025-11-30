# Node.js + Express + MySQL Boilerplate

## Quick Start

```bash
git clone <repo-url>
cd project
cp .env.example .env
npm install
npm run dev
```

---

# RAG (Retrieval-Augmented Generation) Setup

## Prerequisites

- Python 3.9 이상
- OpenAI API Key (.env 폴더에 저장)

### 1. 사전 준비

```bash
cd src/rag
# 가상환경 생성
python -m venv venv
# 가상환경 활성화
venv\Scripts\activate # Windows
source venv/bin/activate # macOS/Linux
# 패키지 설치
pip install -r ../../requirements.txt
```

**폴더 구조:**
```
src/rag/
├── ingest.py              # 데이터 수집 및 임베딩
├── chatbot.py             # 챗봇 실행
├── static_data.py         # 정적 데이터 (학사일정, 건물정보 등)
├── crawler/               # 크롤러 모듈
│   ├── __init__.py
│   └── cse_notice.py      # 소프트웨어학과 공지 크롤러
├── pdf_doc/               # PDF 문서 관리
│   ├── new/               # 새로운 PDF (임베딩 대상)
│   └── processed/         # 처리 완료 PDF (자동 이동)
├── chroma_db/             # 벡터 DB (자동 생성)
├── crawled_data.json      # 크롤링 기록 (자동 생성)
└── latest_notices.json    # 최신 공지 3개 (자동 생성)
```

### 2. 데이터 수집 및 임베딩 (ingest.py)

#### 기본 실행 (크롤링 + 정적데이터)

```bash
python ingest.py
```

#### 실행 옵션

```bash
# PDF 문서 포함 (pdf_doc/new/ 폴더의 PDF 자동 처리)
python ingest.py --pdf

# 크롤링 스킵 (정적 데이터만)
python ingest.py --no-crawl

# 정적 데이터 스킵 (크롤링만)
python ingest.py --no-static

# 새로운 DB 생성 (기존 DB 덮어쓰기)
python ingest.py --create

# 조합 예시: PDF만 처리 (크롤링/정적데이터 스킵)
python ingest.py --pdf --no-crawl --no-static
```

#### 실행 흐름

1. **기존 데이터 로드**: `crawled_data.json`에서 이미 크롤링한 공지 확인
2. **크롤링 실행**: 각 게시판에서 새 공지만 수집
3. **최신 공지 업데이트**: 전체 게시판 통합 최신 3개를 `latest_notices.json`에 저장
4. **정적 데이터 로드**: `static_data.py`에서 학사일정, 건물정보 등 로드
5. **PDF 처리**: `pdf_doc/new/` 폴더의 PDF를 처리 후 `processed/`로 이동
6. **청크 분할**: 문서를 800자 단위로 분할 (200자 오버랩)
7. **임베딩 및 저장**: OpenAI embeddings로 벡터화하여 ChromaDB에 저장

### 2-1. PDF 문서 추가 방법
```bash
# PDF 문서를 위한 폴더 생성 (자동 생성되지만 수동으로 만들어도 됨)
mkdir -p pdf_doc/new
mkdir -p pdf_doc/processed
```

1. PDF 파일을 `pdf_doc/new/` 폴더에 복사
2. `python ingest.py --pdf` 실행
3. 처리 완료된 PDF는 자동으로 `pdf_doc/processed/`로 이동

**주의:**
- 같은 PDF를 다시 `new/` 폴더에 넣으면 중복 임베딩됨
- 처리 완료된 PDF는 삭제해도 됨 (벡터DB에 이미 저장됨)
- 단, 재처리가 필요할 수 있으니 백업 권장

### 2-2. 정적 데이터 수정 방법

1. `static_data.py` 파일 열기
2. 텍스트 내용 수정 (학사일정, 건물정보 등)
3. 크롤링 없이 정적 데이터만 업데이트:
   ```bash
   python ingest.py --no-crawl
   ```

### 3. 챗봇 실행 (chatbot.py)

```bash
python chatbot.py
```

### 4. 정기 업데이트

```bash
# 매일 또는 매주 실행하여 새 공지사항 수집
python ingest.py

# 결과: 
# - 새 공지만 크롤링되어 추가됨
# - latest_notices.json 자동 업데이트
# - 중복 없이 벡터DB 업데이트
```

---
## 문제 해결

### ChromaDB 초기화

```bash
# 벡터DB를 완전히 초기화하고 처음부터
rm -rf chroma_db/
python ingest.py --create
```

### 크롤링 기록 초기화

```bash
# 모든 공지를 다시 크롤링하고 싶을 때
rm crawled_data.json
python ingest.py
```

### 가상환경 문제

```bash
# 가상환경 삭제 후 재생성
rm -rf venv/
python -m venv venv
venv\Scripts\activate
pip install -r ../../requirements.txt
```

---

## 성능 최적화 팁

### 1. 청크 크기 조정 (`ingest.py`)

```python
# 공지사항이 짧은 경우
chunk_size=400,    # 기본: 800
chunk_overlap=100  # 기본: 200
```

### 2. 검색 개수 조정 (`chatbot.py`)

```python
# 검색 결과 개수 조절
retriever = vectordb.as_retriever(search_kwargs={"k": 3})  # 기본: 5
```

### 3. 메타데이터 필터링 (`chatbot.py`)

```python
# 특정 게시판만 검색
retriever = vectordb.as_retriever(
    search_kwargs={
        "k": 5,
        "filter": {"board_name": "소프트웨어학과"}
    }
)
```

---

## 새로운 크롤러 추가 방법

### 1. 크롤러 작성

```python
# crawler/dorm_notice.py
def crawl_notices(max_pages=20, delay=2, existing_post_nums=None):
    # 크롤링 로직
    return notices

def notices_to_documents(notices):
    # Document 변환
    return docs
```

### 2. ingest.py에 추가

```python
# notice_crawlers 리스트에 추가
notice_crawlers = [
    {
        "board_name": "소프트웨어학과",
        "crawl_func": crawl_notices,
        "notices_to_docs_func": notices_to_documents,
        "crawl_kwargs": {"max_pages": 30, "delay": 2}
    },
    {
        "board_name": "기숙사",  # 새로 추가!
        "crawl_func": crawl_dorm_notices,
        "notices_to_docs_func": dorm_notices_to_documents,
        "crawl_kwargs": {"max_pages": 20, "delay": 2}
    }
]
```

### 3. 실행

```bash
python ingest.py
```

완료! 새 게시판의 공지도 자동으로 수집되고 `latest_notices.json`에 포함됩니다.

---

## 라이센스

MIT