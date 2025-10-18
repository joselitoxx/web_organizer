@echo off
echo Iniciando servidor web local...
echo.
cd /d "%~dp0"

REM Iniciar el servidor en segundo plano
start /b python -m http.server 8000

REM Esperar un poco para que el servidor inicie
timeout /t 2 /nobreak >nul

REM Abrir el navegador
start http://localhost:8000

echo Servidor iniciado en: http://localhost:8000
echo Para detener el servidor, cierra esta ventana o presiona Ctrl+C
echo.
pause