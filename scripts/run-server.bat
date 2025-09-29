@echo off
REM --- Di chuyển thẳng vào thư mục project ---
cd /d E:\work\DNC\sale-tool

REM --- Chạy web server tĩnh từ thư mục dist ---
echo Starting static server on port 80...
pnpm start

pause
