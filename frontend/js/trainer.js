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
        
        // Modelo CNN otimizado com BatchNormalization e arquitetura mais profunda
        const model = tf.sequential();
        
        // Bloco 1: Conv2D + BatchNorm + Pooling
        model.add(tf.layers.conv2d({
            inputShape: inputShape,
            filters: 32,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        model.add(tf.layers.dropout({ rate: 0.25 }));
        
        // Bloco 2: Conv2D + BatchNorm + Pooling
        model.add(tf.layers.conv2d({
            filters: 64,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        model.add(tf.layers.dropout({ rate: 0.25 }));
        
        // Bloco 3: Conv2D + BatchNorm + Pooling
        model.add(tf.layers.conv2d({
            filters: 128,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        model.add(tf.layers.dropout({ rate: 0.25 }));
        
        // Bloco 4: Conv2D adicional para mais capacidade
        model.add(tf.layers.conv2d({
            filters: 256,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        
        // Flatten e Dense
        model.add(tf.layers.flatten());
        model.add(tf.layers.dropout({ rate: 0.5 }));
        
        // Camadas Dense
        model.add(tf.layers.dense({ 
            units: 128, 
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.dropout({ rate: 0.5 }));
        
        model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));
        
        // Compilar com learning rate menor para melhor convergência
        model.compile({
            optimizer: tf.train.adam(0.0005),
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
    
    async train(epochs = 50, batchSize = 16, onEpochEnd = null) {
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
            console.log(`   ⚠️  Treinamento mais longo para maior acurácia!`);
            
            // Ajustar batch size baseado no número de amostras para evitar sobrecarga
            const totalSamples = xs.shape[0];
            const adjustedBatchSize = Math.min(batchSize, Math.floor(totalSamples / 4));
            
            if (adjustedBatchSize !== batchSize) {
                console.log(`   ⚠️ Batch size ajustado: ${batchSize} → ${adjustedBatchSize}`);
            }
            
            // Variáveis para early stopping e melhor modelo
            let bestValAcc = 0;
            let bestWeights = null;
            let patienceCounter = 0;
            const patience = 10; // Parar se não melhorar por 10 épocas
            
            // Treinar com gerenciamento de memória melhorado e early stopping
            const history = await this.model.fit(xs, ys, {
                epochs: epochs,
                batchSize: adjustedBatchSize,
                validationSplit: 0.2,
                shuffle: true,
                callbacks: {
                    onEpochBegin: async (epoch) => {
                        // Ajustar learning rate dinamicamente (cosine annealing)
                        if (epoch > 0 && epoch % 10 === 0) {
                            const currentLR = this.model.optimizer.learningRate;
                            const newLR = currentLR * 0.5;
                            this.model.optimizer.learningRate = newLR;
                            console.log(`   📉 Learning rate reduzido: ${currentLR.toFixed(6)} → ${newLR.toFixed(6)}`);
                        }
                    },
                    onEpochEnd: async (epoch, logs) => {
                        const valAcc = logs.val_acc || logs.val_accuracy || 0;
                        
                        console.log(`   Época ${epoch + 1}/${epochs}`);
                        console.log(`      Training   - loss: ${logs.loss.toFixed(4)}, acc: ${logs.acc.toFixed(4)}`);
                        console.log(`      Validation - loss: ${logs.val_loss.toFixed(4)}, acc: ${valAcc.toFixed(4)}`);
                        
                        // Early stopping: salvar melhor modelo
                        if (valAcc > bestValAcc) {
                            bestValAcc = valAcc;
                            bestWeights = await this.model.getWeights();
                            patienceCounter = 0;
                            console.log(`      ✅ Novo melhor modelo! Val Acc: ${(valAcc * 100).toFixed(2)}%`);
                        } else {
                            patienceCounter++;
                            if (patienceCounter >= patience) {
                                console.log(`      ⚠️ Early stopping! Sem melhoria por ${patience} épocas`);
                                this.model.stopTraining = true;
                            }
                        }
                        
                        // Liberar memória GPU periodicamente
                        if ((epoch + 1) % 5 === 0) {
                            await tf.nextFrame(); // Permitir que a GPU respire
                            const memInfo = tf.memory();
                            console.log(`      💾 GPU: ${(memInfo.numBytes / 1024 / 1024).toFixed(2)} MB, ${memInfo.numTensors} tensores`);
                        }
                        
                        if (onEpochEnd) {
                            onEpochEnd(epoch, logs);
                        }
                    }
                }
            });
            
            // Restaurar melhor modelo se early stopping foi ativado
            if (bestWeights) {
                console.log(`🏆 Restaurando melhor modelo (Val Acc: ${(bestValAcc * 100).toFixed(2)}%)`);
                await this.model.setWeights(bestWeights);
                // Limpar pesos antigos
                bestWeights.forEach(w => w.dispose());
            }
            
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
