# Guia de Avaliação e Testes de Campo
# Fase 6: Avaliação e Iteração

**Projeto BioAcustic**  
**Data:** Novembro 2025

---

## 1. Introdução

Este documento fornece diretrizes práticas para testar e avaliar o desempenho do modelo de classificação de anfíbios em condições reais de campo.

---

## 2. Protocolo de Teste

### 2.1 Preparação

#### Dataset de Teste

- ✅ **Isolado**: Nunca usado durante treinamento
- ✅ **Balanceado**: Representação equitativa de todas as espécies
- ✅ **Diversificado**: Diferentes condições acústicas
- ✅ **Anotado**: Labels validados por especialistas

#### Condições de Teste

1. **Áudios Limpos**: Gravações de alta qualidade em estúdio
2. **Áudios de Campo**: Condições naturais com ruído de fundo
3. **Áudios Desafiadores**: 
   - Sobreposição de espécies
   - Ruído de chuva/vento
   - Gravações distantes

### 2.2 Métricas de Avaliação

#### Métricas Básicas

```python
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

# Acurácia Geral
accuracy = accuracy_score(y_true, y_pred)

# Por Classe
precision, recall, f1, support = precision_recall_fscore_support(
    y_true, y_pred, average=None
)
```

**Interpretação:**
- **Accuracy**: % de previsões corretas
- **Precision**: % de previsões positivas que estão corretas
- **Recall**: % de positivos reais que foram detectados
- **F1-Score**: Média harmônica de precision e recall

#### Matriz de Confusão

```python
from sklearn.metrics import confusion_matrix
import seaborn as sns

cm = confusion_matrix(y_true, y_pred)

# Visualizar
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
plt.xlabel('Predito')
plt.ylabel('Real')
plt.title('Matriz de Confusão')
plt.show()
```

**Análise:**
- Diagonal principal: Previsões corretas
- Fora da diagonal: Confusões entre classes

#### Top-K Accuracy

```python
from tensorflow.keras.metrics import TopKCategoricalAccuracy

top3_acc = TopKCategoricalAccuracy(k=3)
top3_acc.update_state(y_true_onehot, y_pred_probs)
print(f"Top-3 Accuracy: {top3_acc.result().numpy():.4f}")
```

**Útil quando:**
- Espécies muito similares
- Alta incerteza é aceitável
- Interface mostra top-K resultados

---

## 3. Testes de Campo

### 3.1 Checklist de Teste

#### Antes do Teste

- [ ] Carregar modelo convertido
- [ ] Testar carregamento no navegador
- [ ] Preparar dataset de teste anotado
- [ ] Configurar ambiente de logging
- [ ] Briefing com usuários/testadores

#### Durante o Teste

- [ ] Coletar predições
- [ ] Registrar tempo de inferência
- [ ] Anotar feedback qualitativo
- [ ] Documentar casos de erro
- [ ] Capturar screenshots/vídeos

#### Após o Teste

- [ ] Calcular métricas
- [ ] Gerar relatório
- [ ] Análise de erros
- [ ] Planejar melhorias

### 3.2 Exemplo de Script de Teste

```python
import json
import time
from pathlib import Path

# Carregar modelo
classifier = AmphibianClassifier()
classifier.model = keras.models.load_model('path/to/model.h5')
classifier.class_names = json.load(open('class_names.json'))

# Dataset de teste
test_dir = Path('./test_data')

results = []

for species_dir in test_dir.iterdir():
    if not species_dir.is_dir():
        continue
    
    true_label = species_dir.name
    
    for audio_file in species_dir.glob('*.wav'):
        # Processar
        start = time.time()
        
        # ... (carregar e preprocessar áudio)
        spec = preprocess_audio(audio_file)
        
        # Predição
        pred_probs = classifier.predict(spec)
        pred_label = classifier.class_names[pred_probs.argmax()]
        confidence = pred_probs.max()
        
        inference_time = time.time() - start
        
        # Armazenar resultado
        results.append({
            'file': str(audio_file),
            'true_label': true_label,
            'pred_label': pred_label,
            'confidence': float(confidence),
            'correct': true_label == pred_label,
            'inference_time': inference_time
        })

# Salvar resultados
with open('test_results.json', 'w') as f:
    json.dump(results, f, indent=2)

# Estatísticas
accuracy = sum(r['correct'] for r in results) / len(results)
avg_time = sum(r['inference_time'] for r in results) / len(results)

print(f"Accuracy: {accuracy:.2%}")
print(f"Avg Inference Time: {avg_time:.3f}s")
```

