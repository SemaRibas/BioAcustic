/**
 * Gerenciador de Interface do Usuário
 * Responsável por atualizar elementos visuais
 *
 * ATUALIZAÇÃO:
 * - Substituído `showAlert` por `showNotification`
 * - Sistema de notificação agora cria "toasts" dinâmicos
 * que aparecem e desaparecem com animação.
 * - Integração com IndexedDB para buscar espécies cadastradas
 */

import { storage } from './storage.js';

export class UIManager {
    
    constructor() {
        this.resultsVisible = false;
        this.notificationContainer = null;
        this.speciesCache = new Map(); // Cache de espécies
        this.initNotificationContainer();
        this.loadSpeciesCache();
    }

    /**
     * Carrega todas as espécies cadastradas no cache
     */
    async loadSpeciesCache() {
        try {
            const allSpecies = await storage.getAllSpecies();
            allSpecies.forEach(species => {
                this.speciesCache.set(species.scientificName.toLowerCase(), species);
            });
            console.log(`✅ ${allSpecies.length} espécies carregadas no cache`);
        } catch (error) {
            console.error('Erro ao carregar cache de espécies:', error);
        }
    }

    /**
     * Busca informações de uma espécie no cache
     */
    getSpeciesInfo(scientificName) {
        return this.speciesCache.get(scientificName.toLowerCase());
    }
    
    /**
     * Cria o container de notificações no body
     */
    initNotificationContainer() {
        if (document.getElementById('notification-container')) {
            this.notificationContainer = document.getElementById('notification-container');
        } else {
            this.notificationContainer = document.createElement('div');
            this.notificationContainer.id = 'notification-container';
            document.body.appendChild(this.notificationContainer);
        }
    }
    
    /**
     * Exibe uma notificação toast dinâmica
     * @param {string} message - A mensagem a ser exibida
     * @param {string} type - 'info', 'success', 'warning', 'error'
     * @param {number} duration - Duração em ms
     */
    showNotification(message, type = 'info', duration = 4000) {
        // 1. Criar o elemento toast
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        toast.textContent = message;
        
        // 2. Adicionar ao container
        this.notificationContainer.appendChild(toast);
        
        // 3. Remover após a duração
        setTimeout(() => {
            toast.classList.add('fade-out');
            
            // Remover do DOM após a animação de fade-out
            toast.addEventListener('animationend', () => {
                if (toast.parentNode === this.notificationContainer) {
                    this.notificationContainer.removeChild(toast);
                }
            });
            
        }, duration);
    }
    
    // FUNÇÃO ANTIGA (showAlert) REMOVIDA
    // As chamadas a ela devem ser substituídas por showNotification
    
