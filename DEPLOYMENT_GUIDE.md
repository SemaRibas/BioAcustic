# 🚀 Deployment - Servidor Permanente

## 📋 Visão Geral

Este guia mostra como manter o BioAcustic rodando permanentemente, acessível 24/7, mesmo com o PC desligado.

## 🎯 Opções de Deployment

### Opção 1: GitHub Pages (Mais Fácil) ⭐ RECOMENDADO

**Características:**
- ✅ 100% Gratuito
- ✅ HTTPS automático
- ✅ Não precisa de servidor
- ✅ Deploy automático
- ✅ Rápido e confiável

**Limitações:**
- ⚠️ Apenas frontend (sem backend Python)
- ⚠️ Perfeito para treinamento no navegador

#### Passo a Passo:

1. **Crie repositório no GitHub:**
   ```bash
   # No diretório do projeto
   git init
   git add .
   git commit -m "Initial commit - BioAcustic"
   
   # Crie repositório em: https://github.com/new
   git remote add origin https://github.com/seu-usuario/bioacustic.git
   git push -u origin main
   ```

2. **Ative GitHub Pages:**
   - Vá em: `Settings` → `Pages`
   - Source: `Deploy from a branch`
   - Branch: `main` / `frontend`
   - Clique `Save`

3. **Configure arquivo de configuração:**
   
   Crie `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./frontend
   ```

4. **Acesse seu site:**
   ```
   https://seu-usuario.github.io/bioacustic/
   ```

**🎉 Pronto! Seu app está online 24/7!**

---

### Opção 2: Netlify (Muito Fácil) ⭐

**Características:**
- ✅ Gratuito (100GB/mês)
- ✅ Deploy em segundos
- ✅ HTTPS automático
- ✅ Custom domain
- ✅ Formulários e funções serverless

#### Passo a Passo:

1. **Crie conta:** https://netlify.com

2. **Deploy direto do GitHub:**
   - New site from Git
   - Selecione seu repositório
   - Build settings:
     ```
     Base directory: frontend
     Build command: (deixe vazio)
     Publish directory: . (ponto)
     ```
   - Deploy site

3. **Seu site estará em:**
   ```
   https://seu-app.netlify.app
   ```

**Bônus:** Deploy automático a cada push no GitHub!

---

### Opção 3: Vercel (Para Next.js/React)

**Características:**
- ✅ Gratuito
- ✅ Muito rápido
- ✅ Edge functions
- ✅ Analytics

#### Passo a Passo:

1. **Instale Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Siga instruções interativas**

**URL:** https://seu-app.vercel.app

---

### Opção 4: Serviço Windows (Servidor Local Permanente)

**Para manter rodando no seu PC, mesmo após fechar terminal:**

#### A. Usando NSSM (Non-Sucking Service Manager)

1. **Baixe NSSM:**
   ```
   https://nssm.cc/download
   ```

2. **Crie script de servidor** `C:\BioAcustic\start_server.bat`:
   ```batch
   @echo off
   cd /d C:\Users\SemaR\Downloads\BioAcustic\frontend
   python -m http.server 8000
   ```

3. **Instale como serviço:**
   ```powershell
   # Abra PowerShell como Administrador
   cd "C:\path\to\nssm\win64"
   
   .\nssm.exe install BioAcusticServer "C:\BioAcustic\start_server.bat"
   .\nssm.exe start BioAcusticServer
   ```

4. **Configurar serviço:**
   ```powershell
   # Iniciar automaticamente
   .\nssm.exe set BioAcusticServer Start SERVICE_AUTO_START
   
   # Ver status
   .\nssm.exe status BioAcusticServer
   
   # Parar serviço
   .\nssm.exe stop BioAcusticServer
   
   # Remover serviço
   .\nssm.exe remove BioAcusticServer confirm
   ```

**Acesse:** http://localhost:8000

#### B. Usando Task Scheduler

1. **Abra Task Scheduler** (Agendador de Tarefas)

2. **Criar Tarefa Básica:**
   - Nome: `BioAcustic Server`
   - Trigger: `When the computer starts`
   - Action: `Start a program`
   - Program: `python`
   - Arguments: `-m http.server 8000`
   - Start in: `C:\Users\SemaR\Downloads\BioAcustic\frontend`

3. **Configurações Avançadas:**
   - ☑ Run whether user is logged on or not
   - ☑ Run with highest privileges
   - ☑ Configure for: Windows 10

**Acesse:** http://localhost:8000

---

### Opção 5: VPS/Cloud (Solução Profissional)

