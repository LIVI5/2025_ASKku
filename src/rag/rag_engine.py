import os
import json
from typing import List, Dict, Optional
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

load_dotenv()
PERSIST_DIR = "chroma_db"


def clean_text(text: str) -> str:
    """텍스트 인코딩 정리"""
    if text is None:
        return ""
    return text.encode("utf-8", "ignore").decode("utf-8", "ignore")


def get_retriever(score_threshold: float = 0.5):
    """벡터 DB에서 리트리버 생성"""
    vectordb = Chroma(
        persist_directory=PERSIST_DIR,
        embedding_function=OpenAIEmbeddings(model="text-embedding-3-small"),
    )
    return vectordb.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={
            "score_threshold": score_threshold,
            "k": 5
        }
    )


def format_timetable(timetable: List[Dict]) -> str:
    """시간표를 읽기 쉬운 형식으로 변환"""
    if not timetable:
        return "등록된 시간표 없음"
    
    formatted = []
    for item in timetable:
        if item.get('courseName'):  # 빈 시간표 제외
            formatted.append(
                f"- {item.get('courseName', '과목명 없음')} "
                f"({item.get('dayOfWeek', '?')}요일 "
                f"{item.get('startTime', '?')}~{item.get('endTime', '?')})"
            )
    
    return "\n".join(formatted) if formatted else "등록된 수업 없음"


def format_docs_with_metadata(docs: List) -> str:
    """검색된 문서를 메타데이터 포함하여 포맷"""
    context_parts = []
    
    for i, doc in enumerate(docs, 1):
        board = doc.metadata.get('board_name', '출처불명')
        title = doc.metadata.get('title', '제목없음')
        date = doc.metadata.get('date', '날짜불명')
        content = clean_text(doc.page_content)
        
        context_parts.append(
            f"=== 문서 {i} ===\n"
            f"출처: {board}\n"
            f"제목: {title}\n"
            f"날짜: {date}\n"
            f"내용:\n{content}\n"
        )
    
    return "\n\n".join(context_parts) if context_parts else "관련 문서를 찾지 못했습니다."


def extract_sources(docs: List) -> List[Dict]:
    """검색된 문서에서 출처 정보 추출"""
    sources = []
    
    for doc in docs:
        sources.append({
            "board_name": doc.metadata.get('board_name', '출처불명'),
            "title": doc.metadata.get('title', '제목없음'),
            "date": doc.metadata.get('date', ''),
            "post_num": doc.metadata.get('post_num', '')
        })
    
    return sources


def create_system_prompt(user_info: Dict, timetable: List[Dict]) -> str:
    """시스템 프롬프트 생성"""
    
    # 기본 정보
    base_info = f"""[사용자 정보]
- 이름: {user_info.get('name', '미제공')}
- 학과: {user_info.get('department', '미제공')}
- 학년: {user_info.get('grade', '미제공')}"""
    
    # 추가 정보가 있으면 포함
    if user_info.get('additional_info'):
        base_info += f"\n- 추가정보: {user_info['additional_info']}"
    
    # 시간표 정보
    timetable_info = f"\n\n[사용자 시간표]\n{format_timetable(timetable)}"
    
    system_prompt = f"""너는 성균관대학교 학생을 돕는 AI 어시스턴트야.

{base_info}
{timetable_info}

[답변 규칙]
1. 제공된 참고 문서에 명확한 정보가 있으면 그것을 기반으로 답변
2. 날짜가 있는 정보는 반드시 날짜를 함께 언급
3. 여러 문서에서 정보를 찾았다면 출처(게시판)도 언급
4. 정보가 불확실하거나 없으면 솔직하게 모른다고 말하기
5. 마크다운 형식으로 출력 (중요한 날짜, 기한은 **볼드**로 강조)
6. 여러 항목이 있으면 리스트로 정리
7. 사용자 정보(학과, 학년, 시간표)를 고려한 맞춤형 답변 제공

[추가 정보 안내]
답변 후 필요시 "💡 학점, 소득분위 등을 알려주시면 더 정확한 답변이 가능합니다" 를 자연스럽게 포함

[언어]
사용자가 한국어로 물으면 한국어로, 영어로 물으면 영어로 답변
"""
    
    return system_prompt


