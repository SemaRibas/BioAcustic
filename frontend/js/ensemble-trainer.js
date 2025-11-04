/**
 * Ensemble Trainer - Sistema de Modelos Especializados
 * Arquitetura modular para TCC com precisão científica
 * 
 * Abordagem:
 * 1. Treina um modelo binário especializado para cada espécie (One-vs-All)
 * 2. Cada modelo é expert em detectar UMA espécie vs todas as outras
 * 3. No ensemble, todos os modelos votam e a predição final usa probabilidades combinadas
 * 4. Permite adicionar novas espécies sem retreinar tudo
 */

export class EnsembleTrainer {
    constructor() {
        this.speciesModels = new Map(); // espécie -> modelo binário
        this.trainingData = new Map(); // espécie -> [espectrogramas]
        this.ensembleMetadata = null;
        this.isTraining = false;
    }

    /**
     * Adiciona exemplo de treinamento
     */
    addTrainingExample(spectrogram, speciesName) {
        if (!this.trainingData.has(speciesName)) {
            this.trainingData.set(speciesName, []);
        }
        this.trainingData.get(speciesName).push(spectrogram);
        
        console.log(`✅ Exemplo adicionado: ${speciesName} (${this.trainingData.get(speciesName).length} amostras)`);
    }

    /**
     * Retorna estatísticas do dataset
     */
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

    /**
     * Verifica se pode treinar (mínimo 2 espécies, 10 amostras cada)
     */
    canTrain() {
        if (this.trainingData.size < 2) return false;
        
        for (const samples of this.trainingData.values()) {
            if (samples.length < 10) return false;
        }
        
        return true;
    }

    /**
     * Limpa memória GPU
     */
    cleanupMemory() {
        const numTensors = tf.memory().numTensors;
        console.log(`🧹 Limpando memória GPU... (${numTensors} tensores ativos)`);
        
        tf.engine().startScope();
        tf.engine().endScope();
        
        const afterCleanup = tf.memory().numTensors;
        console.log(`✅ Memória limpa (${afterCleanup} tensores restantes)`);
    }

