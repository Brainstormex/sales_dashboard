@echo off
echo ========================================================
echo   Starting Finance Sales Analytics Dashboard
echo ========================================================

echo 1. Loading data into SQLite database...
python backend/app/load_data.py

echo.
echo 2. Launching FastAPI backend on http://localhost:8000...
start cmd /k "python -m uvicorn backend.app.main:app --port 8000 --reload"

echo.
echo 3. Launching React frontend on http://localhost:5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo Done! Open your browser at http://localhost:5173