---

## 4. Análise de Erros

### 4.1 Categorias de Erro

#### Tipo 1: Confusão entre Espécies Similares

**Exemplo:**
```
Real: Boana faber
Pred: Boana albopunctata (80% confiança)
```

**Possíveis Causas:**
- Características acústicas muito similares
- Dataset insuficiente para uma das espécies
- Falta de features discriminativas

**Soluções:**
- Coletar mais dados das espécies confundidas
- Data augmentation focada
- Engenharia de features adicional

#### Tipo 2: Baixa Confiança

**Exemplo:**
```
Real: Scinax fuscomarginatus
Pred: Scinax fuscomarginatus (45% confiança)
```

**Possíveis Causas:**
- Ruído excessivo
- Vocalização atípica
- Modelo sub-treinado

**Soluções:**
- Melhorar qualidade dos dados
- Aumentar complexidade do modelo
- Mais épocas de treinamento

#### Tipo 3: Erro Completo

**Exemplo:**
```
Real: Dendropsophus minutus
Pred: Leptodactylus fuscus (90% confiança)
```

**Possíveis Causas:**
- Erro de anotação no dataset
- Overfitting
- Vocalização de outra espécie sobreposta

**Soluções:**
- Revisar anotações
- Regularização (dropout, data augmentation)
- Limpeza de dados

### 4.2 Visualização de Erros

```python
import matplotlib.pyplot as plt

# Casos de erro
errors = [r for r in results if not r['correct']]

# Distribuição de erros por espécie
error_counts = {}
for err in errors:
    true_label = err['true_label']
    error_counts[true_label] = error_counts.get(true_label, 0) + 1

plt.bar(error_counts.keys(), error_counts.values())
plt.xticks(rotation=45, ha='right')
plt.xlabel('Espécie')
plt.ylabel('Número de Erros')
plt.title('Distribuição de Erros por Espécie')
plt.tight_layout()
plt.show()
```

---

## 5. Testes de Usabilidade (UX)

### 5.1 Protocolo de Teste com Usuários

#### Participantes
- Biólogos/Herpetólogos
- Estudantes de biologia
- Usuários leigos (controle)

#### Tarefas
1. **Tarefa 1**: Fazer upload de um arquivo de áudio
2. **Tarefa 2**: Gravar áudio ao vivo (se possível)
3. **Tarefa 3**: Interpretar resultados
4. **Tarefa 4**: Explorar informações da espécie

#### Métricas UX
- Tempo para completar cada tarefa
- Taxa de sucesso
- Número de erros
- Satisfação (escala Likert 1-5)

### 5.2 Questionário Pós-Teste

```markdown
## Questionário de Avaliação - BioAcustic

### Seção 1: Usabilidade
1. Quão fácil foi usar a aplicação? (1-5)
2. A interface é intuitiva? (Sim/Não/Parcialmente)
3. Houve alguma dificuldade técnica? (Descreva)

### Seção 2: Resultados
4. Os resultados foram apresentados de forma clara? (1-5)
5. As informações das espécies foram úteis? (1-5)
6. Você confia nos resultados? (1-5)

### Seção 3: Melhorias
7. O que você mais gostou?
8. O que você mudaria?
9. Sugestões de funcionalidades adicionais?

### Seção 4: Desempenho
10. O carregamento foi rápido? (1-5)
11. A análise de áudio foi rápida? (1-5)
```

---

## 6. Monitoramento em Produção

### 6.1 Logging de Predições

```javascript
// Frontend (JavaScript)
async function logPrediction(predictionData) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        audioFileName: predictionData.fileName,
        predictions: predictionData.topPredictions,
        inferenceTime: predictionData.inferenceTime,
        userAgent: navigator.userAgent
    };
    
    // Enviar para backend (opcional)
    await fetch('/api/log-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
    });
    
    // Ou salvar localmente
    const logs = JSON.parse(localStorage.getItem('predictionLogs') || '[]');
    logs.push(logEntry);
    localStorage.setItem('predictionLogs', JSON.stringify(logs));
}
```

### 6.2 Coleta de Feedback