    /**
     * Cria modelo binário especializado para uma espécie
     * Arquitetura otimizada para classificação binária
     */
    buildBinaryModel(inputShape, speciesName) {
        console.log(`🏗️ Construindo modelo binário para: ${speciesName}`);
        
        const model = tf.sequential({
            name: `model_${speciesName.replace(/\s+/g, '_')}`
        });
        
        // Arquitetura CNN otimizada para classificação binária
        // Camada 1: Extração de features de baixo nível
        model.add(tf.layers.conv2d({
            inputShape: inputShape,
            filters: 16,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        
        // Camada 2: Features de médio nível
        model.add(tf.layers.conv2d({
            filters: 32,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        model.add(tf.layers.dropout({ rate: 0.3 }));
        
        // Camada 3: Features de alto nível
        model.add(tf.layers.conv2d({
            filters: 48,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        model.add(tf.layers.dropout({ rate: 0.4 }));
        
        // Global Average Pooling (melhor que flatten para generalização)
        model.add(tf.layers.globalAveragePooling2d());
        
        // Camada densa
        model.add(tf.layers.dense({ 
            units: 64, 
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }));
        model.add(tf.layers.dropout({ rate: 0.5 }));
        
        // Saída binária (sigmoid para probabilidade)
        model.add(tf.layers.dense({ 
            units: 1, 
            activation: 'sigmoid'
        }));
        
        // Compilar com métricas para análise científica
        model.compile({
            optimizer: tf.train.adam(0.0005), // Learning rate menor para convergência suave
            loss: 'binaryCrossentropy',
            metrics: ['accuracy', 'precision', 'recall']
        });
        
        const params = model.countParams();
        console.log(`   Modelo ${speciesName}: ${params.toLocaleString()} parâmetros`);
        
        return model;
    }

    /**
     * Prepara dataset binário para uma espécie específica
     * One-vs-All: espécie alvo = 1, todas as outras = 0
     */
    prepareBinaryDataset(targetSpecies) {
        console.log(`📊 Preparando dataset binário para: ${targetSpecies}`);
        
        const X = [];
        const y = [];
        
        // Adicionar amostras positivas (espécie alvo)
        const positiveData = this.trainingData.get(targetSpecies) || [];
        for (const spec of positiveData) {
            X.push(spec);
            y.push(1); // Classe positiva
        }
        
        // Adicionar amostras negativas (outras espécies)
        const negativeCount = positiveData.length; // Balancear classes
        let addedNegatives = 0;
        
        for (const [species, spectrograms] of this.trainingData) {
            if (species === targetSpecies) continue;
            
            // Adicionar proporcionalmente de cada espécie negativa
            const countToAdd = Math.ceil(negativeCount / (this.trainingData.size - 1));
            const samples = spectrograms.slice(0, Math.min(countToAdd, spectrograms.length));
            
            for (const spec of samples) {
                X.push(spec);
                y.push(0); // Classe negativa
                addedNegatives++;
                
                if (addedNegatives >= negativeCount) break;
            }
            
            if (addedNegatives >= negativeCount) break;
        }
        
        console.log(`   Positivas: ${positiveData.length}, Negativas: ${addedNegatives}`);
        
        // Converter para tensores com tf.tidy
        return tf.tidy(() => {
            const xs = tf.tensor4d(X);
            const ys = tf.tensor2d(y, [y.length, 1]);
            
            // Shuffle dataset
            const indices = tf.util.createShuffledIndices(X.length);
            const xsShuffled = tf.gather(xs, indices);
            const ysShuffled = tf.gather(ys, indices);
            
            xs.dispose();
            ys.dispose();
            
            return { xs: xsShuffled, ys: ysShuffled };
        });
    }

    /**
     * Treina todos os modelos especializados (ensemble completo)
     */
    async trainEnsemble(epochs = 30, batchSize = 16, onProgress = null) {
        if (!this.canTrain()) {
            throw new Error('Dados insuficientes. Mínimo: 2 espécies com 10 amostras cada.');
        }

        this.isTraining = true;
        const speciesList = Array.from(this.trainingData.keys()).sort();
        const totalModels = speciesList.length;
        
        console.log('🎓 Iniciando treinamento de ensemble...');
        console.log(`   Total de modelos: ${totalModels}`);
        console.log(`   Espécies: ${speciesList.join(', ')}`);

        try {
            // Limpar memória antes de começar
            this.cleanupMemory();
            
            // Detectar input shape
            const firstSpecies = speciesList[0];
            const firstExample = this.trainingData.get(firstSpecies)[0];
            const inputShape = [firstExample.length, firstExample[0].length, firstExample[0][0].length];
            
            console.log(`   Input shape: [${inputShape.join(', ')}]`);

            // Treinar um modelo para cada espécie
            for (let i = 0; i < totalModels; i++) {
                const species = speciesList[i];
                const progress = ((i + 1) / totalModels) * 100;
                
                console.log(`\n📚 Treinando modelo ${i + 1}/${totalModels}: ${species}`);
                
                if (onProgress) {
                    onProgress({
                        phase: 'training',
                        currentModel: i + 1,
                        totalModels: totalModels,
                        species: species,
                        progress: progress
                    });
                }

                // Construir modelo
                const model = this.buildBinaryModel(inputShape, species);
                
                // Preparar dataset binário
                const { xs, ys } = this.prepareBinaryDataset(species);
                
                // Treinar modelo
                const history = await model.fit(xs, ys, {
                    epochs: epochs,
                    batchSize: batchSize,
                    validationSplit: 0.2,
                    shuffle: true,
                    callbacks: {
                        onEpochEnd: async (epoch, logs) => {
                            // Logging detalhado para análise científica
                            if ((epoch + 1) % 5 === 0 || epoch === epochs - 1) {
                                console.log(`      Época ${epoch + 1}/${epochs} - loss: ${logs.loss.toFixed(4)}, ` +
                                          `acc: ${logs.acc.toFixed(4)}, val_loss: ${logs.val_loss.toFixed(4)}, ` +
                                          `val_acc: ${logs.val_acc.toFixed(4)}`);
                            }
                            
                            // Liberar memória periodicamente
                            if ((epoch + 1) % 10 === 0) {
                                await tf.nextFrame();
                            }
                            
                            if (onProgress) {
                                onProgress({
                                    phase: 'epoch',
                                    currentModel: i + 1,
                                    totalModels: totalModels,
                                    species: species,
                                    epoch: epoch + 1,
                                    totalEpochs: epochs,
                                    logs: logs
                                });
                            }
                        }
                    }
                });

                // Salvar modelo
                this.speciesModels.set(species, {
                    model: model,
                    history: history,
                    trained: new Date().toISOString()
                });

                // Limpar dataset da memória
                xs.dispose();
                ys.dispose();
                
                // Limpar memória entre modelos
                if (i < totalModels - 1) {
                    this.cleanupMemory();
                    await tf.nextFrame();
                }

                console.log(`   ✅ Modelo ${species} treinado com sucesso`);
            }

            // Salvar metadata do ensemble
            this.ensembleMetadata = {
                species: speciesList,
                totalModels: totalModels,
                trainedAt: new Date().toISOString(),
                epochs: epochs,
                inputShape: inputShape
            };

            console.log('\n✅ Ensemble completo treinado!');
            console.log(`   ${totalModels} modelos especializados prontos`);
            
            this.isTraining = false;
            return this.ensembleMetadata;

        } catch (error) {
            this.isTraining = false;
            console.error('❌ Erro no treinamento do ensemble:', error);
            
            // Limpar memória em caso de erro
            try {
                this.cleanupMemory();
            } catch (cleanupError) {
                console.warn('⚠️ Erro ao limpar memória:', cleanupError);
            }
            
            throw error;
        }
    }

    /**
     * Predição com ensemble (votação ponderada por probabilidades)
     */
    async predictEnsemble(spectrogram) {
        if (this.speciesModels.size === 0) {
            throw new Error('Nenhum modelo treinado no ensemble');
        }

        console.log('🔮 Executando predição com ensemble...');

        const predictions = [];
        const speciesList = Array.from(this.speciesModels.keys());

        return await tf.tidy(() => {
            const inputTensor = tf.tensor4d([spectrogram]);

            for (const species of speciesList) {
                const modelData = this.speciesModels.get(species);
                const prediction = modelData.model.predict(inputTensor);
                const probability = prediction.dataSync()[0]; // Probabilidade sigmoid [0, 1]
                
                predictions.push({
                    species: species,
                    probability: probability,
                    confidence: Math.abs(probability - 0.5) * 2 // 0-1, quanto mais longe de 0.5, mais confiante
                });
                
                prediction.dispose();
            }

            inputTensor.dispose();

            // Ordenar por probabilidade
            predictions.sort((a, b) => b.probability - a.probability);

            // Normalizar probabilidades (softmax-like)
            const sumProb = predictions.reduce((sum, p) => sum + p.probability, 0);
            predictions.forEach(p => {
                p.normalizedProbability = p.probability / sumProb;
            });

            console.log('📊 Predições do ensemble:');
            predictions.forEach(p => {
                console.log(`   ${p.species}: ${(p.normalizedProbability * 100).toFixed(2)}% ` +
                          `(conf: ${(p.confidence * 100).toFixed(1)}%)`);
            });

            return {
                topPrediction: predictions[0],
                allPredictions: predictions,
                ensembleSize: speciesList.length
            };
        });
    }

    /**
     * Adiciona nova espécie ao ensemble (sem retreinar tudo!)
     */
    async addSpeciesToEnsemble(speciesName, spectrograms, epochs = 30, batchSize = 16) {
        console.log(`➕ Adicionando nova espécie ao ensemble: ${speciesName}`);

        // Adicionar dados
        this.trainingData.set(speciesName, spectrograms);

        // Detectar input shape
        const inputShape = this.ensembleMetadata?.inputShape || 
            [spectrograms[0].length, spectrograms[0][0].length, spectrograms[0][0][0].length];

        // Construir e treinar modelo para nova espécie
        const model = this.buildBinaryModel(inputShape, speciesName);
        const { xs, ys } = this.prepareBinaryDataset(speciesName);

        const history = await model.fit(xs, ys, {
            epochs: epochs,
            batchSize: batchSize,
            validationSplit: 0.2,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if ((epoch + 1) % 5 === 0) {
                        console.log(`   Época ${epoch + 1}/${epochs} - loss: ${logs.loss.toFixed(4)}, acc: ${logs.acc.toFixed(4)}`);
                    }
                }
            }
        });

        // Adicionar ao ensemble
        this.speciesModels.set(speciesName, {
            model: model,
            history: history,
            trained: new Date().toISOString()
        });

        // Atualizar metadata
        if (this.ensembleMetadata) {
            this.ensembleMetadata.species.push(speciesName);
            this.ensembleMetadata.totalModels++;
        }

        xs.dispose();
        ys.dispose();
        this.cleanupMemory();

        console.log(`✅ Espécie ${speciesName} adicionada ao ensemble`);
    }

    /**
     * Remove espécie do ensemble
     */
    removeSpeciesFromEnsemble(speciesName) {
        if (!this.speciesModels.has(speciesName)) {
            throw new Error(`Espécie ${speciesName} não encontrada no ensemble`);
        }

        // Limpar modelo da memória
        const modelData = this.speciesModels.get(speciesName);
        modelData.model.dispose();
        
        this.speciesModels.delete(speciesName);
        this.trainingData.delete(speciesName);

        // Atualizar metadata
        if (this.ensembleMetadata) {
            this.ensembleMetadata.species = this.ensembleMetadata.species.filter(s => s !== speciesName);
            this.ensembleMetadata.totalModels--;
        }

        console.log(`🗑️ Espécie ${speciesName} removida do ensemble`);
    }

    /**
     * Salvar ensemble completo no navegador
     */
    async saveEnsemble() {
        console.log('💾 Salvando ensemble...');

        const savedModels = [];

        for (const [species, modelData] of this.speciesModels) {
            const modelName = `ensemble-${species.replace(/\s+/g, '_')}`;
            await modelData.model.save(`indexeddb://${modelName}`);
            savedModels.push(species);
        }

        // Salvar metadata
        const metadata = {
            ...this.ensembleMetadata,
            savedModels: savedModels,
            version: '1.0.0'
        };

        localStorage.setItem('bioacustic-ensemble-metadata', JSON.stringify(metadata));

        console.log(`✅ Ensemble salvo: ${savedModels.length} modelos`);
        return metadata;
    }

    /**
     * Carregar ensemble do navegador
     */
    async loadEnsemble() {
        console.log('📂 Carregando ensemble...');

        const metadataStr = localStorage.getItem('bioacustic-ensemble-metadata');
        if (!metadataStr) {
            console.log('   Nenhum ensemble salvo encontrado');
            return null;
        }

        const metadata = JSON.parse(metadataStr);
        this.ensembleMetadata = metadata;

        // Carregar cada modelo
        for (const species of metadata.savedModels) {
            const modelName = `ensemble-${species.replace(/\s+/g, '_')}`;
            
            try {
                const model = await tf.loadLayersModel(`indexeddb://${modelName}`);
                this.speciesModels.set(species, {
                    model: model,
                    trained: metadata.trainedAt
                });
                console.log(`   ✅ Modelo ${species} carregado`);
            } catch (error) {
                console.warn(`   ⚠️ Erro ao carregar modelo ${species}:`, error);
            }
        }

        console.log(`✅ Ensemble carregado: ${this.speciesModels.size} modelos`);
        return metadata;
    }

    /**
     * Deletar ensemble
     */
    async deleteEnsemble() {
        console.log('🗑️ Deletando ensemble...');

        // Deletar modelos do IndexedDB
        for (const species of this.speciesModels.keys()) {
            const modelName = `ensemble-${species.replace(/\s+/g, '_')}`;
            
            try {
                await tf.io.removeModel(`indexeddb://${modelName}`);
                console.log(`   ✅ Modelo ${species} deletado`);
            } catch (error) {
                console.warn(`   ⚠️ Erro ao deletar modelo ${species}:`, error);
            }
        }

        // Limpar memória
        for (const modelData of this.speciesModels.values()) {
            modelData.model.dispose();
        }

        this.speciesModels.clear();
        this.ensembleMetadata = null;
        localStorage.removeItem('bioacustic-ensemble-metadata');

        console.log('✅ Ensemble deletado');
    }

    /**
     * Exportar dados de treinamento
     */
    exportTrainingData() {
        const data = {};
        
        for (const [species, spectrograms] of this.trainingData) {
            data[species] = spectrograms;
        }

        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bioacustic-ensemble-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('📦 Dados exportados');
    }

    /**
     * Importar dados de treinamento
     */
    async importTrainingData(file) {
        const text = await file.text();
        const data = JSON.parse(text);

        for (const [species, spectrograms] of Object.entries(data)) {
            this.trainingData.set(species, spectrograms);
        }

        console.log(`📥 Dados importados: ${Object.keys(data).length} espécies`);
    }

    /**
     * Gerar relatório científico do ensemble
     */
    generateReport() {
        const report = {
            metadata: this.ensembleMetadata,
            models: [],
            trainingData: this.getTrainingStats(),
            totalParameters: 0
        };

        for (const [species, modelData] of this.speciesModels) {
            const modelInfo = {
                species: species,
                parameters: modelData.model.countParams(),
                layers: modelData.model.layers.length,
                trained: modelData.trained
            };

            if (modelData.history) {
                const finalLoss = modelData.history.history.loss[modelData.history.history.loss.length - 1];
                const finalAcc = modelData.history.history.acc[modelData.history.history.acc.length - 1];
                
                modelInfo.finalMetrics = {
                    loss: finalLoss,
                    accuracy: finalAcc
                };
            }

            report.models.push(modelInfo);
            report.totalParameters += modelInfo.parameters;
        }

        return report;
    }
}
