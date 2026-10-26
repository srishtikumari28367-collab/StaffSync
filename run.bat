@echo off
title StaffSync — Launcher
color 0A

echo ============================================
echo        StaffSync — MERN HR Platform
echo ============================================
echo.

:: ── Check Node.js ──────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Download it from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo [OK] Node.js %%v detected

:: ── Server setup ───────────────────────────────
echo.
echo [1/4] Installing server dependencies...
cd /d "%~dp0server"
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Server npm install failed.
        pause
        exit /b 1
    )
) else (
    echo       node_modules found — skipping install.
)

:: ── Create .env if missing ─────────────────────
if not exist .env (
    echo [1/4] Creating .env from .env.example...
    copy .env.example .env >nul
    echo       .env created — edit it if you need custom settings.
) else (
    echo       .env already exists.
)

:: ── Client setup ───────────────────────────────
echo.
echo [2/4] Installing client dependencies...
cd /d "%~dp0client"
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Client npm install failed.
        pause
        exit /b 1
    )
) else (
    echo       node_modules found — skipping install.
)

:: ── Seed database ──────────────────────────────
echo.
echo [3/4] Seeding database (demo users + data)...
cd /d "%~dp0server"
call npm run seed
if %errorlevel% neq 0 (
    color 0E
    echo [WARN] Seeding failed — is MongoDB running?
    echo        Make sure mongod is started, then try again.
    pause
    exit /b 1
)

:: ── Launch both servers ────────────────────────
echo.
echo [4/4] Starting servers...
echo       API   : http://localhost:5000
echo       Client: http://localhost:5173
echo.
echo       Demo logins (password: password123)
echo         HR       : hr@staffsync.com
echo         Manager  : manager@staffsync.com
echo         Employee : employee@staffsync.com
echo.
echo ============================================
echo   Close this window to stop both servers.
echo ============================================
echo.

:: Start the API server in a new window
start "StaffSync API" cmd /k "cd /d "%~dp0server" && npm run dev"

:: Start the Vite dev server in this window
cd /d "%~dp0client"
call npm run dev
