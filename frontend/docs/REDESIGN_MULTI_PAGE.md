# 🎨 Redesign Completo - Sistema Multi-Páginas

## 📋 Resumo das Alterações

O BioAcustic foi completamente redesenhado com uma arquitetura multi-páginas moderna, separando funcionalidades em páginas dedicadas com navegação unificada.

---

## 🏗️ Nova Estrutura de Arquivos

```
frontend/
├── index.html              ← Nova landing page (página inicial)
├── analyze.html            ← Página de análise de áudio (antiga index.html)
├── train.html              ← Página de treinamento (atualizada)
├── species.html            ← Nova: gerenciamento de espécies
├── settings.html           ← Nova: configurações e exportações
├── index_backup.html       ← Backup do index.html original
│
├── js/
│   ├── navbar.js           ← Novo: componente de navegação compartilhado
│   ├── storage.js          ← Novo: sistema de armazenamento IndexedDB
│   ├── app.js              ← Mantido (análise)
│   ├── training.js         ← Mantido (treinamento)
│   └── species-info.js     ← Mantido (busca de informações)
│
└── docs/
    └── REDESIGN_MULTI_PAGE.md  ← Este documento
```

---

## 🎯 Páginas Criadas/Modificadas

### 1. **index.html** - Landing Page ✨ NOVA

**Objetivo**: Página inicial moderna que apresenta o sistema

**Seções**:
- 🎭 **Hero Section**: Banner com call-to-action e mockup visual
- 📊 **Stats**: Métricas de destaque (95%+ precisão, <2s análise, 100% offline)
- 🔥 **Features**: Grid com 6 recursos principais
- 📖 **Como Funciona**: Fluxo de trabalho em 4 etapas
- 💻 **Tech Stack**: Tecnologias utilizadas
- 🦶 **Footer**: Links rápidos e recursos

**Design**:
- Gradientes emerald/teal
- Blobs animados no background
- Cards com hover effect (translateY + shadow)
- Ícones SVG em todos os elementos
- Totalmente responsivo

### 2. **analyze.html** - Análise de Vocalização 🎙️ RENOMEADA

**Anterior**: `index.html` (funcionalidade principal)  
**Atual**: `analyze.html` (página dedicada)

**Modificações**:
- ✅ Navbar integrado
- ✅ Header redesenhado (emerald-50/teal-50)
- ✅ Título atualizado: "Análise de Vocalização"
- ✅ Mantém todas funcionalidades (upload, gravação, análise)

### 3. **train.html** - Treinamento 🧠 ATUALIZADA

**Modificações**:
- ✅ Navbar integrado
- ✅ Header redesenhado
- ✅ Mantém funcionalidades completas de treinamento
- ✅ Gráficos e métricas preservados

### 4. **species.html** - Gerenciamento de Espécies 🐸 NOVA

**Funcionalidades**:
- 📋 **Tabela de Espécies**: Lista completa com busca e filtros
- ➕ **CRUD Completo**: Criar, ler, atualizar, deletar
- 🔍 **Busca Automática**: Integração com GBIF/Wikipedia
- 📊 **Filtros**: Por status (completas/incompletas)
- 📤 **Importar/Exportar**: JSON e CSV

**Campos do Formulário**:
- Nome científico *
- Nome comum
- Taxonomia (Família, Ordem, Classe, Filo)
- Descrição
- Status de conservação (LC, VU, EN, CR, etc.)
- URL da imagem

**Integrações**:
- ✅ `storage.js` para IndexedDB
- ✅ `species-info.js` para busca automática
- ✅ Validação de formulário
- ✅ Notificações em tempo real

### 5. **settings.html** - Configurações ⚙️ NOVA

**Seções**:

#### 🧠 Configurações do Modelo
- Threshold de confiança (slider 0-1)
- Batch size (16/32/64/128)
- Número de épocas (1-200)

#### 💾 Gerenciamento de Dados
- **Exportar Todos os Dados**: Backup completo JSON
- **Importar Dados**: Restaurar de backup
- **Exportar CSV**: Compatível com Excel/Python/R
- **Limpar Dados**: Reset completo (⚠️ irreversível)

#### 📊 Informações de Armazenamento
- Contador de espécies
- Contador de áudios
- Contador de modelos
- Contador de análises

#### 🎨 Preferências
- Auto-salvar (toggle)
- Notificações (toggle)

---

## 🧩 Componentes Novos

### **navbar.js** - Sistema de Navegação

**Classe**: `Navbar`

**Recursos**:
- ✅ Auto-detecção de página atual
- ✅ Destaque de item ativo
- ✅ Menu mobile responsivo
- ✅ Animações suaves
- ✅ Ícones SVG para cada página

