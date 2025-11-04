# 🔥 Guia: Exportar Modelo para Firebase ML

## 📋 Visão Geral

Este guia explica como exportar seu modelo treinado do BioAcustic e usá-lo com Firebase ML (Machine Learning) em aplicativos web, Android e iOS.

---

## 🎯 Passo 1: Exportar o Modelo

### Na Interface de Treinamento

1. **Treine seu modelo** com pelo menos 2 espécies e 5+ amostras cada
2. Aguarde o treinamento completar
3. Clique em **"🔥 Exportar para Firebase ML"**
4. Um arquivo ZIP será baixado: `bioacustic-firebase-[timestamp].zip`

### Conteúdo do ZIP

```
bioacustic-firebase-xxxxx/
├── model.json              # Topologia do modelo (arquitetura)
├── group1-shard1of1.bin    # Pesos do modelo (binário)
├── metadata.json           # Informações sobre classes e treinamento
└── README.md              # Instruções de uso
```

---

## 🔥 Passo 2: Upload no Firebase

### Opção A: Via Console Firebase (Recomendado)

1. **Acesse o Firebase Console**
   ```
   https://console.firebase.google.com/
   ```

2. **Navegue até ML**
   - Selecione seu projeto
   - Menu lateral: **Machine Learning** → **Custom models**

3. **Adicione um modelo customizado**
   - Clique em **"Add a custom model"**
   - Nome: `bioacustic-model`
   - Tags: `audio`, `classification`, `cnn`

4. **Upload dos arquivos**
   - Extraia o ZIP
   - Faça upload de **AMBOS** os arquivos:
     - `model.json`
     - `group1-shard1of1.bin`

5. **Publique o modelo**
   - Clique em **"Publish"**
   - Aguarde o processamento (1-2 minutos)

### Opção B: Via Firebase CLI

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar projeto
firebase init

# Upload do modelo
firebase ml:models:create bioacustic-model \
  --input model.json \
  --input group1-shard1of1.bin \
  --tags audio,classification
```

---

## 💻 Passo 3: Usar o Modelo no App

### 🌐 Web (JavaScript/TypeScript)

```javascript
import * as tf from '@tensorflow/tfjs';

// 1. Carregar modelo do Firebase Storage
const modelUrl = 'https://firebasestorage.googleapis.com/v0/b/[SEU-PROJETO].appspot.com/o/ml%2Fbioacustic-model%2Fmodel.json?alt=media';

const model = await tf.loadLayersModel(modelUrl);

// 2. Processar áudio para espectrograma
const audioData = ...; // Float32Array do áudio
const spectrogram = processAudioToMelSpectrogram(audioData);

// 3. Fazer predição
const input = tf.tensor4d([spectrogram], [1, 128, 126, 3]);
const predictions = model.predict(input);
const probabilities = await predictions.data();

// 4. Obter classe predita
const classNames = ['Espécie A', 'Espécie B']; // Do metadata.json
const predictedIndex = probabilities.indexOf(Math.max(...probabilities));
const predictedClass = classNames[predictedIndex];
const confidence = probabilities[predictedIndex] * 100;

console.log(`Predição: ${predictedClass} (${confidence.toFixed(2)}%)`);
```

### 📱 Android (Kotlin)

```kotlin
import com.google.firebase.ml.modeldownloader.CustomModel
import com.google.firebase.ml.modeldownloader.CustomModelDownloadConditions
import com.google.firebase.ml.modeldownloader.DownloadType
import com.google.firebase.ml.modeldownloader.FirebaseModelDownloader
import org.tensorflow.lite.Interpreter
import java.nio.ByteBuffer

class BioAcusticClassifier {
    private var interpreter: Interpreter? = null
    
    // 1. Download do modelo
    fun downloadModel() {
        val conditions = CustomModelDownloadConditions.Builder()
            .requireWifi()
            .build()
        
        FirebaseModelDownloader.getInstance()
            .getModel("bioacustic-model", DownloadType.LOCAL_MODEL, conditions)
            .addOnSuccessListener { model: CustomModel ->
                val modelFile = model.file
                if (modelFile != null) {
                    interpreter = Interpreter(modelFile)
                }
            }
    }
    
