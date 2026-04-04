@echo off
:: Agent Dashboard — Start (or restart) the dashboard server on port 8099

set "PORT=8099"
set "ADVISOR_DIR=%~dp0"

:: Kill any existing process on the port
powershell -NoProfile -Command ^
  "(Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue).OwningProcess | Sort-Object -Unique | ForEach-Object {" ^
  "  Write-Host 'Stopping existing server on port %PORT% (PID' $_ ')...';" ^
  "  Stop-Process -Id $_ -Force" ^
  "}"

:: Brief pause to let the port free up
timeout /t 1 /nobreak >nul

echo Starting dashboard server on port %PORT%...
start /MIN "Agent Dashboard" node "%ADVISOR_DIR%server\server.mjs"

:: Wait for server to become ready
set /a attempts=0
:wait_loop
timeout /t 1 /nobreak >nul
curl -s http://localhost:%PORT%/api/state >nul 2>&1
if %errorlevel% equ 0 goto ready
set /a attempts+=1
if %attempts% lss 10 goto wait_loop
echo ERROR: Server did not start after 10 seconds.
exit /b 1

:ready
echo Server is running at http://localhost:%PORT%
echo (You can close this window — the server runs independently)
pause
