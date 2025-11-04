# 📚 Glossário - Métricas de Treinamento

## 🎯 O que significa cada métrica?

### 1. 📉 ERRO (Loss)

**Definição simples:**  
O "erro" (ou "loss" em inglês) é uma medida de **quão errado** o modelo está nas suas previsões.

**Como funciona:**
- **Erro ALTO** (ex: 2.5): Modelo está errando muito, ainda está aprendendo
- **Erro MÉDIO** (ex: 0.8): Modelo está melhorando
- **Erro BAIXO** (ex: 0.2): Modelo está fazendo previsões muito próximas do correto

**O que queremos:**
- ✅ Erro **decrescente** ao longo das épocas
- ✅ Erro final **< 0.5** é considerado bom
- ✅ Erro final **< 0.3** é excelente!

**Exemplo prático:**
```
Época 1: Erro = 2.047 ❌ (Modelo confuso, chutando)
Época 10: Erro = 0.850 ⚠️ (Melhorando, mas ainda errando)
Época 30: Erro = 0.250 ✅ (Modelo aprendeu bem!)
```

**Por que esse nome?**  
Usamos uma função matemática chamada **"Cross-Entropy Loss"** que calcula a diferença entre:
- O que o modelo previu (ex: 60% L. camaquara, 40% L. cunicularius)
- O que era correto (ex: 100% L. camaquara, 0% L. cunicularius)

Quanto maior a diferença, maior o erro!

---

### 2. ✅ ACURÁCIA (Accuracy)

**Definição simples:**  
Percentual de vezes que o modelo **acertou** a espécie correta.

**Como funciona:**
- **Acurácia BAIXA** (ex: 40%): Modelo erra 6 em cada 10 previsões
- **Acurácia MÉDIA** (ex: 70%): Modelo acerta 7 em cada 10 previsões
- **Acurácia ALTA** (ex: 95%): Modelo acerta 19 em cada 20 previsões!

**O que queremos:**
- ✅ Acurácia **crescente** ao longo das épocas
- ✅ Acurácia final **> 85%** é considerada boa
- ✅ Acurácia final **> 90%** é excelente!

**Exemplo prático:**
```
Época 1: Acurácia = 37% ❌ (Acertou 3 de 10)
Época 10: Acurácia = 59% ⚠️ (Acertou 6 de 10)
Época 30: Acurácia = 92% ✅ (Acertou 9 de 10!)
```

---

### 3. 🎓 TREINAMENTO vs. VALIDAÇÃO

#### 📚 Dados de Treinamento (80%)
- São os dados que o modelo **usa para aprender**
- Como um aluno estudando com exercícios do livro
- O modelo vê esses dados repetidamente

#### 🧪 Dados de Validação (20%)
- São dados que o modelo **nunca viu durante o treino**
- Como uma prova surpresa para testar o que aprendeu
- Mede a **generalização**: capacidade de classificar áudios novos

**O que observar:**

✅ **Bom modelo:**
```
Treinamento: Acurácia = 90%
Validação:   Acurácia = 87%
Diferença:   3% ✅ (pequena!)
```

❌ **Overfitting (decorou):**
```
Treinamento: Acurácia = 98%
Validação:   Acurácia = 65%
Diferença:   33% ❌ (modelo decorou os dados!)
```

---

## 📊 Interpretando o Treinamento

### Cenário 1: Treinamento Saudável ✅

```
Época 1:  Treinamento - Erro: 2.047, Acurácia: 37%
          Validação   - Erro: 2.100, Acurácia: 35%

Época 10: Treinamento - Erro: 0.850, Acurácia: 68%
          Validação   - Erro: 0.920, Acurácia: 65%

Época 30: Treinamento - Erro: 0.250, Acurácia: 92%
          Validação   - Erro: 0.310, Acurácia: 89%
```

**Interpretação:**
- ✅ Erro diminuindo gradualmente
- ✅ Acurácia aumentando gradualmente
- ✅ Diferença pequena entre treino e validação
- ✅ **Modelo está aprendendo corretamente!**

---

### Cenário 2: Overfitting (Decorando) ❌

```
Época 1:  Treinamento - Erro: 2.047, Acurácia: 37%
          Validação   - Erro: 2.100, Acurácia: 35%

Época 10: Treinamento - Erro: 0.450, Acurácia: 85%
          Validação   - Erro: 1.200, Acurácia: 62%  ⚠️

Época 30: Treinamento - Erro: 0.050, Acurácia: 98%
          Validação   - Erro: 1.850, Acurácia: 55%  ❌
```

