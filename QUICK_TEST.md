# ⚡ Teste Rápido - Treinamento no Navegador

## 🎯 Objetivo
Treinar e testar um modelo em **menos de 10 minutos** para experimentar a funcionalidade.

## 📋 Pré-requisitos
- Navegador moderno (Chrome, Edge, Firefox)
- Pelo menos 6 arquivos de áudio (2 espécies × 3 áudios mínimo para teste)

---

## 🚀 Opção 1: Teste com Áudios Próprios

### Passo 1: Inicie o Servidor (30 segundos)

Abra PowerShell na pasta do projeto e execute:

```powershell
cd frontend
python -m http.server 8000
```

Você verá:
```
Serving HTTP on :: port 8000 (http://[::]:8000/) ...
```

### Passo 2: Acesse a Página de Treinamento (10 segundos)

Abra no navegador:
```
http://localhost:8000/train.html
```

### Passo 3: Adicione Áudios da Primeira Espécie (1 minuto)

1. **Digite o nome:** `Especie A` (ou nome real da espécie)
2. **Arraste 5 áudios** (ou clique para selecionar)
3. **Clique:** "➕ Adicionar Exemplos"
4. **Aguarde:** Processamento automático

### Passo 4: Adicione Áudios da Segunda Espécie (1 minuto)

1. **Digite o nome:** `Especie B` (ou nome real da segunda espécie)
2. **Arraste 5 áudios**
3. **Clique:** "➕ Adicionar Exemplos"
4. **Aguarde:** Processamento

### Passo 5: Verifique Estatísticas (5 segundos)

Painel lateral deve mostrar:
- Total: 10 amostras
- 2 espécies
- Especie A: 5 ✅
- Especie B: 5 ✅
- Botão "🎓 Treinar Modelo" agora está **ATIVO**

### Passo 6: Treine o Modelo (3-5 minutos)

1. **Clique:** "🎓 Treinar Modelo"
2. **Observe:**
   - Barra de progresso movendo
   - Loss diminuindo
   - Acurácia aumentando
   - Log mostrando épocas

Exemplo de output esperado:
```
Época 1/20 - loss: 0.8234 - acc: 55.00%
Época 2/20 - loss: 0.6891 - acc: 62.50%
...
Época 20/20 - loss: 0.1234 - acc: 95.00%
✅ Treinamento concluído!
```

### Passo 7: Salve o Modelo (5 segundos)

1. **Clique:** "💾 Salvar Modelo"
2. **Veja mensagem:** "✅ Modelo salvo no navegador!"

### Passo 8: Teste no App Principal (1 minuto)

1. **Abra nova aba:** `http://localhost:8000/index.html`
2. **Veja cabeçalho:** "✅ Modelo carregado: BioAcustic Browser Model"
3. **Faça upload** de um áudio de teste
4. **Veja resultado:** Classificação com probabilidades!

**🎉 SUCESSO! Você treinou e usou um modelo de Deep Learning no navegador!**

---

## 🚀 Opção 2: Teste com Dataset do Xeno-canto (15 minutos)

### Preparação: Baixar Áudios (5-10 minutos)

#### Método A: Manual (Mais Rápido para Teste)

1. Acesse: https://xeno-canto.org/explore?query=Boana+faber
2. Clique em 5 gravações diferentes
3. Baixe cada uma (botão Download)
4. Salve em uma pasta: `C:\Temp\boana_faber\`

5. Acesse: https://xeno-canto.org/explore?query=Scinax+fuscomarginatus
6. Baixe 5 gravações
7. Salve em: `C:\Temp\scinax\`

#### Método B: Script Python (Mais Organizado)

1. Edite `backend/scripts/01_download_data.py`:

```python
ESPECIES = [
    "Boana faber",
    "Scinax fuscomarginatus"
]

