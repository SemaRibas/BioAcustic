# 🔧 Debug - Inserção de Áudios

## Problema Resolvido

O problema estava no nome do método - o código estava chamando `processAudioBuffer()` mas o método correto era `audioBufferToMelSpectrogram()`.

## Correções Aplicadas

### 1. Novo método `processAudioForTraining()` em `audio.js`
- Processa áudio completo
- Gera mel-spectrogram
- Converte para tensor 3D (H x W x 3)
- Normaliza valores para [0, 1]

### 2. Melhor tratamento de erros em `train.html`
- Processa cada arquivo individualmente
- Mostra erro específico por arquivo
- Continua processando outros arquivos se um falhar
- Contador de sucessos/erros

### 3. Auto-detecção de shape no `trainer.js`
- Detecta dimensões automaticamente do primeiro exemplo
- Não precisa especificar shape manualmente

### 4. Logs de debug adicionados
- Verifica se TensorFlow.js carregou
- Mostra status de inicialização
- Instruções no console

## Como Testar Agora

### Passo 1: Iniciar Servidor

```powershell
cd C:\Users\SemaR\Downloads\BioAcustic\frontend
python -m http.server 8000
```

### Passo 2: Abrir no Navegador

```
http://localhost:8000/train.html
```

### Passo 3: Abrir Console (F12)

Você deve ver:
```
✅ TensorFlow.js carregado: 4.x.x
✅ AudioProcessor inicializado
✅ BrowserTrainer inicializado
🎓 Módulo de treinamento inicializado
📋 Para testar: ...
```

### Passo 4: Testar Upload

1. **Digite nome da espécie:** `Teste A`
2. **Selecione 2-3 arquivos de áudio** (MP3 ou WAV)
3. **Clique:** "➕ Adicionar Exemplos"

**No console você verá:**
```
🎵 Processando áudio para espectrograma...
   Reamostrando: 48000Hz → 22050Hz
   Calculando STFT...
   Aplicando Mel filterbank...
✅ Espectrograma gerado: 128 x 126
📊 Tensor gerado: 128 x 126 x 3
✅ Exemplo adicionado: Teste A (1 amostras)
✅ Exemplo adicionado: Teste A (2 amostras)
✅ Exemplo adicionado: Teste A (3 amostras)
```

**No navegador:**
- Toast mostrando "Processando 1/3: arquivo.mp3"
- Toast de sucesso: "✅ 3 exemplos adicionados para Teste A"
- Painel lateral atualizado

### Passo 5: Verificar Estatísticas

No painel direito "📊 Dataset" você deve ver:
- Total de Amostras: 3
- 1 espécie(s)
- Teste A: 3 (amarelo - precisa de mais)

## Possíveis Erros e Soluções

### Erro: "TensorFlow.js não carregado"

**Causa:** Sem internet ou CDN bloqueado

**Solução:**
1. Verifique conexão com internet
2. Tente outro navegador
3. Desabilite bloqueadores de script

### Erro: "Erro ao processar áudio: formato não suportado"

**Causa:** Formato de áudio não suportado pelo navegador

**Solução:**
1. Use WAV ou MP3
2. Converta com FFmpeg:
   ```bash
   ffmpeg -i audio.ogg -acodec pcm_s16le audio.wav
   ```

### Erro: "Cannot decode audio data"

**Causa:** Arquivo corrompido ou codec não suportado

**Solução:**
1. Abra o arquivo em um player de áudio primeiro
2. Re-exporte com Audacity
3. Tente outro arquivo

### Erro: Áudio processado mas nada acontece

**Causa:** JavaScript ou Console com erro

**Solução:**
1. Abra console (F12)
2. Veja se há erros em vermelho
3. Recarregue a página (Ctrl+Shift+R)

## Teste Completo Passo a Passo

### Arquivos de Teste Necessários

Você precisa de pelo menos **2 espécies** com **5 áudios** cada.

**Opção A: Usar áudios existentes**
- Qualquer arquivo MP3/WAV de áudio
- Não precisa ser de anfíbio para testar funcionalidade

