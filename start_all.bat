@echo off
echo ===================================
echo     digital-literacy - STARTUP
echo ===================================
echo.
echo Starting Full Application Stack...
echo.

:: Start Backend Server
echo [1/2] Starting Python Backend Server...
cd backend
start "Backend Server" cmd /k "venv\Scripts\activate.bat && python -m uvicorn main:app --reload --host localhost --port 8001"
cd ..

:: Wait a moment for backend to start
timeout /t 3 /nobreak > nul

:: Start Frontend Server  
echo [2/2] Starting Next.js Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

:: Wait for servers to initialize
echo.
echo Waiting for servers to start...
timeout /t 8 /nobreak > nul

echo.
echo ===================================
echo     🚀 APPLICATION READY!
echo ===================================
echo.
echo 📱 Main Application: http://localhost:3001
echo 🤖 Notebot (AI Features): http://localhost:3001/notebot  
echo 💬 AI Tutor Chat: http://localhost:3001/tutor
echo 📚 Learning Paths: http://localhost:3001/learning-path
echo 🔐 Authentication: http://localhost:3001/auth
echo 📊 Dashboard: http://localhost:3001/dashboard
echo.
echo 🔧 Backend API: http://localhost:8001
echo 🩺 Backend Health: http://localhost:8001/health
echo.
echo ===================================
echo Press any key to open main app...
pause > nul

:: Open the main application
start http://localhost:3001

echo.
echo 🎉 Application is now running!
echo Close this window when you're done.
echo (Both servers will continue running in separate windows)
pause
