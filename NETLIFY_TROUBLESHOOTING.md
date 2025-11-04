# 🔧 Troubleshooting - Deploy Netlify

## ❌ Problema: Site não carrega no Netlify

### Diagnóstico Rápido

1. **Verifique o log de deploy:**
   - No Netlify dashboard → seu site → Deploys
   - Clique no deploy mais recente
   - Veja se há erros

2. **Verifique a URL de produção:**
   - Acesse: `https://seu-app.netlify.app`
   - Abra DevTools (F12) → Console
   - Veja se há erros

---

## ✅ Soluções

### Solução 1: Reconfigurar Build Settings

No Netlify Dashboard:

1. **Site Settings** → **Build & Deploy** → **Build Settings**

2. Configure assim:
   ```
   Base directory: frontend
   Build command: (deixe vazio ou delete)
   Publish directory: . (apenas um ponto)
   ```

3. **Save** e faça novo deploy:
   - Deploys → Trigger deploy → Deploy site

### Solução 2: Verificar Estrutura de Arquivos

**O Netlify precisa:**
```
frontend/
├── index.html          ✅ Obrigatório
├── train.html         ✅ Obrigatório
├── _redirects         ✅ Criado (para SPA)
├── favicon.svg        ✅ 
├── js/
│   ├── app.js        ✅
│   ├── model.js      ✅
│   ├── audio.js      ✅
│   ├── ui.js         ✅
│   └── trainer.js    ✅
└── assets/
    └── model/
        ├── metadata.json  ✅
        └── class_names.json ✅
```

### Solução 3: Testar Localmente Primeiro

```powershell
cd frontend
python -m http.server 8000
```

Acesse: http://localhost:8000

**Se funcionar local mas não no Netlify:**
- Problema é configuração do deploy
- Continue para próximas soluções

### Solução 4: Verificar MIME Types

O arquivo `netlify.toml` já está configurado com MIME types corretos.

**Verifique se está no diretório raiz:**
```
C:\Users\SemaR\Downloads\BioAcustic\netlify.toml
```

### Solução 5: Deploy Manual (Drag & Drop)

Se o deploy via Git não funciona:

1. **Crie um arquivo ZIP:**
   ```powershell
   cd C:\Users\SemaR\Downloads\BioAcustic
   Compress-Archive -Path frontend\* -DestinationPath bioacustic-deploy.zip
   ```

2. **No Netlify:**
   - Sites → (novo site ou existente)
   - Arraste `bioacustic-deploy.zip` na área de drop
   - Aguarde upload e deploy

### Solução 6: Verificar .gitignore

O `.gitignore` pode estar excluindo arquivos necessários.

**Verifique:**
```powershell
cd C:\Users\SemaR\Downloads\BioAcustic
Get-Content .gitignore
```

**Certifique-se que NÃO está ignorando:**
- `frontend/`
- `*.html`
- `*.js`
- `*.json`
- `*.css`

### Solução 7: Deploy via Netlify CLI

```powershell
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd C:\Users\SemaR\Downloads\BioAcustic\frontend
netlify deploy --prod

# Siga as instruções
```

---

## 🔍 Erros Comuns e Soluções

### Erro 1: "Page Not Found" (404)

**Causa:** Configuração de publish directory errada

**Solução:**
```
Build settings:
Base directory: frontend
Publish directory: . (apenas um ponto, não "frontend")
```

### Erro 2: Módulos JavaScript não carregam

**Causa:** MIME type incorreto ou CORS

**Solução:** Arquivo `netlify.toml` já está correto. Se ainda falhar:

1. Verifique console (F12) no site
2. Se erro de CORS, adicione ao `netlify.toml`:
   ```toml
   [[headers]]
     for = "/*"
     [headers.values]
       Access-Control-Allow-Origin = "*"
   ```

### Erro 3: TensorFlow.js não carrega

**Causa:** CDN bloqueado ou timeout

**Solução:** Já está usando CDN oficial. Se falhar:

1. Verifique internet
2. Tente outro CDN:
   ```html
   <!-- Alternativa 1: jsDelivr -->
   <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest"></script>
   
   <!-- Alternativa 2: unpkg -->
   <script src="https://unpkg.com/@tensorflow/tfjs@latest"></script>
   ```

### Erro 4: Assets não encontrados (404)

**Causa:** Caminhos relativos incorretos

**Verificar em `index.html` e `train.html`:**
```html
<!-- ✅ Correto (caminhos relativos) -->
<script type="module" src="./js/app.js"></script>
<link rel="icon" href="./favicon.svg">

<!-- ❌ Incorreto (caminhos absolutos) -->
<script type="module" src="/js/app.js"></script>
<link rel="icon" href="/favicon.svg">
```