    // 2. Fazer predição
    fun classify(audioData: FloatArray): Pair<String, Float> {
        // Processar áudio para espectrograma
        val spectrogram = processAudio(audioData)
        
        // Preparar input
        val inputBuffer = ByteBuffer.allocateDirect(128 * 126 * 3 * 4) // float32
        inputBuffer.order(ByteOrder.nativeOrder())
        spectrogram.forEach { inputBuffer.putFloat(it) }
        
        // Preparar output
        val outputBuffer = Array(1) { FloatArray(numClasses) }
        
        // Executar inferência
        interpreter?.run(inputBuffer, outputBuffer)
        
        // Obter resultado
        val predictions = outputBuffer[0]
        val maxIndex = predictions.indices.maxByOrNull { predictions[it] } ?: 0
        val confidence = predictions[maxIndex]
        
        return Pair(classNames[maxIndex], confidence)
    }
    
    private fun processAudio(audioData: FloatArray): FloatArray {
        // Implementar processamento de áudio para Mel-spectrogram
        // Similar ao código JavaScript do BioAcustic
        // Retornar array de 128x126x3 = 48,384 valores
        return floatArrayOf(/* ... */)
    }
}
```

### 🍎 iOS (Swift)

```swift
import FirebaseMLModelDownloader
import TensorFlowLite

class BioAcusticClassifier {
    private var interpreter: Interpreter?
    
    // 1. Download do modelo
    func downloadModel() {
        let conditions = ModelDownloadConditions(
            allowsCellularAccess: false,
            allowsBackgroundDownloading: true
        )
        
        ModelDownloader.modelDownloader()
            .getModel(
                name: "bioacustic-model",
                downloadType: .localModel,
                conditions: conditions
            ) { result in
                switch result {
                case .success(let customModel):
                    do {
                        self.interpreter = try Interpreter(modelPath: customModel.path)
                        try self.interpreter?.allocateTensors()
                    } catch {
                        print("Erro ao carregar modelo: \(error)")
                    }
                case .failure(let error):
                    print("Erro ao baixar modelo: \(error)")
                }
            }
    }
    
    // 2. Fazer predição
    func classify(audioData: [Float]) -> (String, Float)? {
        guard let interpreter = interpreter else { return nil }
        
        // Processar áudio para espectrograma
        let spectrogram = processAudio(audioData)
        
        // Preparar input
        let inputData = Data(bytes: spectrogram, count: spectrogram.count * MemoryLayout<Float>.size)
        
        do {
            // Copiar input
            try interpreter.copy(inputData, toInputAt: 0)
            
            // Executar inferência
            try interpreter.invoke()
            
            // Obter output
            let outputTensor = try interpreter.output(at: 0)
            let outputData = outputTensor.data
            let results = outputData.withUnsafeBytes {
                Array(UnsafeBufferPointer<Float>(start: $0, count: numClasses))
            }
            
            // Encontrar classe com maior probabilidade
            if let maxIndex = results.indices.max(by: { results[$0] < results[$1] }) {
                return (classNames[maxIndex], results[maxIndex])
            }
        } catch {
            print("Erro na inferência: \(error)")
        }
        
        return nil
    }
    
    private func processAudio(_ audioData: [Float]) -> [Float] {
        // Implementar processamento de áudio para Mel-spectrogram
        // Retornar array de 128x126x3 = 48,384 valores
        return []
    }
}
```

---

## 🎵 Processamento de Áudio

### Importante!
O modelo espera um **Mel-spectrogram** com shape `[128, 126, 3]`:

- **128 bins Mel** (frequências)
- **126 frames temporais**
- **3 canais** (RGB - espectrograma convertido para imagem)

### Parâmetros de Processamento

```javascript
{
  sampleRate: 22050,        // Hz - reamostragem necessária
  nFFT: 2048,              // Tamanho da FFT
  hopLength: 512,          // Pulo entre frames
  nMels: 128,              // Número de filtros Mel
  fMin: 0,                 // Frequência mínima
  fMax: 11025,             // Frequência máxima (Nyquist)
  windowSize: 2048,        // Tamanho da janela
  minDb: -80,              // Normalização
  maxDb: 0                 // Normalização
}
```

### Código de Referência

O código completo de processamento está em:
```
frontend/js/audio.js → AudioProcessor.createMelSpectrogram()
```

Você pode portá-lo para Android/iOS ou usar bibliotecas como:
- **Android**: TarsosDSP, JLibrosa
- **iOS**: Accelerate framework, AudioKit

---

## 📊 Metadados do Modelo

O arquivo `metadata.json` exportado contém:

```json
{
  "name": "BioAcustic Audio Classifier",
  "version": "1.0",
  "classes": ["Espécie A", "Espécie B"],
  "numClasses": 2,
  "inputShape": [128, 126, 3],
  "framework": "TensorFlow.js",
  "architecture": "CNN Sequential"
}
```

Use estes dados no seu app para:
- Mapear índices para nomes de espécies
- Validar input shape
- Exibir informações do modelo

---

## 🚀 Deploy e Versionamento

### Publicar Nova Versão

```bash
# Via CLI
firebase ml:models:update bioacustic-model \
  --input model.json \
  --input group1-shard1of1.bin \
  --version 2.0

