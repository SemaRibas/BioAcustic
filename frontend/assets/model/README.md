# 📁 Diretório do Modelo TensorFlow.js

## ⚠️ Modelo Ainda Não Disponível

Este diretório contém apenas arquivos de **metadados de demonstração**. O modelo TensorFlow.js ainda não foi gerado.

---

## 🚀 Como Gerar o Modelo

Siga estes passos para treinar e converter o modelo:

### 1. Preparar Ambiente

```powershell
# No diretório raiz do projeto
cd C:\Users\SemaR\Downloads\BioAcustic

# Ativar ambiente virtual
.\venv\Scripts\Activate.ps1
```

### 2. Executar Pipeline de Treinamento

```powershell
# Fase 1: Download de dados (~15-30 min)
python backend\scripts\01_download_data.py

# Fase 2: Pré-processamento (~10-20 min)
python backend\scripts\02_preprocess_audio.py

# Fase 3: Treinamento (~1-3 horas)
python backend\scripts\03_train_model.py

# Fase 4: Conversão para TF.js (~1-2 min)
python backend\scripts\04_convert_to_tfjs.py
```

### 3. Arquivos Que Serão Gerados

Após executar o script `04_convert_to_tfjs.py`, este diretório conterá:

```
frontend/assets/model/
├── model.json              # ✅ Arquitetura do modelo
├── group1-shard1of*.bin    # ✅ Pesos do modelo (shards)
├── metadata.json           # ✅ Metadados (atualizado)
├── class_names.json        # ✅ Nomes das classes (atualizado)
└── test_model.html         # ✅ Página de teste
```

---

## 📖 Documentação

- **QUICKSTART.md** - Guia passo a passo completo
- **docs/DIRETRIZES_COMPLETAS.md** - Detalhes de cada fase
- **README.md** - Visão geral do projeto

---

## 🐛 Problemas Comuns

### Erro: "Modelo não encontrado"

**Causa:** Você tentou usar a aplicação web antes de treinar o modelo.

**Solução:** Execute o pipeline de treinamento completo (passos acima).

### Erro: "tensorflowjs_converter não encontrado"

**Causa:** Dependência não instalada.

**Solução:**
```powershell
pip install tensorflowjs
```

### Modelo muito grande

**Causa:** Modelo sem quantização.

**Solução:** Edite `04_convert_to_tfjs.py` e certifique-se de que `quantization=True`.

---

## ⏱️ Tempo Estimado

| Fase | Tempo (com GPU) | Tempo (sem GPU) |
|------|-----------------|-----------------|
| 1. Download | 15-30 min | 15-30 min |
| 2. Pré-proc | 10-20 min | 10-20 min |
| 3. Treino | 1-2 horas | 3-4 horas |
| 4. Conversão | 1-2 min | 1-2 min |
| **TOTAL** | **~2 horas** | **~4 horas** |

---

## 📊 Arquivos Atuais

Arquivos de demonstração presentes:

- ✅ `metadata.json` - Metadados demo (será substituído)
- ✅ `class_names.json` - Classes demo (será substituído)
- ✅ `.gitkeep` - Mantém diretório no Git

Arquivos que faltam (serão gerados):

- ❌ `model.json` - **NECESSÁRIO** para inferência
- ❌ `group1-shard*.bin` - **NECESSÁRIO** para inferência

---

## 💡 Dica

Se você só quer testar a interface sem treinar, considere:

1. Baixar um modelo pré-treinado (se disponível)
2. Usar o modo de demonstração (sem inferência real)
3. Modificar o código para gerar predições aleatórias (teste de UI)

---

**Status Atual:** 🔴 Modelo não treinado  
**Próximo Passo:** Execute `python backend\scripts\01_download_data.py`
