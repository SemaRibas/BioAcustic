# 🎓 Guia de Treinamento no Navegador

## 📋 Visão Geral

O BioAcustic agora permite treinar um modelo de classificação de anfíbios **diretamente no navegador**, sem necessidade de instalar Python ou executar scripts backend!

## 🌟 Vantagens do Treinamento no Navegador

- ✅ **Zero configuração**: Não precisa instalar Python, TensorFlow ou outras dependências
- ✅ **Privacidade total**: Todos os dados ficam no seu computador
- ✅ **Feedback em tempo real**: Veja o progresso do treinamento ao vivo
- ✅ **Modelo persistente**: Salvo automaticamente no navegador
- ✅ **Pronto para usar**: Integração automática com o aplicativo principal

## 🚀 Como Usar

### 1. Acesse a Página de Treinamento

```
http://localhost:8000/train.html
```

Ou clique no botão **"Treinar Modelo"** no cabeçalho do aplicativo principal.

### 2. Prepare Seus Áudios

Você precisa de:
- **Mínimo de 2 espécies** diferentes
- **Pelo menos 5 áudios** para cada espécie
- Formatos aceitos: WAV, MP3, OGG, FLAC

**Recomendações:**
- Use mais amostras para melhor acurácia (10-20 por espécie ideal)
- Áudios de qualidade com vocalização clara
- Duração variada (3-10 segundos funciona bem)
- Diferentes contextos (dia/noite, próximo/distante, etc.)

### 3. Adicione Exemplos de Treinamento

Para cada espécie:

1. **Digite o nome da espécie** (científico ou comum)
   - Exemplo: "Boana faber" ou "Rã-ferreira"

2. **Selecione múltiplos áudios** da espécie
   - Arraste e solte na área de upload
   - Ou clique para selecionar arquivos

3. **Clique em "Adicionar Exemplos"**
   - Os áudios serão processados automaticamente
   - Mel-espectrogramas serão gerados

4. **Repita para cada espécie**

### 4. Monitore o Dataset

O painel lateral mostra:
- **Total de amostras** coletadas
- **Número de espécies** adicionadas
- **Contagem por espécie** (verde = suficiente, amarelo = adicione mais)

### 5. Inicie o Treinamento

Quando tiver dados suficientes:

1. Clique em **"🎓 Treinar Modelo"**
2. O treinamento iniciará automaticamente
3. Acompanhe o progresso:
   - **Barra de progresso** (épocas)
   - **Loss** (deve diminuir ao longo do tempo)
   - **Acurácia** (deve aumentar ao longo do tempo)
   - **Log de treinamento** (detalhes técnicos)

**Parâmetros de Treinamento:**
- Épocas: 20
- Batch size: 8
- Validação: 20% dos dados
- Otimizador: Adam (lr=0.001)

### 6. Salve o Modelo

Após o treinamento:

1. Clique em **"💾 Salvar Modelo"**
2. O modelo será salvo no **IndexedDB** do navegador
3. Metadados salvos no **localStorage**

### 7. Use o Modelo

1. Volte para o aplicativo principal (`index.html`)
2. O modelo será carregado automaticamente
3. Faça upload ou grave áudios para classificar!

## 📊 Arquitetura do Modelo

O modelo treinado no navegador usa uma **CNN simples e leve**:

```
Input (128x128x3) - Mel-spectrogram
    ↓
Conv2D (16 filtros) + MaxPooling
    ↓
Conv2D (32 filtros) + MaxPooling
    ↓
Conv2D (64 filtros) + MaxPooling
    ↓
Flatten + Dropout (0.5)
    ↓
Dense (64) + ReLU + Dropout (0.3)
    ↓
Dense (N classes) + Softmax
```

**Características:**
- ~150k parâmetros (modelo leve)
- Inferência rápida (~50ms)
- Adequado para navegador

## 💾 Gerenciamento de Dados

### Exportar Dataset

Salve seus dados de treinamento:

1. Clique em **"📦 Exportar Dataset"**
2. Um arquivo JSON será baixado
3. Contém todos os espectrogramas e labels

**Quando exportar:**
- Backup antes de limpar dados
- Compartilhar dataset com outros
- Versionar seus dados

### Importar Dataset

Carregue dados previamente exportados:

1. Clique em **"📥 Importar Dataset"**
2. Selecione arquivo JSON exportado
3. Dados serão carregados automaticamente

### Limpar Dados

Remove todos os exemplos de treinamento:

1. Clique em **"🧹 Limpar Dados"**
2. Confirme a ação
3. Modelo treinado não é afetado

### Limpar Modelo

Remove modelo treinado do navegador:

1. Clique em **"🗑️ Limpar Modelo"**
2. Confirme a ação
3. Libera espaço no navegador

## ⚡ Dicas e Truques

### 1. Coleta de Dados

**✅ Boas práticas:**
- Use gravações de qualidade
- Varie condições de gravação
- Inclua diferentes indivíduos
- Balanceie o número de amostras por espécie

**❌ Evite:**
- Áudios com muito ruído de fundo
- Amostras muito curtas (<1 segundo)
- Apenas um indivíduo/local por espécie
- Desbalanceamento extremo (ex: 50 de uma, 5 de outra)

### 2. Durante o Treinamento

**Sinais de bom treinamento:**
- Loss diminuindo consistentemente
- Acurácia aumentando gradualmente
- Loss de validação similar ao de treino

