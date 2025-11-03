# 📁 Estrutura do Projeto BioAcustic

```
BioAcustic/
│
├── 📄 README.md                          # Documentação principal do projeto
├── 📄 QUICKSTART.md                      # Guia de início rápido
├── 📄 LICENSE                            # Licença MIT
├── 📄 .gitignore                         # Arquivos a ignorar no Git
│
├── 📂 docs/                              # 📚 Documentação detalhada
│   ├── DIRETRIZES_COMPLETAS.md          # Guia completo das 6 fases
│   └── EVALUATION_GUIDE.md              # Guia de avaliação e testes
│
├── 📂 backend/                           # 🐍 Backend Python
│   ├── 📄 requirements.txt              # Dependências Python
│   │
│   ├── 📂 scripts/                       # Scripts de processamento
│   │   ├── 01_download_data.py          # Baixar dados do Xeno-canto
│   │   ├── 02_preprocess_audio.py       # Gerar espectrogramas
│   │   ├── 03_train_model.py            # Treinar modelo CNN
│   │   └── 04_convert_to_tfjs.py        # Converter para TensorFlow.js
│   │
│   ├── 📂 data/                          # Dados do projeto
│   │   ├── 📂 raw/                       # Áudios originais (.mp3, .wav)
│   │   │   ├── Boana_faber/
│   │   │   ├── Scinax_fuscomarginatus/
│   │   │   └── ...
│   │   │
│   │   └── 📂 processed/                 # Dados processados
│   │       └── spectrograms/            # Mel-Espectrogramas (.npy)
│   │           ├── Boana_faber/
│   │           ├── Scinax_fuscomarginatus/
│   │           └── ...
│   │
│   └── 📂 models/                        # Modelos treinados
│       └── amphibian_classifier_*/
│           ├── best_model.h5            # Melhor modelo (Keras)
│           ├── final_model.h5           # Modelo final
│           ├── class_names.json         # Nomes das classes
│           ├── config.json              # Configuração do modelo
│           └── logs/                    # TensorBoard logs
│
└── 📂 frontend/                          # 🌐 Frontend Web
    ├── 📄 index.html                     # Página principal
    │
    ├── 📂 js/                            # JavaScript modules
    │   ├── app.js                       # Aplicação principal
    │   ├── model.js                     # Gerenciador de modelo TF.js
    │   ├── audio.js                     # Processamento de áudio
    │   └── ui.js                        # Gerenciador de interface
    │
    └── 📂 assets/                        # Assets estáticos
        └── model/                       # Modelo TensorFlow.js
            ├── model.json               # Arquitetura do modelo
            ├── group1-shard*.bin        # Pesos do modelo (shards)
            ├── metadata.json            # Metadados do modelo
            ├── class_names.json         # Nomes das classes
            └── test_model.html          # Página de teste
```

---

## 🔄 Fluxo de Trabalho

### Pipeline de Treinamento (Backend)

```
1. Download     2. Pré-proc    3. Treino      4. Conversão
   (Xeno-canto) →  (librosa)  →  (TensorFlow) →  (TF.js)
   
   Áudio MP3   →  Espectro-   →  Modelo       →  model.json
   Áudio WAV      gramas         .h5             + .bin files
                  (.npy)
```

### Pipeline de Inferência (Frontend)

```
Usuário         Áudio          Pré-proc       Inferência     Resultado
Upload/Grava →  Buffer      →  Espectro-   →  TF.js       →  Top-K
                AudioBuffer    grama          modelo          espécies
```

---

## 📊 Tamanhos Aproximados

```
backend/data/raw/                ~2-5 GB     (áudios)
backend/data/processed/          ~500 MB     (espectrogramas)
backend/models/                  ~50-100 MB  (modelo .h5)
frontend/assets/model/           ~10-15 MB   (modelo TF.js quantizado)
```

---

## 🚀 Comandos Principais

### Treinar Pipeline Completo

```bash
# 1. Ativar ambiente
.\venv\Scripts\Activate.ps1

# 2. Executar pipeline
python backend\scripts\01_download_data.py
python backend\scripts\02_preprocess_audio.py
python backend\scripts\03_train_model.py
python backend\scripts\04_convert_to_tfjs.py

# 3. Iniciar servidor
cd frontend
python -m http.server 8000
```

### Desenvolvimento

```bash
# Instalar/atualizar dependências
pip install -r backend\requirements.txt

# Testar imports
python -c "import tensorflow, librosa; print('OK')"

# Limpar cache Python
Get-ChildItem -Recurse -Filter "__pycache__" | Remove-Item -Recurse -Force
```

---

## 🎯 Pontos de Entrada

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| `01_download_data.py` | Download de dados | Iniciar novo dataset |
| `02_preprocess_audio.py` | Pré-processamento | Após adicionar novos áudios |
| `03_train_model.py` | Treinamento | Treinar/re-treinar modelo |
| `04_convert_to_tfjs.py` | Conversão | Após treinar modelo |
| `frontend/index.html` | App web | Usar modelo treinado |

---

## 🔧 Arquivos de Configuração

### Backend
- `requirements.txt`: Dependências Python
- `backend/models/*/config.json`: Config do modelo
- `backend/models/*/class_names.json`: Classes (espécies)

### Frontend
- `frontend/assets/model/metadata.json`: Metadados completos
- `frontend/assets/model/model.json`: Arquitetura TF.js

---

## 📝 Logs e Outputs

```
backend/models/amphibian_classifier_*/
├── logs/                               # TensorBoard
│   └── train/
│       └── events.out.tfevents.*
│
├── training_history.png               # Gráfico loss/accuracy
└── confusion_matrix.png               # Matriz de confusão
```

---

## 🗂️ Convenções

### Nomenclatura de Arquivos

- **Áudio Original**: `XC123456.mp3`
- **Espectrograma**: `XC123456_seg000.npy`
- **Modelo**: `amphibian_classifier_mobilenet_20251103_123456`

### Nomenclatura de Espécies

Usar nome científico com underscore:
- ✅ `Boana_faber`
- ✅ `Scinax_fuscomarginatus`
- ❌ `boana faber` (espaço)
- ❌ `BoanaFaber` (sem separador)

---

## 🔐 Arquivos Sensíveis (.gitignore)

```
# NÃO comitar:
backend/data/raw/             # Dados brutos (grandes)
backend/models/**/*.h5        # Modelos treinados
frontend/assets/model/*.bin   # Pesos TF.js

# Comitar:
*.py                          # Scripts
*.md                          # Documentação
requirements.txt              # Dependências
.gitkeep                      # Manter estrutura
```

---

## 📚 Documentos por Fase

| Fase | Documento | Descrição |
|------|-----------|-----------|
| Todas | `README.md` | Visão geral |
| Setup | `QUICKSTART.md` | Guia rápido |
| 1-6 | `docs/DIRETRIZES_COMPLETAS.md` | Guia detalhado |
| 6 | `docs/EVALUATION_GUIDE.md` | Avaliação |
| - | Código inline | Docstrings |

---

**Última atualização:** Novembro 2025  
**Versão da estrutura:** 1.0
