@echo off
echo Setting up Python Backend...

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

:: Create virtual environment
echo Creating virtual environment...
python -m venv venv

:: Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

:: Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

:: Install requirements
echo Installing Python dependencies...
pip install -r backend/requirements.txt

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Get your Gemini API key from: https://makersuite.google.com/app/apikey
echo 2. Set up Google Cloud Vision API credentials
echo 3. Update the .env file with your API keys
echo 4. Run: start_backend.bat
echo.
pause
