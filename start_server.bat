@echo off
REM ========================================
REM BioAcustic - Start Server Script
REM ========================================

title BioAcustic Server

echo.
echo ========================================
echo   BioAcustic - Servidor Local
echo ========================================
echo.

REM Navegar para diretório do frontend
cd /d "%~dp0frontend"

REM Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado!
    echo.
    echo Por favor, instale Python 3:
    echo https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo [OK] Python encontrado
echo.

REM Verificar porta 8000
netstat -ano | findstr :8000 >nul
if not errorlevel 1 (
    echo [AVISO] Porta 8000 ja esta em uso!
    echo.
    set /p KILL="Deseja encerrar o processo? (S/N): "
    if /i "%KILL%"=="S" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
            taskkill /PID %%a /F >nul 2>&1
        )
        echo [OK] Processo encerrado
        timeout /t 2 >nul
    ) else (
        echo.
        echo Escolha outra porta ou encerre o processo manualmente.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   Iniciando servidor...
echo ========================================
echo.
echo URL Local:     http://localhost:8000
echo URL Rede:      http://%COMPUTERNAME%:8000
echo.
echo Pressione Ctrl+C para parar o servidor
echo ========================================
echo.

REM Iniciar servidor HTTP
python -m http.server 8000

pause