    updateModelStatus(status, message, details = {}) {
        const statusDiv = document.getElementById('modelStatus');
        const iconDiv = document.getElementById('modelStatusIcon');
        const labelSpan = document.getElementById('modelStatusLabel');
        const descP = document.getElementById('modelStatusDesc');
        const badgeSpan = document.getElementById('modelStatusBadge');
        const loadingBar = document.getElementById('modelLoadingBar');
        const actionDiv = document.getElementById('modelStatusAction');
        
        if (!statusDiv || !iconDiv || !labelSpan || !descP) return;
        
        if (status === 'success') {
            // Estilo de Sucesso - Fundo verde claro visível
            statusDiv.className = 'bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl shadow-2xl border-4 border-emerald-500 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)] hover:scale-105';
            
            iconDiv.className = 'flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg';
            iconDiv.innerHTML = `
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
            `;
            
            labelSpan.textContent = message || 'Modelo Carregado';
            labelSpan.className = 'text-lg font-black text-emerald-900 tracking-tight';
            
            descP.textContent = details.description || 'Sistema pronto para análise';
            descP.className = 'text-sm font-medium text-emerald-800';
            
            badgeSpan.textContent = '✓ Pronto';
            badgeSpan.className = 'px-3 py-1 text-sm font-bold rounded-full bg-emerald-500 text-white shadow-md';
            badgeSpan.classList.remove('hidden');
            
            if (loadingBar) loadingBar.classList.add('hidden');
            
        } else if (status === 'error') {
            // Estilo de Erro - Fundo vermelho claro visível
            statusDiv.className = 'bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl shadow-2xl border-4 border-red-500 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(239,68,68,0.5)] hover:scale-105';
            
            iconDiv.className = 'flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg';
            iconDiv.innerHTML = `
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            `;
            
            labelSpan.textContent = message || 'Erro ao Carregar';
            labelSpan.className = 'text-lg font-black text-red-900 tracking-tight';
            
            descP.textContent = details.description || 'Nenhum modelo encontrado. Treine um modelo primeiro.';
            descP.className = 'text-sm font-medium text-red-800';
            
            badgeSpan.textContent = '✗ Erro';
            badgeSpan.className = 'px-3 py-1 text-sm font-bold rounded-full bg-red-500 text-white shadow-md';
            badgeSpan.classList.remove('hidden');
            
            if (loadingBar) loadingBar.classList.add('hidden');
            
            // Mostrar link para treinamento
            if (actionDiv) {
                actionDiv.innerHTML = `
                    <a href="train.html" class="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                        Treinar
                    </a>
                `;
                actionDiv.classList.remove('hidden');
            }
            
        } else if (status === 'warning') {
            // Estilo de Aviso - Fundo amarelo claro visível
            statusDiv.className = 'bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl shadow-2xl border-4 border-yellow-500 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(234,179,8,0.5)] hover:scale-105';
            
            iconDiv.className = 'flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg';
            iconDiv.innerHTML = `
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
            `;
            
            labelSpan.textContent = message || 'Atenção';
            labelSpan.className = 'text-lg font-black text-yellow-900 tracking-tight';
            
            descP.textContent = details.description || 'Verificação necessária';
            descP.className = 'text-sm font-medium text-yellow-800';
            
            badgeSpan.textContent = '⚠ Aviso';
            badgeSpan.className = 'px-3 py-1 text-sm font-bold rounded-full bg-yellow-500 text-white shadow-md';
            badgeSpan.classList.remove('hidden');
            
            if (loadingBar) loadingBar.classList.add('hidden');
            
        } else {
            // Estilo de Loading - Fundo azul claro visível
            statusDiv.className = 'bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl shadow-2xl border-4 border-blue-400 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.5)]';
            
            iconDiv.className = 'flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg';
            iconDiv.innerHTML = `
                <svg class="animate-spin h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            `;
            
            labelSpan.textContent = message || 'Carregando Modelo';
            labelSpan.className = 'text-lg font-black text-blue-900 tracking-tight';
            
            descP.textContent = details.description || 'Inicializando rede neural...';
            descP.className = 'text-sm font-medium text-blue-800';
            
            badgeSpan.classList.add('hidden');
            
            if (loadingBar) {
                loadingBar.classList.remove('hidden');
                loadingBar.innerHTML = '<div class="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 animate-pulse shadow-lg" style="width: 60%"></div>';
            }
            
            if (actionDiv) actionDiv.classList.add('hidden');
        }
    }
    
    showAudioPlayer(file) {
        const container = document.getElementById('audioPlayerContainer');
        const player = document.getElementById('audioPlayer');
        if (!container || !player) return;
        
        const url = URL.createObjectURL(file);
        player.src = url;
        
        container.classList.remove('hidden');
    }
    
    showProcessing(show) {
        const processingDiv = document.getElementById('loadingOverlay');
        if (!processingDiv) return;
        
        if (show) {
            processingDiv.classList.remove('hidden');
            this.updateProgress(0, 'Iniciando...');
        } else {
            // Adiciona um pequeno delay para a animação de 100% ser visível
            setTimeout(() => {
                processingDiv.classList.add('hidden');
            }, 500);
        }
    }
    
