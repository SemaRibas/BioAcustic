# 🚀 Guia de Início Rápido - BioAcustic 2.0

## 📖 Visão Geral

BioAcustic agora é um **sistema multi-páginas completo** para classificação de anfíbios por vocalização. Este guia te ajuda a começar rapidamente.

---

## 🎯 Acesso Rápido às Páginas

### 🏠 **Página Inicial** (`index.html`)
**Para que serve**: Apresentação do sistema e suas capacidades

**Quando usar**: Primeira visita, entender o que o sistema faz

**Principais seções**:
- Hero com mockup visual
- 6 recursos principais
- Como funciona (4 etapas)
- Tecnologias utilizadas

---

### 🎙️ **Análise** (`analyze.html`)
**Para que serve**: Analisar vocalizações de anfíbios

**Quando usar**: Quando você tem um áudio e quer identificar a espécie

**Como usar**:
1. Faça upload de um arquivo `.wav` ou `.mp3`
   - OU grave diretamente pelo navegador
2. Clique em **"Analisar Vocalização"**
3. Veja os resultados com % de confiança
4. Clique em **"Buscar Info"** para mais detalhes da espécie

**Requisitos**:
- Modelo treinado (vá em Treinamento primeiro)
- Áudio de qualidade (mínimo 1 segundo)

---

### 🧠 **Treinamento** (`train.html`)
**Para que serve**: Treinar modelos CNN personalizados

**Quando usar**: Primeira vez no sistema, ou para retreinar com novos dados

**Fluxo de trabalho**:

#### 1️⃣ Preparar Dados
```
Espécie A: 5-10 áudios diferentes
Espécie B: 5-10 áudios diferentes
Espécie C: 5-10 áudios diferentes
...
```

#### 2️⃣ Adicionar Exemplos
- Digite nome da espécie
- Selecione arquivos de áudio
- Clique "Adicionar Exemplos"
- Repita para cada espécie

#### 3️⃣ Configurar Treinamento
- **Épocas**: 50-100 (recomendado)
- **Batch Size**: 32 (padrão)
- **Validation Split**: 0.2

#### 4️⃣ Treinar
- Clique "Treinar Modelo"
- Acompanhe gráficos de Loss e Accuracy
- Aguarde conclusão

#### 5️⃣ Testar
- Faça upload de áudio teste
- Clique "Testar Modelo"
- Verifique se predição está correta

**⏱️ Tempo estimado**: 2-10 minutos (depende dos dados)

---

### 🐸 **Espécies** (`species.html`)
**Para que serve**: Gerenciar banco de dados de espécies

**Quando usar**: Para cadastrar novas espécies ou consultar existentes

**Funcionalidades**:

#### ➕ Adicionar Nova Espécie
1. Clique em **"Nova Espécie"**
2. Digite o **nome científico** (ex: *Boana faber*)
3. Clique em **"Buscar informações automaticamente"** 🔍
4. Sistema preenche automaticamente:
   - Nome comum
   - Taxonomia (Família, Ordem, Classe, Filo)
   - Descrição
   - Status de conservação
   - Imagem
5. Revise e ajuste se necessário
6. Clique **"Salvar Espécie"**

#### 🔍 Buscar Espécies
- Use o campo de busca para filtrar por nome
- Filtre por status (completas/incompletas)
- Visualize em tabela organizada

#### ✏️ Editar Espécie
- Clique no ícone de lápis
- Modifique os campos
- Salve alterações

#### 🗑️ Excluir Espécie
- Clique no ícone de lixeira
- Confirme exclusão

#### 📤 Importar/Exportar
- **Exportar**: Baixa JSON com todas as espécies
- **Importar**: Carrega JSON de backup anterior

**💡 Dica**: Use a busca automática sempre que possível para garantir dados precisos!

---

### ⚙️ **Configurações** (`settings.html`)
**Para que serve**: Ajustar parâmetros e gerenciar dados

**Quando usar**: Para otimizar o sistema ou fazer backup

**Seções**:

#### 🧠 Configurações do Modelo
- **Threshold**: Confiança mínima para aceitar previsão
  - Baixo (0.5): Mais resultados, menos preciso
  - Alto (0.9): Menos resultados, mais preciso
  - **Recomendado: 0.70**
  
- **Batch Size**: Amostras por lote
  - 16: Lento, menos memória
  - 32: Balanceado ✅
  - 64/128: Rápido, mais memória

- **Épocas**: Iterações de treinamento
  - 20-30: Teste rápido
  - 50-100: Produção ✅
  - 100+: Fine-tuning

#### 💾 Gerenciamento de Dados

**Exportar Todos os Dados** (JSON):
- Backup completo do sistema
- Inclui: espécies, modelos, análises, configurações
- Use para migração ou backup

**Importar Dados** (JSON):
- Restaura backup anterior
- Merge com dados existentes

**Exportar CSV**:
- Apenas espécies
- Compatível com Excel, Python, R
- Para análise estatística

**Limpar Dados** ⚠️:
- Remove TUDO do sistema
- **IRREVERSÍVEL**
- Faça backup antes!

#### 📊 Estatísticas
- Visualize quantidade de:
  - Espécies cadastradas
  - Áudios salvos
  - Modelos treinados
  - Análises realizadas

#### 🎨 Preferências
- **Auto-salvar**: Salvar progresso automaticamente
- **Notificações**: Exibir alertas do sistema

---

## 🎬 Tutorial Passo a Passo

### Cenário: Primeira Vez no Sistema

