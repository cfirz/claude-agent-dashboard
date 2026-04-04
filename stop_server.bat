@echo off
:: Agent Dashboard — Stop any running server instances on port 8099

set "PORT=8099"

echo Checking for server on port %PORT%...
powershell -NoProfile -Command ^
  "$pids = (Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue).OwningProcess | Sort-Object -Unique;" ^
  "if ($pids) { $pids | ForEach-Object { Write-Host \"Stopping PID $_...\"; Stop-Process -Id $_ -Force }; Write-Host 'Server stopped.' }" ^
  "else { Write-Host 'No server running on port %PORT%.' }"

pause
