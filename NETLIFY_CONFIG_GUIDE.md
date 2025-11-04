# ⚙️ Configuração Netlify - Guia Visual

## 📁 Estrutura de Arquivos Correta

```
BioAcustic/                          ← Repositório raiz
│
├── netlify.toml                     ← Configuração Netlify (RAIZ)
├── .gitignore
├── README.md
│
├── frontend/                        ← Base directory no Netlify
│   │
│   ├── _redirects                   ← Para SPA routing
│   ├── index.html                   ← Página principal
│   ├── train.html                   ← Página de treinamento
│   ├── favicon.svg
│   │
│   ├── js/                          ← Módulos JavaScript
│   │   ├── app.js
│   │   ├── model.js
│   │   ├── audio.js
│   │   ├── ui.js
│   │   └── trainer.js
│   │
│   └── assets/
│       └── model/
│           ├── metadata.json
│           ├── class_names.json
│           └── README.md
│
├── backend/                         ← Não usado no deploy (apenas local)
│   └── ...
│
├── docs/
│   └── ...
│
└── outros arquivos de documentação
```

---

## ⚙️ Arquivo netlify.toml

**Localização:** `C:\Users\SemaR\Downloads\BioAcustic\netlify.toml`

```toml
# Build settings
[build]
  # IMPORTANTE: Aponta para a pasta frontend
  base = "frontend"
  
  # Vazio = sem build (site estático)
  command = ""
  
  # IMPORTANTE: Apenas um ponto (publish a partir de frontend/)
  publish = "."

# Redirecionamento para SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false

# Headers de segurança
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

---

## 📄 Arquivo _redirects

**Localização:** `C:\Users\SemaR\Downloads\BioAcustic\frontend\_redirects`

```
# Redireciona todas as rotas para index.html (SPA)
/*    /index.html   200
```

---

## 🖥️ Configuração no Dashboard Netlify

### Passo 1: Build Settings

```
┌─────────────────────────────────────────────┐
│ Build settings                              │
├─────────────────────────────────────────────┤
│                                             │
│ Base directory:                             │
│ ┌─────────────────────────────────────────┐│
│ │ frontend                                ││
│ └─────────────────────────────────────────┘│
│                                             │
│ Build command:                              │
│ ┌─────────────────────────────────────────┐│
│ │                                         ││ ← DEIXE VAZIO
│ └─────────────────────────────────────────┘│
│                                             │
│ Publish directory:                          │
│ ┌─────────────────────────────────────────┐│
│ │ .                                       ││ ← APENAS UM PONTO
│ └─────────────────────────────────────────┘│
│                                             │
│ [ Save ]                                    │
└─────────────────────────────────────────────┘
```

### Passo 2: Deploy Settings

```
┌─────────────────────────────────────────────┐
│ Deploy settings                             │
├─────────────────────────────────────────────┤
│                                             │
│ Branch to deploy:                           │
│ ┌─────────────────────────────────────────┐│
│ │ main                                    ││
│ └─────────────────────────────────────────┘│
│                                             │
│ Production branch:                          │
│ • main                                      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ✅ Checklist de Verificação

### Antes de Fazer Deploy:

- [ ] **netlify.toml** existe na RAIZ do repositório
- [ ] **frontend/_redirects** existe
- [ ] Todos arquivos HTML estão em `frontend/`
- [ ] Todos arquivos JS estão em `frontend/js/`
- [ ] Git está configurado corretamente
- [ ] Último commit inclui netlify.toml

### No Netlify Dashboard:

- [ ] Base directory = `frontend`
- [ ] Build command = ` ` (vazio)
- [ ] Publish directory = `.` (ponto)
- [ ] Branch = `main` (ou `master`)

### Após Deploy:

- [ ] Status = **Published** (verde)
- [ ] Site carrega sem 404
- [ ] Console sem erros (F12)
- [ ] Navegação funciona (index.html ↔ train.html)

---

## 🎯 Configurações Comuns (Correto vs Incorreto)

### ❌ INCORRETO

```toml
[build]
  base = "."                    # ❌ Errado
  publish = "frontend"          # ❌ Errado
```

```
Dashboard:
Base directory: (vazio)         # ❌ Errado
Publish directory: frontend     # ❌ Errado
```

### ✅ CORRETO

```toml
[build]
  base = "frontend"             # ✅ Correto
  publish = "."                 # ✅ Correto
```

```
Dashboard:
Base directory: frontend        # ✅ Correto
Publish directory: .            # ✅ Correto (apenas ponto)
```

---

## 🔍 Como Verificar se Está Correto

### 1. Estrutura no Deploy Log

No log de deploy, você deve ver:

```
2:34:56 PM: Base directory located at /opt/build/repo/frontend
2:34:57 PM: Publishing directory located at /opt/build/repo/frontend/.
2:34:58 PM: Processing files...
2:34:59 PM: - index.html
2:35:00 PM: - train.html
2:35:01 PM: - js/app.js
2:35:02 PM: - js/model.js
...
2:35:10 PM: Site is live ✨
```

**Se ver:**
```
❌ No files found in publish directory
❌ index.html not found
```
→ Publish directory está errado!

### 2. URL Funcionando

Teste estas URLs:

```
✅ https://seu-app.netlify.app/
✅ https://seu-app.netlify.app/index.html
✅ https://seu-app.netlify.app/train.html
✅ https://seu-app.netlify.app/js/app.js
```

Se alguma der 404 → configuração errada

### 3. Console do Navegador

Abra: https://seu-app.netlify.app

Press F12 → Console

**Deve ver:**
```javascript
✅ TensorFlow.js carregado: 4.x.x
✅ AudioProcessor inicializado
✅ BrowserTrainer inicializado
```

**Se ver erros:**
```javascript
❌ Failed to load module script: Expected a JavaScript module...
❌ Uncaught TypeError: Cannot read property...
```
→ Problema com paths ou MIME types

---

## 🚀 Deploy do Zero (Passo a Passo Completo)

### Terminal/PowerShell:

```powershell
# 1. Navegar para projeto
cd C:\Users\SemaR\Downloads\BioAcustic

# 2. Verificar Git
git status

# 3. Adicionar arquivos novos (netlify.toml, _redirects)
git add netlify.toml frontend/_redirects

# 4. Commit
git commit -m "Add Netlify configuration"

# 5. Push
git push
```

### No Netlify:

1. **Login:** https://app.netlify.com

2. **Add new site**

3. **Import an existing project**

4. **Connect to Git provider** → GitHub

5. **Pick a repository** → bioacustic

6. **Configure:**
   - Base: `frontend`
   - Build: (vazio)
   - Publish: `.`

7. **Deploy site**

8. **Aguardar** (1-2 min)

9. **Acessar:** https://seu-app.netlify.app

---

## 💡 Dicas de Ouro

### 1. Se deploy falhar, olhe o LOG

**Deploys** → Clique no deploy → **Deploy log**

Leia TODO o log, especialmente:
- Base directory
- Publish directory  
- Files processed
- Erros (se houver)

### 2. Teste com Deploy Manual

Se Git não funcionar:

```powershell
cd frontend
Compress-Archive -Path * -DestinationPath ..\netlify-manual.zip
```

No Netlify: **Deploys** → Arraste o ZIP

### 3. Use Netlify CLI

```powershell
npm install -g netlify-cli
netlify login
cd frontend
netlify deploy --prod
```

Mais controle e debug!

### 4. Compare com Site Funcionando

Veja o exemplo no ar:
- https://bioacustic-demo.netlify.app (exemplo)

Compare console, network, estrutura

---

## 📞 Precisa de Ajuda?

**Me envie:**

1. **URL do site:** https://seu-app.netlify.app
2. **Deploy log completo** (copie/cole)
3. **Screenshot do console** (F12)
4. **Build settings screenshot**

Com isso posso ajudar especificamente! 🐸

---

## 🎓 Resumo Visual

```
┌─────────────────────────────────────────────┐
│  ARQUIVOS                                   │
├─────────────────────────────────────────────┤
│  ✅ netlify.toml (raiz)                     │
│  ✅ frontend/_redirects                     │
│  ✅ frontend/index.html                     │
│  ✅ frontend/train.html                     │
│  ✅ frontend/js/*.js                        │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│  GIT                                        │
├─────────────────────────────────────────────┤
│  git add .                                  │
│  git commit -m "Deploy"                     │
│  git push                                   │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│  NETLIFY                                    │
├─────────────────────────────────────────────┤
│  Base: frontend                             │
│  Build: (vazio)                             │
│  Publish: .                                 │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│  RESULTADO                                  │
├─────────────────────────────────────────────┤
│  ✅ https://seu-app.netlify.app            │
└─────────────────────────────────────────────┘
```

**Siga esta ordem e vai funcionar! 🚀**
