
import subprocess
import webbrowser
import time
import sys
import os
import shutil
import requests


# Paths to backend and frontend start commands
BACKEND_CMD = [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8001"]
FRONTEND_CMD = ["cmd", "/c", "npm run dev"]


# Detect frontend directory (project root or 'app' subfolder)
PROJECT_ROOT = os.path.dirname(__file__)
FRONTEND_DIR = None
if os.path.exists(os.path.join(PROJECT_ROOT, "package.json")):
    FRONTEND_DIR = PROJECT_ROOT
elif os.path.exists(os.path.join(PROJECT_ROOT, "app", "package.json")):
    FRONTEND_DIR = os.path.join(PROJECT_ROOT, "app")


# Check if npm is available and package.json exists
if shutil.which("npm") is None:
    print("Error: npm is not installed or not in your PATH. Please install Node.js and npm.")
    sys.exit(1)
if FRONTEND_DIR is None:
    print("Error: Could not find package.json for frontend in project root or ./app. Please check your project structure.")
    sys.exit(1)
if not os.path.exists(os.path.join(FRONTEND_DIR, "package.json")):
    print(f"Error: package.json not found in {FRONTEND_DIR}. Please ensure your frontend is set up correctly.")
    sys.exit(1)

# Main website URL
MAIN_URL = "http://localhost:3000"



# Run backend setup script to ensure dependencies are installed
setup_script = os.path.join("backend", "setup_backend.bat")
if os.path.exists(setup_script):
    print("Running backend/setup_backend.bat to install backend dependencies...")
    setup_result = subprocess.run(["cmd", "/c", setup_script], cwd=PROJECT_ROOT)
    if setup_result.returncode != 0:
        print("Error: setup_backend.bat failed. Please check the script output above.")
        sys.exit(1)
else:
    print("Warning: setup_backend.bat not found. Skipping backend setup.")


# Start backend
backend_proc = subprocess.Popen(BACKEND_CMD)

# Wait for backend to become healthy
backend_healthy = False
for i in range(20):  # Try for up to 10 seconds
    try:
        resp = requests.get("http://127.0.0.1:8001/health", timeout=0.5)
        if resp.status_code == 200:
            backend_healthy = True
            print("Backend health check passed.")
            break
    except Exception:
        pass
    time.sleep(0.5)
if not backend_healthy:
    print("Backend health check failed. Attempting to install backend requirements and retry...")
    backend_proc.terminate()
    backend_proc.wait()
    # Try to install requirements.txt if it exists
    req_path = os.path.join("backend", "requirements.txt")
    if os.path.exists(req_path):
        # Check if pip is available
        import importlib.util
        pip_spec = importlib.util.find_spec("pip")
        if pip_spec is None:
            print("pip is not installed in your Python environment. Please install pip and run setup_backend.bat manually.")
            sys.exit(1)
        print("Installing backend requirements with pip...")
        pip_result = subprocess.run([sys.executable, "-m", "pip", "install", "-r", req_path], cwd=PROJECT_ROOT)
        if pip_result.returncode != 0:
            print("Error: pip install failed. Please check requirements.txt and your Python environment.")
            sys.exit(1)
        # Try to start backend again
        backend_proc = subprocess.Popen(BACKEND_CMD)
        for i in range(20):
            try:
                resp = requests.get("http://127.0.0.1:8001/health", timeout=0.5)
                if resp.status_code == 200:
                    backend_healthy = True
                    print("Backend health check passed after installing requirements.")
                    break
            except Exception:
                pass
            time.sleep(0.5)
        if not backend_healthy:
            print("Error: Backend health check still failed after installing requirements. The backend server did not start or /health endpoint is not available.")
            backend_proc.terminate()
            backend_proc.wait()
            sys.exit(1)
    else:
        print("Error: Backend health check failed and requirements.txt not found. The backend server did not start or /health endpoint is not available.")
        sys.exit(1)

# Start frontend (in detected frontend directory)
try:
    frontend_proc = subprocess.Popen(FRONTEND_CMD, cwd=FRONTEND_DIR)
except FileNotFoundError as e:
    print(f"Error starting frontend: {e}\nCheck if npm is installed and package.json exists in {FRONTEND_DIR}.")
    backend_proc.terminate()
    backend_proc.wait()
    sys.exit(1)

# Wait for servers to start
print("Starting backend and frontend...")
time.sleep(5)

# Open the main website
print(f"\nYour app is running at: {MAIN_URL}\n")
webbrowser.open(MAIN_URL)

try:
    # Wait for the frontend process to exit (user closes site/dev server)
    frontend_proc.wait()
finally:
    # On exit, terminate backend and frontend
    print("Shutting down backend and frontend...")
    backend_proc.terminate()
    frontend_proc.terminate()
    backend_proc.wait()
    frontend_proc.wait()
    print("All processes closed.")
