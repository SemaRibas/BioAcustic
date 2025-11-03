# ⚡ Início Rápido - Servidor Permanente

## 🎯 Objetivo
Manter o BioAcustic rodando 24/7, acessível sempre.

---

## 🚀 Opção 1: GitHub Pages (5 minutos) ⭐ MAIS FÁCIL

### Passos:

1. **Crie conta no GitHub** (se não tiver):
   - https://github.com/signup

2. **Instale Git** (se não tiver):
   - https://git-scm.com/download/win
   - Execute o instalador
   - Use configurações padrão

3. **Configure Git** (primeira vez):
   ```powershell
   git config --global user.name "Seu Nome"
   git config --global user.email "seu@email.com"
   ```

4. **Crie repositório no GitHub**:
   - Acesse: https://github.com/new
   - Nome: `bioacustic`
   - Público ou Privado (ambos funcionam)
   - Clique "Create repository"

5. **Envie o código** (no PowerShell):
   ```powershell
   cd C:\Users\SemaR\Downloads\BioAcustic
   
   git init
   git add .
   git commit -m "Initial commit - BioAcustic"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/bioacustic.git
   git push -u origin main
   ```

6. **Ative GitHub Pages**:
   - No seu repositório, vá em: `Settings` → `Pages`
   - Em "Build and deployment":
     - Source: `GitHub Actions`
   - O arquivo `.github/workflows/deploy.yml` já está configurado!
   - Clique em `Actions` → veja o deploy rodando

7. **Acesse seu site** (após ~2 minutos):
   ```
   https://SEU-USUARIO.github.io/bioacustic/
   ```

**🎉 PRONTO! Seu app está online 24/7!**

**Atualizar conteúdo:**
```powershell
git add .
git commit -m "Atualizacao"
git push
# Aguarde 2-3 minutos para deploy automático
```

---

## 🚀 Opção 2: Servidor Local Permanente (10 minutos)

### Para manter rodando no seu PC:

1. **Execute o script de instalação**:
   ```powershell
   # Clique com botão direito: "Executar como Administrador"
   .\install_service.ps1
   ```

2. **Escolha opção 1** (Instalar serviço)

3. **Siga as instruções na tela**

4. **Pronto!** Servidor rodará automaticamente sempre que ligar o PC

**Acesse:** http://localhost:8000

**Gerenciar serviço:**
- Execute novamente `install_service.ps1` como Admin
- Opções: Iniciar, Parar, Status, Desinstalar

---

## 🚀 Opção 3: Netlify (3 minutos) ⭐

### Se já tem GitHub configurado:

1. **Acesse:** https://netlify.com

2. **Login com GitHub**

3. **New site from Git** → Selecione seu repositório

4. **Configurações:**
   - Base directory: `frontend`
   - Build command: (deixe vazio)
   - Publish directory: `.` (ponto)

5. **Deploy site**

**URL:** https://seu-app.netlify.app

**Atualizar:** Só dar push no GitHub!

---

## 🚀 Opção 4: Docker (se já tem Docker instalado)

```powershell
cd C:\Users\SemaR\Downloads\BioAcustic

# Build e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

**Acesse:** http://localhost:8000

---

## 📊 Comparação Rápida

| Opção | Tempo | Dificuldade | Acesso Externo | Custo |
|-------|-------|-------------|----------------|-------|
| **GitHub Pages** | 5 min | ⭐ | ✅ Sim | Grátis |
| **Netlify** | 3 min | ⭐ | ✅ Sim | Grátis |
| **Serviço Windows** | 10 min | ⭐⭐ | ❌ Não | Grátis |
| **Docker** | 2 min | ⭐⭐⭐ | ❌ Não | Grátis |

---

## 🎯 Minha Recomendação

### Use GitHub Pages se:
- ✅ Quer compartilhar com outras pessoas
- ✅ Quer backup automático
- ✅ Não se importa que seja público

### Use Serviço Windows se:
- ✅ Quer usar só na sua rede
- ✅ Tem PC que fica ligado sempre
- ✅ Quer controle total

### Use Netlify se:
- ✅ Quer domínio customizado
- ✅ Quer analytics
- ✅ Quer HTTPS automático

---

## 🆘 Problemas?

### Git não reconhecido
**Solução:** Instale Git: https://git-scm.com/download/win

### Erro ao fazer push
**Solução:** Configure autenticação:
```powershell
# Use Personal Access Token
# Gere em: https://github.com/settings/tokens
```

### Porta 8000 em uso
**Solução:**
```powershell
# Ver processo
netstat -ano | findstr :8000

# Matar processo (substitua PID)
taskkill /PID <numero> /F
```

### Serviço não inicia
**Solução:** 
1. Execute PowerShell como Admin
2. Verifique se Python está no PATH
3. Use NSSM: https://nssm.cc/download

---

## 📚 Documentação Completa

Ver: `DEPLOYMENT_GUIDE.md` para todas as opções detalhadas

---

## ✅ Checklist

**Para GitHub Pages:**
- [ ] Conta no GitHub criada
- [ ] Git instalado
- [ ] Repositório criado
- [ ] Código enviado (`git push`)
- [ ] GitHub Pages ativado
- [ ] Aguardar 2-3 minutos
- [ ] Acessar URL

**Para Serviço Windows:**
- [ ] PowerShell como Admin
- [ ] `install_service.ps1` executado
- [ ] Opção 1 selecionada
- [ ] Serviço instalado
- [ ] Serviço iniciado
- [ ] Acessar http://localhost:8000

---

## 🎓 Próximos Passos

Depois de ter o servidor rodando:

1. **Custom Domain** (opcional):
   - Compre domínio (~$10/ano)
   - Configure DNS
   - Conecte ao GitHub Pages/Netlify

2. **HTTPS** (automático no GitHub Pages/Netlify)

3. **Analytics**:
   - Google Analytics
   - Netlify Analytics
   - Cloudflare Analytics (grátis)

4. **Backup**:
   - Git já faz backup automático! 🎉

---

**🐸 Escolha uma opção e tenha seu BioAcustic online!**

**Recomendação:** Comece com **GitHub Pages** (mais fácil + grátis + online 24/7)
