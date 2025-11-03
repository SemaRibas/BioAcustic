# ========================================
# BioAcustic - Start Server Script (PowerShell)
# ========================================

$host.UI.RawUI.WindowTitle = "BioAcustic Server"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BioAcustic - Servidor Local" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navegar para diretório do frontend
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptPath "frontend")

# Verificar se Python está instalado
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] Python encontrado: $pythonVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERRO] Python nao encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instale Python 3:" -ForegroundColor Yellow
    Write-Host "https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar porta 8000
$port = 8000
$portInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "[AVISO] Porta $port ja esta em uso!" -ForegroundColor Yellow
    Write-Host ""
    $kill = Read-Host "Deseja encerrar o processo? (S/N)"
    
    if ($kill -eq "S" -or $kill -eq "s") {
        $processId = (Get-NetTCPConnection -LocalPort $port).OwningProcess
        Stop-Process -Id $processId -Force
        Write-Host "[OK] Processo encerrado" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host ""
        Write-Host "Escolha outra porta ou encerre o processo manualmente." -ForegroundColor Yellow
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}

# Obter IP local
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"} | Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando servidor..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL Local:     " -NoNewline -ForegroundColor White
Write-Host "http://localhost:$port" -ForegroundColor Green
Write-Host "URL Rede:      " -NoNewline -ForegroundColor White
Write-Host "http://${localIP}:$port" -ForegroundColor Green
Write-Host "URL App:       " -NoNewline -ForegroundColor White
Write-Host "http://localhost:$port/index.html" -ForegroundColor Green
Write-Host "URL Treino:    " -NoNewline -ForegroundColor White
Write-Host "http://localhost:$port/train.html" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Tentar abrir navegador
try {
    Start-Process "http://localhost:$port/index.html"
} catch {
    Write-Host "[INFO] Nao foi possivel abrir o navegador automaticamente" -ForegroundColor Yellow
}

# Iniciar servidor HTTP
python -m http.server $port
