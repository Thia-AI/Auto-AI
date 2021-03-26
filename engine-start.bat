@echo off

SET INTERNAL=%~dp0
SET INTERNAL=%INTERNAL:~0,-1%
rem ===== CUDA ENVIRONMENT =====
SET PATH=%INTERNAL%\dist\engine\CUDA;%PATH%

dist\engine\engine.exe

