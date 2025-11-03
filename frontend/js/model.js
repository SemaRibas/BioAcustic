/**
 * Gerenciador de Modelo TensorFlow.js
 * Responsável por carregar e executar inferências
 */

export class ModelManager {
    constructor() {
        this.model = null;
        this.metadata = null;
        this.classNames = [];
        this.isLoaded = false;
    }
    
    async loadModel(modelPath) {
        console.log('📥 Carregando modelo TensorFlow.js...');
        
        // Tentar carregar modelo treinado no navegador primeiro
        const browserModelLoaded = await this.tryLoadBrowserModel();
        if (browserModelLoaded) {
            return;
        }
        
        // Se não houver modelo no navegador, tentar carregar do servidor
        try {
            // Carregar metadados primeiro
            const metadataPath = modelPath.replace('model.json', 'metadata.json');
            const metadataResponse = await fetch(metadataPath);
            
            if (!metadataResponse.ok) {
                throw new Error('Metadados não encontrados. Modelo ainda não foi treinado.');
            }
            
            this.metadata = await metadataResponse.json();
            this.classNames = this.metadata.classes;
            
            console.log('📊 Metadados carregados:', this.metadata.modelInfo);
            
            // Verificar se é modo demo
            if (this.metadata.status === 'demo') {
                console.warn('⚠️  MODO DEMO: Modelo ainda não foi treinado');
                console.warn('   Siga as instruções em QUICKSTART.md para treinar o modelo');
                console.warn('   OU acesse train.html para treinar no navegador');
                throw new Error('DEMO_MODE');
            }
            
            // Carregar modelo
            this.model = await tf.loadLayersModel(modelPath);
            
            // Warmup (primeira inferência é sempre mais lenta)
            await this.warmup();
            
            this.isLoaded = true;
            console.log('✅ Modelo carregado com sucesso');
            console.log(`   Classes: ${this.classNames.length}`);
            console.log(`   Input shape:`, this.model.inputs[0].shape);
            
        } catch (error) {
            console.error('❌ Erro ao carregar modelo:', error);
            
            if (error.message === 'DEMO_MODE') {
                throw new Error('Modelo ainda não foi treinado.\n\nOpções:\n1. Treine no navegador: acesse train.html\n2. Execute o pipeline Python (veja QUICKSTART.md)');
            }
            
            throw new Error(`Falha ao carregar modelo: ${error.message}`);
        }
    }
    
    async tryLoadBrowserModel(modelName = 'bioacustic-browser-model') {
        try {
            console.log('🔍 Verificando modelo treinado no navegador...');
            
            // Tentar carregar modelo do IndexedDB
            this.model = await tf.loadLayersModel(`indexeddb://${modelName}`);
            
            // Carregar metadados do localStorage
            const metadataStr = localStorage.getItem(`${modelName}-metadata`);
            if (metadataStr) {
                const metadata = JSON.parse(metadataStr);
                this.classNames = metadata.classNames;
                
                // Criar metadata no formato esperado
                this.metadata = {
                    modelInfo: {
                        name: 'BioAcustic Browser Model',
                        version: '1.0.0',
                        architecture: 'CNN Simple'
                    },
                    numClasses: metadata.numClasses,
                    classes: metadata.classNames,
                    trainedAt: metadata.trainedAt
                };
                
                // Warmup
                await this.warmup();
                
                this.isLoaded = true;
                console.log('✅ Modelo do navegador carregado com sucesso!');
                console.log(`   Classes: ${this.classNames.join(', ')}`);
                console.log(`   Treinado em: ${new Date(metadata.trainedAt).toLocaleString('pt-BR')}`);
                
                return true;
            }
            
        } catch (error) {
            console.log('ℹ️  Nenhum modelo treinado no navegador encontrado');
        }
        
        return false;
    }
    
    async warmup() {
        console.log('🔥 Warmup do modelo...');
        
        const inputShape = this.model.inputs[0].shape;
        const dummyInput = tf.zeros([1, inputShape[1], inputShape[2], inputShape[3]]);
        
        const startTime = performance.now();
        await this.model.predict(dummyInput);
        const endTime = performance.now();
        
        dummyInput.dispose();
        
        console.log(`   Tempo de warmup: ${(endTime - startTime).toFixed(2)} ms`);
    }
    
    async predict(inputTensor) {
        if (!this.isLoaded) {
            throw new Error('Modelo não carregado');
        }
        
        console.log('🧠 Executando predição...');
        console.log('   Input shape:', inputTensor.shape);
        
        const startTime = performance.now();
        
        // Fazer predição
        const predictions = this.model.predict(inputTensor);
        
        // Aguardar resultado
        const probabilities = await predictions.data();
        
        const endTime = performance.now();
        const inferenceTime = endTime - startTime;
        
        console.log(`✅ Predição concluída em ${inferenceTime.toFixed(2)} ms`);
        
        // Limpar
        predictions.dispose();
        
        return Array.from(probabilities);
    }
    
    getTopPredictions(probabilities, topK = 5) {
        // Criar array de objetos {class, probability, index}
        const results = probabilities.map((prob, idx) => ({
            species: this.classNames[idx] || `Classe ${idx}`,
            probability: prob,
            confidence: (prob * 100).toFixed(2),
            index: idx
        }));
        
        // Ordenar por probabilidade (maior primeiro)
        results.sort((a, b) => b.probability - a.probability);
        
        // Retornar top K
        return results.slice(0, topK);
    }
    
    getClassInfo(className) {
        // Informações adicionais sobre espécies (pode ser expandido)
        const speciesInfo = {
            'Boana faber': {
                scientificName: 'Boana faber',
                commonName: 'Rã-ferreira',
                family: 'Hylidae',
                habitat: 'Florestas úmidas, próximo a corpos d\'água',
                distribution: 'Mata Atlântica, sudeste do Brasil',
                description: 'Anfíbio de médio a grande porte, conhecido por sua vocalização característica.'
            },
            'Scinax fuscomarginatus': {
                scientificName: 'Scinax fuscomarginatus',
                commonName: 'Perereca-de-borda-escura',
                family: 'Hylidae',
                habitat: 'Áreas abertas, campos, cerrado',
                distribution: 'Brasil central e sudeste',
                description: 'Pequena perereca comum em áreas abertas e antropizadas.'
            }
            // Adicionar mais espécies conforme necessário
        };
        
        return speciesInfo[className] || {
            scientificName: className,
            commonName: 'Informação não disponível',
            family: 'N/A',
            habitat: 'N/A',
            distribution: 'N/A',
            description: 'Informações detalhadas não disponíveis.'
        };
    }
    
    getModelInfo() {
        if (!this.metadata) return null;
        
        return {
            name: this.metadata.modelInfo.name,
            version: this.metadata.modelInfo.version,
            architecture: this.metadata.modelInfo.architecture,
            numClasses: this.metadata.numClasses,
            classes: this.classNames
        };
    }
}
