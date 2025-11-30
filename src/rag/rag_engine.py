import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()
PERSIST_DIR = "chroma_db"


def clean_text(text: str) -> str:
    if text is None:
        return ""
    return text.encode("utf-8", "ignore").decode("utf-8", "ignore")


def get_retriever():
    vectordb = Chroma(
        persist_directory=PERSIST_DIR,
        embedding_function=OpenAIEmbeddings(model="text-embedding-3-small"),
    )
    return vectordb.as_retriever(search_kwargs={"k": 5})


def generate_rag_response(question: str, history: list, user_info: dict, timetable: list) -> str:
    retriever = get_retriever()
    llm = ChatOpenAI(model="gpt-4o", temperature=0.2)

    # Retrieve context
    docs = retriever.invoke(question)
    context_text = "\n\n".join([clean_text(d.page_content) for d in docs])

    system_prompt = f"""
너는 성균관대 관련 안내를 도와주는 비서야.

[사용자 정보]
이름: {user_info.get("name")}
학과: {user_info.get("department")}

[사용자 시간표]
{timetable}

문맥 기반으로 정확하게 답하고,
없으면 모른다고 말해.
    """

    messages = [SystemMessage(content=system_prompt)]

    for msg in history:
        role = "human" if msg["role"] == "user" else "assistant"
        messages.append(HumanMessage(content=msg["content"]) if role == "human" else SystemMessage(content=msg["content"]))

    messages.append(HumanMessage(content=f"[문맥]\n{context_text}\n\n질문: {question}"))

    response = llm.invoke(messages)
    return response.content
