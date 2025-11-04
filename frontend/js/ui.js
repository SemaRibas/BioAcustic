/**
 * Gerenciador de Interface do Usuário
 * Responsável por atualizar elementos visuais
 *
 * ATUALIZAÇÃO:
 * - Substituído `showAlert` por `showNotification`
 * - Sistema de notificação agora cria "toasts" dinâmicos
 * que aparecem e desaparecem com animação.
 */

export class UIManager {
    
    constructor() {
        this.resultsVisible = false;
        this.notificationContainer = null;
        this.initNotificationContainer();
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
    
    updateModelStatus(status, message) {
        const statusDiv = document.getElementById('modelStatus');
        if (!statusDiv) return;
        
        if (status === 'success') {
            statusDiv.innerHTML = `✅ ${message}`;
            statusDiv.style.color = 'white';
            statusDiv.style.background = 'rgba(255, 255, 255, 0.2)';
            statusDiv.style.borderColor = 'var(--primary-300)';
        } else if (status === 'error') {
            statusDiv.innerHTML = `❌ ${message}`;
            statusDiv.style.color = 'white';
            statusDiv.style.background = 'rgba(220, 38, 38, 0.5)'; // Vermelho
            statusDiv.style.borderColor = 'var(--error-300)';
        } else {
            statusDiv.innerHTML = `<span class="spinner" style="border-top-color: white;"></span> ${message}`;
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
        // Adicionando 'fade-in' para animação de entrada
        card.className = 'result-card fade-in';
        card.style.animationDelay = `${index * 100}ms`;
        
        // Cor da borda baseada na posição
        const borderColors = ['var(--primary-500)', 'var(--secondary-500)', 'var(--warning)', 
                              'var(--gray-400)', 'var(--gray-400)'];
        const borderColor = borderColors[index] || 'var(--gray-400)';
        
        // Ícone baseado na confiança
        let icon = '🐸';
        
        if (prediction.probability < 0.5) {
            icon = '❓';
        } else if (prediction.probability < 0.7) {
            icon = '🤔';
        } else if (prediction.probability >= 0.95) {
            icon = '🎯';
        }
        
        // Cor do texto de confiança
        const confidenceColor = this.getConfidenceColor(prediction.probability);
        
        // Cor da barra de progresso
        const progressBgColor = this.getProgressColor(prediction.probability);
        
        card.style.cssText = `
            background: white;
            border-radius: var(--radius-xl);
            padding: var(--space-xl);
            margin-bottom: var(--space-lg);
            border-left: 4px solid ${borderColor};
            box-shadow: var(--shadow-md);
            transition: all var(--transition-base);
            animation: fadeIn 0.5s ease-out forwards;
            animation-delay: ${index * 100}ms;
            opacity: 0;
        `;
        
        card.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md);">
                <div style="display: flex; align-items: center; gap: var(--space-md);">
                    <div style="font-size: 2rem; line-height: 1;">${icon}</div>
                    <div>
                        <h4 style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin: 0; font-style: italic;">
                            ${prediction.species}
                        </h4>
                        ${index === 0 ? `
                            <span class="badge badge-success" style="margin-top: var(--space-xs);">
                                Mais Provável
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 2rem; font-weight: 700; color: ${confidenceColor}; line-height: 1;">
                        ${prediction.confidence}%
                    </div>
                    <div style="font-size: 0.75rem; color: var(--gray-500); margin-top: var(--space-xs);">confiança</div>
                </div>
            </div>
            
            <!-- Barra de progresso -->
            <div style="width: 100%; background: var(--gray-200); border-radius: var(--radius-full); height: 12px; overflow: hidden; margin-bottom: var(--space-md);">
                <div class="progress-bar" style="height: 100%; background: ${progressBgColor}; width: ${prediction.confidence}%; transition: width 0.5s ease 0.3s;">
                </div>
            </div>
            
            <!-- Botão de info -->
            <button 
                class="species-info-btn btn btn-ghost btn-sm"
                data-species="${prediction.species}"
                style="color: var(--primary-600); padding-left: 0;"
                onclick="window.handleSpeciesInfoClick('${prediction.species}')"
            >
                ℹ️ Ver informações da espécie
            </button>
        `;
        
        // Adicionar hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = 'var(--shadow-lg)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'var(--shadow-md)';
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
