@echo off
cd /d %~dp0
if not exist .local (
  mkdir .local
)
redis-server.exe redis.conf
pause
