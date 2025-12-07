import os
import json
from typing import List, Dict, Optional, AsyncGenerator
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
    return vectordb.as_retriever(search_kwargs={"k": 5})


def format_timetable(timetable: List[Dict]) -> str:
    """시간표를 읽기 쉬운 형식으로 변환"""
    if not timetable:
        return "등록된 시간표 없음"
    
    formatted = []
    for item in timetable:
        if item.get('courseName'):
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
    
    base_info = f"""[사용자 정보]
- 이름: {user_info.get('name', '미제공')}
- 학과: {user_info.get('department', '미제공')}
- 학년: {user_info.get('grade', '미제공')}"""
    
    if user_info.get('additional_info'):
        base_info += f"\n- 추가정보: {user_info['additional_info']}"
    
    timetable_info = f"\n\n[사용자 시간표]\n{format_timetable(timetable)}"
    
    system_prompt = f"""너는 성균관대학교 학생을 돕는 AI 어시스턴트야.

{base_info}
{timetable_info}

[답변 규칙]
1. 제공된 참고 문서에 명확한 정보가 있으면 그것을 기반으로 답변
2. 날짜가 있는 정보는 반드시 날짜를 함께 언급
3. 정보가 불확실하거나 없으면 솔직하게 모른다고 말하기
4. **반드시 마크다운 형식으로 출력**:
   - 리스트는 `*` 또는 `-` 사용
   - 리스트 앞뒤로 빈 줄 필수 (예: 문단\n\n* 리스트1\n* 리스트2\n\n다음 문단)
   - 중요한 날짜, 기한은 **볼드**로 강조
   - 제목은 ## 또는 ### 사용
5. 여러 항목이 있으면 리스트로 정리
6. 사용자 정보(학과, 학년, 시간표)를 고려한 맞춤형 답변 제공

[언어]
사용자가 한국어로 물으면 한국어로, 영어로 물으면 영어로 답변
"""
    
    return system_prompt


async def generate_rag_response_stream(
    question: str,
    history: List[Dict],
    user_info: Dict,
    timetable: List[Dict]
) -> AsyncGenerator[Dict, None]:
    """
    스트리밍 RAG 응답 생성
    
    Yields:
        - {"type": "sources", "sources": [...]}  # 출처 정보 (첫 번째)
        - {"type": "content", "content": "토큰"} # 스트리밍 컨텐츠
        - {"type": "done"}                       # 완료
        - {"type": "error", "message": "..."}   # 에러
    """
    
    try:
        # LLM 초기화 (streaming=True 필수)
        llm = ChatOpenAI(model="gpt-4o", temperature=0.1, streaming=True)
        
        # 1. 문서 검색
        retriever = get_retriever(score_threshold=0.5)
        docs = retriever.invoke(question)
        
        # 2. 출처 정보 먼저 전송
        sources = extract_sources(docs)
        yield {
            "type": "sources",
            "sources": sources
        }
        
        # 3. Context 생성
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
        
        # 6. 스트리밍 응답 생성
        async for chunk in llm.astream(messages):
            if chunk.content:
                yield {
                    "type": "content",
                    "content": chunk.content
                }
        
        # 7. 완료 신호
        yield {"type": "done"}
        
    except Exception as e:
        print(f"RAG Stream Error: {e}")
        yield {
            "type": "error",
            "message": "답변 생성 중 오류가 발생했습니다.",
            "details": str(e)
        }


def generate_rag_response(
    question: str,
    history: List[Dict],
    user_info: Dict,
    timetable: List[Dict]
) -> Dict:
    """
    기존 non-streaming 버전 (호환성 유지)
    """
    
    try:
        llm = ChatOpenAI(model="gpt-4o", temperature=0.2, streaming=True)
        
        retriever = get_retriever(score_threshold=0.5)
        docs = retriever.invoke(question)
        
        context_text = format_docs_with_metadata(docs)
        system_msg = create_system_prompt(user_info, timetable)
        
        messages = [SystemMessage(content=system_msg)]
        
        for msg in history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            else:
                messages.append(AIMessage(content=msg["content"]))
        
        current_msg = f"""[참고 문서]
{context_text}

[질문]
{question}

위 참고 문서와 사용자 정보를 바탕으로 답변해줘."""
        
        messages.append(HumanMessage(content=current_msg))
        
        response = llm.invoke(messages)
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


def translate_response(text: str, target_language: str = "en") -> Dict:
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


def summarize_bookmark(question, answer):
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1)

    prompt = f"""
다음 내용을 아래 마크다운 형식에 따라 요약해줘.

## 내용
- 핵심 항목 3~7개
- 문장형 금지 (예: ~하다, ~할 수 있다, 좋다 등)
- 불필요한 말 축약, 핵심 표현만
- 중복 의미 금지
- 설명 문장 생성 금지
- 한 줄당 하나의 항목
- 일정이 있다면 일정도 반드시 포함
---

### 출력 형식(이 형식을 그대로 사용할 것):

**내용:**
- 항목1
- 항목1 일정

**내용:**
- 항목2
- 항목2 일정

---

### 요약 대상

**질문:**  
{question}
**답변:**  
{answer}
"""

    return llm.invoke(prompt).content.strip()


def extract_schedule_from_dialog(question: str, answer: str):
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1)

    prompt = f"""
아래 대화를 분석하여 '일정' 데이터를 추출해줘.

매우 중요한 규칙 (시간 포함):

1. 날짜 + 시간 범위가 있는 경우:
   예: "2025년 12월 6일 09:00~18:00"
   - startDate = 2025-12-06
   - endDate = 2025-12-06
   - startTime = 09:00
   - endTime = 18:00

2. 날짜는 있고 시간이 없는 경우:
   - startTime = null
   - endTime = null
   - isAllDay = true

3. 기간만 있는 경우:
   예: 2025.12.22 ~ 2026.01.31
   - startTime = null
   - endTime = null

4. 시간 표현은 반드시 "HH:MM" 24시간 형식

5. 날짜가 없으면 반드시 "null" 출력
   (JSON 외 출력 금지)


최종 출력 형식 (JSON ONLY)

단일 일정이면:
{{
  "title": "...",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "startTime": "HH:MM" 또는 null,
  "endTime": "HH:MM" 또는 null,
  "isAllDay": true 또는 false,
  "type": "exam | schedule | personal | class | 기타",
  "location": "장소 또는 null"
}}

여러 일정이면 JSON 배열:
[
  {{
    "title": "...",
    "startDate": "...",
    "endDate": "...",
    "startTime": "...",
    "endTime": "...",
    "isAllDay": ...,
    "type": "...",
    "location": ...
  }},
  ...
]

대화 내용:

질문: {question}
답변: {answer}
"""

    return llm.invoke(prompt).content.strip()