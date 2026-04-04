@echo off
:: Agent Advisor — Register plugin with Claude Code
:: Requires Node.js (already used by the dashboard server)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is required but not found in PATH.
    exit /b 1
)

node "%~dp0scripts\install.mjs"

pause