SAMPLES_PER_SPECIES = 5  # Para teste rápido
```

2. Execute:
```powershell
cd backend\scripts
python 01_download_data.py
```

Áudios serão salvos em `data/raw/`

### Treinamento: Siga Opção 1 (Passos 1-8)

Use os áudios baixados! ✨

---

## 🧪 Testes de Validação

### Teste 1: Dataset Mínimo
- ✅ 2 espécies
- ✅ 5 amostras cada
- ✅ Total: 10 amostras
- 🎯 Objetivo: Verificar funcionalidade básica
- ⏱️ Tempo: ~5 minutos treino

### Teste 2: Dataset Pequeno
- ✅ 2 espécies
- ✅ 10 amostras cada
- ✅ Total: 20 amostras
- 🎯 Objetivo: Melhor acurácia
- ⏱️ Tempo: ~7 minutos treino

### Teste 3: Dataset Médio
- ✅ 3 espécies
- ✅ 15 amostras cada
- ✅ Total: 45 amostras
- 🎯 Objetivo: Caso real
- ⏱️ Tempo: ~10 minutos treino

---

## 📊 O Que Observar

### Durante o Processamento de Áudios

**✅ Sinais de sucesso:**
```
🎵 Processando áudio para espectrograma...
   Reamostrando: 48000Hz → 22050Hz
   Calculando STFT...
   Aplicando Mel filterbank...
✅ Espectrograma gerado: 128 x 126
✅ Exemplo adicionado: Especie A (1 amostras)
```

**❌ Sinais de problema:**
```
❌ Erro ao processar áudio: formato não suportado
```
→ Solução: Use WAV ou MP3

### Durante o Treinamento

**✅ Treinamento saudável:**
- Loss: 0.8 → 0.6 → 0.4 → 0.2 → 0.1 (diminuindo)
- Acc: 50% → 65% → 75% → 85% → 95% (aumentando)
- Progresso consistente

**⚠️ Possíveis problemas:**

**Problema 1:** Loss não diminui
```
Época 1: loss: 0.9234 - acc: 52%
Época 2: loss: 0.9185 - acc: 51%
Época 3: loss: 0.9201 - acc: 53%
```
→ Causa: Dados insuficientes/ruins
→ Solução: Adicione mais amostras

**Problema 2:** Acurácia muito baixa (<60%)
```
Época 20: loss: 0.4523 - acc: 58%
```
→ Causa: Espécies muito similares ou áudios ruins
→ Solução: Escolha espécies mais distintas

**Problema 3:** Overfitting
```
Training acc: 98%
Validation acc: 65%
```
→ Causa: Modelo memorizou dados
→ Solução: Adicione mais amostras variadas

### Após Salvar o Modelo

**✅ Sucesso:**
```
💾 Salvando modelo...
✅ Modelo salvo no navegador
```

**Verificar no Console (F12):**
```
✅ Modelo do navegador carregado com sucesso!
   Classes: Especie A, Especie B
   Treinado em: 03/11/2025 14:30:25
```

### Ao Usar no App Principal

**✅ Classificação funcionando:**
```
🧠 Iniciando análise...
🎵 Processando áudio para espectrograma...
✅ Espectrograma gerado: 128 x 126
🧠 Executando predição...
✅ Predição concluída em 67.23 ms