**Opção B: Baixar do Xeno-canto**
1. Acesse: https://xeno-canto.org/explore?query=Boana+faber
2. Baixe 5 gravações
3. Acesse: https://xeno-canto.org/explore?query=Scinax+fuscomarginatus
4. Baixe mais 5 gravações

### Teste Funcional

```
1. Adicionar Espécie A
   ✓ Digite: "Especie A"
   ✓ Selecione 5 áudios
   ✓ Clique "Adicionar Exemplos"
   ✓ Aguarde processar (~30 segundos)
   ✓ Veja mensagem de sucesso

2. Adicionar Espécie B
   ✓ Digite: "Especie B"
   ✓ Selecione 5 áudios
   ✓ Clique "Adicionar Exemplos"
   ✓ Aguarde processar (~30 segundos)
   ✓ Veja mensagem de sucesso

3. Verificar Estatísticas
   ✓ Total: 10 amostras
   ✓ 2 espécies
   ✓ Cada uma com 5 (verde)
   ✓ Botão "Treinar Modelo" aparece

4. Treinar
   ✓ Clique "Treinar Modelo"
   ✓ Veja progresso em tempo real
   ✓ Aguarde ~3-5 minutos
   ✓ Veja "Treinamento concluído"

5. Salvar
   ✓ Clique "Salvar Modelo"
   ✓ Veja "Modelo salvo no navegador"
```

## Logs Esperados (Console)

### Ao Carregar Página
```javascript
✅ TensorFlow.js carregado: 4.20.0
✅ AudioProcessor inicializado
✅ BrowserTrainer inicializado
🎓 Módulo de treinamento inicializado
ℹ️  Nenhum modelo salvo encontrado
```

### Ao Adicionar Exemplos
```javascript
🎵 Processando áudio para espectrograma...
   Reamostrando: 44100Hz → 22050Hz
   Calculando STFT...
   Aplicando Mel filterbank...
✅ Espectrograma gerado: 128 x 126
📊 Tensor gerado: 128 x 126 x 3
✅ Exemplo adicionado: Especie A (1 amostras)
✅ Exemplo adicionado: Especie A (2 amostras)
... (repete para cada arquivo)
```

### Ao Treinar
```javascript
🏗️ Construindo modelo...
   Shape detectado: [128, 126, 3]
✅ Modelo construído
   Parâmetros: 152,xxx
📊 Preparando dataset...
✅ Dataset preparado: 10 amostras
   Shape: 10,128,126,3
🎓 Iniciando treinamento...
   Épocas: 20
   Batch size: 8
   Época 1/20 - loss: 0.8234 - acc: 55.00%
   Época 2/20 - loss: 0.6891 - acc: 62.50%
   ...
✅ Treinamento concluído!
```

## Próximos Passos Após Correção

1. **Teste com áudios reais de anfíbios**
2. **Aumente número de amostras** (10-15 por espécie)
3. **Adicione mais espécies** (3-5 espécies)
4. **Use no app principal** (index.html)

## Comandos Úteis de Debug

### No Console do Navegador

```javascript
// Verificar se TensorFlow.js está disponível
console.log('TF:', typeof tf !== 'undefined' ? 'OK' : 'ERRO');

// Ver dados do trainer
console.log('Espécies:', trainer.trainingData.size);
console.log('Stats:', trainer.getTrainingStats());

// Verificar se pode treinar
console.log('Pode treinar?', trainer.canTrain());

// Ver modelo atual
console.log('Modelo:', trainer.model);
```

## Status Atual

✅ **Correções aplicadas:**
- Método `processAudioForTraining()` criado
- Conversão para tensor 3D implementada
- Tratamento de erros melhorado
- Logs de debug adicionados
- Auto-detecção de shape

🔍 **Para verificar:**
- Teste com áudios reais
- Verifique console para erros
- Confirme que estatísticas atualizam

---

**Se ainda houver problemas, me envie os logs do console (F12) e posso ajudar mais!**
