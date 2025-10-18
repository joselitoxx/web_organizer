@echo off
echo Iniciando servidor web local...
echo.
echo El servidor se ejecutará en: http://localhost:8000
echo Para detener el servidor presiona Ctrl+C
echo.
cd /d "%~dp0"
python -m http.server 8000
pause