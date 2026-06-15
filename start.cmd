@echo off
title Cafe Services Server
echo Starting server...
npm run start:local <nul
echo.
echo Terminating background node processes to free ports...
taskkill /F /IM node.exe >nul 2>&1
echo Port freed successfully.
pause
