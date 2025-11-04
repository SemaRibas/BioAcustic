/**
 * Aplicação Principal - BioAcustic
 * Coordena carregamento de modelo, processamento e inferência
 *
 * ATUALIZAÇÃO:
 * - Chamadas a `uiManager.showAlert` atualizadas para `uiManager.showNotification`
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
        this.currentFile = null;
    }
    
    async initialize() {
        console.log('🐸 Inicializando BioAcustic App...');
        
        try {
            // Carregar modelo
            // O caminho é relativo ao index.html
            await this.modelManager.loadModel('./assets/model/model.json');
            this.uiManager.updateModelStatus('success', 'Modelo Carregado');
            
            // Configurar event listeners
            this.setupEventListeners();
            
            console.log('✅ App inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            
            // Verificar se é problema de modelo não treinado
            if (error.message.includes('ainda não foi treinado') || error.message.includes('DEMO_MODE')) {
                this.uiManager.updateModelStatus('error', 'Modelo não treinado');
                // ATUALIZADO: Usando showNotification
                this.uiManager.showNotification(
                    '🎓 Modelo não treinado. Acesse a página "Treinar Modelo" ou execute o pipeline Python.',
                    'info',
                    10000 // Manter a mensagem por 10s
                );
            } else {
                this.uiManager.updateModelStatus('error', 'Erro ao carregar');
                // ATUALIZADO: Usando showNotification
                this.uiManager.showNotification(`Erro ao carregar modelo: ${error.message}`, 'error');
            }
            
            // Ainda configurar listeners para interface funcionar
            this.setupEventListeners();
        }
    }
    
    setupEventListeners() {
        const uploadInput = document.getElementById('audioUpload');
        const dropZone = document.getElementById('dropZone');
        const recordBtn = document.getElementById('recordBtn');
        const analyzeBtn = document.getElementById('analyzeBtn');

        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]));
        }
        
        if (dropZone) {
            dropZone.addEventListener('click', () => uploadInput.click());
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });
            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
            });
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                if (e.dataTransfer.files[0]) {
                    this.handleFileUpload(e.dataTransfer.files[0]);
                }
            });
        }
        
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.toggleRecording());
        }
        
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeAudio());
        }
    }
    
    async handleFileUpload(file) {
        if (!file) return;
        
        console.log('📁 Arquivo selecionado:', file.name);
        
        // Validar tipo
        if (!file.type.startsWith('audio/')) {
            // ATUALIZADO: Usando showNotification
            this.uiManager.showNotification('Por favor, selecione um arquivo de áudio válido', 'error');
            return;
        }
        
        // Validar tamanho (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            // ATUALIZADO: Usando showNotification
            this.uiManager.showNotification('Arquivo muito grande! Máximo: 10MB', 'error');
            return;
        }
        
        try {
            this.currentFile = file; // Salvar referência do arquivo
            const arrayBuffer = await file.arrayBuffer();
            
            // Decodificar áudio
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.currentAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Mostrar player
            this.uiManager.showAudioPlayer(file);
            
            // Habilitar botão de análise
            document.getElementById('analyzeBtn').disabled = false;
            
            // ATUALIZADO: Usando showNotification
            this.uiManager.showNotification(`Áudio carregado: ${file.name}`, 'success');
            
        } catch (error) {
            console.error('❌ Erro ao processar arquivo:', error);
            // ATUALIZADO: Usando showNotification
            this.uiManager.showNotification('Erro ao processar arquivo de áudio. O formato pode não ser suportado.', 'error');
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
                const file = new File([blob], 'gravacao.webm', { type: 'audio/webm' });
                this.currentFile = file; // Salvar referência
                await this.processRecordedAudio(blob);
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Atualizar UI
            const recordBtn = document.getElementById('recordBtn');
            recordBtn.innerHTML = '◼ Parar Gravação';
            recordBtn.style.background = 'linear-gradient(135deg, var(--gray-600), var(--gray-500))';
            
            document.getElementById('recordingStatus').textContent = '🔴 Gravando...';
            
        } catch (error) {
            console.error('❌ Erro ao acessar microfone:', error);
            // ATUALIZADO: Usando showNotification
            this.uiManager.showNotification('Erro ao acessar microfone. Verifique as permissões.', 'error');
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
            recordBtn.innerHTML = '⏺ Iniciar Gravação';
            recordBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            
            document.getElementById('recordingStatus').textContent = '✅ Gravação concluída';
        }
    }
    
    async processRecordedAudio(blob) {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.currentAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Mostrar player usando o arquivo blob
            this.uiManager.showAudioPlayer(this.currentFile);
            
            // Habilitar análise
            document.getElementById('analyzeBtn').disabled = false;
            
            // ATUALIZADO: Usando showNotification
            this.uiManager.showNotification('Áudio gravado com sucesso!', 'success');
            
        } catch (error) {
            console.error('❌ Erro ao processar gravação:', error);
            // ATUALIZADO: Usando showNotification
            this.uiManager.showNotification('Erro ao processar gravação', 'error');
        }
    }
    
    async analyzeAudio() {
        if (!this.currentAudioBuffer) {
            // ATUALIZADO: Usando showNotification
            this.uiManager.showNotification('Nenhum áudio carregado', 'error');
            return;
        }
        
        if (!this.modelManager.isLoaded) {
            // ATUALIZADO: Usando showNotification
            this.uiManager.showNotification('O modelo ainda não foi carregado ou treinado.', 'error');
            return;
        }
        
        console.log('🧠 Iniciando análise...');
        
        // Mostrar animação de processamento
        this.uiManager.showProcessing(true);
        
        try {
            // 1. Pré-processar áudio (gerar espectrograma)
            this.uiManager.updateProgress(30, 'Gerando espectrograma...');
            const melSpectrogram = await this.audioProcessor.audioBufferToMelSpectrogram(
                this.currentAudioBuffer
            );
            
            // 2. Preparar tensor de input
            this.uiManager.updateProgress(50, 'Preparando tensor...');
            const inputTensor = this.prepareInputTensor(melSpectrogram);
            
            // 3. Fazer predição
            this.uiManager.updateProgress(70, 'Executando inferência...');
            const predictions = await this.modelManager.predict(inputTensor);
            
            // 4. Processar resultados
            this.uiManager.updateProgress(90, 'Processando resultados...');
            const results = this.modelManager.getTopPredictions(predictions, 5);
            
            // 5. Exibir resultados
            this.uiManager.updateProgress(100, 'Concluído!');
            this.uiManager.showResults(results);
            
            // 6. Visualizar espectrograma
            this.uiManager.drawSpectrogram(melSpectrogram);
            
            // Limpar
            inputTensor.dispose();
            
            console.log('✅ Análise concluída', results);
            
            // O showProcessing(false) agora tem um delay embutido
            this.uiManager.showProcessing(false);
            
        } catch (error) {
            console.error('❌ Erro na análise:', error);
            // ATUALIZADO: Usando showNotification
            this.uiManager.showNotification(`Erro na análise: ${error.message}`, 'error');
            this.uiManager.showProcessing(false);
        }
    }
    
    prepareInputTensor(melSpectrogram) {
        // Normalizar espectrograma (função movida para cá para consistência)
        const normalized = this.normalizeSpectrogram(melSpectrogram);
        
        // Converter para tensor (1, 128, 128, 3) - assumindo que audioProcessor retorna 128xN
        const height = normalized.length; // Deve ser this.audioProcessor.nMels (128)
        const width = normalized[0].length; // N frames
        
        // O modelo espera um shape específico, ex: [1, 128, 126, 3] ou [1, 128, 128, 3]
        const targetWidth = this.modelManager.model.inputs[0].shape[2]; // 126 ou 128
        
        if (width !== targetWidth) {
            console.warn(`Shape do espectrograma (${width}) não bate com o esperado (${targetWidth}). Redimensionando...`);
            // TODO: Adicionar lógica de redimensionamento/corte se necessário
            // Por enquanto, vamos assumir que audio.js produz o tamanho correto
        }
        
        const tensorData = new Float32Array(1 * height * targetWidth * 3);
        
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < targetWidth; j++) {
                const idx = (i * targetWidth + j) * 3;
                // Usar valor ou 0 se o espectrograma for menor
                const value = (normalized[i] && normalized[i][j]) ? normalized[i][j] : 0;
                tensorData[idx] = value;     // R
                tensorData[idx + 1] = value; // G
                tensorData[idx + 2] = value; // B
            }
        }
        
        return tf.tensor4d(tensorData, [1, height, targetWidth, 3]);
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
        
        const range = max - min;
        if (range === 0) return spec; // Evitar divisão por zero
        
        // Normalizar para [0, 1]
        const normalized = [];
        for (let i = 0; i < spec.length; i++) {
            normalized[i] = [];
            for (let j = 0; j < spec[i].length; j++) {
                normalized[i][j] = (spec[i][j] - min) / range;
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
