# 🔧 Troubleshooting - BioAcustic

## Problemas Identificados e Soluções

### ✅ **Problema 1: Modelo não encontrado (404)**

**Erro Console:**
```
Failed to load resource: the server responded with a status of 404
/assets/model/metadata.json
```

**Causa:**  
O modelo TensorFlow.js ainda não foi gerado. A aplicação web tenta carregar um modelo que não existe.

**Solução Aplicada:**
1. ✅ Criados arquivos de **metadados de demonstração** (`metadata.json`, `class_names.json`)
2. ✅ Atualizado `model.js` para detectar modo demo
3. ✅ Mensagem amigável quando modelo não está pronto
4. ✅ Criado `README.md` no diretório do modelo com instruções

**Ação do Usuário:**
Para usar o sistema completo, execute o pipeline de treinamento:
```powershell
python backend\scripts\01_download_data.py
python backend\scripts\02_preprocess_audio.py
python backend\scripts\03_train_model.py
python backend\scripts\04_convert_to_tfjs.py
```

---

### ✅ **Problema 2: Favicon não encontrado (404)**

**Erro Console:**
```
Failed to load resource: the server responded with a status of 404
/favicon.ico
```

**Causa:**  
Navegador busca automaticamente por `favicon.ico`, mas o arquivo não existia.

**Solução Aplicada:**
1. ✅ Criado `favicon.svg` com ícone de sapo simples
2. ✅ Adicionado `<link rel="icon">` no `index.html`

---

### ⚠️ **Aviso: Tailwind CDN em Produção**

**Aviso Console:**
```
cdn.tailwindcss.com should not be used in production
```

**Causa:**  
O CDN do Tailwind adiciona overhead e não é recomendado para produção.

**Status:**  
✅ **OK para desenvolvimento/demonstração**  
⚠️ Para produção, considere instalar Tailwind localmente

**Solução Futura (Opcional):**
```bash
npm install -D tailwindcss
npx tailwindcss init
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
```

**Comentário adicionado no HTML** para documentar.

---

## 🚀 Estado Atual da Aplicação

### Funcionalidades Disponíveis SEM Modelo

Mesmo sem o modelo treinado, a aplicação agora:

✅ **Carrega corretamente** (sem erros críticos)  
✅ **Interface funcional** (pode testar UI/UX)  
✅ **Upload de áudio** funciona  
✅ **Gravação ao vivo** funciona  
✅ **Mensagem clara** sobre necessidade de treinar modelo

### Funcionalidades Que Requerem Modelo

❌ **Inferência real** (classificação de espécies)  
❌ **Visualização de espectrograma com predições**  
❌ **Resultados de classificação**

---

## 📋 Checklist de Uso

### Para Testar a Interface (AGORA)

```powershell
# 1. Certifique-se de estar no diretório frontend
cd C:\Users\SemaR\Downloads\BioAcustic\frontend

# 2. Inicie o servidor (se ainda não estiver rodando)
python -m http.server 8000

# 3. Abra o navegador
# http://localhost:8000
```

**O que você pode fazer:**
- ✅ Ver a interface
- ✅ Fazer upload de áudio (UI funciona, mas não classifica)
- ✅ Testar gravação ao vivo
- ✅ Verificar responsividade

### Para Usar o Sistema Completo

```powershell
# 1. Voltar para raiz e ativar venv
cd C:\Users\SemaR\Downloads\BioAcustic
.\venv\Scripts\Activate.ps1

# 2. Executar pipeline (pode levar 2-4 horas)
python backend\scripts\01_download_data.py    # ~30 min
python backend\scripts\02_preprocess_audio.py # ~20 min
python backend\scripts\03_train_model.py      # ~1-3 horas
python backend\scripts\04_convert_to_tfjs.py  # ~2 min

# 3. Atualizar página web
# O modelo estará disponível em frontend/assets/model/
```

---

## 🐛 Outros Problemas Comuns

### Erro: "Python não reconhecido"

**Solução:**
```powershell
# Verificar se Python está no PATH
python --version

# Se não estiver, use caminho completo
C:\Python39\python.exe -m http.server 8000
```

### Erro: "Porta 8000 já em uso"

**Solução:**
```powershell
# Usar outra porta
python -m http.server 8001

# Ou fechar o processo existente
# Ctrl+C no terminal onde está rodando
```

### Erro: "ModuleNotFoundError: No module named 'tensorflow'"

**Solução:**
```powershell
# Certifique-se de que o venv está ativado
.\venv\Scripts\Activate.ps1

# Se não estiver, instale as dependências
pip install -r backend\requirements.txt
```

### Navegador não abre a página

**Soluções:**
1. Verifique se o servidor está rodando (deve mostrar logs no terminal)
2. Tente `http://127.0.0.1:8000` em vez de `localhost`
3. Limpe cache do navegador (Ctrl+Shift+Delete)
4. Tente outro navegador (Chrome, Edge, Firefox)

---

## 📊 Status dos Componentes

| Componente | Status | Observação |
|------------|--------|------------|
| Frontend HTML | ✅ OK | Interface carrega |
| Frontend JS | ✅ OK | Módulos funcionais |
| Favicon | ✅ OK | Adicionado |
| Metadados | ✅ OK | Demo criado |
| Modelo TF.js | ❌ Pendente | Precisa treinar |
| Backend Scripts | ✅ OK | Prontos para uso |
| Documentação | ✅ OK | Completa |

---

## 🎯 Próximo Passo Recomendado

### Opção A: Explorar a Interface (5 minutos)
✅ A página já funciona!  
- Explore a UI
- Teste upload (não vai classificar, mas UI funciona)
- Veja mensagens de erro amigáveis

### Opção B: Treinar Modelo Completo (2-4 horas)
🚀 Para ter o sistema 100% funcional:
1. Seguir `QUICKSTART.md`
2. Executar pipeline de treinamento
3. Voltar e testar com modelo real

### Opção C: Ler Documentação (30 minutos)
📚 Para entender o sistema:
1. `DIRETRIZES_COMPLETAS.md` - Teoria
2. `EVALUATION_GUIDE.md` - Como avaliar
3. Código-fonte com comentários

---

## 💡 Dica Final

Se você só quer **ver a interface funcionando agora** sem treinar, a aplicação já está usável! A mensagem de erro é informativa e não impede de explorar a UI.

Para **usar o sistema completo** (com classificação real), reserve 2-4 horas para o treinamento.

---

**Atualizado:** 3 de novembro de 2025  
**Status:** ✅ Todos os problemas identificados foram resolvidos
