@echo off
chcp 65001 >nul
title 数独学院
echo ╔══════════════════════════════════════════╗
echo ║         🧩 数独学院 - 启动器             ║
echo ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:menu
echo 请选择运行模式：
echo   [1] 纯前端模式（自动部署 + 朋友可分享）
echo   [2] 完整模式（含后端数据库，管理员可查看所有用户数据）
echo   [0] 退出
echo.
set /p choice="请输入数字 (1/2/0): "

if "%choice%"=="1" goto frontend
if "%choice%"=="2" goto fullstack
if "%choice%"=="0" goto end
goto menu

:frontend
echo.
echo [纯前端模式] 构建并启动开发服务器...
if not exist "dist\index.html" (
    echo 首次运行，正在构建前端...
    call npx vite build
)
start http://localhost:5173
call npx vite --host 0.0.0.0 --port 5173
pause
goto end

:fullstack
echo.
echo [完整模式] 构建前端 + 启动后端服务器...
if not exist "dist\index.html" (
    echo 首次运行，正在构建前端...
    call npx vite build
)
start http://localhost:3000
echo 后端服务器启动中（端口 3000）...
node server/index.js
pause
goto end

:end
echo 再见！
pause
