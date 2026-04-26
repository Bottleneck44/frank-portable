@echo off
echo === FinSight Startup ===
echo.

echo [1/3] Installing Node dependencies...
cd apps\web
call npm install
cd ..\..

echo.
echo [2/3] Setting up Python environment...
cd apps\api
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..\..

echo.
echo [3/3] Starting servers...
echo  - Web app:  http://localhost:3000
echo  - ML API:   http://localhost:8000
echo.

start "FinSight ML API" cmd /k "cd apps\api && venv\Scripts\activate.bat && uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload"
cd apps\web && npm run dev
