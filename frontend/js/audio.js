/**
 * Processador de Áudio
 * Converte áudio para Mel-Espectrograma no navegador
 */

export class AudioProcessor {
    constructor() {
        // Parâmetros (devem corresponder aos usados no treinamento!)
        this.sampleRate = 22050;
        this.duration = 3.0;
        this.nMels = 128;
        this.nFFT = 2048;
        this.hopLength = 512;
        this.fmin = 50;
        this.fmax = 8000;
    }
    
    async audioBufferToMelSpectrogram(audioBuffer) {
        console.log('🎵 Processando áudio para espectrograma...');
        
        // 1. Extrair canal de áudio e reamostrar
        const audioData = this.extractAndResample(audioBuffer);
        
        // 2. Ajustar duração (pad ou truncate)
        const targetSamples = Math.floor(this.sampleRate * this.duration);
        const processedAudio = this.padOrTruncate(audioData, targetSamples);
        
        // 3. Normalizar
        const normalized = this.normalize(processedAudio);
        
        // 4. Calcular STFT (Short-Time Fourier Transform)
        const stft = this.computeSTFT(normalized);
        
        // 5. Aplicar Mel filterbank
        const melSpec = this.applyMelFilterbank(stft);
        
        // 6. Converter para dB
        const melSpecDB = this.powerToDB(melSpec);
        
        console.log('✅ Espectrograma gerado:', melSpecDB.length, 'x', melSpecDB[0].length);
        
        return melSpecDB;
    }
    
    extractAndResample(audioBuffer) {
        // Pegar primeiro canal (mono)
        let audioData = audioBuffer.getChannelData(0);
        
        // Se sample rate for diferente, reamostrar (simplificado)
        if (audioBuffer.sampleRate !== this.sampleRate) {
            console.log(`   Reamostrando: ${audioBuffer.sampleRate}Hz → ${this.sampleRate}Hz`);
            audioData = this.simpleResample(
                audioData, 
                audioBuffer.sampleRate, 
                this.sampleRate
            );
        }
        
        return audioData;
    }
    
    simpleResample(data, fromRate, toRate) {
        const ratio = fromRate / toRate;
        const newLength = Math.floor(data.length / ratio);
        const result = new Float32Array(newLength);
        
        for (let i = 0; i < newLength; i++) {
            const srcIndex = i * ratio;
            const srcIndexFloor = Math.floor(srcIndex);
            const srcIndexCeil = Math.min(srcIndexFloor + 1, data.length - 1);
            const t = srcIndex - srcIndexFloor;
            
            // Interpolação linear
            result[i] = data[srcIndexFloor] * (1 - t) + data[srcIndexCeil] * t;
        }
        
        return result;
    }
    
    padOrTruncate(audioData, targetLength) {
        if (audioData.length === targetLength) {
            return audioData;
        } else if (audioData.length > targetLength) {
            // Truncar
            return audioData.slice(0, targetLength);
        } else {
            // Pad com zeros
            const padded = new Float32Array(targetLength);
            padded.set(audioData);
            return padded;
        }
    }
    
    normalize(audioData) {
        const max = Math.max(...audioData.map(Math.abs));
        if (max === 0) return audioData;
        
        return audioData.map(x => x / max);
    }
    
    computeSTFT(audioData) {
        console.log('   Calculando STFT...');
        
        const numFrames = Math.floor((audioData.length - this.nFFT) / this.hopLength) + 1;
        const stft = [];
        
        // Janela de Hann
        const window = this.hannWindow(this.nFFT);
        
        for (let frame = 0; frame < numFrames; frame++) {
            const start = frame * this.hopLength;
            const segment = audioData.slice(start, start + this.nFFT);
            
            // Aplicar janela
            const windowed = segment.map((x, i) => x * window[i]);
            
            // FFT
            const fftResult = this.fft(windowed);
            
            // Magnitude (power spectrum)
            const magnitudes = fftResult.slice(0, this.nFFT / 2 + 1).map(c => 
                c.real * c.real + c.imag * c.imag
            );
            
            stft.push(magnitudes);
        }
        
        return stft;
    }
    
    hannWindow(length) {
        const window = new Float32Array(length);
        for (let i = 0; i < length; i++) {
            window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
        }
        return window;
    }
    
    fft(signal) {
        // Implementação simplificada de FFT usando algoritmo Cooley-Tukey
        const n = signal.length;
        
        // Base case
        if (n === 1) {
            return [{ real: signal[0], imag: 0 }];
        }
        
        // Garantir que n seja potência de 2 (pad com zeros se necessário)
        const nextPow2 = Math.pow(2, Math.ceil(Math.log2(n)));
        if (n !== nextPow2) {
            const padded = new Float32Array(nextPow2);
            padded.set(signal);
            return this.fft(padded);
        }
        
        // Dividir em pares e ímpares
        const even = new Float32Array(n / 2);
        const odd = new Float32Array(n / 2);
        
        for (let i = 0; i < n / 2; i++) {
            even[i] = signal[2 * i];
            odd[i] = signal[2 * i + 1];
        }
        
        // Recursão
        const fftEven = this.fft(even);
        const fftOdd = this.fft(odd);
        
        // Combinar
        const result = new Array(n);
        
        for (let k = 0; k < n / 2; k++) {
            const angle = -2 * Math.PI * k / n;
            const twiddle = {
                real: Math.cos(angle),
                imag: Math.sin(angle)
            };
            
            const t = {
                real: twiddle.real * fftOdd[k].real - twiddle.imag * fftOdd[k].imag,
                imag: twiddle.real * fftOdd[k].imag + twiddle.imag * fftOdd[k].real
            };
            
            result[k] = {
                real: fftEven[k].real + t.real,
                imag: fftEven[k].imag + t.imag
            };
            
            result[k + n / 2] = {
                real: fftEven[k].real - t.real,
                imag: fftEven[k].imag - t.imag
            };
        }
        
        return result;
    }
    