### Erro 5: "Function failed" durante build

**Causa:** Tentando executar comando de build desnecessário

**Solução:**
```
Build command: (deixe VAZIO)
```

Não precisa de build para site estático!

---

## 📋 Checklist de Verificação

### Antes do Deploy:

- [ ] `netlify.toml` existe na raiz
- [ ] `frontend/_redirects` existe
- [ ] Todos arquivos HTML/JS/JSON estão no `frontend/`
- [ ] `.gitignore` não exclui arquivos necessários
- [ ] Funciona local (http://localhost:8000)

### Configuração Netlify:

- [ ] Base directory: `frontend`
- [ ] Build command: (vazio)
- [ ] Publish directory: `.` (ponto)
- [ ] Deploy branch: `main` ou `master`

### Após Deploy:

- [ ] Deploy status: Published ✅
- [ ] Site carrega (sem 404)
- [ ] Console sem erros (F12)
- [ ] Links funcionam (index.html, train.html)
- [ ] Modules JS carregam
- [ ] TensorFlow.js inicializa

---

## 🚀 Passo a Passo Completo (Do Zero)

### 1. Prepare o Repositório

```powershell
cd C:\Users\SemaR\Downloads\BioAcustic

# Verificar arquivos
git status

# Adicionar novos arquivos (netlify.toml, _redirects)
git add netlify.toml frontend/_redirects
git commit -m "Add Netlify configuration"
git push
```

### 2. Configure no Netlify

1. **Login:** https://app.netlify.com
2. **Add new site** → **Import an existing project**
3. **Connect to Git provider** → GitHub
4. **Pick a repository** → seu repositório
5. **Build settings:**
   ```
   Base directory: frontend
   Build command: (deixe vazio)
   Publish directory: .
   ```
6. **Deploy site**

### 3. Aguarde Deploy (1-2 minutos)

Veja o log em tempo real.

### 4. Teste o Site

```
https://seu-app.netlify.app
```

**Teste:**
- [ ] Página principal carrega
- [ ] Console sem erros (F12)
- [ ] Click em "Treinar Modelo" funciona
- [ ] Upload de áudio funciona (se tiver modelo)

### 5. Configure Custom Domain (Opcional)

**Settings** → **Domain management** → **Add custom domain**

---

## 💡 Dicas Extras

### 1. Preview Deploy

Para cada branch, Netlify cria preview:
```
https://deploy-preview-123--seu-app.netlify.app
```

### 2. Environment Variables

Se precisar de variáveis:

**Site settings** → **Environment variables**

### 3. Logs Detalhados

No painel de deploy, clique em **"Deploy log"** para ver detalhes.

### 4. Rollback

Se deploy quebrar:

**Deploys** → Selecione deploy anterior → **Publish deploy**

---

## 🆘 Ainda Não Funciona?

### Opção A: Deploy Manual ZIP

```powershell
# Criar ZIP apenas da pasta frontend
cd C:\Users\SemaR\Downloads\BioAcustic\frontend
Compress-Archive -Path * -DestinationPath ..\bioacustic-netlify.zip

# No Netlify: Sites → Deploys → Drag & drop o ZIP
```

### Opção B: Netlify CLI

```powershell
npm install -g netlify-cli
netlify login
cd C:\Users\SemaR\Downloads\BioAcustic\frontend
netlify deploy --prod --dir=.
```

### Opção C: Mudar para Vercel

Se Netlify não funcionar, tente Vercel:

```powershell
npm install -g vercel
cd C:\Users\SemaR\Downloads\BioAcustic\frontend
vercel --prod
```

---

## 📞 Verificação Final

**Envie os seguintes logs:**

1. **Log de deploy do Netlify:**
   - Copie todo texto do deploy log

2. **Erros do Console:**
   - F12 → Console → copie erros (se houver)

3. **URL do site:**
   - `https://seu-app.netlify.app`

4. **Screenshot** do erro (se houver)

Com essas informações posso ajudar mais especificamente!

---

## ✅ Configuração Correta (Resumo)

**Arquivo `netlify.toml` na raiz:**
```toml
[build]
  base = "frontend"
  publish = "."
```

**Arquivo `frontend/_redirects`:**
```
/*    /index.html   200
```

**Build Settings no Netlify:**
```
Base directory: frontend
Build command: (vazio)
Publish directory: .
```

**Estrutura de arquivos:**
```
BioAcustic/
├── netlify.toml           ← Na raiz
├── frontend/
│   ├── _redirects        ← Aqui dentro
│   ├── index.html
│   ├── train.html
│   └── js/
│       └── ...
```

---

**🐸 Siga este guia e seu site estará online no Netlify!**

**Qual erro específico você está vendo?**
- URL do site?
- Mensagem de erro?
- Screenshot?
