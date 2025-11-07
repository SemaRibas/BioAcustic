// Firebase Configuration
// Biblioteca compartilhada de espécies - sincroniza apenas informações das espécies (sem áudios)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, orderBy, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBIueZNb1hPR2pwcrfPxFbwGIJoB9OIbNM",
    authDomain: "studio-2303145907-57188.firebaseapp.com",
    projectId: "studio-2303145907-57188",
    storageBucket: "studio-2303145907-57188.firebasestorage.app",
    messagingSenderId: "538093909283",
    appId: "1:538093909283:web:d6b2e884ef4fd1a3548896"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Firebase Manager - Gerencia sincronização de espécies com Firestore
 * 
 * IMPORTANTE: 
 * - Sincroniza APENAS informações das espécies (biblioteca compartilhada)
 * - NÃO sincroniza áudios (permanecem locais no IndexedDB)
 * - Todos os usuários compartilham a mesma biblioteca de espécies
 */
class FirebaseManager {
    constructor() {
        this.speciesCollection = 'species';
        this.initialized = true;
    }

    /**
     * Sincronizar espécie local para o Firebase
     * Remove campos sensíveis (audioCount permanece como indicador)
     */
    async syncSpeciesToCloud(species) {
        try {
            // Preparar dados para sincronização (sem áudios)
            const cloudSpecies = {
                scientificName: species.scientificName,
                commonName: species.commonName || null,
                taxonomy: species.taxonomy || {},
                description: species.description || null,
                conservation: species.conservation || null,
                imageUrl: species.imageUrl || null,
                // Mantemos audioCount como indicador, mas não os áudios
                audioCount: species.audioCount || 0,
                lastModified: serverTimestamp(),
                createdAt: species.createdAt || new Date().toISOString()
            };

            // Usar scientificName como ID do documento
            const docId = this.sanitizeDocId(species.scientificName);
            const docRef = doc(db, this.speciesCollection, docId);
            
            await setDoc(docRef, cloudSpecies, { merge: true });
            
            console.log('✅ Espécie sincronizada com Firebase:', species.scientificName);
            return { success: true, docId };
        } catch (error) {
            console.error('❌ Erro ao sincronizar espécie:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Buscar espécie do Firebase
     */
    async getSpeciesFromCloud(scientificName) {
        try {
            const docId = this.sanitizeDocId(scientificName);
            const docRef = doc(db, this.speciesCollection, docId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return {
                    success: true,
                    data: { id: docSnap.id, ...docSnap.data() }
                };
            } else {
                return { success: false, error: 'Espécie não encontrada' };
            }
        } catch (error) {
            console.error('❌ Erro ao buscar espécie:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Buscar todas as espécies do Firebase
     */
    async getAllSpeciesFromCloud() {
        try {
            const q = query(collection(db, this.speciesCollection), orderBy('scientificName'));
            const querySnapshot = await getDocs(q);
            
            const species = [];
            querySnapshot.forEach((doc) => {
                species.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`📚 ${species.length} espécies carregadas do Firebase`);
            return { success: true, data: species };
        } catch (error) {
            console.error('❌ Erro ao buscar espécies:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Deletar espécie do Firebase
     */
    async deleteSpeciesFromCloud(scientificName) {
        try {
            const docId = this.sanitizeDocId(scientificName);
            const docRef = doc(db, this.speciesCollection, docId);
            
            await deleteDoc(docRef);
            
            console.log('✅ Espécie deletada do Firebase:', scientificName);
            return { success: true };
        } catch (error) {
            console.error('❌ Erro ao deletar espécie:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Importar espécie do Firebase para IndexedDB local
     * Mescla dados da nuvem com dados locais (preserva áudios locais)
     */
    async importSpeciesFromCloud(scientificName, storage) {
        try {
            const cloudResult = await this.getSpeciesFromCloud(scientificName);
            
            if (!cloudResult.success) {
                return cloudResult;
            }

            const cloudSpecies = cloudResult.data;
            
            // Verificar se já existe localmente
            const localSpecies = await storage.getAllSpecies();
            const existing = localSpecies.find(s => 
                s.scientificName.toLowerCase() === scientificName.toLowerCase()
            );

            let finalSpecies;
            
            if (existing) {
                // Mesclar: preserva ID local e áudios, atualiza informações
                finalSpecies = {
                    ...existing,
                    commonName: cloudSpecies.commonName || existing.commonName,
                    taxonomy: { ...existing.taxonomy, ...cloudSpecies.taxonomy },
                    description: cloudSpecies.description || existing.description,
                    conservation: cloudSpecies.conservation || existing.conservation,
                    imageUrl: cloudSpecies.imageUrl || existing.imageUrl,
                    // Mantém audioCount local (mais preciso)
                    updatedAt: new Date().toISOString()
                };
                
                await storage.updateSpecies(existing.id, finalSpecies);
                console.log('🔄 Espécie atualizada localmente:', scientificName);
            } else {
                // Nova espécie: adiciona sem áudios
                finalSpecies = {
                    scientificName: cloudSpecies.scientificName,
                    commonName: cloudSpecies.commonName,
                    taxonomy: cloudSpecies.taxonomy,
                    description: cloudSpecies.description,
                    conservation: cloudSpecies.conservation,
                    imageUrl: cloudSpecies.imageUrl,
                    audioCount: 0, // Resetar pois não há áudios locais
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                await storage.addSpecies(finalSpecies);
                console.log('➕ Nova espécie importada:', scientificName);
            }

            return { success: true, data: finalSpecies };
        } catch (error) {
            console.error('❌ Erro ao importar espécie:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sincronizar todas as espécies locais para a nuvem
     */
    async syncAllSpeciesToCloud(storage) {
        try {
            const localSpecies = await storage.getAllSpecies();
            const results = {
                success: 0,
                failed: 0,
                total: localSpecies.length
            };

            for (const species of localSpecies) {
                const result = await this.syncSpeciesToCloud(species);
                if (result.success) {
                    results.success++;
                } else {
                    results.failed++;
                }
            }

            console.log(`📤 Sincronização completa: ${results.success}/${results.total} espécies`);
            return { success: true, results };
        } catch (error) {
            console.error('❌ Erro na sincronização em lote:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Importar todas as espécies da nuvem para local
     */
    async importAllSpeciesFromCloud(storage) {
        try {
            const cloudResult = await this.getAllSpeciesFromCloud();
            
            if (!cloudResult.success) {
                return cloudResult;
            }

            const cloudSpecies = cloudResult.data;
            const results = {
                imported: 0,
                updated: 0,
                failed: 0,
                total: cloudSpecies.length
            };

            for (const species of cloudSpecies) {
                const result = await this.importSpeciesFromCloud(species.scientificName, storage);
                if (result.success) {
                    // Determinar se foi importação ou atualização baseado em mensagem de log anterior
                    results.imported++;
                } else {
                    results.failed++;
                }
            }

            console.log(`📥 Importação completa: ${results.imported} espécies`);
            return { success: true, results };
        } catch (error) {
            console.error('❌ Erro na importação em lote:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sanitizar nome científico para usar como ID de documento
     * Remove caracteres especiais e espaços
     */
    sanitizeDocId(scientificName) {
        return scientificName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }

    /**
     * Verificar se Firebase está conectado
     */
    isConnected() {
        return this.initialized;
    }

    /**
     * Obter estatísticas da biblioteca
     */
    async getLibraryStats() {
        try {
            const result = await this.getAllSpeciesFromCloud();
            
            if (!result.success) {
                return { success: false, error: result.error };
            }

            const species = result.data;
            const stats = {
                totalSpecies: species.length,
                withImages: species.filter(s => s.imageUrl).length,
                withDescription: species.filter(s => s.description).length,
                withConservation: species.filter(s => s.conservation).length,
                families: [...new Set(species.map(s => s.taxonomy?.family).filter(Boolean))].length,
                orders: [...new Set(species.map(s => s.taxonomy?.order).filter(Boolean))].length
            };

            return { success: true, stats };
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return { success: false, error: error.message };
        }
    }
}

// Exportar instância singleton
export const firebaseManager = new FirebaseManager();