**Para acesso externo (fora da sua rede):**

#### A. DigitalOcean (Recomendado)

**Custo:** $6/mês (Droplet básico)

1. **Criar Droplet:**
   - Ubuntu 22.04 LTS
   - 1GB RAM, 25GB SSD
   - Datacenter mais próximo

2. **Conectar via SSH:**
   ```bash
   ssh root@seu-ip
   ```

3. **Instalar dependências:**
   ```bash
   # Atualizar sistema
   apt update && apt upgrade -y
   
   # Instalar Python e Nginx
   apt install -y python3 python3-pip nginx git
   
   # Clonar projeto
   cd /var/www
   git clone https://github.com/seu-usuario/bioacustic.git
   cd bioacustic
   ```

4. **Configurar Nginx:**
   
   Crie `/etc/nginx/sites-available/bioacustic`:
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com;
       
       root /var/www/bioacustic/frontend;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
       
       # Cache para assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

5. **Ativar site:**
   ```bash
   ln -s /etc/nginx/sites-available/bioacustic /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

6. **SSL com Certbot (HTTPS):**
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d seu-dominio.com
   ```

**Acesse:** https://seu-dominio.com

#### B. AWS EC2 (Gratuito por 1 ano)

**Free Tier:** 750 horas/mês por 12 meses

1. **Criar instância EC2:**
   - AMI: Ubuntu 22.04
   - Instance type: t2.micro (gratuito)
   - Configure Security Group:
     - HTTP (80)
     - HTTPS (443)
     - SSH (22)

2. **Siga passos similares ao DigitalOcean**

#### C. Google Cloud Platform

**Free Tier:** $300 créditos por 3 meses

Similar aos anteriores.

---

### Opção 6: Raspberry Pi (Servidor Caseiro)

**Custo:** ~$50 (hardware único)

**Vantagens:**
- ✅ Baixo consumo energia (~3W)
- ✅ Silencioso
- ✅ Controle total
- ✅ Sem mensalidade

#### Setup:

1. **Instalar Raspberry Pi OS:**
   ```bash
   # No Raspberry Pi
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y python3 nginx git
   ```

2. **Clonar projeto:**
   ```bash
   cd /var/www
   sudo git clone https://github.com/seu-usuario/bioacustic.git
   ```

3. **Configurar Nginx** (igual VPS acima)

4. **Dynamic DNS** (se IP dinâmico):
   - Cadastre em: https://www.noip.com (gratuito)
   - Configure no roteador ou use cliente:
     ```bash
     sudo apt install -y noip2
     sudo noip2 -C
     ```

5. **Port Forwarding no roteador:**
   - Porta 80 → Raspberry Pi IP:80
   - Porta 443 → Raspberry Pi IP:443

**Acesse externamente:** http://seu-dominio.ddns.net

---

### Opção 7: Docker (Profissional)

**Para deploy em qualquer lugar:**

#### Criar `Dockerfile`:

```dockerfile
FROM nginx:alpine

# Copiar arquivos do frontend
COPY frontend/ /usr/share/nginx/html/

# Configuração Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Criar `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

#### Criar `docker-compose.yml`:

```yaml
version: '3.8'

services:
  bioacustic:
    build: .
    ports:
      - "8000:80"
    restart: unless-stopped
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
```

#### Comandos:

```bash
# Build e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Atualizar
git pull
docker-compose up -d --build
```

**Acesse:** http://localhost:8000

**Deploy no servidor:**
```bash
# Copiar para servidor
scp -r . user@servidor:/opt/bioacustic

# No servidor
cd /opt/bioacustic
docker-compose up -d
```

---

## 📊 Comparação de Opções

| Opção | Custo | Dificuldade | Uptime | Velocidade | Recomendado Para |
|-------|-------|-------------|--------|------------|------------------|
| **GitHub Pages** | Grátis | ⭐ | 99.9% | ⚡⚡⚡ | Projetos open-source |
| **Netlify** | Grátis | ⭐ | 99.9% | ⚡⚡⚡ | Protótipos, demos |
| **Vercel** | Grátis | ⭐ | 99.9% | ⚡⚡⚡ | Apps modernos |
| **Windows Service** | Grátis | ⭐⭐ | 95% | ⚡⚡ | Uso local/rede interna |
| **VPS (DigitalOcean)** | $6/mês | ⭐⭐⭐ | 99.9% | ⚡⚡⚡ | Produção profissional |
| **Raspberry Pi** | $50 único | ⭐⭐⭐ | 98% | ⚡⚡ | Projetos pessoais |
| **Docker** | Variável | ⭐⭐⭐⭐ | 99%+ | ⚡⚡⚡ | Deploy profissional |

