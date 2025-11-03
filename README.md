# 🐸 BioAcustic - Classificador de Anfíbios com Deep Learning

Sistema completo de reconhecimento e classificação de espécies de anfíbios baseado em vocalizações utilizando Deep Learning e Web Technologies.

![Status](https://img.shields.io/badge/status-development-yellow)
![Python](https://img.shields.io/badge/python-3.8+-blue)
![TensorFlow](https://img.shields.io/badge/tensorflow-2.10+-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Uso Rápido](#uso-rápido)
- [Pipeline Completo](#pipeline-completo)
- [Deployment (Servidor 24/7)](#deployment)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Documentação](#documentação)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

O **BioAcustic** é uma aplicação web que utiliza redes neurais convolucionais (CNNs) para identificar espécies de anfíbios através de suas vocalizações. O sistema processa áudio em tempo real no navegador usando TensorFlow.js.

### Características Principais

- ✅ **100% Cliente-Side**: Inferência no navegador (privacidade!)
- � **Treinamento no Navegador**: Treine modelos sem instalar Python! (NOVO)
- �🎵 **Processamento de Áudio**: Conversão de áudio para Mel-Espectrogramas
- 🧠 **Deep Learning**: Transfer Learning com MobileNetV2/EfficientNet (Python) ou CNN simples (Navegador)
- 🎨 **Interface Moderna**: UI responsiva com Tailwind CSS
- 📊 **Visualização**: Espectrogramas e resultados em tempo real
- 🎤 **Gravação ao Vivo**: Suporte para microfone

### 🆕 Novidade: Treinamento no Navegador

Agora você pode treinar modelos diretamente no navegador sem precisar instalar Python ou TensorFlow! Perfeito para:
- Prototipagem rápida
- Demonstrações educacionais
- Projetos com poucas espécies (2-10)
- Máxima privacidade (dados não saem do navegador)

[📖 Ver Guia Completo de Treinamento no Navegador](BROWSER_TRAINING_GUIDE.md)

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│         FRONTEND (Navegador)            │
│  ┌────────────────────────────────────┐ │
│  │  HTML5 + Tailwind CSS              │ │
│  │  JavaScript (ESM) + TensorFlow.js  │ │
│  │  Processamento de Áudio (Web API)  │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                  ▲
                  │ (Modelo convertido)
                  │
┌─────────────────────────────────────────┐
│         BACKEND (Python)                │
│  ┌────────────────────────────────────┐ │
│  │  1. Aquisição de Dados (Xeno-canto)│ │
│  │  2. Pré-processamento (librosa)    │ │
│  │  3. Treinamento (TensorFlow/Keras) │ │
│  │  4. Conversão (tensorflowjs)       │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🚀 Instalação

### Pré-requisitos

- **Python 3.8+**
- **Node.js** (opcional, para servidor HTTP)
- **GPU NVIDIA** (recomendado para treinamento)

### 1. Clonar Repositório

```bash
git clone https://github.com/seu-usuario/bioacustic.git
cd bioacustic
```

### 2. Configurar Ambiente Python

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar (Windows)
venv\Scripts\activate

# Ativar (Linux/Mac)
source venv/bin/activate

# Instalar dependências
pip install -r backend/requirements.txt
```

### 3. Verificar Instalação

```bash
python -c "import tensorflow as tf; print('TensorFlow:', tf.__version__)"
python -c "import librosa; print('Librosa OK')"
```

---

## ⚡ Uso Rápido

### Opção 1: Treinamento no Navegador (Recomendado para Iniciantes)

**Sem instalação! Zero configuração!**

1. Inicie um servidor HTTP simples:
   ```bash
   # Python 3
   python -m http.server 8000 --directory frontend
   
   # Ou use qualquer servidor HTTP
   ```

2. Acesse a página de treinamento:
   ```
   http://localhost:8000/train.html
   ```

3. Siga o guia interativo:
   - Adicione pelo menos 5 áudios de cada espécie (mínimo 2 espécies)
   - Clique em "Treinar Modelo"
   - Aguarde o treinamento (~5-15 minutos)
   - Salve o modelo
   - Use no app principal!

**📖 [Guia Completo de Treinamento no Navegador](BROWSER_TRAINING_GUIDE.md)**

---

### Opção 2: Pipeline Python (Avançado - Maior Acurácia)

### Opção A: Usar Modelo Pré-treinado (Recomendado)

Se você já tem um modelo treinado:

```bash
# 1. Converter modelo para TensorFlow.js
python backend/scripts/04_convert_to_tfjs.py

# 2. Iniciar servidor HTTP
cd frontend
python -m http.server 8000

# 3. Abrir navegador
# http://localhost:8000
```

### Opção B: Treinar Seu Próprio Modelo

Veja [Pipeline Completo](#pipeline-completo) abaixo.

---

## 📦 Pipeline Completo

### Fase 1: Aquisição de Dados

Baixar vocalizações do Xeno-canto:

```bash
python backend/scripts/01_download_data.py
```

**Configurações** (editar no script):
- `SPECIES_LIST`: Lista de espécies
- `RECORDINGS_PER_SPECIES`: Número de gravações por espécie
- `QUALITY`: Qualidade mínima (A, B, C)

### Fase 2: Pré-processamento

Converter áudios para Mel-Espectrogramas:

```bash
python backend/scripts/02_preprocess_audio.py
```

**Parâmetros**:
- Sample Rate: 22050 Hz
- Duração: 3 segundos
- Mel Bands: 128
- FFT Size: 2048

### Fase 3: Treinamento

Treinar modelo CNN com Transfer Learning:

```bash
python backend/scripts/03_train_model.py
```

**Configurações**:
- Arquitetura: `mobilenet` ou `efficientnet`
- Épocas: 50
- Batch Size: 32
- Learning Rate: 0.0001

**Saída**:
```
backend/models/
└── amphibian_classifier_mobilenet_YYYYMMDD_HHMMSS/
    ├── best_model.h5
    ├── final_model.h5
    ├── class_names.json
    ├── config.json
    └── logs/
```

### Fase 4: Conversão para Web

Converter modelo para TensorFlow.js:

```bash
python backend/scripts/04_convert_to_tfjs.py
```

**Saída**:
```
frontend/assets/model/
├── model.json
├── group1-shard1of*.bin
├── metadata.json
└── class_names.json
```

### Fase 5: Deploy da Aplicação Web

```bash
cd frontend
python -m http.server 8000
```

Abra: `http://localhost:8000`

---

## 📂 Estrutura do Projeto

```
BioAcustic/
├── backend/
│   ├── scripts/
│   │   ├── 01_download_data.py
│   │   ├── 02_preprocess_audio.py
│   │   ├── 03_train_model.py
│   │   └── 04_convert_to_tfjs.py
│   ├── data/
│   │   ├── raw/              # Áudios originais
│   │   └── processed/        # Espectrogramas
│   ├── models/               # Modelos treinados
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── js/
│   │   ├── app.js           # Aplicação principal
│   │   ├── model.js         # Gerenciador de modelo
│   │   ├── audio.js         # Processamento de áudio
│   │   └── ui.js            # Interface de usuário
│   └── assets/
│       └── model/           # Modelo TensorFlow.js
│
├── docs/
│   ├── DIRETRIZES_COMPLETAS.md
│   └── EVALUATION_GUIDE.md
│
└── README.md
```

---

## 📚 Documentação

- **[Diretrizes Completas](./docs/DIRETRIZES_COMPLETAS.md)**: Guia detalhado de todas as fases
- **[Guia de Avaliação](./docs/EVALUATION_GUIDE.md)**: Métricas e testes de campo
- **API Reference**: Documentação inline no código

---

## 🧪 Testes

### Teste de Modelo (Navegador)

```bash
cd frontend/assets/model
python -m http.server 8000
```

Abrir: `http://localhost:8000/test_model.html`

### Teste de Acurácia (Python)

```python
from backend.scripts.03_train_model import AmphibianClassifier

classifier = AmphibianClassifier()
# ... carregar dados de teste
results = classifier.evaluate(X_test, y_test)
```

---

## 🚀 Deployment

### Manter Servidor Online 24/7

O BioAcustic pode ser implantado de várias formas:

#### Opção 1: GitHub Pages (Recomendado) ⭐
- **Gratuito** e **Fácil**
- Online em 5 minutos
- HTTPS automático

```bash
# Enviar para GitHub
git init
git add .
git commit -m "Deploy BioAcustic"
git push

# Ativar GitHub Pages em Settings → Pages
```

**Acesse:** `https://seu-usuario.github.io/bioacustic/`

#### Opção 2: Serviço Windows (Local)
```powershell
# Execute como Administrador
.\install_service.ps1
```
Servidor rodará automaticamente sempre que ligar o PC.

#### Opção 3: Docker
```bash
docker-compose up -d
```

#### Opção 4: VPS/Cloud
- DigitalOcean ($6/mês)
- AWS Free Tier (1 ano grátis)
- Heroku, Netlify, Vercel (grátis)

**📖 Guias Completos:**
- **Início Rápido:** `QUICK_DEPLOY.md`
- **Todas Opções:** `DEPLOYMENT_GUIDE.md`

---

## 🎓 Tecnologias Utilizadas

### Backend
- **Python 3.8+**
- **TensorFlow/Keras**: Deep Learning
- **librosa**: Processamento de áudio
- **NumPy/Pandas**: Manipulação de dados
- **scikit-learn**: Métricas e validação

### Frontend
- **HTML5**: Estrutura
- **Tailwind CSS**: Estilização
- **JavaScript (ESM)**: Lógica
- **TensorFlow.js**: Inferência no navegador
- **Web Audio API**: Processamento de áudio

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

## 📊 Roadmap

- [x] Pipeline completo de treinamento
- [x] Interface web básica
- [x] Inferência no navegador
- [ ] Adição de mais espécies
- [ ] API backend opcional (Python/FastAPI)
- [ ] App mobile (React Native)
- [ ] Integração com banco de dados de biodiversidade
- [ ] Modo offline (PWA)

---

## 🐛 Issues Conhecidos

- **Pré-processamento no navegador**: Pode haver pequenas diferenças entre espectrogramas gerados em Python vs. JavaScript. Para produção, considere usar uma API backend.
- **Performance**: Primeira inferência é lenta (carregamento de modelo). Warump resolve.
- **Compatibilidade**: Testado apenas em Chrome/Edge. Firefox e Safari podem ter limitações.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

- **Projeto BioAcustic** - Desenvolvido para fins educacionais e científicos

---

## 🙏 Agradecimentos

- **Xeno-canto**: Pela disponibilização de dados de áudio
- **TensorFlow Team**: Pela excelente biblioteca
- **Comunidade de Bioacústica**: Pelo conhecimento compartilhado

---

## 📞 Contato

- **Issues**: Use o sistema de issues do GitHub
- **Discussões**: Aba de Discussions do repositório

---

## 🌟 Star History

Se este projeto foi útil para você, considere dar uma ⭐!

---

**Made with 🐸 and 🧠 for Amphibian Conservation**
