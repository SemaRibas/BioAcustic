/**
 * Aplicação Principal - BioAcustic
 * Coordena carregamento de modelo, processamento e inferência
 */

import { ModelManager } from './model.js';
import { AudioProcessor } from './audio.js';
import { UIManager } from './ui.js';

class BioAcusticApp {
    constructor() {
        this.modelManager = new ModelManager();
        this.audioProcessor = new AudioProcessor();
        this.uiManager = new UIManager();
        
        this.currentAudioBuffer = null;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
    }
    
    async initialize() {
        console.log('🐸 Inicializando BioAcustic App...');
        
        try {
            // Carregar modelo
            await this.modelManager.loadModel('./assets/model/model.json');
            this.uiManager.updateModelStatus('success', 'Modelo carregado!');
            
            // Configurar event listeners
            this.setupEventListeners();
            
            console.log('✅ App inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            
            // Verificar se é problema de modelo não treinado
            if (error.message.includes('ainda não foi treinado') || error.message.includes('DEMO_MODE')) {
                this.uiManager.updateModelStatus('error', '⚠️ Modelo não treinado');
                this.uiManager.showAlert('info', 
                    '🎓 O modelo ainda não foi treinado. Para usar o sistema:\n\n' +
                    '1. Siga o guia QUICKSTART.md\n' +
                    '2. Execute os scripts de treinamento\n' +
                    '3. Converta o modelo para TensorFlow.js\n\n' +
                    'Consulte a documentação para mais detalhes.'
                );
            } else {
                this.uiManager.updateModelStatus('error', 'Erro ao carregar modelo');
                this.uiManager.showAlert('error', `Erro: ${error.message}`);
            }
            
            // Ainda configurar listeners para interface funcionar
            this.setupEventListeners();
        }
    }
    
    setupEventListeners() {
        // Upload de arquivo
        const uploadInput = document.getElementById('audioUpload');
        uploadInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Botão de gravação
        const recordBtn = document.getElementById('recordBtn');
        recordBtn.addEventListener('click', () => this.toggleRecording());
        
        // Botão de análise
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn.addEventListener('click', () => this.analyzeAudio());
    }
    
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        console.log('📁 Arquivo selecionado:', file.name);
        
        // Validar tipo
        if (!file.type.startsWith('audio/')) {
            this.uiManager.showAlert('error', 'Por favor, selecione um arquivo de áudio válido');
            return;
        }
        
        // Validar tamanho (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            this.uiManager.showAlert('error', 'Arquivo muito grande! Máximo: 10MB');
            return;
        }
        
