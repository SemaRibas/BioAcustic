# Diretrizes para o Desenvolvimento de um Aplicativo de Reconhecimento Bioacústico de Anfíbios com Deep Learning

**Autor:** Dr. Gemini (Especialista em IA e Desenvolvimento Fullstack)  
**Data:** 3 de novembro de 2025

---

## 1. Resumo (Abstract)

Este documento descreve o pipeline metodológico necessário para a criação de uma aplicação web de deep learning (DL) destinada ao reconhecimento e classificação de espécies de anfíbios com base em suas vocalizações (bioacústica). 

O processo é dividido em **seis fases principais**:

1. **Aquisição e Curadoria de Dados**
2. **Pré-processamento de Áudio e Extração de Features**
3. **Modelagem e Treinamento da Rede Neural**
4. **Conversão e Otimização do Modelo**
5. **Desenvolvimento da Aplicação de Inferência**
6. **Avaliação e Iteração**

---

## 2. Fase 1: Aquisição e Curadoria de Dados

Esta é a **fase fundamental**. Modelos de deep learning são tão bons quanto os dados que os alimentam.

### 2.1 Fonte de Dados

Necessitamos de um dataset de áudio robusto (`.wav`, `.mp3`, `.flac`).

#### Repositórios Públicos
- **Xeno-canto** (https://xeno-canto.org/) - Maior biblioteca de sons de aves e anfíbios
- **Macaulay Library** (Cornell Lab of Ornithology) - https://www.macaulaylibrary.org/
- **Repositórios científicos específicos** de herpetologia
- **GBIF** (Global Biodiversity Information Facility) - dados associados

#### Coleta em Campo
- Gravações próprias são valiosas
- Exigem esforço significativo de coleta
- Permitem controle sobre qualidade e condições
- Requerem equipamento adequado (gravadores de alta fidelidade)

### 2.2 Qualidade e Balanceamento

#### Limpeza de Dados
Os dados devem ser de **alta fidelidade**, com o mínimo de ruído de fundo:
- ❌ Vento
- ❌ Tráfego
- ❌ Vocalizações de outras espécies sobrepostas
- ❌ Chuva intensa
- ✅ Isolamento claro da vocalização alvo

#### Balanceamento de Classes
Idealmente, devemos ter um **número similar de amostras** para cada espécie-alvo.

**Problema de Desbalanceamento:**
```
Exemplo:
- Scinax fuscomarginatus: 5.000 amostras ✅
- Boana cipoensis: 50 amostras ❌
```

O modelo ficará **enviesado** para a classe majoritária.

**Soluções:**
- Técnicas de oversampling (SMOTE)
- Undersampling da classe majoritária
- Class weights durante o treinamento
- Data augmentation focada nas classes minoritárias

### 2.3 Anotação (Labeling)

#### Processo de Anotação
Cada arquivo de áudio deve ser **rigorosamente anotado** com:
- Nome científico da espécie
- Timestamp (se aplicável)
- Contexto ambiental (opcional mas valioso)
- Qualidade da gravação (rating)

#### Validação
- Anotações devem ser **validadas por um especialista** (biólogo ou herpetólogo)
- Uso de ferramentas como Raven Pro ou Audacity para análise visual
- Documentação de incertezas

#### Estrutura Recomendada
```
data/
├── raw/
│   ├── Boana_faber/
│   │   ├── audio_001.wav
│   │   ├── audio_002.wav
│   │   └── metadata.csv
│   ├── Scinax_fuscomarginatus/
│   └── Boana_cipoensis/
└── processed/
    └── spectrograms/
```

### 2.4 Aumento de Dados (Data Augmentation)

Para aumentar a **robustez do modelo**, aplicamos transformações às amostras existentes:

#### Técnicas de Augmentation
1. **Adição de Ruído**
   - Ruído branco (white noise)
   - Ruído rosa (pink noise)
   - Ruído ambiental real (chuva leve, folhas, insetos)

2. **Deslocamento de Tempo** (Time Shifting)
   - Deslocar o áudio em milissegundos
   - Simula variações no timing de captura

3. **Deslocamento de Tom** (Pitch Shifting)
   - ±2 semitons (cuidado para não distorcer características da espécie)
   - Simula variações naturais ou equipamento

4. **Mudança de Velocidade** (Time Stretching)
   - Acelerar/desacelerar sem mudar o pitch
   - 0.9x a 1.1x

5. **Mixup**
   - Misturar duas amostras da mesma espécie
   - Criar híbridos sintéticos

#### ⚠️ Cuidado com Over-augmentation
- Não criar dados artificiais que não representam a realidade
- Manter características acústicas essenciais da espécie

---

## 3. Fase 2: Pré-processamento e Extração de Features

Modelos de DL raramente consomem áudio "cru". Devemos convertê-lo em uma **representação visual/numérica** que a rede neural possa entender.

### 3.1 Padronização

#### Taxa de Amostragem (Sample Rate)
Todo áudio deve ser **reamostrado** para uma taxa consistente:
- **22.050 Hz** (padrão para muitos modelos de áudio)
- **44.100 Hz** (qualidade CD, mais detalhes)
- **16.000 Hz** (suficiente para vocalizações de baixa frequência)

**Escolha:** Depende da faixa de frequência das vocalizações dos anfíbios alvo.

#### Normalização de Amplitude
- Normalizar para o range [-1, 1]
- Prevenir clipping

### 3.2 Segmentação

Áudios longos de campo devem ser **segmentados** em clipes curtos:

```python
# Exemplo conceitual
duration = 3  # segundos
overlap = 0.5  # 50% de sobreposição
```

- **Duração recomendada:** 3 a 5 segundos
- **Overlap:** 0% a 50% (para capturar vocalizações nas bordas)
- Descartar segmentos com apenas silêncio

### 3.3 Extração de Features (A Chave 🔑)

O áudio (sinal 1D) é convertido em uma **representação 2D**, tratada como uma "imagem".

#### Mel-Espectrograma (Recomendado)

**O que é?**
- Representação visual da **intensidade** (amplitude) de diferentes **frequências** (escala Mel) ao longo do **tempo**
- Escala Mel: mimetiza a percepção logarítmica humana de frequências

**Por que usar?**
- ✅ Standard na indústria para tarefas de classificação de áudio
- ✅ Captura informações de tempo e frequência
- ✅ Reduz dimensionalidade mantendo informações críticas
- ✅ Compatível com CNNs (tratado como imagem)

**Parâmetros Importantes:**
```python
n_mels = 128  # Número de bandas Mel (altura da imagem)
n_fft = 2048  # Tamanho da janela FFT
hop_length = 512  # Stride entre janelas
fmin = 50  # Frequência mínima (Hz)
fmax = 8000  # Frequência máxima (Hz)
```

#### Biblioteca Python: `librosa`

```python
import librosa
import librosa.display
import numpy as np

# Carregar áudio
y, sr = librosa.load('audio.wav', sr=22050)

# Gerar Mel-Espectrograma
mel_spec = librosa.feature.melspectrogram(
    y=y, 
    sr=sr, 
    n_mels=128, 
    n_fft=2048, 
    hop_length=512
)

# Converter para escala dB (logarítmica)
mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
```

#### Alternativas (Avançadas)
- **MFCCs** (Mel-Frequency Cepstral Coefficients) - mais compacto
- **Spectrograma Linear** - sem escala Mel
- **CQT** (Constant-Q Transform) - melhor para tons musicais

### 3.4 Pipeline Completo de Pré-processamento

```
Áudio Raw → Resample → Segmentar → Normalizar → Mel-Espectrograma → Salvar como .npy/.png
```

---

## 4. Fase 3: Modelagem e Treinamento (O Backend de IA)

Nesta fase, tratamos o problema como uma **"classificação de imagens"** (os espectrogramas são as imagens).

### 4.1 Arquitetura do Modelo

#### Redes Neurais Convolucionais (CNNs)

**Por que CNNs?**
- Excelentes para dados 2D (imagens/espectrogramas)
- Aprendem características hierárquicas automaticamente
- Compartilhamento de pesos reduz parâmetros

#### Transfer Learning (Recomendado)

Em vez de construir do **zero**, usamos arquiteturas **pré-treinadas no ImageNet** e as **re-treinamos** (fine-tuning) para nossos espectrogramas.

**Modelos Leves (Ideais para Web):**

1. **MobileNetV2**
   - ✅ Leve (14 MB)
   - ✅ Rápido
   - ✅ Otimizado para dispositivos móveis
   - Parâmetros: ~3.5M

2. **EfficientNetB0**
   - ✅ Melhor acurácia por tamanho
   - ✅ Escalonável (B0 a B7)
   - Parâmetros: ~5.3M

3. **ResNet50** (se precisar de mais capacidade)
   - Mais pesado (98 MB)
   - Maior acurácia potencial

#### Modelos Específicos de Áudio (Avançado)

- **PANNs** (Large-Scale Pre-trained Audio Neural Networks)
  - Pré-treinados em AudioSet
  - Performance superior para tarefas de áudio
  - https://github.com/qiuqiangkong/audioset_tagging_cnn

- **VGGish** (Google)
  - Pré-treinado para embeddings de áudio

### 4.2 Arquitetura Proposta

```python
# Pseudocódigo TensorFlow/Keras

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(128, 128, 3),  # Altura, Largura, Canais
    include_top=False,
    weights='imagenet'
)

# Congelar as camadas base (opcional)
base_model.trainable = False

model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(num_classes, activation='softmax')
])
```

### 4.3 Ambiente de Treinamento

#### Hardware
- **GPU:** NVIDIA (CUDA compatível)
  - GTX 1660 Ti (mínimo)
  - RTX 3060 (recomendado)
  - A100/V100 (para datasets grandes)
- **RAM:** 16 GB mínimo
- **Armazenamento:** SSD (para I/O rápido)

#### Software
- **Python:** 3.8+
- **TensorFlow:** 2.10+
- **Keras:** Integrado ao TensorFlow
- **CUDA/cuDNN:** Para aceleração GPU

#### Alternativas Cloud
- **Google Colab** (GPU gratuita, 12h de sessão)
- **Kaggle Notebooks** (30h/semana de GPU)
- **Google Cloud AI Platform**
- **AWS SageMaker**

### 4.4 Processo de Treinamento

#### Split de Dados
```
Dataset:
├── Treino: 70%
├── Validação: 15%
└── Teste: 15%
```

#### Hiperparâmetros
```python
batch_size = 32
epochs = 50
learning_rate = 0.0001
optimizer = Adam
loss = categorical_crossentropy
```

#### Callbacks
```python
callbacks = [
    EarlyStopping(patience=10, restore_best_weights=True),
    ReduceLROnPlateau(factor=0.5, patience=5),
    ModelCheckpoint('best_model.h5', save_best_only=True)
]
```

#### Métricas
- **Acurácia** (Accuracy)
- **Precision, Recall, F1-Score** (por classe)
- **Matriz de Confusão**
- **Top-3 Accuracy** (útil para espécies similares)

### 4.5 Saída (O "Artefato")

O resultado desta fase é um **arquivo de modelo treinado**:

- **Formato Keras:** `anfibios_model.h5` (HDF5)
- **Formato SavedModel:** `saved_model/` (diretório)
  - Preferível para deployment
  - Contém arquitetura + pesos + assets

```
backend/models/
└── anfibios_classifier/
    ├── saved_model.pb
    ├── variables/
    │   ├── variables.data-00000-of-00001
    │   └── variables.index
    └── assets/
        └── class_labels.json
```

---

## 5. Fase 4: Conversão e Otimização do Modelo

O modelo Python (`.h5`/`SavedModel`) **não pode ser usado diretamente no navegador** (JavaScript).

### 5.1 Ferramenta: TensorFlow.js Converter

#### Instalação
```bash
pip install tensorflowjs
```

#### Conversão

```bash
tensorflowjs_converter \
    --input_format=keras \
    ./backend/models/anfibios_model.h5 \
    ./frontend/assets/model/
```

**Ou para SavedModel:**
```bash
tensorflowjs_converter \
    --input_format=tf_saved_model \
    ./backend/models/anfibios_classifier/ \
    ./frontend/assets/model/
```

#### Opções de Otimização

```bash
tensorflowjs_converter \
    --input_format=keras \
    --quantize_uint8 \  # Quantização para reduzir tamanho
    --weight_shard_size_bytes=4194304 \  # 4MB shards
    ./backend/models/anfibios_model.h5 \
    ./frontend/assets/model/
```

**Técnicas de Otimização:**
- **Quantização (uint8/uint16):** Reduz tamanho em ~4x com perda mínima de acurácia
- **Pruning:** Remove conexões não importantes
- **Weight Clustering:** Agrupa pesos similares

### 5.2 Saída

```
frontend/assets/model/
├── model.json                 # Arquitetura da rede
├── group1-shard1of3.bin       # Pesos (shard 1)
├── group1-shard2of3.bin       # Pesos (shard 2)
└── group1-shard3of3.bin       # Pesos (shard 3)
```

- **`model.json`:** Descreve a arquitetura (camadas, shapes, conexões)
- **`.bin` files:** Pesos do modelo divididos em arquivos menores (shards)

### 5.3 Verificação

```javascript
// Testar carregamento no navegador
const model = await tf.loadLayersModel('./assets/model/model.json');
console.log('Modelo carregado:', model);
```

---

## 6. Fase 5: Desenvolvimento da Aplicação de Inferência (O Frontend)

Esta é a fase que desenvolve a **interface do usuário**. A aplicação **não treina** o modelo; ela **usa** o modelo da Fase 4 para fazer **previsões** (inferência).

### 6.1 Stack de Tecnologia

#### Core
- **HTML5:** Estrutura semântica
- **Tailwind CSS:** Estilização utilitária, responsiva
- **JavaScript (ESM):** Lógica moderna, modular
- **TensorFlow.js (TF.js):** Biblioteca principal do Google para rodar ML no navegador

#### Bibliotecas Auxiliares
- **meyda.js:** Extração de features de áudio no navegador
- **wavesurfer.js:** Visualização de forma de onda (opcional)
- **Tone.js:** Manipulação avançada de áudio (opcional)

### 6.2 Lógica da Aplicação

#### 6.2.1 Carregamento do Modelo

```javascript
import * as tf from '@tensorflow/tfjs';

let model;

async function loadModel() {
    try {
        model = await tf.loadLayersModel('./assets/model/model.json');
        console.log('✅ Modelo carregado com sucesso');
        console.log('Input shape:', model.inputs[0].shape);
    } catch (error) {
        console.error('❌ Erro ao carregar modelo:', error);
    }
}

loadModel();
```

#### 6.2.2 Entrada do Usuário

**Opção 1: Upload de Arquivo**
```html
<input type="file" id="audioUpload" accept="audio/*">
```

```javascript
document.getElementById('audioUpload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const audioBuffer = await file.arrayBuffer();
    processAudio(audioBuffer);
});
```

**Opção 2: Gravação ao Vivo**
```javascript
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const mediaRecorder = new MediaRecorder(stream);
// ... lógica de gravação
```

#### 6.2.3 Pré-processamento em JavaScript (🔥 O Desafio)

Esta é a **parte mais complexa** do frontend. Devemos **replicar exatamente** o mesmo pré-processamento da Fase 2 (Python/librosa) usando JavaScript.

**Problema:** `librosa` não existe em JavaScript nativamente.

**Soluções:**

##### Opção A: Backend API (Recomendado para Produção)
```
Cliente → Upload Áudio → API Python → Pré-processamento → Retorna Tensor → Frontend → Inferência
```

Vantagens:
- ✅ Usa `librosa` diretamente
- ✅ Processamento consistente
- ✅ Menos código no frontend

Desvantagens:
- ❌ Requer servidor
- ❌ Latência de rede

##### Opção B: Pré-processamento no Navegador (100% Cliente)

Usando **Web Audio API** + **FFT Manual**:

```javascript
// Pseudocódigo complexo
async function audioToMelSpectrogram(audioBuffer) {
    const audioContext = new AudioContext();
    const audioBufferNode = audioContext.createBufferSource();
    
    // 1. Reamostrar para 22050 Hz
    const resampled = resampleAudio(audioBuffer, 22050);
    
    // 2. Aplicar STFT (Short-Time Fourier Transform)
    const stft = computeSTFT(resampled, {
        n_fft: 2048,
        hop_length: 512
    });
    
    // 3. Converter para escala Mel
    const melFilterbank = createMelFilterbank(128, 22050, 50, 8000);
    const melSpec = applyMelFilterbank(stft, melFilterbank);
    
    // 4. Converter para dB
    const melSpecDB = powerToDB(melSpec);
    
    // 5. Normalizar
    const normalized = normalize(melSpecDB);
    
    return normalized;
}
```

**Bibliotecas Auxiliares:**
- **meyda.js:** Pode extrair MFCCs e algumas features
- **Implementação customizada de Mel-Filterbank**

⚠️ **Importante:** O espectrograma gerado em JS **DEVE** ser idêntico ao gerado em Python, pixel por pixel, senão o modelo falhará.

#### 6.2.4 Inferência

```javascript
async function predictSpecies(audioFile) {
    // 1. Pré-processar áudio → espectrograma
    const melSpec = await audioToMelSpectrogram(audioFile);
    
    // 2. Converter para tensor (shape: [1, 128, 128, 3])
    const inputTensor = tf.tensor4d([melSpec]);
    
    // 3. Fazer predição
    const predictions = model.predict(inputTensor);
    
    // 4. Obter probabilidades
    const probabilities = await predictions.data();
    
    // 5. Limpar memória
    inputTensor.dispose();
    predictions.dispose();
    
    return probabilities;
}
```

#### 6.2.5 Pós-processamento

```javascript
const classNames = [
    'Boana faber',
    'Scinax fuscomarginatus',
    'Boana cipoensis',
    'Dendropsophus minutus'
    // ... outras espécies
];

function postprocess(probabilities) {
    // Mapear para nomes de espécies
    const results = classNames.map((name, i) => ({
        species: name,
        probability: probabilities[i],
        confidence: (probabilities[i] * 100).toFixed(2) + '%'
    }));
    
    // Ordenar por probabilidade
    results.sort((a, b) => b.probability - a.probability);
    
    return results.slice(0, 5);  // Top 5
}
```

#### 6.2.6 Interface de Usuário

```html
<div id="results" class="mt-6">
    <h3 class="text-xl font-bold mb-4">Resultados da Classificação:</h3>
    <div id="top-predictions" class="space-y-3">
        <!-- Dinamicamente populado -->
    </div>
</div>
```

```javascript
function displayResults(predictions) {
    const container = document.getElementById('top-predictions');
    container.innerHTML = predictions.map(pred => `
        <div class="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <div class="flex justify-between items-center">
                <span class="font-semibold text-lg">${pred.species}</span>
                <span class="text-2xl font-bold text-green-600">${pred.confidence}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div class="bg-green-600 h-2.5 rounded-full" style="width: ${pred.confidence}"></div>
            </div>
        </div>
    `).join('');
}
```

### 6.3 Estrutura de Arquivos Frontend

```
frontend/
├── index.html
├── css/
│   └── styles.css (se não usar Tailwind CDN)
├── js/
│   ├── app.js (entry point)
│   ├── model.js (carregamento e inferência)
│   ├── audio.js (processamento de áudio)
│   └── ui.js (manipulação DOM)
└── assets/
    ├── model/
    │   ├── model.json
    │   └── *.bin
    └── images/
```

### 6.4 Otimizações de Performance

#### Lazy Loading do Modelo
```javascript
let modelPromise;

function getModel() {
    if (!modelPromise) {
        modelPromise = tf.loadLayersModel('./assets/model/model.json');
    }
    return modelPromise;
}
```

#### Web Workers
Para não bloquear a UI durante processamento pesado:
```javascript
const worker = new Worker('audio-processor.worker.js');
worker.postMessage({ audio: audioBuffer });
worker.onmessage = (e) => {
    const melSpec = e.data;
    predict(melSpec);
};
```

#### Warmup do Modelo
```javascript
async function warmupModel() {
    const dummyInput = tf.zeros([1, 128, 128, 3]);
    await model.predict(dummyInput);
    dummyInput.dispose();
}
```

---

## 7. Fase 6: Avaliação e Iteração

### 7.1 Teste de Campo

A aplicação deve ser testada com **novos dados de áudio** (que **não estavam** no dataset de treino) para verificar sua acurácia no mundo real.

#### Protocolo de Teste

1. **Dataset de Teste Isolado**
   - Nunca visto pelo modelo durante treino
   - Representativo de condições reais de campo

2. **Métricas de Avaliação**
   ```python
   from sklearn.metrics import classification_report, confusion_matrix
   
   y_true = [...]  # Labels verdadeiros
   y_pred = [...]  # Predições do modelo
   
   print(classification_report(y_true, y_pred, target_names=class_names))
   ```

3. **Análise de Erros**
   - Quais espécies são confundidas?
   - Por que o modelo erra?
   - Características acústicas similares?

4. **Teste com Usuários Reais**
   - Beta testers (biólogos, pesquisadores)
   - Coleta de feedback qualitativo
   - Usabilidade da interface

### 7.2 Métricas de Performance

#### Acurácia por Espécie
```
Boana faber:            95% (excelente)
Scinax fuscomarginatus: 88% (bom)
Boana cipoensis:        62% (precisa melhorar)
```

#### Matriz de Confusão
```
                Previsto
Real        Sp1   Sp2   Sp3
Sp1         150    10     5
Sp2          12   140     8
Sp3          20    15   100
```

#### Tempo de Inferência
- **Meta:** < 2 segundos do upload até resultado
- Medir em diferentes dispositivos (desktop, mobile, tablet)

### 7.3 Feedback e Iterações

#### Ciclo de Melhoria Contínua

```
Feedback → Análise → Hipótese → Modificação → Re-treino → Deploy → Teste
```

#### Áreas de Ajuste

**Na Fase 3 (Modelo):**
- Arquitetura diferente (trocar de MobileNet para EfficientNet)
- Mais épocas de treinamento
- Ajuste de hiperparâmetros
- Mais data augmentation
- Técnicas de regularização (dropout, L2)

**Na Fase 5 (UI/UX):**
- Interface mais intuitiva
- Feedback visual melhorado
- Instruções mais claras
- Adição de modo "Dúvida" (quando confiança < 70%)

**Na Fase 1 (Dados):**
- Coletar mais dados das espécies com baixa acurácia
- Limpar dados com ruído excessivo
- Re-balancear dataset

### 7.4 Monitoramento em Produção

#### Logging
```javascript
// Enviar predições para analytics
function logPrediction(species, confidence) {
    fetch('/api/log', {
        method: 'POST',
        body: JSON.stringify({
            predicted_species: species,
            confidence: confidence,
            timestamp: new Date().toISOString(),
            user_feedback: null  // Preenchido depois
        })
    });
}
```

#### Coleta de Feedback do Usuário
```html
<div>
    <p>Esta predição foi útil?</p>
    <button onclick="feedbackCorrect()">✅ Correto</button>
    <button onclick="feedbackIncorrect()">❌ Incorreto</button>
</div>
```

Usar esse feedback para:
- Identificar casos problemáticos
- Criar dataset de "hard examples"
- Re-treinar modelo com exemplos difíceis

### 7.5 Versionamento do Modelo

```
models/
├── v1.0.0/  (baseline)
├── v1.1.0/  (+ data augmentation)
├── v1.2.0/  (arquitetura otimizada)
└── v2.0.0/  (re-treinado com novos dados)
```

Manter histórico de:
- Acurácia de cada versão
- Dataset usado
- Hiperparâmetros
- Data de deploy

---

## 8. Arquitetura Final do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUÁRIO                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Navegador)                          │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │   HTML5    │  │  Tailwind    │  │   JavaScript (ESM)      │ │
│  │  Interface │  │     CSS      │  │   + TensorFlow.js       │ │
│  └────────────┘  └──────────────┘  └─────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Modelo TF.js (model.json + shards.bin)                  │  │
│  │  Pré-processamento de Áudio (Web Audio API)              │  │
│  │  Inferência Local (Privacidade!)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                      ▲
                      │ (Modelo convertido)
                      │
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Python)                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Fase 1-2: Curadoria de Dados + Pré-processamento         │ │
│  │  (librosa, numpy, pandas)                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Fase 3: Treinamento do Modelo                             │ │
│  │  (TensorFlow/Keras + GPU)                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Fase 4: Conversão para TF.js                              │ │
│  │  (tensorflowjs_converter)                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Roadmap de Implementação

