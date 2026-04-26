#!/bin/bash
set -e

echo "=== FinSight Startup ==="

echo "[1/3] Installing Node dependencies..."
cd apps/web && npm install && cd ../..

echo "[2/3] Setting up Python environment..."
cd apps/api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ../..

echo "[3/3] Starting servers..."
echo "  Web app : http://localhost:3000"
echo "  ML API  : http://localhost:8000"

# Start ML API in background
cd apps/api
source venv/bin/activate
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!
cd ../..

# Start Next.js (foreground)
cd apps/web && npm run dev

# Cleanup on exit
kill $API_PID 2>/dev/null
