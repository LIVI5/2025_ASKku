from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
from typing import List, Dict, Optional, AsyncGenerator
from rag_engine import generate_rag_response_stream, translate_response, summarize_bookmark, extract_schedule_from_dialog

app = FastAPI(title="SKKU RAG API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== Request Models =====

class ChatRequest(BaseModel):
    message: str
    history: List[Dict] = []
    user_info: Dict
    timetable: List[Dict] = []


class TranslateRequest(BaseModel):
    text: str
    target_language: str


class BookmarkSummaryRequest(BaseModel):
    question: str
    answer: str


class ScheduleSummaryRequest(BaseModel):
    question: str
    answer: str


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
    채팅 엔드포인트 (스트리밍)
    
    SSE 형식으로 응답:
    - data: {"type": "sources", "sources": [...]}
    - data: {"type": "content", "content": "토큰"}
    - data: {"type": "done"}
    - data: {"type": "error", "message": "..."}
    """
    
    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            async for event in generate_rag_response_stream(
                question=req.message,
                history=req.history,
                user_info=req.user_info,
                timetable=req.timetable
            ):
                # SSE 형식으로 전송
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
                
        except Exception as e:
            error_event = {
                "type": "error",
                "message": "서버 오류가 발생했습니다.",
                "details": str(e)
            }
            yield f"data: {json.dumps(error_event, ensure_ascii=False)}\n\n"
            if event.get("type") == "content":
                    await asyncio.sleep(0.03)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Nginx 버퍼링 방지
        }
    )


@app.post("/translate")
async def translate(req: TranslateRequest):
    """번역 엔드포인트"""
    try:
        result = translate_response(
            text=req.text,
            target_language=req.target_language
        )
        
        if result["error"]:
            raise HTTPException(
                status_code=500,
                detail={"error": result["error"]}
            )
        
        return {"translated_text": result["translated_text"]}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Translation endpoint error: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": f"번역 중 오류가 발생했습니다: {str(e)}"}
        )


@app.get("/health")
async def health_check():
    """헬스 체크"""
    import os
    
    db_exists = os.path.exists("chroma_db")
    
    return {
        "status": "healthy",
        "database": "ready" if db_exists else "not_found",
        "message": "All systems operational" if db_exists else "Please run ingest.py first"
    }


@app.post("/bookmark/summary")
async def bookmark_summary(req: BookmarkSummaryRequest):
    """북마크 내용 요약 API"""
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
        raise HTTPException(status_code=500, detail=str(e))


def clean_llm_output(output: str) -> str:
    output = output.strip()
    if output.startswith("```"):
        output = output.split("```")[1]
        output = output.replace("json", "").strip()

    output = output.replace(""", "\"").replace(""", "\"").replace("'", "'").replace("'", "'")
    return output.strip()


def safe_json_parse(output: str):
    try:
        return json.loads(output)
    except json.JSONDecodeError:
        if output.startswith("{") and output.endswith("}"):
            return [json.loads(output)]
        raise


@app.post("/schedule/summary")
async def schedule_summary(req: ScheduleSummaryRequest):
    try:
        raw = extract_schedule_from_dialog(req.question, req.answer)

        if raw == "null":
            raise HTTPException(status_code=400, detail="일정 정보를 추출할 수 없습니다.")

        cleaned = clean_llm_output(raw)

        try:
            schedule = safe_json_parse(cleaned)
        except Exception:
            print("[LLM JSON ERROR RAW]\n", raw)
            print("[CLEANED]\n", cleaned)
            raise HTTPException(status_code=400, detail="LLM JSON 파싱 오류")

        return {
            "success": True,
            "schedule": schedule
        }

    except HTTPException:
        raise
    except Exception as e:
        print("Calendar summary error:", e)
        raise HTTPException(status_code=500, detail="서버 내부 오류")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)