### Sprint 1: Fundação (2-3 semanas)
- [ ] Configurar ambiente Python (virtual env, dependências)
- [ ] Baixar dataset inicial (Xeno-canto)
- [ ] Scripts de curadoria básica
- [ ] Implementar pipeline de pré-processamento (Fase 2)
- [ ] Validar espectrogramas visualmente

### Sprint 2: Modelagem (3-4 semanas)
- [ ] Implementar modelo baseline (MobileNetV2)
- [ ] Treinar primeira versão (v1.0.0)
- [ ] Avaliar métricas no conjunto de teste
- [ ] Iterar com data augmentation
- [ ] Salvar melhor modelo

### Sprint 3: Conversão e Frontend (2-3 semanas)
- [ ] Converter modelo para TensorFlow.js
- [ ] Criar interface HTML base
- [ ] Implementar upload de áudio
- [ ] Integrar modelo TF.js
- [ ] Testar inferência no navegador

### Sprint 4: Refinamento (2-3 semanas)
- [ ] Implementar pré-processamento em JS (ou API backend)
- [ ] Melhorar UI/UX com Tailwind
- [ ] Adicionar visualização de espectrograma
- [ ] Testes em diferentes navegadores
- [ ] Otimizações de performance

### Sprint 5: Validação (2 semanas)
- [ ] Testes de campo com usuários reais
- [ ] Análise de erros detalhada
- [ ] Coleta de feedback
- [ ] Documentação final

