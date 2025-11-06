/**
 * Módulo para buscar informações científicas sobre espécies
 * Integra múltiplas APIs públicas de biodiversidade
 */

export class SpeciesInfoFetcher {
    constructor() {
        this.currentSpecies = null;
        this.cache = new Map(); // Cache para evitar requisições duplicadas
    }

    /**
     * Busca informações completas sobre uma espécie
     * @param {string} scientificName - Nome científico da espécie
     * @returns {Promise<Object>} Informações agregadas da espécie
     */
    async fetchSpeciesInfo(scientificName) {
        console.log(`🔍 Buscando informações para: ${scientificName}`);
        
        // Verificar cache
        if (this.cache.has(scientificName)) {
            console.log('✅ Retornando do cache');
            return this.cache.get(scientificName);
        }

        this.currentSpecies = scientificName;
        
        try {
            // Buscar em paralelo de múltiplas fontes
            const [gbifData, wikipediaData, wikidataData] = await Promise.allSettled([
                this.fetchFromGBIF(scientificName),
                this.fetchFromWikipedia(scientificName),
                this.fetchFromWikidata(scientificName)
            ]);

            // Agregar dados de todas as fontes
            const aggregatedData = this.aggregateData(
                scientificName,
                gbifData.status === 'fulfilled' ? gbifData.value : null,
                wikipediaData.status === 'fulfilled' ? wikipediaData.value : null,
                wikidataData.status === 'fulfilled' ? wikidataData.value : null
            );

            // Salvar no cache
            this.cache.set(scientificName, aggregatedData);
            
            return aggregatedData;
            
        } catch (error) {
            console.error('❌ Erro ao buscar informações:', error);
            throw new Error('Não foi possível buscar informações da espécie');
        }
    }

