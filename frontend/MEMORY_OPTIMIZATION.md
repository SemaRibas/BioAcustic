# 🧠 Otimizações de Memória GPU - BioAcustic

## Problema Identificado
Ao processar 180 amostras (9 espécies × 20 réplicas), o contexto WebGL foi perdido devido ao esgotamento de memória GPU:
```
WebGL: CONTEXT_LOST_WEBGL: loseContext: context lost
```

## Soluções Implementadas

### 1. **Configuração TensorFlow.js** (train.html)
```javascript
tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0); // Deletar texturas imediatamente
tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);    // Usar float16 (50% menos memória)
tf.env().set('WEBGL_PACK', true);                   // Empacotar texturas
```

### 2. **Gerenciamento de Memória** (trainer.js)
- **cleanupMemory()**: Força garbage collection do TensorFlow
- **tf.tidy()**: Gerenciamento automático de tensores no prepareDataset()
- **tf.nextFrame()**: Pausa a cada 5 épocas para GPU respirar
- **Logging de memória**: Monitora uso de GPU durante treinamento

### 3. **Modelo Otimizado** (trainer.js)
Redução de parâmetros para economizar memória:
- Conv2D Layer 1: 16 → 12 filtros (-25%)
- Conv2D Layer 2: 32 → 24 filtros (-25%)
- Conv2D Layer 3: 64 → 32 filtros (-50%)
- Dense Layer: 64 → 48 neurônios (-25%)

**Resultado**: ~40% menos parâmetros, ~40% menos memória

### 4. **Processamento em Batch** (train.html)
- Libera memória GPU a cada 20 amostras processadas
- Atualiza UI a cada 10 amostras (reduz overhead)
- Ajuste automático de batch size baseado no total de amostras

### 5. **Sistema de Avisos**
- **Aviso amarelo**: > 100 amostras
- **Aviso vermelho**: > 150 amostras
- **Banner informativo**: Explica limites antes do uso

### 6. **Recuperação de Erro**
- Detecta perda de contexto WebGL
- Mensagens claras sobre o problema
- Sugestões de ação para o usuário

## Limites Recomendados

| Cenário | Amostras Totais | Status |
|---------|----------------|--------|
| **Ideal** | 50-80 | ✅ Muito seguro |
| **Aceitável** | 80-100 | ✅ Seguro |
| **Limite** | 100-150 | ⚠️ Atenção |
| **Perigoso** | > 150 | ❌ Risco alto |

## Exemplo de Uso Seguro

### ✅ Bom (80 amostras):
- 4 espécies × 20 réplicas = 80 amostras

### ⚠️ Limite (150 amostras):
- 5 espécies × 30 réplicas = 150 amostras

### ❌ Perigoso (180 amostras):
- 9 espécies × 20 réplicas = 180 amostras

## Como Processar Grandes Datasets

### Estratégia 1: Lotes Menores
```
1. Processe 3-4 espécies por vez
2. Treine o modelo
3. Salve o modelo
4. Recarregue a página
5. Continue com as próximas espécies
```

### Estratégia 2: Menos Réplicas
```
Em vez de: 9 espécies × 20 réplicas = 180 amostras
Use: 9 espécies × 10 réplicas = 90 amostras
```

### Estratégia 3: Arquivos Únicos
```
Em vez de replicar o mesmo arquivo 20x,
Use 20 arquivos diferentes (melhor para o modelo!)
```

## Monitoramento

### Console do Navegador
```javascript
// Ver memória atual
tf.memory()

// Ver backend
tf.getBackend()

// Ver tensores ativos
tf.memory().numTensors
```

### Durante Processamento
O sistema automaticamente loga:
```
💾 GPU: 245.67 MB, 1234 tensores
```

## Troubleshooting

### Problema: Página travou durante processamento
**Solução**: Recarregue a página (F5) e reduza quantidade de amostras

### Problema: Erro "context lost"
**Solução**: 
1. Recarregue a página
2. Reduza réplicas por arquivo
3. Processe menos arquivos de uma vez

### Problema: Treinamento muito lento
**Solução**: Normal para muitas amostras. Aguarde ou reduza quantidade.

## Performance Esperada

| Amostras | Tempo Processamento | Tempo Treinamento (20 épocas) |
|----------|--------------------|-----------------------------|
| 50 | ~1-2 min | ~2-3 min |
| 80 | ~2-3 min | ~3-5 min |
| 100 | ~3-4 min | ~5-7 min |
| 150 | ~5-7 min | ~8-12 min |

## Hardware Recomendado

- **GPU dedicada**: Melhor performance
- **GPU integrada**: Funciona, mas mais lento
- **RAM**: Mínimo 8GB
- **Navegador**: Chrome/Edge (melhor suporte WebGL)

## Conclusão

Com essas otimizações, o sistema pode processar até **100-150 amostras com segurança**. Para datasets maiores, use a estratégia de lotes menores. Sempre monitore o console para avisos de memória.
