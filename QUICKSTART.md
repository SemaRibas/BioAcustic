# 🚀 Guia de Início Rápido - BioAcustic

Este guia fornece instruções passo a passo para começar a usar o sistema BioAcustic.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Python 3.8 ou superior instalado
- ✅ Conexão com a internet (para download de dados)
- ✅ Pelo menos 5GB de espaço livre em disco
- ✅ (Recomendado) GPU NVIDIA com CUDA para treinamento

---

## ⚡ Instalação em 5 Minutos

### 1. Abrir Terminal/PowerShell

Navegue até o diretório do projeto:

```powershell
cd C:\Users\SemaR\Downloads\BioAcustic
```

### 2. Criar Ambiente Virtual

```powershell
python -m venv venv
```

### 3. Ativar Ambiente Virtual

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
venv\Scripts\activate.bat
```

### 4. Instalar Dependências

```powershell
pip install -r backend\requirements.txt
```

⏱️ Isso pode levar 5-10 minutos dependendo da conexão.

### 5. Verificar Instalação

```powershell
python -c "import tensorflow as tf; print('TensorFlow:', tf.__version__)"
python -c "import librosa; print('Librosa: OK')"
```

Se não houver erros, está tudo pronto! ✅

---

## 🎯 Opção A: Usar Modelo Demo (Mais Rápido)

Se você só quer testar a aplicação web sem treinar um modelo:

### 1. Baixar Modelo Pré-treinado

**Nota:** Por enquanto, você precisa treinar seu próprio modelo (veja Opção B).  
Futuramente, modelos pré-treinados estarão disponíveis para download.

---

## 🧠 Opção B: Treinar Seu Próprio Modelo

### Fase 1: Download de Dados (15-30 min)

```powershell
python backend\scripts\01_download_data.py
```

**O que acontece:**
- Baixa vocalizações de anfíbios do Xeno-canto
- Salva em `backend/data/raw/`
- Por padrão: 50 gravações por espécie

**Configurações** (edite o script se quiser):
- `SPECIES_LIST`: Lista de espécies
- `RECORDINGS_PER_SPECIES`: Quantidade de áudios
- `OUTPUT_DIR`: Onde salvar

### Fase 2: Pré-processamento (10-20 min)

```powershell
python backend\scripts\02_preprocess_audio.py
```

**O que acontece:**
- Converte áudios para Mel-Espectrogramas
- Salva em `backend/data/processed/spectrograms/`
- Formato: `.npy` (NumPy array)

### Fase 3: Treinamento do Modelo (1-3 horas)

```powershell
python backend\scripts\03_train_model.py
```

**O que acontece:**
- Treina CNN com Transfer Learning (MobileNetV2)
- Salva modelo em `backend/models/`
- Gera gráficos de treinamento

**⚠️ Importante:**
- Primeira execução pode baixar pesos do ImageNet (~14MB)
- Com GPU: ~1 hora
- Sem GPU: ~3-4 horas

**Dica:** Monitore o treinamento no terminal. Você verá:
```
Epoch 1/50
████████████████ 95/95 - 45s - loss: 1.234 - accuracy: 0.567
...
```

### Fase 4: Conversão para Web (1-2 min)

Antes de converter, **edite** o script `04_convert_to_tfjs.py`:

```python
# Linha ~195
MODEL_PATH = "./backend/models/NOME_DO_SEU_MODELO/best_model.h5"
```

Substitua `NOME_DO_SEU_MODELO` pelo diretório criado na Fase 3.

Depois, execute:

```powershell
python backend\scripts\04_convert_to_tfjs.py
```

**O que acontece:**
- Converte modelo `.h5` para formato TensorFlow.js
- Salva em `frontend/assets/model/`
- Cria arquivo de teste `test_model.html`

---

## 🌐 Fase 5: Executar Aplicação Web

### 1. Iniciar Servidor HTTP

```powershell
cd frontend
python -m http.server 8000
```

### 2. Abrir no Navegador

Acesse: **http://localhost:8000**

### 3. Usar a Aplicação

1. **Upload de Áudio:** Clique em "Selecionar arquivo" e escolha um `.mp3` ou `.wav`
2. **Ou Gravar:** Clique em "Iniciar Gravação" (permita acesso ao microfone)
3. **Analisar:** Clique no botão "Analisar Vocalização"
4. **Resultados:** Veja as espécies previstas com % de confiança

---

## 🐛 Solução de Problemas

### Erro: "tensorflowjs_converter não encontrado"

```powershell
pip install tensorflowjs
```

### Erro: "CUDA not available" (GPU não detectada)

- **Solução 1:** Instalar CUDA Toolkit + cuDNN (veja documentação NVIDIA)
- **Solução 2:** Treinar apenas com CPU (será mais lento, mas funciona)

### Erro: "No module named 'librosa'"

```powershell
pip install librosa
```

### Modelo não carrega no navegador

1. Verifique se os arquivos estão em `frontend/assets/model/`
2. Verifique console do navegador (F12) para erros
3. Tente abrir `http://localhost:8000/assets/model/test_model.html`

### Áudio não é processado

- Verifique se o arquivo é `.mp3`, `.wav` ou `.flac`
- Tamanho máximo: 10MB
- Tente converter o áudio para formato compatível

---

## 📊 Próximos Passos

Após ter o sistema funcionando:

1. **Avaliar Desempenho:** Leia `docs/EVALUATION_GUIDE.md`
2. **Melhorar Modelo:** 
   - Adicionar mais dados
   - Ajustar hiperparâmetros
   - Testar arquiteturas diferentes
3. **Personalizar Interface:** Edite `frontend/index.html` e arquivos JS
4. **Adicionar Espécies:** Edite `SPECIES_LIST` no script de download

---

## 🆘 Precisa de Ajuda?

1. **Documentação Completa:** `docs/DIRETRIZES_COMPLETAS.md`
2. **Issues GitHub:** Abra uma issue descrevendo o problema
3. **Logs:** Sempre inclua mensagens de erro completas

---

## ✅ Checklist de Sucesso

Marque conforme completa:

- [ ] Ambiente Python configurado
- [ ] Dependências instaladas
- [ ] Dados baixados (Fase 1)
- [ ] Espectrogramas gerados (Fase 2)
- [ ] Modelo treinado (Fase 3)
- [ ] Modelo convertido (Fase 4)
- [ ] Aplicação web funcionando (Fase 5)
- [ ] Teste com áudio real bem-sucedido

---

## 🎉 Parabéns!

Se chegou até aqui, você tem um sistema completo de classificação de anfíbios funcionando! 🐸🧠

**Contribua:** Se encontrou bugs ou tem sugestões, abra uma issue no GitHub.

---

**Dica Final:** Salve este arquivo como referência rápida! 📌
