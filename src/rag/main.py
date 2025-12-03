from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from rag_engine import generate_rag_response, translate_response, summarize_bookmark

app = FastAPI(title="SKKU RAG API")

# CORS 설정 (프론트엔드와 통신)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 배포 시 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== Request Models =====

class ChatRequest(BaseModel):
    message: str
    history: List[Dict] = []  # [{"role": "user", "content": "..."}, ...]
    user_info: Dict  # {"name": ..., "department": ..., "grade": ..., "additional_info": ...}
    timetable: List[Dict] = []
    is_first_question: bool = False  # 세션의 첫 질문 여부


class TranslateRequest(BaseModel):
    text: str
    target_language: str  # "en" or "ko"


# ===== Response Models =====

class InfoRequestResponse(BaseModel):
    type: str = "info_request"
    reason: str
    suggestion: str


class AnswerResponse(BaseModel):
    type: str = "answer"
    reply: str
    sources: List[Dict]


class ErrorResponse(BaseModel):
    type: str = "error"
    message: str
    details: Optional[str] = None


class TranslateResponse(BaseModel):
    translated_text: Optional[str]
    error: Optional[str]


# ===== Endpoints =====

@app.get("/")
async def root():
    """API 상태 확인"""
    return {
        "status": "online",
        "message": "SKKU RAG API is running"
    }


@app.post("/chat")
async def chat(req: ChatRequest):
    """
    채팅 엔드포인트
    
    Returns:
        - type: "answer" → 정상 답변
        - type: "info_request" → 추가 정보 요청
        - type: "error" → 오류 발생
    """
    
    try:
        result = generate_rag_response(
            question=req.message,
            history=req.history,
            user_info=req.user_info,
            timetable=req.timetable,
            is_first_question=req.is_first_question
        )
        
        if result["type"] == "info_request":
            return {
                "type": "info_request",
                "reason": result["info_request"]["reason"],
                "suggestion": result["info_request"]["suggestion"]
            }
        
        elif result["type"] == "answer":
            return {
                "type": "answer",
                "reply": result["reply"],
                "sources": result["sources"]
            }
        
        elif result["type"] == "error":
            return {
                "type": "error",
                "message": result["reply"],
                "details": result.get("error")
            }
        
        else:
            raise HTTPException(status_code=500, detail="Unknown response type")
    
    except Exception as e:
        print(f"Chat endpoint error: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "type": "error",
                "message": "서버 오류가 발생했습니다.",
                "details": str(e)
            }
        )


@app.post("/translate")
async def translate(req: TranslateRequest):
    """
    번역 엔드포인트
    
    Args:
        text: 번역할 텍스트
        target_language: "en" 또는 "ko"
    """
    
    try:
        result = translate_response(
            text=req.text,
            target_language=req.target_language
        )
        
        if result["error"]:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": result["error"]
                }
            )
        
        return {
            "translated_text": result["translated_text"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Translation endpoint error: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": f"번역 중 오류가 발생했습니다: {str(e)}"
            }
        )


@app.get("/health")
async def health_check():
    """헬스 체크"""
    import os
    
    # ChromaDB 존재 여부 확인
    db_exists = os.path.exists("chroma_db")
    
    return {
        "status": "healthy",
        "database": "ready" if db_exists else "not_found",
        "message": "All systems operational" if db_exists else "Please run ingest.py first"
    }

class BookmarkSummaryRequest(BaseModel):
    question: str
    answer: str


@app.post("/bookmark/summary")
async def bookmark_summary(req: BookmarkSummaryRequest):
    """
    북마크 내용 요약 API
    question + answer 기반 JSON 요약 생성
    """
    try:
        result = summarize_bookmark(req.question, req.answer)

        if not result:
            raise HTTPException(status_code=500, detail="요약 생성 실패")

        return {
            "success": True,
            "summary": result
        }

    except Exception as e:
        print("Bookmark summary error:", e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)