### Sprint 6: Deploy (1 semana)
- [ ] Hospedar frontend (Netlify, Vercel, GitHub Pages)
- [ ] Configurar domínio
- [ ] Analytics e logging
- [ ] Lançamento beta

---

## 10. Recursos e Referências

### Datasets
- 🌐 **Xeno-canto:** https://xeno-canto.org/
- 🌐 **Macaulay Library:** https://www.macaulaylibrary.org/
- 📚 **ESC-50** (para treino de baseline): https://github.com/karolpiczak/ESC-50

### Bibliotecas Python
- 🔊 **librosa:** https://librosa.org/
- 🧠 **TensorFlow:** https://www.tensorflow.org/
- 📊 **scikit-learn:** https://scikit-learn.org/

### Bibliotecas JavaScript
- 🧠 **TensorFlow.js:** https://www.tensorflow.org/js
- 🔊 **meyda.js:** https://meyda.js.org/
- 🎵 **Tone.js:** https://tonejs.github.io/

### Papers Científicos
1. **"Automatic acoustic identification of individuals in multiple species"** (2020)
2. **"Deep learning for bioacoustic classification"** (2019)
3. **"CNN Architectures for Large-Scale Audio Classification"** (Google Research, 2017)

### Tutoriais
- 📝 TensorFlow Audio Recognition: https://www.tensorflow.org/tutorials/audio/simple_audio
- 📝 Audio Classification with TF.js: https://blog.tensorflow.org/2019/06/audio-classification-tensorflow-js.html

