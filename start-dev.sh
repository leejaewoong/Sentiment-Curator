#!/bin/bash
# Sentiment-Curator Development Environment Startup Script (Linux/macOS)

set -e

echo "========================================"
echo "  Sentiment-Curator Dev Environment"
echo "========================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}[WARNING] backend/.env not found. Copy from backend/.env.example${NC}"
    echo -e "${YELLOW}  Run: cp backend/.env.example backend/.env${NC}"
    echo ""
fi

if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}[WARNING] frontend/.env.local not found. Copy from frontend/.env.example${NC}"
    echo -e "${YELLOW}  Run: cp frontend/.env.example frontend/.env.local${NC}"
    echo ""
fi

# Check if Python venv exists
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}[INFO] Python virtual environment not found. Creating...${NC}"
    python3 -m venv backend/venv
    echo -e "${YELLOW}[INFO] Installing Python dependencies...${NC}"
    backend/venv/bin/pip install -r backend/requirements.txt
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}[INFO] node_modules not found. Installing dependencies...${NC}"
    cd frontend
    npm install
    cd ..
fi

echo -e "${GREEN}[INFO] Starting Backend (FastAPI) on http://localhost:8000${NC}"
echo -e "${GREEN}[INFO] Starting Frontend (Next.js) on http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Trap Ctrl+C
trap cleanup INT TERM

cleanup() {
    echo ""
    echo -e "${YELLOW}[INFO] Stopping servers...${NC}"

    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi

    # Kill any remaining processes on ports
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true

    echo -e "${GREEN}[INFO] All servers stopped.${NC}"
    exit 0
}

# Start backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}[SUCCESS] Servers started!${NC}"
echo -e "${CYAN}  Backend:  http://localhost:8000${NC}"
echo -e "${CYAN}  API Docs: http://localhost:8000/docs${NC}"
echo -e "${CYAN}  Frontend: http://localhost:3000${NC}"
echo ""

# Wait for background processes
wait