**Menu**:
```
🏠 Início       → index.html
🎙️ Análise      → analyze.html
🧠 Treinamento  → train.html
🐸 Espécies     → species.html
⚙️ Configurações → settings.html
```

**Inicialização**:
```javascript
import { Navbar } from './js/navbar.js';

const navbar = new Navbar();
navbar.mount();
```

### **storage.js** - Sistema de Armazenamento

**Tecnologias**:
- 💾 **localStorage**: Configurações e cache leve
- 🗄️ **IndexedDB**: Dados grandes (áudios, modelos, espécies)

**Object Stores**:
1. **species**: Banco de espécies
2. **audios**: Arquivos de áudio
3. **models**: Modelos treinados
4. **analyses**: Histórico de análises

**Métodos Principais**:

```javascript
import { storage } from './js/storage.js';

// Configurações
storage.saveSettings({ theme: 'light', autoSave: true });
const settings = storage.getSettings();

// Espécies
await storage.addSpecies({ scientificName: 'Boana faber', ... });
const species = await storage.getAllSpecies();
await storage.updateSpecies(id, { commonName: 'Sapo-ferreiro' });
await storage.deleteSpecies(id);

// Modelos
await storage.saveModel({ name: 'modelo_v1', data: blob });
const models = await storage.getAllModels();

// Análises
await storage.saveAnalysis({ audioId: 1, predictions: [...] });
const history = await storage.getAnalysisHistory(50);

// Import/Export
const backup = await storage.exportAllData();
await storage.importData(backup);
await storage.clearAllData();
```

---

## 🎨 Design System

### Paleta de Cores

```javascript
primary: emerald (Tailwind)
  - emerald-50  → backgrounds suaves
  - emerald-500 → botões e destaques
  - emerald-600 → gradientes

secondary: teal (Tailwind)
  - teal-50  → backgrounds
  - teal-600 → gradientes
```

### Componentes Reutilizáveis

#### Card com Hover
```html
<div class="card-hover bg-white p-8 rounded-2xl border-2 border-emerald-100">
  <!-- Conteúdo -->
</div>
```

```css
.card-hover {
    transition: all 0.3s ease;
}
.card-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
```

#### Botão Primário
```html
<button class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
  Ação
</button>
```

#### Gradient Text
```html
<h1 class="gradient-text">Texto com Gradiente</h1>
```

```css
.gradient-text {
    background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
```

---

## 🔄 Fluxo de Navegação

```
┌──────────────┐
│  index.html  │  Landing Page
│   (Início)   │
└──────┬───────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌──────────────┐
│analyze.html │    │  train.html  │
│  (Análise)  │    │(Treinamento) │
└─────────────┘    └──────────────┘
       │                  │
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│species.html  │   │settings.html │
│ (Espécies)   │   │(Configurações)│
└──────────────┘   └──────────────┘
       │                  │
       └─────────┬────────┘
                 │
                 ▼
           [Storage Layer]
        (IndexedDB + localStorage)
```

---

## 📱 Responsividade

### Breakpoints (Tailwind)

- **Mobile**: < 640px
  - Menu hamburger
  - Layout de coluna única
  - Cards empilhados

- **Tablet**: 640px - 1024px
  - Menu expandido
  - Grid 2 colunas

- **Desktop**: > 1024px
  - Menu completo
  - Grid 3-4 colunas
  - Sidebars visíveis

### Exemplos de Classes Responsivas

```html
<!-- Grid responsivo -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- Texto responsivo -->
<h1 class="text-3xl md:text-4xl lg:text-5xl">

<!-- Espaçamento responsivo -->
<div class="px-4 sm:px-6 lg:px-8">

<!-- Visibilidade condicional -->
<div class="hidden md:block">Visível apenas em tablet+</div>
<div class="md:hidden">Visível apenas em mobile</div>
```

---

## 🚀 Como Usar

### 1. Iniciar o Sistema

Abra `index.html` no navegador (pode usar Live Server do VS Code)

### 2. Navegar Entre Páginas

Use o menu de navegação superior para acessar:
- 🏠 **Início**: Apresentação do sistema
- 🎙️ **Análise**: Upload/gravação de áudios
- 🧠 **Treinamento**: Treinar modelos CNN
- 🐸 **Espécies**: Gerenciar banco de dados
- ⚙️ **Configurações**: Ajustes e exportações

### 3. Cadastrar Espécies

1. Vá em **Espécies** → **Nova Espécie**
2. Digite o nome científico
3. Clique em **"Buscar informações automaticamente"**
4. Revise e complete os dados
5. Salvar

### 4. Treinar Modelo

