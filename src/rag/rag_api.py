from fastapi import FastAPI
from pydantic import BaseModel
from rag_engine import generate_rag_response

app = FastAPI()


class ChatRequest(BaseModel):
    message: str
    history: list
    user_info: dict
    timetable: list


@app.post("/chat")
async def chat(req: ChatRequest):
    reply = generate_rag_response(
        question=req.message,
        history=req.history,
        user_info=req.user_info,
        timetable=req.timetable
    )
    return {"reply": reply}
