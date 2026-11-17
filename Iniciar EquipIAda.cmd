@echo off
setlocal
cd /d "%~dp0"
if exist "%LOCALAPPDATA%\EquipIAda\node\node.exe" (
  "%LOCALAPPDATA%\EquipIAda\node\node.exe" "%~dp0scripts\startLocal.mjs"
) else (
  node "%~dp0scripts\startLocal.mjs"
)
if errorlevel 1 pause
