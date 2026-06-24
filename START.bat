@echo off
title MindBridge Launcher
color 0A

echo.
echo  =========================================
echo    MindBridge - Student Wellness Tracker
echo  =========================================
echo.

REM Check if Docker is installed and running
docker info >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Docker is not running!
    echo.
    echo  Please start Docker Desktop and try again.
    echo  Download from: https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

echo  [1/3] Building MindBridge image...
docker compose build --quiet
if errorlevel 1 (
    echo  [ERROR] Build failed. Check your Docker setup.
    pause
    exit /b 1
)

echo  [2/3] Starting MindBridge server...
docker compose up -d
if errorlevel 1 (
    echo  [ERROR] Could not start the server.
    pause
    exit /b 1
)

echo  [3/3] Waiting for server to be ready...
timeout /t 3 /nobreak >nul

echo.
echo  =========================================
echo    MindBridge is running!
echo    Open in your browser:
echo    http://localhost:8000
echo  =========================================
echo.

REM Automatically open in default browser
start http://localhost:8000

echo  Press any key to STOP the server and exit...
pause >nul

echo.
echo  Stopping MindBridge...
docker compose down
echo  Stopped. Your data is safely saved.
echo.
pause