---

## 11. Considerações Finais

### Desafios Técnicos Principais

1. **Qualidade dos Dados**
   - Maior gargalo do projeto
   - Exige curadoria manual intensiva

2. **Pré-processamento no Navegador**
   - Replicar `librosa` em JavaScript é complexo
   - Considerar API backend como alternativa

3. **Performance em Dispositivos Móveis**
   - Modelos leves são essenciais
   - Testar em hardware variado

4. **Generalização**
   - Modelo pode ter overfitting no dataset de treino
   - Teste com dados do mundo real é crítico

### Boas Práticas

- ✅ **Versionamento:** Git para código, DVC para dados
- ✅ **Documentação:** Docstrings, comentários, README
- ✅ **Testes:** Unit tests para funções críticas
- ✅ **Reprodutibilidade:** Seeds aleatórias fixas, environment.yml
- ✅ **Ética:** Respeitar licenças de dados, créditos aos autores

### Próximos Passos

1. Iniciar com **proof of concept** (3-5 espécies comuns)
2. Validar pipeline completo end-to-end
3. Escalar para mais espécies gradualmente
4. Envolver comunidade científica para validação

---

## Glossário

- **Bioacústica:** Estudo dos sons produzidos por organismos vivos
- **CNN:** Convolutional Neural Network (Rede Neural Convolucional)
- **Espectrograma:** Representação visual de frequências ao longo do tempo
- **FFT:** Fast Fourier Transform (Transformada Rápida de Fourier)
- **Mel Scale:** Escala perceptual de frequências
- **Inferência:** Processo de fazer predições com um modelo treinado
- **Transfer Learning:** Reutilizar modelo pré-treinado para nova tarefa
- **TensorFlow.js:** Biblioteca para rodar modelos de ML no navegador

---

**Documento vivo - Versão 1.0**  
Última atualização: 3 de novembro de 2025

Para contribuições ou dúvidas, abra uma issue no repositório do projeto.