```html
<!-- Botões de feedback -->
<div id="feedbackButtons">
    <p>Esta predição foi útil?</p>
    <button onclick="sendFeedback('correct')">
        ✅ Correto
    </button>
    <button onclick="sendFeedback('incorrect')">
        ❌ Incorreto
    </button>
    <button onclick="sendFeedback('uncertain')">
        ❓ Incerto
    </button>
</div>

<script>
function sendFeedback(type) {
    const feedback = {
        predictionId: currentPredictionId,
        feedback: type,
        timestamp: new Date().toISOString()
    };
    
    // Enviar para backend
    fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
    });
    
    alert('Obrigado pelo feedback!');
}
</script>
```

### 6.3 Análise de Logs

```python
import pandas as pd

# Carregar logs
logs = pd.read_json('prediction_logs.json')

# Estatísticas
print(f"Total de predições: {len(logs)}")
print(f"Tempo médio de inferência: {logs['inferenceTime'].mean():.3f}s")

# Espécies mais previstas
top_species = logs['predictions'].apply(lambda x: x[0]['species']).value_counts()
print("\nTop 5 Espécies Previstas:")
print(top_species.head())

# Distribuição de confiança
confidences = logs['predictions'].apply(lambda x: x[0]['confidence'])
print(f"\nConfiança média: {confidences.mean():.2f}%")
print(f"Predições com confiança > 80%: {(confidences > 80).sum()}")
```

---

## 7. Iteração e Melhoria

### 7.1 Ciclo de Feedback

```
1. Coletar Dados
   ↓
2. Analisar Erros
   ↓
3. Identificar Problemas
   ↓
4. Propor Soluções
   ↓
5. Implementar Mudanças
   ↓
6. Re-treinar Modelo
   ↓
7. Re-testar
   ↓
(Repetir)
```

### 7.2 Checklist de Melhorias

#### Dados
- [ ] Adicionar mais exemplos das classes com baixa acurácia
- [ ] Limpar/rever anotações incorretas
- [ ] Balancear dataset
- [ ] Coletar dados de casos difíceis

#### Modelo
- [ ] Testar arquitetura diferente
- [ ] Ajustar hiperparâmetros
- [ ] Aumentar/reduzir complexidade
- [ ] Implementar ensemble de modelos

#### Pré-processamento
- [ ] Ajustar parâmetros de espectrograma
- [ ] Testar diferentes transformações
- [ ] Melhorar normalização

#### Interface
- [ ] Simplificar fluxo
- [ ] Adicionar tutoriais
- [ ] Melhorar feedback visual
- [ ] Otimizar performance

---

## 8. Relatório de Avaliação (Template)

```markdown
# Relatório de Avaliação - BioAcustic
**Versão do Modelo:** v1.0.0
**Data:** YYYY-MM-DD
**Avaliador:** Nome

## 1. Resumo Executivo
- Acurácia Geral: XX%
- Top-3 Accuracy: XX%
- Tempo Médio de Inferência: XXXms
- Principais Problemas: [Lista]

## 2. Métricas Detalhadas

### Por Espécie
| Espécie | Precision | Recall | F1-Score | Support |
|---------|-----------|--------|----------|---------|
| Sp1     | 0.XX      | 0.XX   | 0.XX     | XX      |
| ...     | ...       | ...    | ...      | ...     |

### Matriz de Confusão
[Imagem ou tabela]

## 3. Análise de Erros

### Casos Críticos
1. [Descrição do erro + possível causa]
2. [...]

### Padrões Identificados
- [Padrão 1]
- [Padrão 2]

## 4. Feedback de Usuários

### Pontos Positivos
- [Comentário 1]
- [...]

### Pontos Negativos
- [Comentário 1]
- [...]

## 5. Recomendações

### Curto Prazo (1-2 semanas)
- [Ação 1]
- [Ação 2]

### Médio Prazo (1-2 meses)
- [Ação 1]
- [...]

### Longo Prazo (3+ meses)
- [Visão estratégica]

## 6. Conclusão
[Resumo e próximos passos]
```

---

## 9. Recursos Adicionais

### Ferramentas

- **Confusion Matrix**: `sklearn.metrics.confusion_matrix`
- **Classification Report**: `sklearn.metrics.classification_report`
- **ROC Curve**: Para análise de threshold
- **t-SNE**: Visualização de embeddings

### Referências

1. **"A Survey on Deep Learning for Audio Classification"** (IEEE, 2020)
2. **"Best Practices for ML Evaluation"** (Google ML Guide)
3. **"User Testing Guide"** (Nielsen Norman Group)

---

**Documento Vivo - Atualizar conforme novas métricas/insights**
