/**
 * AudioFragmenter - Sistema de Fragmentação e Data Augmentation para Áudios
 * 
 * Funcionalidades:
 * - Fragmentação automática de áudios longos
 * - Detecção e remoção de silêncios
 * - Data Augmentation (volume, ruído, pitch, time stretch)
 * - Processamento totalmente no navegador (Web Audio API)
 */

export class AudioFragmenter {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sampleRate = this.audioContext.sampleRate;
    }

    /**
     * Fragmenta um arquivo de áudio em múltiplos pedaços
     * @param {File} audioFile - Arquivo de áudio original
     * @param {Object} options - Opções de fragmentação
     * @returns {Promise<Array<File>>} - Array de fragmentos de áudio
     */
    async fragmentAudio(audioFile, options = {}) {
        const {
            fragmentDuration = 3.0,  // Duração de cada fragmento em segundos
            removesilence = true,     // Remover silêncios
            silenceThreshold = -40,   // Limiar de silêncio em dB
            applyAugmentation = true, // Aplicar data augmentation
            augmentationCount = 2     // Número de variações por fragmento
        } = options;

        console.log('🎵 Iniciando fragmentação de áudio:', audioFile.name);
        
        // 1. Carregar e decodificar áudio
        const audioBuffer = await this.loadAudioFile(audioFile);
        const duration = audioBuffer.duration;
        
        console.log(`📊 Duração original: ${duration.toFixed(2)}s`);
        
        // 2. Detectar regiões de áudio (sem silêncio)
        const audioRegions = removesilence 
            ? this.detectAudioRegions(audioBuffer, silenceThreshold)
            : [{ start: 0, end: duration }];
        
        console.log(`🔍 Regiões de áudio detectadas: ${audioRegions.length}`);
        
        // 3. Fragmentar regiões em pedaços menores
        const fragments = [];
        let fragmentIndex = 0;
        
        for (const region of audioRegions) {
            const regionDuration = region.end - region.start;
            
            // Se a região é menor que o fragmento desejado, usa ela inteira
            if (regionDuration <= fragmentDuration) {
                const fragment = this.extractFragment(audioBuffer, region.start, region.end);
                fragments.push({
                    buffer: fragment,
                    start: region.start,
                    end: region.end,
                    index: fragmentIndex++
                });
            } else {
                // Divide a região em múltiplos fragmentos
                const numFragments = Math.ceil(regionDuration / fragmentDuration);
                const actualFragmentDuration = regionDuration / numFragments;
                
                for (let i = 0; i < numFragments; i++) {
                    const start = region.start + (i * actualFragmentDuration);
                    const end = Math.min(start + actualFragmentDuration, region.end);
                    
                    const fragment = this.extractFragment(audioBuffer, start, end);
                    fragments.push({
                        buffer: fragment,
                        start: start,
                        end: end,
                        index: fragmentIndex++
                    });
                }
            }
        }
        
        console.log(`✂️ Fragmentos criados: ${fragments.length}`);
        
        // 4. Aplicar Data Augmentation (se habilitado)
        let augmentedFragments = [];
        
        if (applyAugmentation && fragments.length > 0) {
            for (const fragment of fragments) {
                // Adiciona o fragmento original
                augmentedFragments.push({
                    buffer: fragment.buffer,
                    name: `${fragmentIndex}_original`,
                    type: 'original'
                });
                
                // Cria variações augmentadas
                for (let i = 0; i < augmentationCount; i++) {
                    const augmented = await this.applyRandomAugmentation(fragment.buffer);
                    augmentedFragments.push({
                        buffer: augmented,
                        name: `${fragmentIndex}_aug${i + 1}`,
                        type: 'augmented'
                    });
                }
            }
        } else {
            augmentedFragments = fragments.map((f, i) => ({
                buffer: f.buffer,
                name: `fragment_${i}`,
                type: 'original'
            }));
        }
        
        console.log(`🎨 Total com augmentation: ${augmentedFragments.length}`);
        
        // 5. Converter buffers de volta para arquivos
        const audioFiles = await Promise.all(
            augmentedFragments.map((fragment, index) => 
                this.bufferToFile(
                    fragment.buffer,
                    `${this.getBaseName(audioFile.name)}_${fragment.name}.wav`,
                    fragment.type
                )
            )
        );
        
        console.log(`✅ Fragmentação concluída: ${audioFiles.length} arquivos`);
        
        return audioFiles;
    }

    /**
     * Carrega e decodifica um arquivo de áudio
     */
    async loadAudioFile(file) {
        const arrayBuffer = await file.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
    }

    /**
     * Detecta regiões de áudio (não silenciosas) no buffer
     */
    detectAudioRegions(audioBuffer, silenceThreshold = -40) {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const windowSize = Math.floor(sampleRate * 0.1); // Janela de 100ms
        const hopSize = Math.floor(windowSize / 2);
        
        // Calcula RMS (Root Mean Square) para cada janela
        const rmsValues = [];
        for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
            let sum = 0;
            for (let j = 0; j < windowSize; j++) {
                sum += channelData[i + j] ** 2;
            }
            const rms = Math.sqrt(sum / windowSize);
            const db = 20 * Math.log10(rms + 1e-10); // Converte para dB
            rmsValues.push({
                time: i / sampleRate,
                db: db,
                isSilence: db < silenceThreshold
            });
        }
        
        // Agrupa regiões contínuas de áudio
        const regions = [];
        let currentRegion = null;
        
        for (const value of rmsValues) {
            if (!value.isSilence) {
                if (!currentRegion) {
                    currentRegion = { start: value.time, end: value.time };
                } else {
                    currentRegion.end = value.time;
                }
            } else {
                if (currentRegion && (value.time - currentRegion.end) > 0.2) {
                    // Finaliza região se silêncio durar mais de 200ms
                    regions.push(currentRegion);
                    currentRegion = null;
                }
            }
        }
        
        if (currentRegion) {
            regions.push(currentRegion);
        }
        
        // Se não encontrou nenhuma região, retorna o áudio inteiro
        return regions.length > 0 ? regions : [{ start: 0, end: audioBuffer.duration }];
    }

    /**
     * Extrai um fragmento do buffer de áudio
     */
    extractFragment(audioBuffer, startTime, endTime) {
        const sampleRate = audioBuffer.sampleRate;
        const startSample = Math.floor(startTime * sampleRate);
        const endSample = Math.floor(endTime * sampleRate);
        const fragmentLength = endSample - startSample;
        
        const fragmentBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            fragmentLength,
            sampleRate
        );
        
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const sourceData = audioBuffer.getChannelData(channel);
            const fragmentData = fragmentBuffer.getChannelData(channel);
            
            for (let i = 0; i < fragmentLength; i++) {
                fragmentData[i] = sourceData[startSample + i];
            }
        }
        
        return fragmentBuffer;
    }

    /**
     * Aplica data augmentation aleatório ao buffer
     */
    async applyRandomAugmentation(audioBuffer) {
        const techniques = [
            () => this.adjustVolume(audioBuffer, 0.7 + Math.random() * 0.6), // 0.7 a 1.3x
            () => this.addNoise(audioBuffer, 0.002 + Math.random() * 0.003), // Ruído leve
            () => this.pitchShift(audioBuffer, -2 + Math.random() * 4),      // ±2 semitons
        ];
        
        // Escolhe 1-2 técnicas aleatórias
        const numTechniques = 1 + Math.floor(Math.random() * 2);
        const selectedTechniques = this.shuffleArray([...techniques]).slice(0, numTechniques);
        
        let result = audioBuffer;
        for (const technique of selectedTechniques) {
            result = await technique();
        }
        
        return result;
    }

    /**
     * Ajusta o volume do áudio
     */
    adjustVolume(audioBuffer, factor) {
        const newBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );
        
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const sourceData = audioBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            
            for (let i = 0; i < audioBuffer.length; i++) {
                newData[i] = Math.max(-1, Math.min(1, sourceData[i] * factor));
            }
        }
        
        return newBuffer;
    }

    /**
     * Adiciona ruído branco ao áudio
     */
    addNoise(audioBuffer, noiseLevel) {
        const newBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );
        
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const sourceData = audioBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            
            for (let i = 0; i < audioBuffer.length; i++) {
                const noise = (Math.random() * 2 - 1) * noiseLevel;
                newData[i] = Math.max(-1, Math.min(1, sourceData[i] + noise));
            }
        }
        
        return newBuffer;
    }

    /**
     * Pitch shift (altera a frequência sem mudar a duração)
     * Implementação simplificada usando resampling
     */
    pitchShift(audioBuffer, semitones) {
        // Fator de pitch: 2^(semitones/12)
        const pitchFactor = Math.pow(2, semitones / 12);
        const newLength = Math.floor(audioBuffer.length / pitchFactor);
        
        const newBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length, // Mantém duração original
            audioBuffer.sampleRate
        );
        
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const sourceData = audioBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            
            // Interpolação linear para pitch shift
            for (let i = 0; i < newBuffer.length; i++) {
                const sourceIndex = i * pitchFactor;
                const index1 = Math.floor(sourceIndex);
                const index2 = Math.min(index1 + 1, audioBuffer.length - 1);
                const fraction = sourceIndex - index1;
                
                if (index1 < audioBuffer.length) {
                    newData[i] = sourceData[index1] * (1 - fraction) + sourceData[index2] * fraction;
                }
            }
        }
        
        return newBuffer;
    }

    /**
     * Converte AudioBuffer para File (WAV)
     */
    async bufferToFile(audioBuffer, fileName, type) {
        const wav = this.audioBufferToWav(audioBuffer);
        const blob = new Blob([wav], { type: 'audio/wav' });
        
        const file = new File([blob], fileName, { 
            type: 'audio/wav',
            lastModified: Date.now()
        });
        
        // Adiciona metadados customizados
        file.fragmentType = type;
        
        return file;
    }

    /**
     * Converte AudioBuffer para formato WAV
     */
    audioBufferToWav(audioBuffer) {
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;
        
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        
        const data = this.interleave(audioBuffer);
        const dataLength = data.length * bytesPerSample;
        
        const buffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(buffer);
        
        // WAV Header
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        this.writeString(view, 8, 'WAVE');
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // fmt chunk size
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true); // byte rate
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        this.writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true);
        
        // Write audio data
        this.floatTo16BitPCM(view, 44, data);
        
        return buffer;
    }

    /**
     * Intercala canais de áudio
     */
    interleave(audioBuffer) {
        const numChannels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length * numChannels;
        const result = new Float32Array(length);
        
        const channels = [];
        for (let i = 0; i < numChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }
        
        let offset = 0;
        for (let i = 0; i < audioBuffer.length; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                result[offset++] = channels[channel][i];
            }
        }
        
        return result;
    }

    /**
     * Escreve string no DataView
     */
    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    /**
     * Converte Float32 para 16-bit PCM
     */
    floatTo16BitPCM(view, offset, input) {
        for (let i = 0; i < input.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, input[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }

    /**
     * Remove a extensão do nome do arquivo
     */
    getBaseName(fileName) {
        return fileName.replace(/\.[^/.]+$/, '');
    }

    /**
     * Embaralha array (Fisher-Yates shuffle)
     */
    shuffleArray(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /**
     * Estima o número de fragmentos que serão gerados
     */
    estimateFragments(duration, fragmentDuration, applyAugmentation, augmentationCount) {
        const baseFragments = Math.ceil(duration / fragmentDuration);
        const totalFragments = applyAugmentation 
            ? baseFragments * (1 + augmentationCount)
            : baseFragments;
        
        return {
            base: baseFragments,
            total: totalFragments,
            augmented: applyAugmentation ? baseFragments * augmentationCount : 0
        };
    }
}
