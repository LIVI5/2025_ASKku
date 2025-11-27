# chatbot.py
import os

from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from dotenv import load_dotenv
load_dotenv()

PERSIST_DIR = "chroma_db"


def clean_text(text: str) -> str:
    if text is None:
        return ""
    # 유효하지 않은 유니코드(서로게이트 등)를 모두 제거
    return text.encode("utf-8", "ignore").decode("utf-8", "ignore")


def get_retriever():
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectordb = Chroma(
        embedding_function=embeddings,
        persist_directory=PERSIST_DIR,
    )
    return vectordb.as_retriever(search_kwargs={"k": 5})


def main():
    if not os.path.exists(PERSIST_DIR):
        raise FileNotFoundError(
            f"{PERSIST_DIR} not found. Run ingest.py first to build the DB."
        )

    retriever = get_retriever()
    llm = ChatOpenAI(
        model="gpt-4o",   # gpt-4o-mini 써도 되고, 4o 써도 됨
        temperature=0.2,
    )

    print("💬 SKKU RAG chatbot ready! Type 'exit' to quit.\n")

    from langchain_core.messages import SystemMessage, HumanMessage

    while True:
        try:
            question_raw = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye!")
            break

        if not question_raw:
            continue
        if question_raw.lower() in {"exit", "quit"}:
            print("Bye!")
            break

        # 🔹 터미널에서 들어온 질문도 깨끗하게
        question = clean_text(question_raw)

        # 1) 문서 검색
        docs = retriever.invoke(question)

        # 2) 검색된 문서들 텍스트 정리 + 합치기
        context_parts = []
        for i, d in enumerate(docs):
            text = clean_text(d.page_content).replace("\n", " ")
            context_parts.append(f"[문서 {i}] {text}")
        context = "\n\n".join(context_parts)
        context = clean_text(context)  # 한 번 더 안전하게

        # 3) 시스템/유저 메시지 구성 + 정리
        system_msg_raw = (
            "너는 성균관대학교 교환학생 관련 정보를 도와주는 챗봇이야.\n"
            "아래 '문맥'에 포함된 내용만 사실로 사용해서 대답해.\n"
            "문맥에 관련 정보가 없으면 솔직하게 모른다고 말하고, "
            "성균관대학교 공식 홈페이지나 국제처에 문의하라고 안내해.\n"
            "사용자가 한국어로 물으면 한국어로, 영어로 물으면 영어로 답해."
        )
        system_msg = clean_text(system_msg_raw)

        user_msg_raw = (
            f"문맥:\n{context}\n\n"
            f"질문: {question}\n\n"
            "위 문맥을 바탕으로 질문에 답해. "
            "문맥에 관련 내용이 없다면 모른다고 말해."
        )
        user_msg = clean_text(user_msg_raw)

        messages = [
            SystemMessage(content=system_msg),
            HumanMessage(content=user_msg),
        ]

        # 4) LLM 호출
        response = llm.invoke(messages)

        print("\nBot:", response.content, "\n")


if __name__ == "__main__":
    main()