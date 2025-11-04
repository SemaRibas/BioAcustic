/**
 * Gerenciador de Treinamento No Navegador
 * Permite treinar um modelo simples diretamente no navegador
 */

export class BrowserTrainer {
    constructor() {
        this.trainingData = new Map(); // espécie -> [espectrogramas]
        this.model = null;
        this.classNames = [];
        this.isTraining = false;
    }
    
    addTrainingExample(spectrogram, speciesName) {
        if (!this.trainingData.has(speciesName)) {
            this.trainingData.set(speciesName, []);
        }
        this.trainingData.get(speciesName).push(spectrogram);
        
        console.log(`✅ Exemplo adicionado: ${speciesName} (${this.trainingData.get(speciesName).length} amostras)`);
    }
    
    // Limpar tensores não utilizados para liberar memória GPU
    cleanupMemory() {
        const numTensors = tf.memory().numTensors;
        console.log(`🧹 Limpando memória GPU... (${numTensors} tensores ativos)`);
        
        // Forçar garbage collection do TensorFlow
        tf.engine().startScope();
        tf.engine().endScope();
        
        const afterCleanup = tf.memory().numTensors;
        console.log(`✅ Memória limpa (${afterCleanup} tensores restantes)`);
    }
    
    getTrainingStats() {
        const stats = [];
        for (const [species, samples] of this.trainingData) {
            stats.push({
                species,
                count: samples.length
            });
        }
        return stats;
    }
    
    canTrain() {
        // Mínimo: 2 espécies com pelo menos 5 amostras cada
        if (this.trainingData.size < 2) return false;
        
        for (const samples of this.trainingData.values()) {
            if (samples.length < 5) return false;
        }
        
        return true;
    }
    