    applyMelFilterbank(stft) {
        console.log('   Aplicando Mel filterbank...');
        
        // Criar banco de filtros Mel
        const melFilters = this.createMelFilterbank();
        
        // Aplicar filtros
        const melSpec = [];
        
        for (let frame of stft) {
            const melFrame = new Array(this.nMels).fill(0);
            
            for (let i = 0; i < this.nMels; i++) {
                for (let j = 0; j < frame.length; j++) {
                    melFrame[i] += frame[j] * melFilters[i][j];
                }
            }
            
            melSpec.push(melFrame);
        }
        
        // Transpor (de frames x mels para mels x frames)
        return this.transpose(melSpec);
    }
    
    createMelFilterbank() {
        // Criar banco de filtros triangulares na escala Mel
        const numFreqs = this.nFFT / 2 + 1;
        const filters = [];
        
        // Converter limites de frequência para escala Mel
        const melMin = this.hzToMel(this.fmin);
        const melMax = this.hzToMel(this.fmax);
        
        // Pontos igualmente espaçados na escala Mel
        const melPoints = [];
        for (let i = 0; i <= this.nMels + 1; i++) {
            melPoints.push(melMin + (melMax - melMin) * i / (this.nMels + 1));
        }
        
        // Converter de volta para Hz
        const hzPoints = melPoints.map(m => this.melToHz(m));
        
        // Converter Hz para índices de bin FFT
        const binPoints = hzPoints.map(hz => 
            Math.floor((this.nFFT + 1) * hz / this.sampleRate)
        );
        
        // Criar filtros triangulares
        for (let i = 1; i <= this.nMels; i++) {
            const filter = new Array(numFreqs).fill(0);
            
            const left = binPoints[i - 1];
            const center = binPoints[i];
            const right = binPoints[i + 1];
            
            // Rampa ascendente
            for (let j = left; j < center; j++) {
                if (j < numFreqs) {
                    filter[j] = (j - left) / (center - left);
                }
            }
            
            // Rampa descendente
            for (let j = center; j < right; j++) {
                if (j < numFreqs) {
                    filter[j] = (right - j) / (right - center);
                }
            }
            
            filters.push(filter);
        }
        
        return filters;
    }
    
    hzToMel(hz) {
        return 2595 * Math.log10(1 + hz / 700);
    }
    
    melToHz(mel) {
        return 700 * (Math.pow(10, mel / 2595) - 1);
    }
    
    powerToDB(melSpec) {
        // Converter power para escala dB
        const melSpecDB = [];
        
        for (let row of melSpec) {
            const rowDB = row.map(val => {
                const power = Math.max(val, 1e-10); // Evitar log(0)
                return 10 * Math.log10(power);
            });
            melSpecDB.push(rowDB);
        }
        
        return melSpecDB;
    }
    
    transpose(matrix) {
        if (matrix.length === 0) return [];
        
        const rows = matrix.length;
        const cols = matrix[0].length;
        const transposed = [];
        
        for (let j = 0; j < cols; j++) {
            transposed[j] = [];
            for (let i = 0; i < rows; i++) {
                transposed[j][i] = matrix[i][j];
            }
        }
        
        return transposed;
    }
    
    /**
     * Converte mel-spectrogram para formato tensor 3D (H x W x 3)
     * Normaliza e converte para RGB "fake" (mesmo valor nos 3 canais)
     */
    spectrogramToTensor3D(melSpecDB) {
        // melSpecDB é [nMels x nFrames]
        const height = melSpecDB.length;
        const width = melSpecDB[0].length;
        
        // Encontrar min/max para normalização
        let minVal = Infinity;
        let maxVal = -Infinity;
        
        for (let row of melSpecDB) {
            for (let val of row) {
                if (val < minVal) minVal = val;
                if (val > maxVal) maxVal = val;
            }
        }
        
        const range = maxVal - minVal || 1;
        
        // Criar tensor 3D [height x width x 3]
        const tensor3D = [];
        
        for (let i = 0; i < height; i++) {
            const row = [];
            for (let j = 0; j < width; j++) {
                // Normalizar para [0, 1]
                const normalized = (melSpecDB[i][j] - minVal) / range;
                
                // Criar pixel RGB (grayscale nos 3 canais)
                row.push([normalized, normalized, normalized]);
            }
            tensor3D.push(row);
        }
        
        return tensor3D;
    }
    
    /**
     * Método principal para treinamento: processa áudio e retorna tensor pronto
     */
    async processAudioForTraining(audioBuffer) {
        // 1. Gerar mel-spectrogram
        const melSpecDB = await this.audioBufferToMelSpectrogram(audioBuffer);
        
        // 2. Converter para formato tensor 3D [H x W x 3]
        const tensor3D = this.spectrogramToTensor3D(melSpecDB);
        
        console.log(`📊 Tensor gerado: ${tensor3D.length} x ${tensor3D[0].length} x 3`);
        
        return tensor3D;
    }
}
