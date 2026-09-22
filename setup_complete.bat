@echo off
echo =================================================
echo    AI-Powered Notebot - Complete Setup
echo =================================================
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo Error: Please run this script from the project root directory
    pause
    exit /b 1
)

echo Step 1: Setting up Python Backend...
echo.
cd backend
if exist "setup_backend.bat" (
    call setup_backend.bat
) else (
    echo Backend setup script not found. Setting up manually...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
)
cd ..

echo.
echo Step 2: Installing Frontend Dependencies...
echo.
pnpm install

echo.
echo =================================================
echo           Setup Complete!
echo =================================================
echo.
echo Next steps:
echo 1. Configure your API keys in backend\.env
echo    - Get Gemini API key: https://makersuite.google.com/app/apikey
echo    - Set up Google Cloud Vision API credentials
echo.
echo 2. Start the backend server:
echo    cd backend
echo    start_backend.bat
echo.
echo 3. Start the frontend (in a new terminal):
echo    pnpm dev
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo For detailed instructions, see README_AI_SETUP.md
echo.
pause
