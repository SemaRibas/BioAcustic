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
        
        // Modelo CNN otimizado - balanceando capacidade e estabilidade
        const model = tf.sequential();
        
        // Bloco 1: Conv2D + BatchNorm + Pooling
        model.add(tf.layers.conv2d({
            inputShape: inputShape,
            filters: 32,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same'
        }));
        model.add(tf.layers.batchNormalization({ momentum: 0.99 }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        
        // Bloco 2: Conv2D + BatchNorm + Pooling
        model.add(tf.layers.conv2d({
            filters: 64,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same'
        }));
        model.add(tf.layers.batchNormalization({ momentum: 0.99 }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        
        // Bloco 3: Conv2D + BatchNorm + Pooling
        model.add(tf.layers.conv2d({
            filters: 128,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same'
        }));
        model.add(tf.layers.batchNormalization({ momentum: 0.99 }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        model.add(tf.layers.dropout({ rate: 0.3 }));
        
        // Flatten e Dense
        model.add(tf.layers.flatten());
        model.add(tf.layers.dropout({ rate: 0.4 }));
        
        // Camadas Dense
        model.add(tf.layers.dense({ 
            units: 128, 
            activation: 'relu'
        }));
        model.add(tf.layers.batchNormalization({ momentum: 0.99 }));
        model.add(tf.layers.dropout({ rate: 0.4 }));
        
        model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));
        
        // Compilar com learning rate mais alto para convergência rápida
        model.compile({
            optimizer: tf.train.adam(0.003),
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
    
    async train(epochs = 20, batchSize = 16, onEpochEnd = null) {
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
            console.log(`   📊 Configurações:`);
            console.log(`      • Épocas: ${epochs} (todas serão executadas)`);
            console.log(`      • Tamanho do lote: ${batchSize}`);
            console.log(`      • Total de amostras: ${xs.shape[0]}`);
            
            if (xs.shape[0] < 50) {
                console.log(`   `);
                console.log(`   ⚠️  ATENÇÃO: Poucas amostras (${xs.shape[0]})!`);
                console.log(`      • Recomendado: 50-100 amostras para melhor acurácia`);
                console.log(`      • Use áudios DIFERENTES, não apenas réplicas`);
                console.log(`      • Espere acurácia entre 60-80% com esses dados`);
            }
            
            console.log(`   `);
            console.log(`   💡 Sobre as métricas:`);
            console.log(`      • ERRO (Loss): Quanto menor, melhor! Indica o erro do modelo.`);
            console.log(`      • ACURÁCIA: % de previsões corretas. Meta: > 85%`);
            console.log(`      • Treinamento: Aprende com os dados de treino`);
            console.log(`      • Validação: Testa generalização (não usado no treino)`);
            console.log(`   `);
            
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
            const patience = 100; // Desabilitado na prática (deixa todas as épocas rodarem)
            
            // Com poucas amostras, usar validação menor
            const validationSplit = totalSamples < 100 ? 0.15 : 0.2;
            console.log(`   ⚙️  Validação: ${(validationSplit * 100).toFixed(0)}% dos dados`);
            
            // Treinar com gerenciamento de memória melhorado
            const history = await this.model.fit(xs, ys, {
                epochs: epochs,
                batchSize: adjustedBatchSize,
                validationSplit: validationSplit,
                shuffle: true,
                callbacks: {
                    onEpochBegin: async (epoch) => {
                        // Pausar a cada época para liberar GPU
                        await tf.nextFrame();
                        
                        // Ajustar learning rate dinamicamente
                        if (epoch > 0 && epoch % 15 === 0) {
                            const currentLR = this.model.optimizer.learningRate;
                            const newLR = currentLR * 0.7;
                            this.model.optimizer.learningRate = newLR;
                            console.log(`   📉 Taxa de aprendizado reduzida: ${currentLR.toFixed(6)} → ${newLR.toFixed(6)}`);
                        }
                    },
                    onEpochEnd: async (epoch, logs) => {
                        // Pausar após cada época
                        await tf.nextFrame();
                        
                        const valAcc = logs.val_acc || logs.val_accuracy || 0;
                        const trainAcc = logs.acc || logs.accuracy || 0;
                        
                        console.log(`   📊 Época ${epoch + 1}/${epochs}`);
                        console.log(`      Treinamento - Erro: ${logs.loss.toFixed(4)}, Acurácia: ${(trainAcc * 100).toFixed(2)}%`);
                        console.log(`      Validação   - Erro: ${logs.val_loss.toFixed(4)}, Acurácia: ${(valAcc * 100).toFixed(2)}%`);
                        
                        // Early stopping: salvar melhor modelo (apenas se tiver melhoria real)
                        if (valAcc > bestValAcc && valAcc > 0.1) { // Ignorar validação zerada
                            bestValAcc = valAcc;
                            // Limpar pesos anteriores se existirem
                            if (bestWeights) {
                                bestWeights.forEach(w => w.dispose());
                            }
                            bestWeights = await this.model.getWeights();
                            patienceCounter = 0;
                            console.log(`      ✅ Melhor modelo até agora! Acurácia Validação: ${(valAcc * 100).toFixed(2)}%`);
                        } else {
                            // Não contar como "sem melhoria" se validação está zerada
                            if (valAcc > 0.1) {
                                patienceCounter++;
                                console.log(`      ⏳ Sem melhoria há ${patienceCounter} épocas`);
                            } else {
                                console.log(`      ⚠️ Validação zerada - modelo ainda aprendendo...`);
                            }
                            
                            // Early stopping desabilitado para poucas amostras
                            if (patienceCounter >= patience && totalSamples >= 100) {
                                console.log(`      🛑 Treinamento interrompido! Sem melhoria por ${patience} épocas consecutivas`);
                                this.model.stopTraining = true;
                            }
                        }
                        
                        // Liberar memória GPU a cada 3 épocas
                        if ((epoch + 1) % 3 === 0) {
                            const memInfo = tf.memory();
                            console.log(`      💾 Memória GPU: ${(memInfo.numBytes / 1024 / 1024).toFixed(2)} MB, ${memInfo.numTensors} tensores`);
                            
                            // Forçar limpeza se muitos tensores
                            if (memInfo.numTensors > 100) {
                                console.log(`      🧹 Limpando tensores...`);
                                await tf.nextFrame();
                            }
                        }
                        
                        if (onEpochEnd) {
                            onEpochEnd(epoch, logs);
                        }
                    }
                }
            });
            
            // Restaurar melhor modelo se early stopping foi ativado
            if (bestWeights) {
                console.log(`🏆 Restaurando melhor modelo (Acurácia Validação: ${(bestValAcc * 100).toFixed(2)}%)`);
                await this.model.setWeights(bestWeights);
                // NÃO limpar bestWeights - eles são referências aos pesos do modelo
                // bestWeights.forEach(w => w.dispose()); // REMOVIDO - causava erro ao salvar
            }
            
            // Limpar apenas os tensores de dados (não afeta o modelo)
            xs.dispose();
            ys.dispose();
            
            // Limpeza suave (não afeta pesos do modelo)
            await tf.nextFrame();
            
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
        
        // Se for ensemble, usar votação/média
        if (this.ensembleModels && this.ensembleModels.length > 1) {
            return await this.predictEnsemble(spectrogram);
        }
        
        const inputTensor = tf.tensor4d([spectrogram]);
        const predictions = this.model.predict(inputTensor);
        const probabilities = await predictions.data();
        
        inputTensor.dispose();
        predictions.dispose();
        
        return Array.from(probabilities);
    }
    
    async predictEnsemble(spectrogram) {
        console.log(`🔗 Usando ensemble com ${this.ensembleModels.length} modelos`);
        
        const inputTensor = tf.tensor4d([spectrogram]);
        const allPredictions = [];
        
        // Coletar predições de cada modelo
        for (const modelData of this.ensembleModels) {
            const predictions = modelData.model.predict(inputTensor);
            const probabilities = await predictions.data();
            allPredictions.push(Array.from(probabilities));
            predictions.dispose();
        }
        
        inputTensor.dispose();
        
        // Média das probabilidades (soft voting)
        const numClasses = this.classNames.length;
        const avgProbabilities = new Array(numClasses).fill(0);
        
        for (let i = 0; i < numClasses; i++) {
            let sum = 0;
            let count = 0;
            
            for (const modelPred of allPredictions) {
                if (i < modelPred.length) {
                    sum += modelPred[i];
                    count++;
                }
            }
            
            avgProbabilities[i] = count > 0 ? sum / count : 0;
        }
        
        console.log(`📊 Ensemble: média de ${allPredictions.length} modelos`);
        return avgProbabilities;
    }
    
    async saveModel(modelName = 'bioacustic-browser-model') {
        if (!this.model) {
            throw new Error('Nenhum modelo para salvar');
        }
        
        console.log('💾 Salvando modelo...');
        
        try {
            // Verificar se o modelo está válido (pesos não foram descartados)
            const weights = this.model.getWeights();
            if (weights.length === 0) {
                throw new Error('Modelo inválido: sem pesos para salvar');
            }
            
            // Salvar no IndexedDB do navegador
            await this.model.save(`indexeddb://${modelName}`);
            
            console.log(`✅ Modelo salvo com sucesso: ${modelName}`);
            
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
            console.log('💾 Metadata salva no localStorage');
            
        } catch (error) {
            console.error('❌ Erro ao salvar modelo:', error);
            throw error;
        }
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