1. Cadastre espécies primeiro
2. Vá em **Treinamento**
3. Adicione exemplos de áudio para cada espécie (5+ arquivos)
4. Configure épocas/batch size
5. Clique em **Treinar Modelo**

### 5. Analisar Áudio

1. Vá em **Análise**
2. Grave ou faça upload de áudio
3. Clique em **Analisar Vocalização**
4. Veja resultados com confiança
5. Clique em **Buscar Info** para detalhes da espécie

### 6. Exportar Dados

1. Vá em **Configurações**
2. Clique em **Exportar Todos os Dados** (JSON) ou **Exportar CSV**
3. Arquivo será baixado automaticamente

---

## 🔧 Configuração Avançada

### Ajustar Threshold

1. **Configurações** → **Threshold de Confiança**
2. Arraste o slider (0.0 - 1.0)
3. Valores menores: mais resultados, menos precisão
4. Valores maiores: menos resultados, mais precisão
5. Recomendado: **0.70 - 0.80**

### Otimizar Treinamento

1. **Configurações** → **Batch Size**
   - 16: Mais lento, menos memória
   - 32: Balanceado (padrão)
   - 64/128: Mais rápido, mais memória

2. **Configurações** → **Épocas**
   - 20-30: Teste rápido
   - 50-100: Produção
   - 100+: Fine-tuning

### Limpar Cache

```javascript
// No console do navegador
localStorage.clear();
indexedDB.deleteDatabase('BioAcusticDB');
location.reload();
```

---

## 🐛 Troubleshooting

### Navbar não aparece

```javascript
// Verifique se navbar.js está importado
import { Navbar } from './js/navbar.js';

// Certifique-se que o container existe
<div id="navbar-container"></div>
```

### Dados não salvam

1. Verifique se IndexedDB está habilitado no navegador
2. Teste em modo normal (não privado/anônimo)
3. Limpe cache e recarregue

### Erro ao buscar espécies

1. Verifique conexão de internet (APIs externas)
2. Nome científico deve estar correto
3. Tente novamente após alguns segundos

---

## 📊 Estatísticas do Projeto

- **5 páginas** HTML criadas/modificadas
- **2 novos módulos** JS (navbar.js, storage.js)
- **4 Object Stores** IndexedDB
- **100% responsivo** (mobile, tablet, desktop)
- **Zero dependências** novas (usa Tailwind via CDN)
- **Offline-first** (exceto busca de APIs)

---

## 🎓 Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Tailwind CSS** | 3.x | Estilização |
| **TensorFlow.js** | 4.22.0 | Deep Learning |
| **WaveSurfer.js** | 7.x | Visualização de áudio |
| **Chart.js** | 4.x | Gráficos de treinamento |
| **IndexedDB** | Native | Armazenamento local |
| **GBIF API** | - | Dados de biodiversidade |
| **Wikipedia API** | - | Descrições e imagens |

---

## 🔮 Próximos Passos

### Melhorias Futuras

- [ ] Sistema de autenticação (multi-usuário)
- [ ] Sincronização em nuvem
- [ ] PWA (Progressive Web App)
- [ ] Dark mode
- [ ] Internacionalização (i18n)
- [ ] Gráficos de distribuição de espécies
- [ ] Mapa interativo com ocorrências
- [ ] Integração com iNaturalist
- [ ] Análise em lote (múltiplos áudios)
- [ ] Comparação de modelos

---

## 📝 Changelog

### Versão 2.0.0 (Novembro 2025)

#### Added ✨
- Nova landing page moderna (index.html)
- Página de gerenciamento de espécies (species.html)
- Página de configurações e exportações (settings.html)
- Componente de navegação compartilhado (navbar.js)
- Sistema de armazenamento IndexedDB (storage.js)
- CRUD completo de espécies
- Import/Export de dados (JSON e CSV)
- Sistema de filtros e busca
- Notificações em tempo real
- Contadores de estatísticas

#### Changed 🔄
- index.html renomeado para analyze.html
- Headers redesenhados (emerald/teal theme)
- Menu de navegação unificado
- Layout responsivo aprimorado
- Arquitetura multi-páginas

#### Fixed 🐛
- Navegação entre páginas
- Cache de dados compartilhados
- Estado persistente entre sessões

---

## 👨‍💻 Contribuindo

Para contribuir com melhorias:

1. Faça fork do repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é open-source para fins educacionais e de pesquisa em biodiversidade.

---

**Desenvolvido para BioAcustic** 🐸  
*Sistema de Classificação de Anfíbios por Vocalização usando Inteligência Artificial*

**Versão**: 2.0.0  
**Data**: Novembro 2025  
**Arquitetura**: Multi-Page Application (MPA)  
**Status**: ✅ Produção
