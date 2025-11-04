# ========================================
# BioAcustic - Preparar Deploy Netlify
# ========================================

$host.UI.RawUI.WindowTitle = "BioAcustic - Preparar Deploy"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BioAcustic - Deploy Netlify" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Verificar estrutura
Write-Host "[1/5] Verificando estrutura de arquivos..." -ForegroundColor Yellow

$requiredFiles = @(
    "frontend\index.html",
    "frontend\train.html",
    "frontend\js\app.js",
    "frontend\js\model.js",
    "frontend\js\audio.js",
    "frontend\js\ui.js",
    "frontend\js\trainer.js",
    "netlify.toml",
    "frontend\_redirects"
)

$missing = @()
foreach ($file in $requiredFiles) {
    $fullPath = Join-Path $scriptPath $file
    if (-not (Test-Path $fullPath)) {
        $missing += $file
    }
}

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "[ERRO] Arquivos faltando:" -ForegroundColor Red
    foreach ($file in $missing) {
        Write-Host "  ❌ $file" -ForegroundColor Red
    }
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "  ✅ Todos arquivos encontrados" -ForegroundColor Green

# Verificar netlify.toml
Write-Host ""
Write-Host "[2/5] Verificando netlify.toml..." -ForegroundColor Yellow

$netlifyToml = Join-Path $scriptPath "netlify.toml"
$content = Get-Content $netlifyToml -Raw

if ($content -match 'base\s*=\s*"frontend"' -and $content -match 'publish\s*=\s*"."') {
    Write-Host "  ✅ Configuração correta" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Configuração pode estar incorreta" -ForegroundColor Yellow
    Write-Host "  Verifique se netlify.toml tem:" -ForegroundColor Yellow
    Write-Host "    base = ""frontend""" -ForegroundColor White
    Write-Host "    publish = "".""" -ForegroundColor White
}

# Verificar Git
Write-Host ""
Write-Host "[3/5] Verificando Git..." -ForegroundColor Yellow

if (Test-Path (Join-Path $scriptPath ".git")) {
    Write-Host "  ✅ Repositório Git inicializado" -ForegroundColor Green
    
    # Verificar status
    $status = git status --porcelain 2>&1
    if ($status) {
        Write-Host "  ⚠️  Há mudanças não commitadas" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Arquivos modificados:" -ForegroundColor White
        git status --short
        Write-Host ""
        
        $commit = Read-Host "Deseja fazer commit agora? (S/N)"
        if ($commit -eq "S" -or $commit -eq "s") {
            git add .
            $message = Read-Host "Mensagem do commit"
            if ([string]::IsNullOrWhiteSpace($message)) {
                $message = "Update BioAcustic - Configuracao Netlify"
            }
            git commit -m $message
            Write-Host "  ✅ Commit realizado" -ForegroundColor Green
        }
    } else {
        Write-Host "  ✅ Nenhuma mudança pendente" -ForegroundColor Green
    }
    
    # Verificar remote
    $remote = git remote get-url origin 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Remote configurado: $remote" -ForegroundColor Green
        
        Write-Host ""
        $push = Read-Host "Deseja fazer push agora? (S/N)"
        if ($push -eq "S" -or $push -eq "s") {
            Write-Host "  Fazendo push..." -ForegroundColor Yellow
            git push
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Push realizado com sucesso" -ForegroundColor Green
            } else {
                Write-Host "  ❌ Erro ao fazer push" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  ⚠️  Remote não configurado" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Configure com:" -ForegroundColor White
        Write-Host "    git remote add origin https://github.com/seu-usuario/bioacustic.git" -ForegroundColor Cyan
    }
} else {
    Write-Host "  ❌ Git não inicializado" -ForegroundColor Red
    Write-Host ""
    $init = Read-Host "Deseja inicializar Git agora? (S/N)"
    if ($init -eq "S" -or $init -eq "s") {
        git init
        Write-Host "  ✅ Git inicializado" -ForegroundColor Green
        Write-Host ""
        Write-Host "  Próximos passos:" -ForegroundColor Yellow
        Write-Host "    1. Crie repositório no GitHub" -ForegroundColor White
        Write-Host "    2. git remote add origin URL" -ForegroundColor White
        Write-Host "    3. git add ." -ForegroundColor White
        Write-Host "    4. git commit -m 'Initial commit'" -ForegroundColor White
        Write-Host "    5. git push -u origin main" -ForegroundColor White
    }
}

# Teste local
Write-Host ""
Write-Host "[4/5] Teste local..." -ForegroundColor Yellow

$test = Read-Host "Deseja testar localmente antes? (S/N)"
if ($test -eq "S" -or $test -eq "s") {
    Write-Host ""
    Write-Host "  Iniciando servidor local..." -ForegroundColor Yellow
    Write-Host "  Acesse: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "  Pressione Ctrl+C para parar" -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location (Join-Path $scriptPath "frontend")
    python -m http.server 8000
}

# Instruções finais
Write-Host ""
Write-Host "[5/5] Próximos passos no Netlify:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Acesse: https://app.netlify.com" -ForegroundColor White
Write-Host "  2. Add new site → Import an existing project" -ForegroundColor White
Write-Host "  3. Connect to GitHub → Selecione seu repositório" -ForegroundColor White
Write-Host "  4. Configure build settings:" -ForegroundColor White
Write-Host "     Base directory: frontend" -ForegroundColor Cyan
Write-Host "     Build command: (deixe vazio)" -ForegroundColor Cyan
Write-Host "     Publish directory: ." -ForegroundColor Cyan
Write-Host "  5. Deploy site!" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ Preparação concluída!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Seu site estará em:" -ForegroundColor Yellow
Write-Host "  https://seu-app.netlify.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Problemas? Veja: NETLIFY_TROUBLESHOOTING.md" -ForegroundColor Yellow
Write-Host ""

Read-Host "Pressione Enter para sair"