#### Passo 1: Explorar o Sistema (2 min)
1. Abra `index.html` no navegador
2. Leia sobre recursos e capacidades
3. Clique em **"🚀 Começar Agora"**

#### Passo 2: Cadastrar Espécies (5 min)
1. Vá em **🐸 Espécies**
2. Clique **"Nova Espécie"**
3. Digite: `Boana faber`
4. Clique **"Buscar informações automaticamente"**
5. Revise e salve
6. Repita para 2-3 espécies diferentes

#### Passo 3: Treinar Modelo (10 min)
1. Vá em **🧠 Treinamento**
2. Para cada espécie cadastrada:
   - Digite o nome
   - Selecione 5-10 áudios
   - Clique "Adicionar Exemplos"
3. Configure:
   - Épocas: 50
   - Batch Size: 32
4. Clique **"Treinar Modelo"**
5. Aguarde e acompanhe gráficos

#### Passo 4: Testar Modelo (2 min)
1. Ainda em **Treinamento**
2. Role até "Testar Modelo"
3. Faça upload de áudio teste
4. Clique "Testar Modelo"
5. Verifique predição

#### Passo 5: Analisar Novo Áudio (1 min)
1. Vá em **🎙️ Análise**
2. Grave ou faça upload de áudio
3. Clique **"Analisar Vocalização"**
4. Veja resultados
5. Clique **"Buscar Info"** para detalhes

#### Passo 6: Fazer Backup (1 min)
1. Vá em **⚙️ Configurações**
2. Clique **"Exportar Todos os Dados"**
3. Arquivo JSON será baixado

**🎉 Parabéns! Você dominou o BioAcustic!**

---

## 💡 Dicas e Truques

### 🎯 Para Melhor Precisão

1. **Mais dados é melhor**:
   - Mínimo: 5 áudios por espécie
   - Recomendado: 10-20 áudios
   - Ideal: 50+ áudios

2. **Variedade importa**:
   - Diferentes indivíduos
   - Diferentes condições
   - Diferentes horários

3. **Qualidade do áudio**:
   - Taxa de amostragem: 22050 Hz ou mais
   - Sem ruído excessivo
   - Vocalização clara

### ⚡ Performance

1. **Treinamento lento?**
   - Reduza épocas (30-50)
   - Aumente batch size (64)
   - Use menos dados temporariamente

2. **Análise demorando?**
   - Verifique tamanho do áudio
   - Feche outras abas do navegador
   - Reinicie o navegador

### 🔧 Troubleshooting

**Modelo não carrega**:
```
1. Verifique se treinou um modelo
2. Vá em Treinamento → Informações do Modelo
3. Se vazio, treine novamente
```

**Espécies não aparecem**:
```
1. Vá em Configurações → Estatísticas
2. Verifique contador de espécies
3. Se 0, cadastre espécies
```

**Erro "IndexedDB não disponível"**:
```
1. Use navegador moderno (Chrome, Firefox, Edge)
2. Desative modo privado/anônimo
3. Limpe cache e cookies
```

**Busca automática falha**:
```
1. Verifique conexão de internet
2. Nome científico deve estar correto
3. Tente novamente após 5 segundos
4. Preencha manualmente se persistir
```

---

## 📱 Atalhos do Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl + 1` | Ir para Início |
| `Ctrl + 2` | Ir para Análise |
| `Ctrl + 3` | Ir para Treinamento |
| `Ctrl + 4` | Ir para Espécies |
| `Ctrl + 5` | Ir para Configurações |
| `Ctrl + S` | Salvar (contexto) |
| `Esc` | Fechar modal |

---

## 🎓 Recursos de Aprendizado

### Documentação Completa
- 📄 `REDESIGN_MULTI_PAGE.md` - Arquitetura do sistema
- 📄 `SPECIES_INFO_FEATURE.md` - Sistema de busca de espécies
- 📄 `DESIGN_GUIDE.md` - Guia de design

### APIs Utilizadas
- [GBIF](https://www.gbif.org/) - Dados de biodiversidade
- [Wikipedia API](https://www.mediawiki.org/wiki/API) - Descrições
- [TensorFlow.js](https://www.tensorflow.org/js) - Machine Learning

### Comunidade
- Reporte bugs via GitHub Issues
- Sugestões são bem-vindas!

---

## 🆘 Precisa de Ajuda?

### Problemas Comuns

1. **"Modelo não encontrado"**
   - **Solução**: Vá em Treinamento e treine um modelo primeiro

2. **"Espécie não cadastrada"**
   - **Solução**: Adicione a espécie em Espécies → Nova Espécie

3. **"Erro ao analisar áudio"**
   - **Solução**: Verifique formato (WAV/MP3) e duração (>1s)

4. **"Dados não salvam"**
   - **Solução**: Use navegador moderno, desative modo privado

### Contato

- 📧 Email: suporte@bioacustic.com
- 🐛 Bugs: GitHub Issues
- 💬 Discussões: GitHub Discussions

---

## ✅ Checklist: Primeiro Uso

- [ ] Abrir index.html e explorar
- [ ] Cadastrar 3+ espécies
- [ ] Preparar 5+ áudios por espécie
- [ ] Treinar modelo (50 épocas)
- [ ] Testar modelo com áudio conhecido
- [ ] Analisar novo áudio
- [ ] Fazer backup (exportar dados)
- [ ] Ajustar threshold se necessário

---

**🎉 Pronto para começar!**

Qualquer dúvida, consulte a documentação completa em `docs/`.

---

**BioAcustic 2.0** 🐸  
*Classificação de Anfíbios por IA*  
Versão: 2.0.0 | Novembro 2025
