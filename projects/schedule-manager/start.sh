#!/bin/bash
# 启动日程管理系统（开发模式）
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== 日程管理系统启动 ==="

# 安装后端依赖
echo "[1/3] 安装后端依赖..."
cd backend
python3 -m venv .venv 2>/dev/null || true
source .venv/bin/activate
pip install -q -r requirements.txt
cd ..

# 安装前端依赖
echo "[2/3] 安装前端依赖..."
cd frontend
npm install --silent
cd ..

# 启动后端
echo "[3/3] 启动服务..."
echo "  后端: http://localhost:8000"
echo "  前端: http://localhost:5173"
echo "  API文档: http://localhost:8000/docs"
echo ""

cd backend && source .venv/bin/activate && python3 -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

cd ../frontend && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

wait $BACKEND_PID $FRONTEND_PID