**Interpretação:**
- ❌ Erro de treino baixo, erro de validação alto
- ❌ Acurácia de treino alta, acurácia de validação baixa
- ❌ Diferença grande (> 20%)
- ❌ **Modelo decorou os dados de treino!**

**Solução:**
- Aumentar dropout (0.5 → 0.6)
- Adicionar mais dados (30+ amostras por espécie)
- Usar data augmentation

---

### Cenário 3: Underfitting (Não aprendeu) ❌

```
Época 1:  Treinamento - Erro: 2.047, Acurácia: 37%
          Validação   - Erro: 2.100, Acurácia: 35%

Época 10: Treinamento - Erro: 1.850, Acurácia: 45%
          Validação   - Erro: 1.920, Acurácia: 43%

Época 30: Treinamento - Erro: 1.650, Acurácia: 52%
          Validação   - Erro: 1.710, Acurácia: 50%
```

**Interpretação:**
- ❌ Erro permanece alto
- ❌ Acurácia não passa de 60%
- ❌ Modelo não está aprendendo

**Solução:**
- Aumentar épocas (50 → 100)
- Aumentar learning rate (0.001 → 0.005)
- Verificar qualidade dos dados
- Modelo pode ser muito simples

---

## 🎯 Metas para seu TCC

### Objetivo Mínimo:
- ✅ Acurácia de Validação **> 80%**
- ✅ Erro de Validação **< 0.6**
- ✅ Diferença Treino-Validação **< 10%**

### Objetivo Ideal:
- 🏆 Acurácia de Validação **> 90%**
- 🏆 Erro de Validação **< 0.3**
- 🏆 Diferença Treino-Validação **< 5%**

---

## 🔬 Termos Técnicos Explicados

### Categorical Cross-Entropy Loss
**O que é:** Função que calcula o erro para classificação multi-classe.

**Fórmula simplificada:**
```
Erro = -Σ (valor_real × log(valor_previsto))
```

**Exemplo:**
```
Real:     [1, 0, 0]  (100% L. camaquara)
Previsto: [0.6, 0.3, 0.1]  (60% L. camaquara, 30% L. cunicularius, 10% outra)

Erro = -(1 × log(0.6) + 0 × log(0.3) + 0 × log(0.1))
     = -log(0.6)
     = 0.51
```

Se a previsão fosse perfeita [1, 0, 0], o erro seria 0!

---

### Adam Optimizer
**O que é:** Algoritmo que ajusta os pesos da rede neural.

**Como funciona:**
1. Calcula o erro
2. Determina a direção para reduzir o erro
3. Ajusta os pesos nessa direção
4. Repete a cada época

**Learning Rate:** Controla o tamanho dos passos:
- Alto (0.01): Passos grandes, aprende rápido, pode errar
- Médio (0.001): Equilibrado ✅
- Baixo (0.0001): Passos pequenos, aprende devagar

---

### Early Stopping
**O que é:** Parar o treinamento automaticamente quando não há mais melhoria.

**Exemplo:**
```
Época 30: Val Acc = 85% ✅ Melhor modelo!
Época 31: Val Acc = 84%
Época 32: Val Acc = 84%
...
Época 45: Val Acc = 83%

🛑 Parou! Sem melhoria por 15 épocas
🏆 Restaurando modelo da época 30
```

**Benefícios:**
- Economiza tempo
- Previne overfitting
- Captura o melhor momento automaticamente

---

## 📖 Para citar no TCC

### Definição de Métricas:

> "A acurácia representa a proporção de classificações corretas sobre o total 
> de amostras avaliadas. A função de perda (categorical cross-entropy) quantifica 
> a divergência entre as distribuições de probabilidade previstas e reais, sendo 
> minimizada durante o processo de otimização através do algoritmo Adam."

### Validação:

> "Os dados foram divididos em conjuntos de treinamento (80%) e validação (20%). 
> A validação cruzada permite avaliar a capacidade de generalização do modelo, 
> prevenindo overfitting através do monitoramento da discrepância entre as 
> métricas de treinamento e validação."

---

**Última atualização:** 03/11/2025  
**Para dúvidas:** Consulte o console durante o treinamento!
