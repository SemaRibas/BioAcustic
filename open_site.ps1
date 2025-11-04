# Script para abrir ambas as páginas do BioAcustic
# Execute este script para visualizar o novo design

Write-Host "🐸 Abrindo BioAcustic com novo design..." -ForegroundColor Green
Write-Host ""

# Página Principal
Write-Host "📱 Abrindo página principal..." -ForegroundColor Cyan
Start-Process "http://localhost:8000/frontend/index.html"
Start-Sleep -Seconds 1

# Página de Treinamento
Write-Host "🎓 Abrindo página de treinamento..." -ForegroundColor Magenta
Start-Process "http://localhost:8000/frontend/train.html"

Write-Host ""
Write-Host "✅ Páginas abertas com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Recursos do novo design:" -ForegroundColor Yellow
Write-Host "  • Design system profissional e consistente"
Write-Host "  • Paleta de cores temática (verde natureza + azul tecnologia)"
Write-Host "  • Animações suaves e modernas"
Write-Host "  • 100% responsivo"
Write-Host "  • Componentes reutilizáveis"
Write-Host ""
Write-Host "📚 Documentação disponível em:" -ForegroundColor Yellow
Write-Host "  • frontend/DESIGN_GUIDE.md"
Write-Host "  • frontend/DESIGN_UPDATE.md"
Write-Host "  • frontend/css/design-system.css"
Write-Host ""
