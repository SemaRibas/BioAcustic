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
        const processingDiv = document.getElementById('processingAnimation');
        
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
        card.className = 'result-card bg-white rounded-lg shadow-md p-5 border-l-4';
        
        // Cor da borda baseada na posição
        const colors = ['border-green-500', 'border-blue-500', 'border-yellow-500', 
                       'border-purple-500', 'border-gray-500'];
        card.classList.add(colors[index] || 'border-gray-500');
        
        // Ícone baseado na confiança
        let icon = 'fa-leaf';
        let iconColor = 'text-green-600';
        
        if (prediction.probability < 0.5) {
            icon = 'fa-question-circle';
            iconColor = 'text-gray-500';
        } else if (prediction.probability < 0.7) {
            icon = 'fa-check-circle';
            iconColor = 'text-yellow-600';
        }
        
        card.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <i class="fas ${icon} text-2xl ${iconColor}"></i>
                    <div>
                        <h4 class="font-semibold text-lg text-gray-800 italic">${prediction.species}</h4>
                        ${index === 0 ? '<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Mais Provável</span>' : ''}
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-3xl font-bold ${this.getConfidenceColor(prediction.probability)}">
                        ${prediction.confidence}%
                    </div>
                    <div class="text-xs text-gray-500">confiança</div>
                </div>
            </div>
            
            <!-- Barra de progresso -->
            <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="h-3 rounded-full transition-all duration-500 ${this.getProgressColor(prediction.probability)}" 
                     style="width: ${prediction.confidence}%">
                </div>
            </div>
            
            <!-- Botão de info (opcional) -->
            <button 
                class="mt-3 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                onclick="showSpeciesInfo('${prediction.species}')"
            >
                <i class="fas fa-info-circle mr-1"></i>Ver informações da espécie
            </button>
        `;
        
        return card;
    }
    
    getConfidenceColor(probability) {
        if (probability >= 0.7) return 'text-green-600';
        if (probability >= 0.5) return 'text-yellow-600';
        return 'text-gray-600';
    }
    
    getProgressColor(probability) {
        if (probability >= 0.7) return 'bg-green-500';
        if (probability >= 0.5) return 'bg-yellow-500';
        return 'bg-gray-500';
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
            <div class="space-y-3">
                <div>
                    <h4 class="font-semibold text-lg text-gray-800 italic">${info.scientificName}</h4>
                    <p class="text-sm text-gray-600">Nome comum: ${info.commonName}</p>
                </div>
                
                <div class="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <p class="text-sm font-semibold text-gray-700">
                            <i class="fas fa-layer-group mr-2 text-blue-500"></i>Família
                        </p>
                        <p class="text-sm text-gray-600">${info.family}</p>
                    </div>
                    
                    <div>
                        <p class="text-sm font-semibold text-gray-700">
                            <i class="fas fa-map-marker-alt mr-2 text-blue-500"></i>Distribuição
                        </p>
                        <p class="text-sm text-gray-600">${info.distribution}</p>
                    </div>
                </div>
                
                <div class="mt-4">
                    <p class="text-sm font-semibold text-gray-700">
                        <i class="fas fa-tree mr-2 text-green-500"></i>Habitat
                    </p>
                    <p class="text-sm text-gray-600">${info.habitat}</p>
                </div>
                
                <div class="mt-4">
                    <p class="text-sm font-semibold text-gray-700">
                        <i class="fas fa-info-circle mr-2 text-purple-500"></i>Descrição
                    </p>
                    <p class="text-sm text-gray-600">${info.description}</p>
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