# Ou no Console Firebase
# ML > Custom models > bioacustic-model > Upload new version
```

### Rollback

```bash
firebase ml:models:versions:rollback bioacustic-model \
  --version 1.0
```

### Monitoramento

No Firebase Console, você pode ver:
- Número de downloads
- Latência de inferência
- Erros de modelo
- Uso de recursos

---

## 🔒 Segurança e Performance

### Regras de Segurança (Storage)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /ml/bioacustic-model/{allPaths=**} {
      // Permitir leitura apenas para usuários autenticados
      allow read: if request.auth != null;
      // Não permitir escrita (apenas via Console/CLI)
      allow write: if false;
    }
  }
}
```

### Otimizações

1. **Cache local**: Baixe o modelo apenas uma vez
2. **Compressão**: Use TensorFlow Lite converter para modelos menores
3. **Quantização**: Reduza precisão para float16 ou int8
4. **Batch processing**: Processe múltiplos áudios de uma vez

### Converter para TensorFlow Lite (Opcional)

```python
import tensorflowjs as tfjs
import tensorflow as tf

# 1. Converter TensorFlow.js para SavedModel
tfjs.converters.load_keras_model('model.json')
model.save('saved_model')

# 2. Converter para TFLite
converter = tf.lite.TFLiteConverter.from_saved_model('saved_model')
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

# 3. Salvar
with open('model.tflite', 'wb') as f:
    f.write(tflite_model)
```

---

## 🐛 Troubleshooting

### Erro: "Model not found"
- Verifique se fez upload de ambos os arquivos (model.json + .bin)
- Confirme que o modelo foi publicado no Console

### Erro: "Invalid input shape"
- Verifique se o espectrograma tem shape [128, 126, 3]
- Confirme a taxa de amostragem (22050 Hz)

### Erro: "Out of memory"
- Reduza o batch size
- Use TensorFlow Lite em vez do modelo completo
- Aplique quantização

### Predições ruins
- Verifique se o processamento de áudio é idêntico ao treinamento
- Confirme a normalização dos dados
- Treine com mais amostras e variedade

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Firebase ML Custom Models](https://firebase.google.com/docs/ml/custom-models)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [TensorFlow Lite](https://www.tensorflow.org/lite)

### Exemplos
- [Firebase ML Samples](https://github.com/firebase/quickstart-js/tree/master/mlkit)
- [TensorFlow.js Examples](https://github.com/tensorflow/tfjs-examples)

### Comunidade
- [Stack Overflow - Firebase ML](https://stackoverflow.com/questions/tagged/firebase-ml-kit)
- [TensorFlow Forum](https://discuss.tensorflow.org/)

---

## ✅ Checklist de Implementação

- [ ] Modelo treinado com acurácia > 80%
- [ ] Exportado arquivo ZIP do BioAcustic
- [ ] Upload realizado no Firebase Console
- [ ] Modelo publicado e ativo
- [ ] Código de inferência implementado
- [ ] Processamento de áudio portado
- [ ] Testes com áudios reais realizados
- [ ] Tratamento de erros implementado
- [ ] Cache local configurado
- [ ] Monitoramento ativo no Firebase

---

## 🎉 Conclusão

Agora você pode usar seu modelo de classificação de espécies por áudio em qualquer plataforma através do Firebase ML! O modelo estará sempre atualizado e sincronizado entre todos os seus apps.

**Dúvidas?** Consulte a documentação ou abra uma issue no repositório.

---

**Projeto BioAcustic** | Desenvolvido com 💚 para conservação ambiental
