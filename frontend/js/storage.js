/**
 * Storage Manager - Sistema de armazenamento compartilhado
 * Gerencia dados entre páginas usando localStorage e IndexedDB
 */

class StorageManager {
    constructor() {
        this.dbName = 'BioAcusticDB';
        this.dbVersion = 1;
        this.db = null;
        this.initDB();
    }

    /**
     * Inicializa IndexedDB para dados grandes (áudios, modelos)
     */
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Object Store para espécies
                if (!db.objectStoreNames.contains('species')) {
                    const speciesStore = db.createObjectStore('species', { keyPath: 'id', autoIncrement: true });
                    speciesStore.createIndex('scientificName', 'scientificName', { unique: true });
                    speciesStore.createIndex('commonName', 'commonName', { unique: false });
                }

                // Object Store para áudios
                if (!db.objectStoreNames.contains('audios')) {
                    const audioStore = db.createObjectStore('audios', { keyPath: 'id', autoIncrement: true });
                    audioStore.createIndex('speciesId', 'speciesId', { unique: false });
                    audioStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Object Store para modelos treinados
                if (!db.objectStoreNames.contains('models')) {
                    const modelStore = db.createObjectStore('models', { keyPath: 'id', autoIncrement: true });
                    modelStore.createIndex('name', 'name', { unique: true });
                    modelStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Object Store para resultados de análise
                if (!db.objectStoreNames.contains('analyses')) {
                    const analysisStore = db.createObjectStore('analyses', { keyPath: 'id', autoIncrement: true });
                    analysisStore.createIndex('audioId', 'audioId', { unique: false });
                    analysisStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    // ============ MÉTODOS LOCALSTORAGE (dados pequenos) ============

    /**
     * Salvar configurações do usuário
     */
    saveSettings(settings) {
        localStorage.setItem('bioAcustic_settings', JSON.stringify(settings));
    }

    /**
     * Carregar configurações do usuário
     */
    getSettings() {
        const settings = localStorage.getItem('bioAcustic_settings');
        return settings ? JSON.parse(settings) : this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            theme: 'light',
            language: 'pt-BR',
            autoSave: true,
            notifications: true,
            modelConfig: {
                threshold: 0.7,
                batchSize: 32,
                epochs: 50
            }
        };
    }

    /**
     * Salvar estado da última análise
     */
    saveLastAnalysis(analysis) {
        localStorage.setItem('bioAcustic_lastAnalysis', JSON.stringify(analysis));
    }

    getLastAnalysis() {
        const analysis = localStorage.getItem('bioAcustic_lastAnalysis');
        return analysis ? JSON.parse(analysis) : null;
    }

    // ============ MÉTODOS INDEXEDDB (dados grandes) ============

    /**
     * Adicionar espécie
     */
    async addSpecies(species) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['species'], 'readwrite');
            const store = transaction.objectStore('species');
            const request = store.add({
                ...species,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Obter todas as espécies
     */
    async getAllSpecies() {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['species'], 'readonly');
            const store = transaction.objectStore('species');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Buscar espécie por nome científico
     */
    async getSpeciesByScientificName(name) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['species'], 'readonly');
            const store = transaction.objectStore('species');
            const index = store.index('scientificName');
            const request = index.get(name);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Atualizar espécie
     */
    async updateSpecies(id, updates) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['species'], 'readwrite');
            const store = transaction.objectStore('species');
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const species = getRequest.result;
                if (!species) {
                    reject(new Error('Espécie não encontrada'));
                    return;
                }

                const updatedSpecies = {
                    ...species,
                    ...updates,
                    updatedAt: new Date().toISOString()
                };

                const updateRequest = store.put(updatedSpecies);
                updateRequest.onsuccess = () => resolve(updatedSpecies);
                updateRequest.onerror = () => reject(updateRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    /**
     * Deletar espécie
     */
    async deleteSpecies(id) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['species'], 'readwrite');
            const store = transaction.objectStore('species');
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Adicionar áudio
     */
    async addAudio(audio) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['audios'], 'readwrite');
            const store = transaction.objectStore('audios');
            const request = store.add({
                ...audio,
                timestamp: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Obter áudios por espécie
     */
    async getAudiosBySpecies(speciesId) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['audios'], 'readonly');
            const store = transaction.objectStore('audios');
            const index = store.index('speciesId');
            const request = index.getAll(speciesId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Salvar modelo treinado
     */
    async saveModel(model) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['models'], 'readwrite');
            const store = transaction.objectStore('models');
            const request = store.add({
                ...model,
                timestamp: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Obter todos os modelos
     */
    async getAllModels() {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['models'], 'readonly');
            const store = transaction.objectStore('models');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Salvar resultado de análise
     */
    async saveAnalysis(analysis) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['analyses'], 'readwrite');
            const store = transaction.objectStore('analyses');
            const request = store.add({
                ...analysis,
                timestamp: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Obter histórico de análises
     */
    async getAnalysisHistory(limit = 50) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['analyses'], 'readonly');
            const store = transaction.objectStore('analyses');
            const index = store.index('timestamp');
            const request = index.openCursor(null, 'prev');
            
            const results = [];
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && results.length < limit) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Exportar todos os dados
     */
    async exportAllData() {
        await this.ensureDB();
        const data = {
            settings: this.getSettings(),
            species: await this.getAllSpecies(),
            models: await this.getAllModels(),
            analyses: await this.getAnalysisHistory(1000),
            exportDate: new Date().toISOString(),
            version: this.dbVersion
        };
        return data;
    }

    /**
     * Importar dados
     */
    async importData(data) {
        await this.ensureDB();
        
        // Importar configurações
        if (data.settings) {
            this.saveSettings(data.settings);
        }

        // Importar espécies
        if (data.species && Array.isArray(data.species)) {
            for (const species of data.species) {
                try {
                    await this.addSpecies(species);
                } catch (error) {
                    console.warn('Erro ao importar espécie:', species.scientificName, error);
                }
            }
        }

        // Importar modelos
        if (data.models && Array.isArray(data.models)) {
            for (const model of data.models) {
                try {
                    await this.saveModel(model);
                } catch (error) {
                    console.warn('Erro ao importar modelo:', model.name, error);
                }
            }
        }

        return true;
    }

    /**
     * Limpar todos os dados
     */
    async clearAllData() {
        await this.ensureDB();
        const stores = ['species', 'audios', 'models', 'analyses'];
        
        for (const storeName of stores) {
            await new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }

        localStorage.clear();
        return true;
    }

    /**
     * Garantir que o DB está inicializado
     */
    async ensureDB() {
        if (!this.db) {
            await this.initDB();
        }
    }
}

// Exportar instância singleton
export const storage = new StorageManager();
