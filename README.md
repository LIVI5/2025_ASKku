# 🧠 ASKku - AI 기반 검색 및 질의응답 서비스

LLM과 RAG(Retrieval-Augmented Generation)를 활용하여  
사용자의 질의에 대해 정확한 정보를 검색하고 자연어 응답을 제공하는 AI 검색 서비스입니다.

---

## 📌 프로젝트 개요

기존 검색 시스템은 키워드 기반으로 동작하여  
사용자의 의도를 정확히 반영하지 못하는 문제가 있었습니다.

이를 해결하기 위해  
✔ 문서 검색 + LLM 응답 생성 구조(RAG)를 적용하여  
✔ 더 정확하고 개인화된 검색 경험을 제공하는 서비스를 개발했습니다.

---

## 🧱 Architecture

### 🔹 Overall
- Frontend → Backend → RAG 서버 → Vector DB → OpenAI

### 🔹 Frontend
- React, Vite, TypeScript
- Axios 기반 API 통신
- Tailwind CSS

### 🔹 Backend
- Node.js (Express)
- JWT 기반 인증
- MySQL + Sequelize

### 🔹 RAG Server
- FastAPI
- LangChain
- ChromaDB (Vector DB)
- OpenAI API

---

## 📂 프로젝트 구조
- backend/
- frontend/

---

## 👥 Team Project

- 인원: 6인 (FE 2, BE 2, AI 2)
- 기간: 2025.09~2025.12

---

## 🙋‍♂️ My Contributions

### 🔹 RAG Pipeline (핵심 기여)

RAG(Retrieval-Augmented Generation) 파이프라인 전반을 설계 및 구현

- **데이터 수집 (Crawling)**
  - Selenium 기반 웹 크롤러 구현
  - Cron을 활용한 주기적 데이터 수집 자동화

- **데이터 전처리 및 임베딩**
  - 수집된 문서 정제 및 chunking 전략 설계
  - OpenAI Embedding을 활용한 벡터화
  - ChromaDB 기반 Vector DB 구축

- **Retriever 구현**
  - 유사도 기반 문서 검색 로직 구현
  - 검색 성능 개선을 위한 파라미터 튜닝

- **Prompt Engineering**
  - LLM 응답 품질 향상을 위한 프롬프트 설계
  - 시스템 메시지 및 컨텍스트 구성 최적화

- **LLM 응답 생성**
  - OpenAI API 연동
  - 검색된 문서를 기반으로 한 응답 생성 파이프라인 구현

- **Streaming 응답 처리**
  - SSE(Server-Sent Events) 기반 토큰 스트리밍 구현
  - 사용자 경험 개선 (실시간 응답)

---