def check_needs_additional_info(
    question: str,
    user_info: Dict,
    llm: ChatOpenAI
) -> Dict:
    """
    질문 분석 후 추가 정보 필요 여부 판단
    
    Returns:
        {
            "needs_more_info": bool,
            "reason": str,
            "suggestion": str
        }
    """
    
    # 사용자가 이미 제공한 정보
    existing_info = f"""
- 학과: {user_info.get('department', '미제공')}
- 학년: {user_info.get('grade', '미제공')}
- 추가정보: {user_info.get('additional_info', '없음')}
"""
    
    analysis_prompt = f"""
질문: "{question}"

현재 사용자 정보:
{existing_info}

이 질문에 답변하기 위해 추가로 필요한 정보가 있는지 판단해줘.

응답 형식 (JSON만 출력, 다른 텍스트 없이):
{{
  "needs_more_info": true 또는 false,
  "reason": "추가 정보가 필요한 이유 (한국어로 친절하게)",
  "suggestion": "어떤 정보를 어떻게 입력하라고 안내할지 (구체적으로)"
}}

판단 기준:
- "장학금", "지원 자격" 관련 → 학점, 소득분위 필요
- "교환학생" 관련 → 학점, 어학성적 필요
- 일반적인 일정, 공지 조회 → 추가 정보 불필요

예시:
질문: "장학금 알려줘"
→ {{"needs_more_info": true, "reason": "장학금 지원 자격을 정확히 확인하려면 추가 정보가 필요합니다", "suggestion": "학점(평점)과 소득분위를 알려주세요. 예: 평점 3.5, 소득 5분위"}}

질문: "중간고사 일정은?"
→ {{"needs_more_info": false, "reason": "", "suggestion": ""}}
"""
    
    try:
        response = llm.invoke([HumanMessage(content=analysis_prompt)])
        # JSON 파싱
        content = response.content.strip()
        # ```json ``` 제거
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        analysis = json.loads(content.strip())
        return analysis
    except Exception as e:
        print(f"Info check error: {e}")
        # 파싱 실패 시 추가 정보 요청 안 함
        return {
            "needs_more_info": False,
            "reason": "",
            "suggestion": ""
        }


def generate_rag_response(
    question: str,
    history: List[Dict],
    user_info: Dict,
    timetable: List[Dict],
    is_first_question: bool = False
) -> Dict:
    """
    RAG 기반 답변 생성
    
    Args:
        question: 사용자 질문
        history: 이전 대화 기록 [{"role": "user", "content": "..."}, ...]
        user_info: 사용자 정보 {"name": ..., "department": ..., ...}
        timetable: 시간표 정보
        is_first_question: 세션의 첫 질문 여부
    
    Returns:
        {
            "type": "answer" | "info_request",
            "reply": str (답변 내용),
            "sources": List[Dict] (참고 문서),
            "info_request": Dict (추가 정보 요청 시)
        }
    """
    
    try:
        llm = ChatOpenAI(model="gpt-4o", temperature=0.2)
        
        # 1. 세션 첫 질문이면 추가 정보 필요 여부 체크
        if is_first_question:
            info_check = check_needs_additional_info(question, user_info, llm)
            
            if info_check["needs_more_info"]:
                return {
                    "type": "info_request",
                    "reply": None,
                    "sources": [],
                    "info_request": {
                        "reason": info_check["reason"],
                        "suggestion": info_check["suggestion"]
                    }
                }
        
        # 2. 문서 검색
        retriever = get_retriever(score_threshold=0.5)
        docs = retriever.invoke(question)
        
        # 3. Context 생성 (메타데이터 포함)
        context_text = format_docs_with_metadata(docs)
        
        # 4. 시스템 프롬프트 생성
        system_msg = create_system_prompt(user_info, timetable)
        
        # 5. 메시지 구성
        messages = [SystemMessage(content=system_msg)]
        
        # 이전 대화 추가
        for msg in history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            else:
                messages.append(AIMessage(content=msg["content"]))
        
        # 현재 질문 + Context
        current_msg = f"""[참고 문서]
{context_text}

[질문]
{question}

위 참고 문서와 사용자 정보를 바탕으로 답변해줘."""
        
        messages.append(HumanMessage(content=current_msg))
        
        # 6. LLM 호출
        response = llm.invoke(messages)
        
        # 7. 출처 추출
        sources = extract_sources(docs)
        
        return {
            "type": "answer",
            "reply": response.content,
            "sources": sources,
            "info_request": None
        }
        
    except Exception as e:
        print(f"RAG Error: {e}")
        return {
            "type": "error",
            "reply": "답변 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
            "sources": [],
            "info_request": None,
            "error": str(e)
        }


def translate_response(
    text: str,
    target_language: str = "en"
) -> Dict:
    """
    답변을 다른 언어로 번역
    
    Args:
        text: 원본 텍스트
        target_language: 목표 언어 ("en" 또는 "ko")
    
    Returns:
        {
            "translated_text": str,
            "error": Optional[str]
        }
    """
    
    try:
        llm = ChatOpenAI(model="gpt-4o", temperature=0.1)
        
        lang_name = "영어" if target_language == "en" else "한국어"
        
        translation_prompt = f"""
다음 텍스트를 {lang_name}로 번역해줘.

요구사항:
1. 마크다운 형식은 그대로 유지
2. 의미를 정확하게 전달
3. 자연스러운 표현 사용
4. 볼드, 리스트 등 서식 유지

원본 텍스트:
{text}
"""
        
        response = llm.invoke([HumanMessage(content=translation_prompt)])
        
        return {
            "translated_text": response.content,
            "error": None
        }
        
    except Exception as e:
        print(f"Translation Error: {e}")
        return {
            "translated_text": None,
            "error": f"번역 중 오류가 발생했습니다: {str(e)}"
        }