    async buildModel(inputShape = null) {
        console.log('🏗️ Construindo modelo...');
        
        const numClasses = this.trainingData.size;
        this.classNames = Array.from(this.trainingData.keys()).sort();
        
        // Detectar shape automaticamente do primeiro exemplo
        if (!inputShape) {
            const firstSpecies = this.trainingData.keys().next().value;
            const firstExample = this.trainingData.get(firstSpecies)[0];
            inputShape = [firstExample.length, firstExample[0].length, firstExample[0][0].length];
            console.log(`   Shape detectado: [${inputShape.join(', ')}]`);
        }
        
        // Modelo CNN otimizado para memória (menos parâmetros)
        const model = tf.sequential();
        
        // Camada 1: Conv2D (reduzido de 16 para 12 filtros)
        model.add(tf.layers.conv2d({
            inputShape: inputShape,
            filters: 12,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same'
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        
        // Camada 2: Conv2D (reduzido de 32 para 24 filtros)
        model.add(tf.layers.conv2d({
            filters: 24,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same'
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        
        // Camada 3: Conv2D (reduzido de 64 para 32 filtros)
        model.add(tf.layers.conv2d({
            filters: 32,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same'
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        
        // Flatten e Dense (reduzido de 64 para 48 neurônios)
        model.add(tf.layers.flatten());
        model.add(tf.layers.dropout({ rate: 0.5 }));
        model.add(tf.layers.dense({ units: 48, activation: 'relu' }));
        model.add(tf.layers.dropout({ rate: 0.3 }));
        model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));
        
        // Compilar
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        this.model = model;
        console.log('✅ Modelo construído');
        console.log(`   Parâmetros: ${model.countParams().toLocaleString()}`);
        
        return model;
    }
    
    prepareDataset() {
        console.log('📊 Preparando dataset...');
        
        const X = [];
        const y = [];
        
        // Converter Map para arrays
        for (const [species, spectrograms] of this.trainingData) {
            const classIndex = this.classNames.indexOf(species);
            
            for (const spec of spectrograms) {
                X.push(spec);
                y.push(classIndex);
            }
        }
        
        // Converter para tensores usando tidy para gerenciamento automático de memória
        return tf.tidy(() => {
            const xs = tf.tensor4d(X);
            const ys = tf.oneHot(tf.tensor1d(y, 'int32'), this.classNames.length);
            
            console.log(`✅ Dataset preparado: ${X.length} amostras`);
            console.log(`   Shape: ${xs.shape}`);
            console.log(`   Memória GPU: ${(tf.memory().numBytes / 1024 / 1024).toFixed(2)} MB`);
            
            return { xs, ys };
        });
    }
    
    async train(epochs = 20, batchSize = 8, onEpochEnd = null) {
        if (!this.canTrain()) {
            throw new Error('Dados insuficientes. Mínimo: 2 espécies com 5 amostras cada.');
        }
        
        this.isTraining = true;
        
        try {
            // Construir modelo
            if (!this.model) {
                await this.buildModel();
            }
            
            // Limpar memória antes de preparar dados
            this.cleanupMemory();
            
            // Preparar dados
            const { xs, ys } = this.prepareDataset();
            
            console.log('🎓 Iniciando treinamento...');
            console.log(`   Épocas: ${epochs}`);
            console.log(`   Batch size: ${batchSize}`);
            console.log(`   Total amostras: ${xs.shape[0]}`);
            
            // Ajustar batch size baseado no número de amostras para evitar sobrecarga
            const totalSamples = xs.shape[0];
            const adjustedBatchSize = Math.min(batchSize, Math.floor(totalSamples / 4));
            
            if (adjustedBatchSize !== batchSize) {
                console.log(`   ⚠️ Batch size ajustado: ${batchSize} → ${adjustedBatchSize}`);
            }
            
            // Treinar com gerenciamento de memória melhorado
            const history = await this.model.fit(xs, ys, {
                epochs: epochs,
                batchSize: adjustedBatchSize,
                validationSplit: 0.2,
                shuffle: true,
                callbacks: {
                    onEpochEnd: async (epoch, logs) => {
                        console.log(`   Época ${epoch + 1}/${epochs} - loss: ${logs.loss.toFixed(4)} - acc: ${logs.acc.toFixed(4)}`);
                        
                        // Liberar memória GPU periodicamente
                        if ((epoch + 1) % 5 === 0) {
                            await tf.nextFrame(); // Permitir que a GPU respire
                            const memInfo = tf.memory();
                            console.log(`   💾 GPU: ${(memInfo.numBytes / 1024 / 1024).toFixed(2)} MB, ${memInfo.numTensors} tensores`);
                        }
                        
                        if (onEpochEnd) {
                            onEpochEnd(epoch, logs);
                        }
                    }
                }
            });
            
            // Limpar tensores
            xs.dispose();
            ys.dispose();
            
            // Limpeza final
            this.cleanupMemory();
            
            console.log('✅ Treinamento concluído!');
            
            this.isTraining = false;
            return history;
            
        } catch (error) {
            this.isTraining = false;
            console.error('❌ Erro no treinamento:', error);
            
            // Tentar recuperar memória em caso de erro
            try {
                this.cleanupMemory();
            } catch (cleanupError) {
                console.warn('⚠️ Erro ao limpar memória:', cleanupError);
            }
            
            throw error;
        }
    }
    
    async predict(spectrogram) {
        if (!this.model) {
            throw new Error('Modelo não treinado');
        }
        
        const inputTensor = tf.tensor4d([spectrogram]);
        const predictions = this.model.predict(inputTensor);
        const probabilities = await predictions.data();
        
        inputTensor.dispose();
        predictions.dispose();
        
        return Array.from(probabilities);
    }
    
    async saveModel(modelName = 'bioacustic-browser-model') {
        if (!this.model) {
            throw new Error('Nenhum modelo para salvar');
        }
        
        console.log('💾 Salvando modelo...');
        
        // Salvar no IndexedDB do navegador
        await this.model.save(`indexeddb://${modelName}`);
        
        // Salvar metadados
        const metadata = {
            classNames: this.classNames,
            numClasses: this.classNames.length,
            trainedAt: new Date().toISOString(),
            samplesPerClass: Object.fromEntries(
                Array.from(this.trainingData.entries()).map(([k, v]) => [k, v.length])
            )
        };
        
        localStorage.setItem(`${modelName}-metadata`, JSON.stringify(metadata));
        
        console.log('✅ Modelo salvo no navegador');
    }
    
    async loadModel(modelName = 'bioacustic-browser-model') {
        console.log('📥 Carregando modelo do navegador...');
        
        try {
            // Carregar modelo
            this.model = await tf.loadLayersModel(`indexeddb://${modelName}`);
            
            // Carregar metadados
            const metadataStr = localStorage.getItem(`${modelName}-metadata`);
            if (metadataStr) {
                const metadata = JSON.parse(metadataStr);
                this.classNames = metadata.classNames;
                console.log('✅ Modelo carregado do navegador');
                console.log(`   Classes: ${this.classNames.join(', ')}`);
                return metadata;
            }
            
        } catch (error) {
            console.log('ℹ️  Nenhum modelo salvo encontrado');
            return null;
        }
    }
    
    async deleteModel(modelName = 'bioacustic-browser-model') {
        try {
            await tf.io.removeModel(`indexeddb://${modelName}`);
            localStorage.removeItem(`${modelName}-metadata`);
            this.model = null;
            this.classNames = [];
            console.log('✅ Modelo deletado');
        } catch (error) {
            console.error('Erro ao deletar modelo:', error);
        }
    }
    
    clearTrainingData() {
        this.trainingData.clear();
        console.log('✅ Dados de treinamento limpos');
    }
    
    exportTrainingData() {
        const data = {
            species: Array.from(this.trainingData.keys()),
            samples: {}
        };
        
        for (const [species, spectrograms] of this.trainingData) {
            data.samples[species] = spectrograms;
        }
        
        return data;
    }
    
    importTrainingData(data) {
        this.trainingData.clear();
        
        for (const species of data.species) {
            this.trainingData.set(species, data.samples[species]);
        }
        
        console.log(`✅ ${this.trainingData.size} espécies importadas`);
    }
}