    updateProgress(percentage, text = null) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        if (progressText) {
            if (text) {
                progressText.textContent = text;
            } else {
                progressText.textContent = `${percentage}% Concluído`;
            }
        }
    }
    
    showResults(predictions) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsContainer = document.getElementById('resultsContainer');
        if (!resultsSection || !resultsContainer) return;
        
        resultsSection.classList.remove('hidden');
        resultsSection.classList.add('fade-in');
        
        // Limpar resultados anteriores
        resultsContainer.innerHTML = '';
        
        // Criar cards de resultado
        predictions.forEach((pred, index) => {
            const card = this.createResultCard(pred, index);
            resultsContainer.appendChild(card);
        });
        
        // Scroll suave para resultados
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }
    
    createResultCard(prediction, index) {
        const card = document.createElement('div');
        card.className = 'result-card fade-in';
        
        // Buscar informações da espécie cadastrada
        const speciesInfo = this.getSpeciesInfo(prediction.species);
        
        // Determinar níveis de confiança
        const isHighConfidence = prediction.probability >= 0.7;
        const isMediumConfidence = prediction.probability >= 0.5 && prediction.probability < 0.7;
        const isTopResult = index === 0;
        
        // Estilos base do card
        card.style.cssText = `
            background: white;
            border-radius: 16px;
            overflow: hidden;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transition: all 0.3s ease;
            animation: fadeIn 0.5s ease-out forwards;
            animation-delay: ${index * 100}ms;
            opacity: 0;
            border: ${isTopResult ? '2px solid #10b981' : '1px solid #e5e7eb'};
        `;

        // Construir HTML do card
        let cardHTML = '';

        // Se tiver informações da espécie, mostrar com imagem
        if (speciesInfo) {
            const imageDisplay = speciesInfo.imageUrl ? 
                `<img src="${speciesInfo.imageUrl}" alt="${speciesInfo.scientificName}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
                 <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);"></div>` :
                '';
            
            cardHTML = `
                <!-- Header com Imagem/Gradiente -->
                <div style="position: relative; height: 200px; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); overflow: hidden;">
                    ${imageDisplay}
                    
                    <!-- Badge de Posição -->
                    ${isTopResult ? `
                        <div style="position: absolute; top: 12px; left: 12px;">
                            <span style="background: #10b981; color: white; padding: 6px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
                                <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                                Melhor Resultado
                            </span>
                        </div>
                    ` : ''}
                    
                    <!-- Confiança Badge -->
                    <div style="position: absolute; top: 12px; right: 12px;">
                        <div style="background: ${isHighConfidence ? 'rgba(16, 185, 129, 0.95)' : isMediumConfidence ? 'rgba(251, 191, 36, 0.95)' : 'rgba(107, 114, 128, 0.95)'}; 
                                    backdrop-filter: blur(8px); padding: 8px 16px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
                            <div style="font-size: 1.5rem; font-weight: 700; color: white; line-height: 1; text-align: center;">
                                ${prediction.confidence}%
                            </div>
                            <div style="font-size: 0.625rem; color: rgba(255, 255, 255, 0.9); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; text-align: center;">
                                Confiança
                            </div>
                        </div>
                    </div>
                    
                    <!-- Nome Científico -->
                    <div style="position: absolute; bottom: 16px; left: 16px; right: 16px;">
                        <h3 style="font-size: 1.5rem; font-weight: 700; color: white; margin: 0; font-style: italic; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);">
                            ${prediction.species}
                        </h3>
                        ${speciesInfo.commonName ? `
                            <p style="font-size: 1rem; color: rgba(255, 255, 255, 0.95); margin: 4px 0 0 0; font-weight: 500; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);">
                                ${speciesInfo.commonName}
                            </p>
                        ` : ''}
                    </div>
                </div>

                <!-- Corpo do Card -->
                <div style="padding: 20px;">
                    <!-- Barra de Confiança -->
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 0.875rem; font-weight: 600; color: #374151;">Nível de Confiança</span>
                            <span style="font-size: 0.875rem; font-weight: 600; color: ${isHighConfidence ? '#10b981' : isMediumConfidence ? '#f59e0b' : '#6b7280'};">
                                ${isHighConfidence ? 'Alta' : isMediumConfidence ? 'Média' : 'Baixa'}
                            </span>
                        </div>
                        <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 9999px; overflow: hidden;">
                            <div style="height: 100%; background: ${isHighConfidence ? 'linear-gradient(90deg, #10b981, #059669)' : isMediumConfidence ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #6b7280, #4b5563)'}; 
                                        width: ${prediction.confidence}%; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms; border-radius: 9999px;">
                            </div>
                        </div>
                    </div>

                    <!-- Informações da Espécie -->
                    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%); border-radius: 12px; padding: 16px; border: 1px solid #d1fae5;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                            <svg style="width: 18px; height: 18px; color: #10b981;" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            <span style="font-size: 0.875rem; font-weight: 600; color: #047857;">Espécie Cadastrada</span>
                        </div>
                        
                        <div style="display: grid; gap: 10px;">
                            ${speciesInfo.taxonomy?.family ? `
                                <div style="display: flex; align-items: start; gap: 8px;">
                                    <svg style="width: 16px; height: 16px; color: #059669; flex-shrink: 0; margin-top: 2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                                    </svg>
                                    <div style="flex: 1;">
                                        <span style="font-size: 0.75rem; color: #065f46; font-weight: 500;">Família</span>
                                        <p style="font-size: 0.875rem; color: #064e3b; font-weight: 600; margin: 2px 0 0 0;">${speciesInfo.taxonomy.family}</p>
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${speciesInfo.taxonomy?.order ? `
                                <div style="display: flex; align-items: start; gap: 8px;">
                                    <svg style="width: 16px; height: 16px; color: #0d9488; flex-shrink: 0; margin-top: 2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    <div style="flex: 1;">
                                        <span style="font-size: 0.75rem; color: #065f46; font-weight: 500;">Ordem</span>
                                        <p style="font-size: 0.875rem; color: #064e3b; font-weight: 600; margin: 2px 0 0 0;">${speciesInfo.taxonomy.order}</p>
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${speciesInfo.conservation ? `
                                <div style="display: flex; align-items: start; gap: 8px;">
                                    <svg style="width: 16px; height: 16px; color: #0891b2; flex-shrink: 0; margin-top: 2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                    </svg>
                                    <div style="flex: 1;">
                                        <span style="font-size: 0.75rem; color: #065f46; font-weight: 500;">Conservação</span>
                                        <p style="font-size: 0.875rem; color: #064e3b; font-weight: 600; margin: 2px 0 0 0;">${speciesInfo.conservation}</p>
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${speciesInfo.audioCount > 0 ? `
                                <div style="display: flex; align-items: start; gap: 8px;">
                                    <svg style="width: 16px; height: 16px; color: #0891b2; flex-shrink: 0; margin-top: 2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                                    </svg>
                                    <div style="flex: 1;">
                                        <span style="font-size: 0.75rem; color: #065f46; font-weight: 500;">Áudios Treinados</span>
                                        <p style="font-size: 0.875rem; color: #064e3b; font-weight: 600; margin: 2px 0 0 0;">${speciesInfo.audioCount} amostras</p>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        
                        ${speciesInfo.description ? `
                            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #d1fae5;">
                                <p style="font-size: 0.875rem; color: #065f46; line-height: 1.6; margin: 0;">
                                    ${speciesInfo.description.length > 200 ? speciesInfo.description.substring(0, 200) + '...' : speciesInfo.description}
                                </p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } else {
            // Espécie não cadastrada
            cardHTML = `
                <!-- Header Simples -->
                <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 20px; position: relative;">
                    <div style="position: absolute; top: 12px; right: 12px;">
                        <div style="background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(8px); padding: 8px 16px; border-radius: 12px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: white; line-height: 1; text-align: center;">
                                ${prediction.confidence}%
                            </div>
                            <div style="font-size: 0.625rem; color: rgba(255, 255, 255, 0.9); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; text-align: center;">
                                Confiança
                            </div>
                        </div>
                    </div>
                    
                    <div style="max-width: 70%;">
                        <h3 style="font-size: 1.5rem; font-weight: 700; color: white; margin: 0; font-style: italic;">
                            ${prediction.species}
                        </h3>
                    </div>
                </div>

                <div style="padding: 20px;">
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 0.875rem; font-weight: 600; color: #374151;">Nível de Confiança</span>
                            <span style="font-size: 0.875rem; font-weight: 600; color: ${isHighConfidence ? '#10b981' : isMediumConfidence ? '#f59e0b' : '#6b7280'};">
                                ${isHighConfidence ? 'Alta' : isMediumConfidence ? 'Média' : 'Baixa'}
                            </span>
                        </div>
                        <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 9999px; overflow: hidden;">
                            <div style="height: 100%; background: ${isHighConfidence ? 'linear-gradient(90deg, #10b981, #059669)' : isMediumConfidence ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #6b7280, #4b5563)'}; 
                                        width: ${prediction.confidence}%; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms; border-radius: 9999px;">
                            </div>
                        </div>
                    </div>

                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 12px; padding: 16px; border: 1px solid #fde68a;">
                        <div style="display: flex; gap: 12px;">
                            <svg style="width: 20px; height: 20px; color: #d97706; flex-shrink: 0; margin-top: 2px;" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                            <div style="flex: 1;">
                                <h4 style="font-size: 0.875rem; font-weight: 600; color: #92400e; margin: 0 0 6px 0;">
                                    Espécie Não Cadastrada
                                </h4>
                                <p style="font-size: 0.813rem; color: #78350f; line-height: 1.5; margin: 0 0 12px 0;">
                                    Esta espécie ainda não possui informações detalhadas no sistema. Cadastre-a para adicionar dados taxonômicos, fotos e descrições.
                                </p>
                                <a href="species.html" style="display: inline-flex; align-items: center; gap: 6px; background: #f59e0b; color: white; padding: 8px 16px; border-radius: 8px; font-size: 0.875rem; font-weight: 600; text-decoration: none; transition: all 0.2s;">
                                    <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                    </svg>
                                    Cadastrar Espécie
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        card.innerHTML = cardHTML;
        
        // Hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        });
        
        return card;
    }
    
    getConfidenceColor(probability) {
        if (probability >= 0.7) return 'var(--primary-600)';
        if (probability >= 0.5) return 'var(--warning)';
        return 'var(--gray-600)';
    }
    
    getProgressColor(probability) {
        if (probability >= 0.7) return 'linear-gradient(90deg, var(--primary-500), var(--primary-400))';
        if (probability >= 0.5) return 'linear-gradient(90deg, var(--warning), #fcd34d)';
        return 'var(--gray-500)';
    }
    
    drawSpectrogram(melSpec) {
        const canvas = document.getElementById('spectrogramCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        // Ajustar tamanho do canvas
        const containerWidth = canvas.parentElement.clientWidth;
        canvas.width = containerWidth;
        canvas.height = 256;
        
        const height = melSpec.length;
        const width = melSpec[0].length;
        
        // Normalizar valores para visualização
        let min = Infinity;
        let max = -Infinity;
        
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (melSpec[i][j] < min) min = melSpec[i][j];
                if (melSpec[i][j] > max) max = melSpec[i][j];
            }
        }
        
        // Desenhar espectrograma
        const scaleX = canvas.width / width;
        const scaleY = canvas.height / height;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const value = (melSpec[i][j] - min) / (max - min);
                
                // Colormap (Viridis)
                const color = this.valueToViridis(value);
                
                ctx.fillStyle = color;
                ctx.fillRect(
                    j * scaleX,
                    (height - i - 1) * scaleY, // Inverter Y
                    Math.ceil(scaleX),
                    Math.ceil(scaleY)
                );
            }
        }
        
        // Adicionar labels
        ctx.fillStyle = 'white';
        ctx.font = '12px var(--font-body)';
        ctx.fillText('Tempo →', canvas.width - 60, canvas.height - 10);
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Frequência (Hz)', 0, 0);
        ctx.restore();
    }
    
    // Colormap Viridis (otimizado)
    valueToViridis(t) {
        const r = Math.floor(255 * (0.267004 + t * (2.123048 + t * (-6.758421 + t * (8.963484 + t * (-6.095293 + t * 1.500176))))));
        const g = Math.floor(255 * (0.005873 + t * (1.020583 + t * (1.618532 + t * (-3.283832 + t * (1.933182 + t * -0.291776))))));
        const b = Math.floor(255 * (0.504240 + t * (2.302370 + t * (-6.392630 + t * (10.425390 + t * (-10.723042 + t * 4.883623))))));
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    showSpeciesInfo(speciesName) {
        const infoCard = document.getElementById('speciesInfoCard');
        const infoContent = document.getElementById('speciesInfoContent');
        if (!infoCard || !infoContent) return;
        
        // Aqui você pode buscar informações de uma API ou usar dados locais
        const info = this.getSpeciesInfo(speciesName);
        
        infoContent.innerHTML = `
            <div class="fade-in">
                <div style="margin-bottom: var(--space-lg);">
                    <h4 style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); font-style: italic; margin: 0;">${info.scientificName}</h4>
                    <p style="font-size: 0.875rem; color: var(--gray-600); margin-top: var(--space-xs);">Nome comum: ${info.commonName}</p>
                </div>
                
                <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-lg); margin-top: var(--space-xl);">
                    <div>
                        <p style="font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-xs); display: flex; align-items: center; gap: var(--space-xs);">
                            🧬 Família
                        </p>
                        <p style="font-size: 0.875rem; color: var(--gray-600);">${info.family}</p>
                    </div>
                    
                    <div>
                        <p style="font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-xs); display: flex; align-items: center; gap: var(--space-xs);">
                            📍 Distribuição
                        </p>
                        <p style="font-size: 0.875rem; color: var(--gray-600);">${info.distribution}</p>
                    </div>
                </div>
                
                <div style="margin-top: var(--space-xl);">
                    <p style="font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-xs); display: flex; align-items: center; gap: var(--space-xs);">
                        🌳 Habitat
                    </p>
                    <p style="font-size: 0.875rem; color: var(--gray-600);">${info.habitat}</p>
                </div>
                
                <div style="margin-top: var(--space-xl);">
                    <p style="font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-xs); display: flex; align-items: center; gap: var(--space-xs);">
                        ℹ️ Descrição
                    </p>
                    <p style="font-size: 0.875rem; color: var(--gray-600);">${info.description}</p>
                </div>
            </div>
        `;
        
        infoCard.classList.remove('hidden');
        // Scroll para o card
        infoCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    getSpeciesInfo(speciesName) {
        // Base de dados simplificada (pode ser expandida)
        const database = {
            'Boana faber': {
                scientificName: 'Boana faber',
                commonName: 'Rã-ferreira',
                family: 'Hylidae',
                habitat: 'Florestas úmidas, próximo a corpos d\'água permanentes',
                distribution: 'Mata Atlântica, sudeste e sul do Brasil',
                description: 'Anfíbio de médio a grande porte (60-100mm), conhecido por sua vocalização característica que lembra o som de uma bigorna. Machos constroem ninhos de barro para os ovos.'
            },
            'Scinax fuscomarginatus': {
                scientificName: 'Scinax fuscomarginatus',
                commonName: 'Perereca-de-borda-escura',
                family: 'Hylidae',
                habitat: 'Áreas abertas, campos, cerrado, áreas antropizadas',
                distribution: 'Brasil central, sudeste e sul',
                description: 'Pequena perereca (25-35mm) com coloração variável. Comum em áreas abertas e modificadas pelo homem. Reproduz-se em poças temporárias.'
            },
            'Dendropsophus minutus': {
                scientificName: 'Dendropsophus minutus',
                commonName: 'Perereca-de-ampulheta',
                family: 'Hylidae',
                habitat: 'Áreas abertas, brejos, bordas de mata',
                distribution: 'Ampla distribuição na América do Sul',
                description: 'Espécie pequena (15-30mm) com padrão característico de ampulheta no dorso. Vocalização aguda e repetitiva.'
            },
            'Leptodactylus fuscus': {
                scientificName: 'Leptodactylus fuscus',
                commonName: 'Rã-assobiadora',
                family: 'Leptodactylidae',
                habitat: 'Áreas abertas, campos, bordas de floresta',
                distribution: 'Ampla distribuição na América do Sul',
                description: 'Rã de médio porte com hábitos terrestres. Constrói ninhos de espuma em câmaras subterrâneas. Vocalização parece um assobio.'
            },
            'Physalaemus cuvieri': {
                scientificName: 'Physalaemus cuvieri',
                commonName: 'Rã-cachorro',
                family: 'Leptodactylidae',
                habitat: 'Áreas abertas, brejos, poças temporárias',
                distribution: 'Ampla distribuição no Brasil',
                description: 'Pequena rã (25-35mm) que constrói ninhos de espuma flutuantes. Sua vocalização é um "uômp" característico.'
            },
            'Rhinella ornata': {
                scientificName: 'Rhinella ornata',
                commonName: 'Sapo-cururu-da-Mata-Atlântica',
                family: 'Bufonidae',
                habitat: 'Florestas úmidas da Mata Atlântica',
                distribution: 'Sudeste do Brasil',
                description: 'Sapo de médio porte, terrestre, com glândulas de veneno (parotoides) proeminentes. Vocalização grave e tratorada.'
            },
            'Hypsiboas lundii': {
                scientificName: 'Hypsiboas lundii',
                commonName: 'Perereca-de-pijama',
                family: 'Hylidae',
                habitat: 'Cerrado, campos rupestres, próximo a riachos',
                distribution: 'Planalto central brasileiro',
                description: 'Perereca de médio porte com coloração característica. Ativa durante a estação chuvosa.'
            },
            'Boana albopunctata': {
                scientificName: 'Boana albopunctata',
                commonName: 'Perereca-de-pinta-branca',
                family: 'Hylidae',
                habitat: 'Formações abertas, bordas de floresta',
                distribution: 'Brasil (Cerrado, Mata Atlântica), Argentina, Paraguai',
                description: 'Perereca de médio porte, vocalização composta por notas curtas e repetidas. Comum em áreas próximas a corpos d\'água.'
            }
        };
        
        return database[speciesName] || {
            scientificName: speciesName,
            commonName: 'Informação não disponível',
            family: 'N/A',
            habitat: 'Informação não disponível',
            distribution: 'N/A',
            description: 'Informações detalhadas sobre esta espécie não estão disponíveis no momento.'
        };
    }
}

// Função global para ser chamada pelos botões de informação
window.handleSpeciesInfoClick = function(speciesName) {
    // Instanciando temporariamente; idealmente, app.js teria uma instância única
    const uiManager = new UIManager();
    uiManager.showSpeciesInfo(speciesName);
};
