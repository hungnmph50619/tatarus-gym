@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Taurus Gym - Khoi dong
where node >nul 2>nul
if errorlevel 1 (
 echo Chua cai Node.js. Vui long cai Node.js LTS truoc.
 pause
 exit /b 1
)
if not exist node_modules (
 call npm.cmd install
 if errorlevel 1 goto loi
)
if not exist .next\BUILD_ID (
 call npm.cmd run build
 if errorlevel 1 goto loi
)
start "" "http://localhost:3000"
call npm.cmd run start
pause
exit /b 0
:loi
echo Khong the khoi dong Taurus Gym.
pause
exit /b 1
