/**
 * Gerenciador de Interface do Usuário
 * Responsável por atualizar elementos visuais
 */

export class UIManager {
    constructor() {
        this.resultsVisible = false;
    }
    
    updateModelStatus(status, message) {
        const statusDiv = document.getElementById('modelStatus');
        
        if (status === 'success') {
            statusDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            statusDiv.classList.add('text-green-300');
        } else if (status === 'error') {
            statusDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            statusDiv.classList.add('text-red-300');
        } else {
            statusDiv.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> ${message}`;
        }
    }
    
    showAlert(type, message) {
        const alertDiv = document.getElementById('statusAlert');
        
        alertDiv.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'bg-blue-100', 
                                  'text-green-800', 'text-red-800', 'text-blue-800');
        
        if (type === 'success') {
            alertDiv.classList.add('bg-green-100', 'text-green-800');
            alertDiv.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
        } else if (type === 'error') {
            alertDiv.classList.add('bg-red-100', 'text-red-800');
            alertDiv.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
        } else {
            alertDiv.classList.add('bg-blue-100', 'text-blue-800');
            alertDiv.innerHTML = `<i class="fas fa-info-circle mr-2"></i>${message}`;
        }
        
        // Auto-esconder após 5 segundos
        setTimeout(() => {
            alertDiv.classList.add('hidden');
        }, 5000);
    }
    
    showAudioPlayer(file) {
        const container = document.getElementById('audioPlayerContainer');
        const player = document.getElementById('audioPlayer');
        
        const url = URL.createObjectURL(file);
        player.src = url;
        
        container.classList.remove('hidden');
    }
    
    showProcessing(show) {
        const processingDiv = document.getElementById('loadingOverlay');
        
        if (show) {
            processingDiv.classList.remove('hidden');
            this.updateProgress(0);
        } else {
            processingDiv.classList.add('hidden');
        }
    }
    
    updateProgress(percentage) {
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = `${percentage}%`;
    }
    
    showResults(predictions) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsContainer = document.getElementById('resultsContainer');
        
        resultsSection.classList.remove('hidden');
        
        // Limpar resultados anteriores
        resultsContainer.innerHTML = '';
        
        // Criar cards de resultado
        predictions.forEach((pred, index) => {
            const card = this.createResultCard(pred, index);
            resultsContainer.appendChild(card);
        });
        
        // Scroll suave para resultados
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }
    
    createResultCard(prediction, index) {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        // Cor da borda baseada na posição
        const borderColors = ['var(--success-500)', 'var(--primary-500)', 'var(--warning-500)', 
                              'var(--secondary-500)', 'var(--gray-400)'];
        const borderColor = borderColors[index] || 'var(--gray-400)';
        
        // Ícone baseado na confiança
        let icon = '🐸';
        
        if (prediction.probability < 0.5) {
            icon = '❓';
        } else if (prediction.probability < 0.7) {
            icon = '✓';
        } else if (prediction.probability >= 0.95) {
            icon = '✅';
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
                            <span style="display: inline-block; margin-top: var(--space-xs); font-size: 0.75rem; background: var(--success-100); color: var(--success-800); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-full); font-weight: 600;">
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
                <div style="height: 100%; border-radius: var(--radius-full); background: ${progressBgColor}; width: ${prediction.confidence}%; transition: width 0.5s ease;">
                </div>
            </div>
            
            <!-- Botão de info -->
            <button 
                class="species-info-btn"
                data-species="${prediction.species}"
                style="background: transparent; border: none; color: var(--primary-600); font-size: 0.875rem; font-weight: 500; cursor: pointer; padding: var(--space-sm) 0; transition: color var(--transition-base); display: flex; align-items: center; gap: var(--space-xs);"
                onmouseover="this.style.color='var(--primary-700)'"
                onmouseout="this.style.color='var(--primary-600)'"
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
        if (probability >= 0.7) return 'var(--success-600)';
        if (probability >= 0.5) return 'var(--warning-600)';
        return 'var(--gray-600)';
    }
    
    getProgressColor(probability) {
        if (probability >= 0.7) return 'linear-gradient(90deg, var(--success-500), var(--success-400))';
        if (probability >= 0.5) return 'linear-gradient(90deg, var(--warning-500), var(--warning-400))';
        return 'var(--gray-500)';
    }
    
    drawSpectrogram(melSpec) {
        const canvas = document.getElementById('spectrogramCanvas');
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
        
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const value = (melSpec[i][j] - min) / (max - min);
                
                // Colormap (viridis-like)
                const color = this.valueToColor(value);
                
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
        ctx.font = '12px Arial';
        ctx.fillText('Tempo →', canvas.width - 60, canvas.height - 10);
        ctx.save();
        ctx.translate(15, 60);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Frequência (Hz) →', 0, 0);
        ctx.restore();
    }
    
    valueToColor(value) {
        // Colormap simplificado (azul → verde → amarelo → vermelho)
        const r = Math.floor(255 * Math.min(1, 2 * value));
        const g = Math.floor(255 * Math.min(1, 2 * (1 - Math.abs(value - 0.5))));
        const b = Math.floor(255 * Math.min(1, 2 * (1 - value)));
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    showSpeciesInfo(speciesName) {
        const infoCard = document.getElementById('speciesInfoCard');
        const infoContent = document.getElementById('speciesInfoContent');
        
        // Aqui você pode buscar informações de uma API ou usar dados locais
        const info = this.getSpeciesInfo(speciesName);
        
        infoContent.innerHTML = `
            <div>
                <div style="margin-bottom: var(--space-lg);">
                    <h4 style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); font-style: italic; margin: 0;">${info.scientificName}</h4>
                    <p style="font-size: 0.875rem; color: var(--gray-600); margin-top: var(--space-xs);">Nome comum: ${info.commonName}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-lg); margin-top: var(--space-xl);">
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
            'Leptodactylus camaquara': {
                scientificName: 'Leptodactylus camaquara',
                commonName: 'Rã-de-Camaquã',
                family: 'Leptodactylidae',
                habitat: 'Campos, áreas abertas, pampas',
                distribution: 'Sul do Brasil, Uruguai e Argentina',
                description: 'Rã de médio porte com hábitos terrestres e fossoriais. Vocaliza em poças temporárias durante a estação reprodutiva.'
            },
            'Leptodactylus cunicularius': {
                scientificName: 'Leptodactylus cunicularius',
                commonName: 'Rã-assobiadora',
                family: 'Leptodactylidae',
                habitat: 'Florestas, áreas úmidas, próxima a corpos d\'água',
                distribution: 'Brasil central e sudeste',
                description: 'Espécie de porte médio a grande, conhecida por sua vocalização característica. Hábitos noturnos e terrestres.'
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

// Função global para ser chamada pelos botões
window.showSpeciesInfo = function(speciesName) {
    const uiManager = new UIManager();
    uiManager.showSpeciesInfo(speciesName);
};
