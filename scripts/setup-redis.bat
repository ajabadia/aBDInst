@echo off
echo ========================================
echo Redis Setup for Windows
echo ========================================
echo.

echo Checking Docker status...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop is not running.
    echo.
    echo Please choose an option:
    echo   1. Start Docker Desktop and run this script again
    echo   2. Use WSL2 to install Redis
    echo   3. Skip Redis (app will use in-memory fallback)
    echo.
    pause
    exit /b 1
)

echo Docker is running!
echo.

echo Checking if redis-ratelimit container exists...
docker ps -a --filter "name=redis-ratelimit" --format "{{.Names}}" | findstr "redis-ratelimit" >nul 2>&1
if %errorlevel% equ 0 (
    echo Container exists. Removing old container...
    docker rm -f redis-ratelimit
)

echo Starting Redis container...
docker run -d --name redis-ratelimit -p 6379:6379 redis:alpine

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Redis is now running on port 6379
    echo.
    echo Next steps:
    echo   1. Add to .env.local: REDIS_URL=redis://localhost:6379
    echo   2. Restart your Next.js app: npm run dev
    echo.
    echo To verify: docker ps ^| findstr redis
    echo To stop: docker stop redis-ratelimit
    echo To remove: docker rm redis-ratelimit
) else (
    echo.
    echo [ERROR] Failed to start Redis container
    echo Check Docker Desktop is running properly
)

pause