    /**
     * Busca dados no GBIF (Global Biodiversity Information Facility)
     */
    async fetchFromGBIF(scientificName) {
        try {
            // 1. Buscar por nome científico
            const searchUrl = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}`;
            const searchResponse = await fetch(searchUrl);
            
            if (!searchResponse.ok) {
                throw new Error('GBIF search failed');
            }
            
            const searchData = await searchResponse.json();
            
            if (!searchData.usageKey) {
                return null;
            }

            // 2. Buscar detalhes completos
            const detailsUrl = `https://api.gbif.org/v1/species/${searchData.usageKey}`;
            const detailsResponse = await fetch(detailsUrl);
            
            if (!detailsResponse.ok) {
                throw new Error('GBIF details failed');
            }
            
            const details = await detailsResponse.json();
            
            // 3. Buscar informações vernaculares (nomes comuns)
            const vernacularUrl = `https://api.gbif.org/v1/species/${searchData.usageKey}/vernacularNames`;
            const vernacularResponse = await fetch(vernacularUrl);
            const vernacularData = vernacularResponse.ok ? await vernacularResponse.json() : { results: [] };

            return {
                source: 'GBIF',
                taxonKey: searchData.usageKey,
                scientificName: details.scientificName || scientificName,
                canonicalName: details.canonicalName,
                kingdom: details.kingdom,
                phylum: details.phylum,
                class: details.class,
                order: details.order,
                family: details.family,
                genus: details.genus,
                species: details.species,
                taxonomicStatus: details.taxonomicStatus,
                rank: details.rank,
                vernacularNames: vernacularData.results
                    ?.filter(v => v.language === 'por' || v.language === 'eng')
                    .map(v => ({ name: v.vernacularName, language: v.language }))
                    .slice(0, 5) || [],
                habitats: details.habitats || [],
                threatStatus: details.threatStatuses?.[0] || null
            };
            
        } catch (error) {
            console.warn('⚠️ GBIF fetch error:', error);
            return null;
        }
    }

    /**
     * Busca dados na Wikipedia em português
     */
    async fetchFromWikipedia(scientificName) {
        try {
            // 1. Buscar artigo
            const searchUrl = `https://pt.wikipedia.org/w/api.php?` + new URLSearchParams({
                action: 'query',
                format: 'json',
                titles: scientificName,
                prop: 'extracts|pageimages|info',
                exintro: true,
                explaintext: true,
                piprop: 'thumbnail',
                pithumbsize: 400,
                inprop: 'url',
                redirects: 1,
                origin: '*'
            });

            const response = await fetch(searchUrl);
            
            if (!response.ok) {
                throw new Error('Wikipedia fetch failed');
            }
            
            const data = await response.json();
            const pages = data.query?.pages;
            
            if (!pages) {
                return null;
            }

            const page = Object.values(pages)[0];
            
            if (page.missing) {
                // Tentar buscar em inglês
                return this.fetchFromWikipediaEN(scientificName);
            }

            return {
                source: 'Wikipedia (PT)',
                title: page.title,
                extract: page.extract,
                thumbnail: page.thumbnail?.source,
                url: page.fullurl
            };
            
        } catch (error) {
            console.warn('⚠️ Wikipedia PT fetch error:', error);
            return null;
        }
    }

    /**
     * Fallback para Wikipedia em inglês
     */
    async fetchFromWikipediaEN(scientificName) {
        try {
            const searchUrl = `https://en.wikipedia.org/w/api.php?` + new URLSearchParams({
                action: 'query',
                format: 'json',
                titles: scientificName,
                prop: 'extracts|pageimages|info',
                exintro: true,
                explaintext: true,
                piprop: 'thumbnail',
                pithumbsize: 400,
                inprop: 'url',
                redirects: 1,
                origin: '*'
            });

            const response = await fetch(searchUrl);
            const data = await response.json();
            const pages = data.query?.pages;
            const page = Object.values(pages)[0];
            
            if (page.missing) {
                return null;
            }

            return {
                source: 'Wikipedia (EN)',
                title: page.title,
                extract: page.extract,
                thumbnail: page.thumbnail?.source,
                url: page.fullurl
            };
            
        } catch (error) {
            console.warn('⚠️ Wikipedia EN fetch error:', error);
            return null;
        }
    }

    /**
     * Busca dados no Wikidata
     */
    async fetchFromWikidata(scientificName) {
        try {
            // Buscar ID do item no Wikidata
            const searchUrl = `https://www.wikidata.org/w/api.php?` + new URLSearchParams({
                action: 'wbsearchentities',
                format: 'json',
                language: 'pt',
                type: 'item',
                search: scientificName,
                origin: '*'
            });

            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();
            
            if (!searchData.search || searchData.search.length === 0) {
                return null;
            }

            const itemId = searchData.search[0].id;
            
            // Buscar dados completos do item
            const dataUrl = `https://www.wikidata.org/w/api.php?` + new URLSearchParams({
                action: 'wbgetentities',
                format: 'json',
                ids: itemId,
                props: 'claims|labels|descriptions',
                languages: 'pt|en',
                origin: '*'
            });

            const dataResponse = await fetch(dataUrl);
            const data = await dataResponse.json();
            const entity = data.entities[itemId];
            
            return {
                source: 'Wikidata',
                itemId: itemId,
                label: entity.labels?.pt?.value || entity.labels?.en?.value,
                description: entity.descriptions?.pt?.value || entity.descriptions?.en?.value,
                iucnStatus: this.extractWikidataClaim(entity.claims, 'P141'), // Conservation status
                taxonRank: this.extractWikidataClaim(entity.claims, 'P105')
            };
            
        } catch (error) {
            console.warn('⚠️ Wikidata fetch error:', error);
            return null;
        }
    }

    /**
     * Extrai valor de uma claim do Wikidata
     */
    extractWikidataClaim(claims, propertyId) {
        try {
            const claim = claims[propertyId];
            if (!claim || claim.length === 0) return null;
            return claim[0].mainsnak?.datavalue?.value;
        } catch {
            return null;
        }
    }

    /**
     * Agrega dados de todas as fontes em um único objeto
     */
    aggregateData(scientificName, gbif, wikipedia, wikidata) {
        const info = {
            scientificName: scientificName,
            commonNames: [],
            taxonomy: {},
            description: '',
            conservation: null,
            image: null,
            sources: []
        };

        // GBIF: Taxonomia e nomes comuns
        if (gbif) {
            info.taxonomy = {
                kingdom: gbif.kingdom,
                phylum: gbif.phylum,
                class: gbif.class,
                order: gbif.order,
                family: gbif.family,
                genus: gbif.genus,
                rank: gbif.rank
            };
            
            if (gbif.vernacularNames && gbif.vernacularNames.length > 0) {
                info.commonNames = gbif.vernacularNames.map(v => v.name);
            }
            
            if (gbif.threatStatus) {
                info.conservation = gbif.threatStatus;
            }
            
            info.sources.push({
                name: 'GBIF',
                url: `https://www.gbif.org/species/${gbif.taxonKey}`
            });
        }

        // Wikipedia: Descrição e imagem
        if (wikipedia) {
            info.description = wikipedia.extract || '';
            info.image = wikipedia.thumbnail;
            
            info.sources.push({
                name: wikipedia.source,
                url: wikipedia.url
            });
        }

        // Wikidata: Informações adicionais
        if (wikidata) {
            if (wikidata.description && !info.description) {
                info.description = wikidata.description;
            }
            
            if (wikidata.iucnStatus && !info.conservation) {
                info.conservation = wikidata.iucnStatus;
            }
            
            info.sources.push({
                name: 'Wikidata',
                url: `https://www.wikidata.org/wiki/${wikidata.itemId}`
            });
        }

        return info;
    }

    /**
     * Limpa o cache
     */
    clearCache() {
        this.cache.clear();
    }
}