Resultados:
1. Especie A - 87.34%
2. Especie B - 12.66%
```

---

## 🔍 Troubleshooting Rápido

### Erro: "Dados insuficientes"
**Sintoma:** Botão treinar desabilitado

**Check:**
- [ ] Pelo menos 2 espécies adicionadas?
- [ ] Cada uma com 5+ amostras?
- [ ] Estatísticas mostram números corretos?

### Erro: "Erro ao processar áudio"
**Sintoma:** Falha ao adicionar exemplos

**Check:**
- [ ] Arquivo é áudio válido? (abra em player)
- [ ] Formato é suportado? (WAV, MP3, OGG)
- [ ] Arquivo não está corrompido?

**Solução rápida:**
1. Converta para WAV usando Audacity
2. Tente com outro arquivo primeiro
3. Veja console (F12) para erro específico

### Erro: Modelo não carrega no app
**Sintoma:** App diz "modelo não treinado"

**Check:**
- [ ] Clicou em "Salvar Modelo" após treinar?
- [ ] Está usando mesmo navegador/perfil?
- [ ] Não limpou cache/dados do site?

**Solução:**
1. Volte para train.html
2. Veja painel "Modelo Atual"
3. Se vazio, treine novamente
4. IMPORTANTE: Clique em "Salvar Modelo"!

### Performance ruim em classificação
**Sintoma:** Classificações erradas

**Análise:**
- Acurácia de treino foi boa (>80%)? 
  - Se não: adicione mais dados
- Áudio de teste é similar aos de treino?
  - Se não: isso é esperado (modelo não viu antes)
- Espécies são muito parecidas?
  - Se sim: dificulta classificação

---

## 📝 Checklist Completo

### Antes de Treinar
- [ ] Servidor HTTP rodando (porta 8000)
- [ ] train.html acessível no navegador
- [ ] Pelo menos 6 áudios disponíveis (2 espécies)
- [ ] Áudios são de boa qualidade
- [ ] Espécies têm vocalizações distintas

### Durante Treinamento
- [ ] Áudios processados sem erro
- [ ] Estatísticas corretas no painel lateral
- [ ] Botão "Treinar" habilitado
- [ ] Loss diminuindo durante treino
- [ ] Acurácia aumentando
- [ ] Sem erros no console (F12)

### Após Treinamento
- [ ] Treinamento concluído (20/20 épocas)
- [ ] Acurácia final >70%
- [ ] Clicou em "Salvar Modelo"
- [ ] Mensagem de sucesso apareceu

### Testando no App
- [ ] index.html carrega sem erro
- [ ] Cabeçalho mostra modelo carregado
- [ ] Upload de áudio funciona
- [ ] Classificação retorna resultados
- [ ] Probabilidades fazem sentido

---

## 🎓 Próximos Passos

### Após Sucesso no Teste Rápido:

1. **Adicione mais dados:**
   - 10-20 amostras por espécie
   - 3-5 espécies diferentes
   - Re-treine para melhor acurácia

2. **Experimente recursos avançados:**
   - Exportar dataset (backup)
   - Importar dataset (compartilhar)
   - Treinar múltiplos modelos (comparar)

3. **Produza conteúdo:**
   - Documente suas espécies
   - Compartilhe resultados
   - Contribua com datasets

4. **Explore pipeline Python:**
   - Para produção
   - Mais espécies (10+)
   - Máxima acurácia (>95%)

---

## 📚 Recursos Adicionais

- **BROWSER_TRAINING_GUIDE.md**: Guia completo detalhado
- **AUDIO_SAMPLES_GUIDE.md**: Como conseguir áudios
- **TROUBLESHOOTING.md**: Problemas gerais
- **TRAINING_FEATURE_SUMMARY.md**: Documentação técnica

---

## 💡 Dicas para Máximo Sucesso

### ✅ Faça:
- Use áudios de boa qualidade (sem ruído excessivo)
- Escolha espécies com vocalizações bem distintas
- Comece com poucas espécies (2-3)
- Adicione pelo menos 10 amostras por espécie
- Varie as condições de gravação
- Teste com áudios similares aos de treino

### ❌ Evite:
- Áudios com muita distorção
- Espécies muito parecidas (para primeiro teste)
- Muito poucas amostras (<5 por espécie)
- Amostras todas iguais (mesmo indivíduo/local)
- Testar com áudios muito diferentes dos de treino

---

## 🎉 Celebre seu Primeiro Modelo!

Quando tudo funcionar:

1. Tire uma screenshot dos resultados! 📸
2. Anote as métricas (acurácia, espécies, etc.)
3. Experimente com novos áudios
4. Compartilhe sua experiência!

**Parabéns! Você treinou um modelo de Deep Learning no navegador! 🐸🎓**

---

**Tempo total esperado:** 10-15 minutos do zero ao modelo funcionando! ⚡

**Dificuldade:** ⭐☆☆☆☆ (Muito Fácil)

**Recompensa:** 🏆🏆🏆🏆🏆 (Muito Satisfatório!)