## 🎯 Recomendações Por Caso de Uso

### 🎓 Estudante/Aprendizado
**→ GitHub Pages ou Netlify**
- Gratuito
- Fácil de usar
- Portfolio online

### 🏢 Projeto Profissional
**→ VPS (DigitalOcean) + Docker**
- Controle total
- Escalável
- HTTPS

### 🏠 Uso Pessoal/Rede Local
**→ Raspberry Pi ou Windows Service**
- Baixo custo
- Controle local
- Privacidade

### 🚀 Startup/Produto
**→ Vercel ou AWS**
- Escalabilidade automática
- Analytics
- Performance

## 📝 Guia Rápido: GitHub Pages (5 minutos)

**A solução mais rápida para ter seu app online:**

```powershell
# 1. Inicializar Git (se ainda não fez)
cd C:\Users\SemaR\Downloads\BioAcustic
git init
git add .
git commit -m "BioAcustic - Initial commit"

# 2. Criar repositório no GitHub
# Acesse: https://github.com/new
# Nome: bioacustic
# Público ou Privado

# 3. Enviar código
git remote add origin https://github.com/SEU-USUARIO/bioacustic.git
git branch -M main
git push -u origin main

# 4. Configurar GitHub Pages
# No GitHub: Settings → Pages
# Source: Deploy from a branch
# Branch: main / folder: /frontend
# Save

# 5. Aguardar 2-3 minutos
# Seu site estará em:
# https://SEU-USUARIO.github.io/bioacustic/
```

**🎉 Pronto! Agora qualquer pessoa pode acessar seu app!**

## 🔒 Segurança

### Para Servidores Públicos:

1. **Sempre use HTTPS:**
   ```bash
   # Certbot (Let's Encrypt)
   certbot --nginx -d seu-dominio.com
   ```

2. **Firewall:**
   ```bash
   # UFW (Ubuntu)
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

3. **Atualizações automáticas:**
   ```bash
   apt install unattended-upgrades
   dpkg-reconfigure --priority=low unattended-upgrades
   ```

4. **Backup:**
   ```bash
   # Script de backup
   #!/bin/bash
   tar -czf /backup/bioacustic-$(date +%Y%m%d).tar.gz /var/www/bioacustic
   ```

## 🆘 Troubleshooting

### Problema: Site não carrega

**Verificar:**
```bash
# Status do servidor
systemctl status nginx

# Logs
tail -f /var/log/nginx/error.log

# Testar configuração
nginx -t
```

### Problema: GitHub Pages não atualiza

**Solução:**
```bash
# Forçar rebuild
git commit --allow-empty -m "Trigger rebuild"
git push
```

### Problema: Porta 8000 em uso

**Solução:**
```powershell
# Ver processo usando porta
netstat -ano | findstr :8000

# Matar processo
taskkill /PID <número> /F
```

## 📚 Recursos Adicionais

- **GitHub Pages:** https://pages.github.com
- **Netlify:** https://netlify.com
- **DigitalOcean:** https://digitalocean.com
- **Docker:** https://docker.com
- **Certbot:** https://certbot.eff.org
- **NSSM:** https://nssm.cc

## 💡 Dicas Extras

### Custom Domain

**Registradores baratos:**
- Namecheap: ~$10/ano
- Google Domains: ~$12/ano
- Cloudflare: ~$9/ano (com CDN grátis)

**Configurar:**
1. Compre domínio
2. Configure DNS:
   ```
   A Record: @ → seu-ip-servidor
   CNAME: www → seu-dominio.com
   ```
3. Aguarde propagação (até 48h)

### CDN Grátis

**Cloudflare:**
1. Cadastre em cloudflare.com
2. Adicione seu site
3. Mude nameservers do domínio
4. CDN + Cache grátis automático!

### Monitoramento

**UptimeRobot (grátis):**
- 50 monitores
- Verifica a cada 5 minutos
- Alerta por email/SMS
- https://uptimerobot.com

---

## 🎯 Minha Recomendação

**Para você especificamente:**

1. **Curto prazo (agora):**
   - Use **GitHub Pages** (5 minutos, grátis, online 24/7)

2. **Médio prazo (se quiser domínio próprio):**
   - Migre para **Netlify** + Custom domain ($10/ano)

3. **Longo prazo (se virar produção):**
   - **DigitalOcean** ($6/mês) com Docker

**Escolha GitHub Pages e tenha seu app online em 5 minutos! 🚀**
