@echo off
echo Starting Python Backend Server...

:: Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found!
    echo Please run setup_backend.bat first
    pause
    exit /b 1
)

:: Activate virtual environment
call venv\Scripts\activate.bat

:: Start the FastAPI server
echo Starting FastAPI server on http://localhost:8001
python -m uvicorn main:app --reload --host localhost --port 8001

pause