        try {
            // Ler arquivo
            const arrayBuffer = await file.arrayBuffer();
            
            // Decodificar áudio
            const audioContext = new AudioContext();
            this.currentAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Mostrar player
            this.uiManager.showAudioPlayer(file);
            
            // Habilitar botão de análise
            document.getElementById('analyzeBtn').disabled = false;
            
            this.uiManager.showAlert('success', `Áudio carregado: ${file.name}`);
            
        } catch (error) {
            console.error('❌ Erro ao processar arquivo:', error);
            this.uiManager.showAlert('error', 'Erro ao processar arquivo de áudio');
        }
    }
    
    async toggleRecording() {
        if (!this.isRecording) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }
    
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.recordedChunks.push(e.data);
                }
            };
            
            this.mediaRecorder.onstop = async () => {
                const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
                await this.processRecordedAudio(blob);
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Atualizar UI
            const recordBtn = document.getElementById('recordBtn');
            recordBtn.innerHTML = '<i class="fas fa-stop mr-2"></i>Parar Gravação';
            recordBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
            recordBtn.classList.add('bg-gray-600', 'hover:bg-gray-700');
            
            document.getElementById('recordingStatus').textContent = '🔴 Gravando...';
            
        } catch (error) {
            console.error('❌ Erro ao acessar microfone:', error);
            this.uiManager.showAlert('error', 'Erro ao acessar microfone. Verifique as permissões.');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Parar stream
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            // Atualizar UI
            const recordBtn = document.getElementById('recordBtn');
            recordBtn.innerHTML = '<i class="fas fa-microphone mr-2"></i>Iniciar Gravação';
            recordBtn.classList.remove('bg-gray-600', 'hover:bg-gray-700');
            recordBtn.classList.add('bg-red-500', 'hover:bg-red-600');
            
            document.getElementById('recordingStatus').textContent = '✅ Gravação concluída';
        }
    }
    
    async processRecordedAudio(blob) {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const audioContext = new AudioContext();
            this.currentAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Criar URL para player
            const url = URL.createObjectURL(blob);
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.src = url;
            
            // Mostrar player
            document.getElementById('audioPlayerContainer').classList.remove('hidden');
            
            // Habilitar análise
            document.getElementById('analyzeBtn').disabled = false;
            
            this.uiManager.showAlert('success', 'Áudio gravado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao processar gravação:', error);
            this.uiManager.showAlert('error', 'Erro ao processar gravação');
        }
    }
    
    async analyzeAudio() {
        if (!this.currentAudioBuffer) {
            this.uiManager.showAlert('error', 'Nenhum áudio carregado');
            return;
        }
        
        console.log('🧠 Iniciando análise...');
        
        // Mostrar animação de processamento
        this.uiManager.showProcessing(true);
        
        try {
            // 1. Pré-processar áudio (gerar espectrograma)
            this.uiManager.updateProgress(30);
            const melSpectrogram = await this.audioProcessor.audioBufferToMelSpectrogram(
                this.currentAudioBuffer
            );
            
            // 2. Preparar tensor de input
            this.uiManager.updateProgress(50);
            const inputTensor = this.prepareInputTensor(melSpectrogram);
            
            // 3. Fazer predição
            this.uiManager.updateProgress(70);
            const predictions = await this.modelManager.predict(inputTensor);
            
            // 4. Processar resultados
            this.uiManager.updateProgress(90);
            const results = this.modelManager.getTopPredictions(predictions, 5);
            
            // 5. Exibir resultados
            this.uiManager.updateProgress(100);
            this.uiManager.showResults(results);
            
            // 6. Visualizar espectrograma
            this.uiManager.drawSpectrogram(melSpectrogram);
            
            // Limpar
            inputTensor.dispose();
            
            console.log('✅ Análise concluída', results);
            
            setTimeout(() => {
                this.uiManager.showProcessing(false);
            }, 500);
            
        } catch (error) {
            console.error('❌ Erro na análise:', error);
            this.uiManager.showAlert('error', `Erro na análise: ${error.message}`);
            this.uiManager.showProcessing(false);
        }
    }
    
    prepareInputTensor(melSpectrogram) {
        // Normalizar espectrograma
        const normalized = this.normalizeSpectrogram(melSpectrogram);
        
        // Converter para tensor (1, 128, 128, 3)
        // Replicar para 3 canais (simular RGB)
        const height = normalized.length;
        const width = normalized[0].length;
        
        const tensorData = new Float32Array(height * width * 3);
        
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const idx = (i * width + j) * 3;
                const value = normalized[i][j];
                tensorData[idx] = value;     // R
                tensorData[idx + 1] = value; // G
                tensorData[idx + 2] = value; // B
            }
        }
        
        return tf.tensor4d(tensorData, [1, height, width, 3]);
    }
    
    normalizeSpectrogram(spec) {
        // Encontrar min e max
        let min = Infinity;
        let max = -Infinity;
        
        for (let i = 0; i < spec.length; i++) {
            for (let j = 0; j < spec[i].length; j++) {
                if (spec[i][j] < min) min = spec[i][j];
                if (spec[i][j] > max) max = spec[i][j];
            }
        }
        
        // Normalizar para [0, 1]
        const normalized = [];
        for (let i = 0; i < spec.length; i++) {
            normalized[i] = [];
            for (let j = 0; j < spec[i].length; j++) {
                normalized[i][j] = (spec[i][j] - min) / (max - min);
            }
        }
        
        return normalized;
    }
}

// Inicializar app quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const app = new BioAcusticApp();
    app.initialize();
});