**Sinais de problemas:**
- Loss não diminui (dados insuficientes/ruins)
- Acurácia estagnada (modelo muito simples ou dados confusos)
- Loss de validação muito maior (overfitting)

**Soluções:**
- Adicione mais dados
- Balanceie as classes
- Treine por mais épocas (se loss ainda diminuindo)

### 3. Performance

**Velocidade de treinamento:**
- GPU do navegador: ~2-5 min
- CPU: ~5-15 min
- Depende do número de amostras

**Uso de memória:**
- ~500MB RAM por 100 amostras
- Feche outras abas se ficar lento
- Monitore console para erros de memória

### 4. Limitações

**Modelo simples:**
- Adequado para 2-10 espécies
- Para mais espécies, use pipeline Python
- Acurácia esperada: 70-90%

**Tamanho do dataset:**
- Mínimo: 5 amostras/espécie
- Recomendado: 15-20 amostras/espécie
- Máximo prático: ~50 amostras/espécie

**Armazenamento:**
- Modelo: ~5-10MB
- Dataset: ~1-2MB por 10 amostras
- Limite do navegador: ~50-100MB (varia)

## 🔧 Solução de Problemas

### "Dados insuficientes"

**Problema:** Botão de treinar desabilitado

**Solução:**
- Adicione pelo menos 2 espécies
- Cada espécie precisa de mínimo 5 amostras
- Verifique painel de estatísticas

### "Erro ao processar áudio"

**Problema:** Falha ao adicionar exemplos

**Possíveis causas:**
- Formato de áudio não suportado
- Arquivo corrompido
- Áudio muito grande (>50MB)

**Solução:**
- Use formatos comuns (WAV, MP3)
- Converta áudios problemáticos
- Reduza duração/qualidade se necessário

### "Treinamento travou"

**Problema:** Barra de progresso parada

**Soluções:**
1. Aguarde mais tempo (primeira época é mais lenta)
2. Verifique console do navegador (F12)
3. Reduza número de amostras se falta memória
4. Feche outras abas/aplicativos

### "Modelo não carrega no app"

**Problema:** App principal não encontra modelo

**Verificações:**
1. Modelo foi salvo? (clicou em "Salvar Modelo")
2. Está no mesmo navegador?
3. Cache foi limpo? (modelo fica no IndexedDB)
4. Console mostra erro específico?

**Solução:**
- Treine e salve novamente
- Use mesmo navegador/perfil
- Não limpe dados do site

### Performance ruim

**Problema:** Classificações incorretas

**Análise:**
- Acurácia de treinamento? (se <70%, adicione dados)
- Áudios de teste similares aos de treino? (importante!)
- Espécies muito parecidas? (dificulta classificação)

**Melhorias:**
- Adicione mais exemplos variados
- Verifique qualidade dos áudios
- Treine por mais épocas
- Considere usar pipeline Python para modelo avançado

## 📈 Comparação: Navegador vs Python

| Aspecto | Navegador | Python Pipeline |
|---------|-----------|-----------------|
| **Instalação** | Nenhuma | Python, TensorFlow, libs |
| **Tempo setup** | 0 min | 10-30 min |
| **Interface** | Visual, simples | Linha de comando |
| **Modelo** | CNN simples | Transfer Learning (MobileNet) |
| **Acurácia** | 70-90% | 85-98% |
| **Espécies** | 2-10 | 10-100+ |
| **Treinamento** | 5-15 min | 30-120 min |
| **Recursos** | Navegador | GPU recomendada |
| **Ideal para** | Prototipagem, testes | Produção, pesquisa |

## 🎯 Quando Usar Cada Opção

### Use Treinamento no Navegador quando:

- ✅ Prototipar rapidamente
- ✅ Não tem ambiente Python
- ✅ Poucas espécies (2-5)
- ✅ Dataset pequeno (<100 amostras)
- ✅ Demonstrações educacionais
- ✅ Privacidade crítica (dados não saem do navegador)

### Use Pipeline Python quando:

- ✅ Projeto de produção
- ✅ Muitas espécies (10+)
- ✅ Grande dataset (1000+ amostras)
- ✅ Máxima acurácia necessária
- ✅ Tem acesso a GPU
- ✅ Precisa de controle fino sobre arquitetura

## 🔬 Exemplo Prático

### Cenário: Classificar 3 Espécies Locais

**Setup:**
1. Grave 15 áudios de cada espécie no campo
2. Total: 45 áudios (~10MB)

**Processo:**
1. Acesse `train.html` (0 min)
2. Adicione exemplos de Espécie A (15 áudios) (5 min)
3. Adicione exemplos de Espécie B (15 áudios) (5 min)
4. Adicione exemplos de Espécie C (15 áudios) (5 min)
5. Treine modelo (8 min)
6. Salve e teste (2 min)

**Total: ~25 minutos do início ao fim!**

**Resultado esperado:**
- Acurácia: 80-85%
- Pronto para usar em campo
- Sem necessidade de configuração adicional

## 📚 Recursos Adicionais

- **QUICKSTART.md**: Pipeline Python completo
- **EVALUATION_GUIDE.md**: Como avaliar modelos
- **TROUBLESHOOTING.md**: Problemas gerais do app
- **DIRETRIZES_COMPLETAS.md**: Metodologia completa

## 🤝 Contribuindo

Encontrou um bug ou tem sugestão?
- Documente o problema
- Inclua logs do console
- Descreva passos para reproduzir

---

**🐸 BioAcustic - Democratizando a bioacústica com tecnologia web!**
