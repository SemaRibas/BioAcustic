# ========================================
# BioAcustic - Instalador de Serviço Windows
# Execute como Administrador!
# ========================================

# Verificar privilégios de administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host "[ERRO] Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Clique com botao direito e selecione 'Executar como Administrador'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BioAcustic - Serviço Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Menu
Write-Host "Escolha uma opcao:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Instalar servico (iniciar automaticamente)" -ForegroundColor White
Write-Host "2. Desinstalar servico" -ForegroundColor White
Write-Host "3. Iniciar servico" -ForegroundColor White
Write-Host "4. Parar servico" -ForegroundColor White
Write-Host "5. Ver status do servico" -ForegroundColor White
Write-Host "6. Sair" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Opcao"

$serviceName = "BioAcusticServer"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonPath = (Get-Command python).Source
$workingDir = Join-Path $scriptPath "frontend"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Instalando servico..." -ForegroundColor Yellow
        
        # Verificar se serviço já existe
        $existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
        if ($existingService) {
            Write-Host "[AVISO] Servico ja existe. Removendo..." -ForegroundColor Yellow
            Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
            sc.exe delete $serviceName
            Start-Sleep -Seconds 2
        }
        
        # Criar script wrapper
        $wrapperScript = @"
@echo off
cd /d "$workingDir"
"$pythonPath" -m http.server 8000
"@
        $wrapperPath = Join-Path $scriptPath "bioacustic_service.bat"
        $wrapperScript | Out-File -FilePath $wrapperPath -Encoding ASCII
        
        # Criar serviço usando NSSM ou sc.exe
        Write-Host ""
        Write-Host "NOTA: Para melhor controle, recomenda-se usar NSSM." -ForegroundColor Cyan
        Write-Host "Baixe em: https://nssm.cc/download" -ForegroundColor Cyan
        Write-Host ""
        $useNSSM = Read-Host "Tem NSSM instalado? (S/N)"
        
        if ($useNSSM -eq "S" -or $useNSSM -eq "s") {
            $nssmPath = Read-Host "Digite o caminho completo do nssm.exe"
            
            if (Test-Path $nssmPath) {
                & $nssmPath install $serviceName $wrapperPath
                & $nssmPath set $serviceName AppDirectory $workingDir
                & $nssmPath set $serviceName DisplayName "BioAcustic Server"
                & $nssmPath set $serviceName Description "Servidor HTTP para aplicacao BioAcustic"
                & $nssmPath set $serviceName Start SERVICE_AUTO_START
                
                Write-Host ""
                Write-Host "[OK] Servico instalado com sucesso!" -ForegroundColor Green
                Write-Host ""
                
                $startNow = Read-Host "Deseja iniciar o servico agora? (S/N)"
                if ($startNow -eq "S" -or $startNow -eq "s") {
                    Start-Service -Name $serviceName
                    Write-Host "[OK] Servico iniciado!" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "Acesse: http://localhost:8000" -ForegroundColor Cyan
                }
            } else {
                Write-Host "[ERRO] NSSM nao encontrado em: $nssmPath" -ForegroundColor Red
            }
        } else {
            Write-Host ""
            Write-Host "[INFO] Instalando com sc.exe (limitado)..." -ForegroundColor Yellow
            Write-Host ""
            
            $binarypathname = "cmd.exe /c `"$wrapperPath`""
            sc.exe create $serviceName binPath= $binarypathname start= auto DisplayName= "BioAcustic Server"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Servico instalado!" -ForegroundColor Green
                Write-Host ""
                Write-Host "[AVISO] Com sc.exe, o servico pode nao funcionar perfeitamente." -ForegroundColor Yellow
                Write-Host "Recomenda-se usar NSSM para producao." -ForegroundColor Yellow
            } else {
                Write-Host "[ERRO] Falha ao instalar servico" -ForegroundColor Red
            }
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "Desinstalando servico..." -ForegroundColor Yellow
        
        $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
        if ($service) {
            Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
            sc.exe delete $serviceName
            
            Write-Host "[OK] Servico desinstalado!" -ForegroundColor Green
        } else {
            Write-Host "[INFO] Servico nao encontrado" -ForegroundColor Yellow
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "Iniciando servico..." -ForegroundColor Yellow
        
        Start-Service -Name $serviceName -ErrorAction SilentlyContinue
        if ($?) {
            Write-Host "[OK] Servico iniciado!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Acesse: http://localhost:8000" -ForegroundColor Cyan
        } else {
            Write-Host "[ERRO] Falha ao iniciar servico" -ForegroundColor Red
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "Parando servico..." -ForegroundColor Yellow
        
        Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
        if ($?) {
            Write-Host "[OK] Servico parado!" -ForegroundColor Green
        } else {
            Write-Host "[ERRO] Falha ao parar servico" -ForegroundColor Red
        }
    }
    
    "5" {
        Write-Host ""
        $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
        
        if ($service) {
            Write-Host "Status do servico:" -ForegroundColor Cyan
            Write-Host "  Nome: $($service.Name)" -ForegroundColor White
            Write-Host "  Status: $($service.Status)" -ForegroundColor $(if ($service.Status -eq "Running") { "Green" } else { "Yellow" })
            Write-Host "  Tipo de inicio: $($service.StartType)" -ForegroundColor White
            
            if ($service.Status -eq "Running") {
                Write-Host ""
                Write-Host "Servidor ativo em: http://localhost:8000" -ForegroundColor Green
            }
        } else {
            Write-Host "[INFO] Servico nao instalado" -ForegroundColor Yellow
        }
    }
    
    "6" {
        Write-Host ""
        Write-Host "Saindo..." -ForegroundColor Yellow
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "[ERRO] Opcao invalida!" -ForegroundColor Red
    }
}

Write-Host ""
Read-Host "Pressione Enter para sair"
