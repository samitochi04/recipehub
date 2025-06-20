@echo off
echo Cleaning Electron build artifacts...

REM Kill any running Electron processes
taskkill /f /im electron.exe /t 2>nul

REM Wait a moment for processes to fully terminate
timeout /t 2 /nobreak >nul

REM Remove dist directory with force
if exist "dist" (
    echo Removing dist directory...
    rmdir /s /q "dist" 2>nul
    if exist "dist" (
        echo Some files are still locked, trying alternative method...
        powershell -Command "Remove-Item -Path 'dist' -Recurse -Force -ErrorAction SilentlyContinue"
    )
)

echo Cleanup completed.
