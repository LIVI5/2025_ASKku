#!/usr/bin/env bash
set -e

# 0) 이 스크립트가 있는 위치 기준으로 프로젝트 루트 찾기
#   (run_ingest.sh 가 dev-ai-search-backend/ 바로 아래에 있다고 가정)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# 1) venv 활성화
#   - 이 레포 안에 .rag-venv 라는 venv를 만든다고 가정 (gitignore에 이미 있음)
if [ -f ".rag-venv/bin/activate" ]; then
  source ".rag-venv/bin/activate"
else
  echo "❌ .rag-venv 가 없습니다. 먼저 아래를 실행해서 venv를 만들어 주세요:"
  echo "    python -m venv .rag-venv"
  echo "    source .rag-venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

# 2) 로그 폴더 만들기 (프로젝트 루트 기준)
mkdir -p logs

# 3) ingest 실행
python src/rag/ingest.py >> logs/ingest.log 2>&1
