@echo off
cd /d %~dp0
if not exist .local (
  mkdir .local
)
D:\bin\redis\redis-server.exe redis.conf
pause
