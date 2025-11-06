# 🔍 Busca Automática de Informações de Espécies

## Visão Geral

O BioAcustic agora possui um sistema inteligente de busca automática de informações científicas sobre espécies detectadas. Quando um áudio é analisado e uma espécie é identificada, você pode clicar no botão **"Buscar Info"** para obter informações detalhadas de múltiplas fontes confiáveis.

## 🌐 Fontes de Dados

O sistema integra **3 APIs públicas** de biodiversidade:

### 1. **GBIF** (Global Biodiversity Information Facility)
- **URL**: https://www.gbif.org/
- **Dados fornecidos**:
  - ✅ Taxonomia completa (Reino, Filo, Classe, Ordem, Família, Gênero)
  - ✅ Nomes vernaculares (nomes comuns em português e inglês)
  - ✅ Status de conservação (IUCN)
  - ✅ Habitats
  - ✅ Link para página da espécie no GBIF

### 2. **Wikipedia** (PT e EN)
- **URL**: https://pt.wikipedia.org/ e https://en.wikipedia.org/
- **Dados fornecidos**:
  - ✅ Descrição detalhada da espécie
  - ✅ Imagem/foto da espécie
  - ✅ Link para o artigo completo

### 3. **Wikidata**
- **URL**: https://www.wikidata.org/
- **Dados fornecidos**:
  - ✅ Informações estruturadas adicionais
  - ✅ Status de conservação IUCN
  - ✅ Classificação taxonômica

## 🚀 Como Usar

1. **Analise um áudio**: Faça upload ou grave um áudio e clique em "Analisar Vocalização"
2. **Aguarde os resultados**: O sistema mostrará as espécies detectadas
3. **Busque informações**: No card "Informações da Espécie", clique em **"Buscar Info"**
4. **Explore os dados**: Visualize taxonomia, descrição, imagem, status de conservação e fontes

## 📊 Informações Exibidas

### 🏷️ Nome Científico e Comuns
- Nome científico completo (ex: *Boana faber*)
- Lista de nomes populares em português e inglês

### 🌳 Taxonomia Completa
- Reino (Kingdom)
- Filo (Phylum)
- Classe (Class)
- Ordem (Order)
- Família (Family)
- Gênero (Genus)

### 📖 Descrição
- Resumo extraído da Wikipedia (300 caracteres)
- Informações sobre habitat, comportamento, características

### 🖼️ Imagem
- Foto da espécie (quando disponível na Wikipedia)

### ⚠️ Status de Conservação
- Classificação IUCN (LC, VU, EN, CR, etc.)
- Informações sobre ameaças

### 🔗 Fontes
- Links diretos para:
  - Página no GBIF
  - Artigo na Wikipedia
  - Item no Wikidata

## 🔧 Arquitetura Técnica

### Arquivos Criados/Modificados

1. **`js/species-info.js`** (NOVO)
   - Classe `SpeciesInfoFetcher`
   - Métodos para buscar de cada API
   - Sistema de cache para evitar requisições duplicadas
   - Agregação inteligente de dados de múltiplas fontes

2. **`js/app.js`** (MODIFICADO)
   - Import do `SpeciesInfoFetcher`
   - Event listener para botão "Buscar Info"
   - Método `fetchAndDisplaySpeciesInfo()`
   - Método `displaySpeciesInfo(info)`

3. **`index.html`** (MODIFICADO)
   - Botão "Buscar Info" no header do card
   - Loading state para feedback visual
   - Container para exibição das informações

### Fluxo de Dados

```
┌─────────────────┐
│ Usuário clica   │
│ "Buscar Info"   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ app.js                      │
│ fetchAndDisplaySpeciesInfo()│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ species-info.js             │
│ SpeciesInfoFetcher          │
└────────┬────────────────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌─────────────┐      ┌─────────────────┐
│ GBIF API    │      │ Wikipedia API   │
│ Taxonomia   │      │ Descrição +     │
│ Nomes       │      │ Imagem          │
└─────┬───────┘      └────────┬────────┘
      │                       │
      └───────────┬───────────┘
                  │
                  ▼
         ┌────────────────┐
         │ Wikidata API   │
         │ Info adicional │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │ Agregação de   │
         │ Dados          │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │ displaySpecies │
         │ Info()         │
         │ Renderiza UI   │
         └────────────────┘
```

## 🎨 Componentes da UI

### Botão "Buscar Info"
```html
<button id="fetchSpeciesInfoBtn" 
        class="flex items-center gap-1.5 bg-white hover:bg-primary-100...">
    🔍 <span>Buscar Info</span>
</button>
```

### Loading State
```html
<div id="speciesInfoLoading" class="hidden">
    <div class="animate-spin rounded-full..."></div>
    <p>Buscando informações científicas...</p>
</div>
```

### Cards de Informação
- **Card de Taxonomia**: Fundo branco, borda primary
- **Card de Descrição**: Fundo branco, borda secondary
- **Card de Conservação**: Fundo amber, borda amber (destaque)
- **Links de Fontes**: Badges com links externos

## 🚨 Tratamento de Erros

### Cenários Cobertos:
1. **Nenhuma espécie detectada**: Aviso para analisar áudio primeiro
2. **API indisponível**: Fallback entre APIs (PT → EN Wikipedia)
3. **Espécie não encontrada**: Mensagem amigável de erro
4. **Timeout de rede**: Tratamento com try/catch
5. **Dados incompletos**: Exibe apenas o que foi encontrado

### Mensagens de Erro:
- ⚠️ "Nenhuma espécie foi detectada ainda"
- ❌ "Não foi possível buscar informações"
- 🔄 "Tente novamente mais tarde"

## 💾 Sistema de Cache

O sistema implementa um **cache em memória** para evitar requisições duplicadas:

```javascript
this.cache = new Map();

// Armazena resultado
this.cache.set(scientificName, aggregatedData);

// Recupera do cache
if (this.cache.has(scientificName)) {
    return this.cache.get(scientificName);
}
```

**Benefícios**:
- ⚡ Resposta instantânea para espécies já buscadas
- 🌐 Reduz carga nas APIs públicas
- 💰 Economiza dados do usuário

## 🔒 Segurança e Privacidade

- ✅ **CORS habilitado**: APIs públicas permitem requisições do navegador
- ✅ **Sem autenticação**: Não requer chaves API
- ✅ **Links externos seguros**: `target="_blank" rel="noopener noreferrer"`
- ✅ **Validação de dados**: Tratamento de respostas malformadas
- ✅ **Sem armazenamento persistente**: Cache apenas na sessão

## 🌍 Suporte Multilíngue

- 🇧🇷 **Português**: Prioridade para Wikipedia PT e nomes vernaculares
- 🇺🇸 **Inglês**: Fallback automático se PT não disponível
- 🌐 **Internacional**: GBIF e Wikidata fornecem dados multilíngues

## 📈 Performance

### Otimizações Implementadas:
1. **Requisições paralelas**: `Promise.allSettled()` busca de 3 APIs simultaneamente
2. **Cache em memória**: Evita requisições repetidas
3. **Lazy loading**: Informações só são buscadas quando solicitadas
4. **Timeout implícito**: Navegadores cancelam requisições longas automaticamente

### Tempo Médio de Resposta:
- 🟢 Com cache: **< 50ms**
- 🟡 Primeira busca: **1-3 segundos**
- 🔴 APIs lentas: **até 5 segundos** (raro)

## 🐛 Debugging

### Logs no Console:
```javascript
console.log('🔍 Buscando informações para: Boana faber');
console.log('✅ Retornando do cache');
console.warn('⚠️ GBIF fetch error:', error);
```

### Ferramentas de Desenvolvedor:
1. Abra DevTools (F12)
2. Vá para **Network** tab
3. Filtre por "gbif", "wikipedia", "wikidata"
4. Verifique status das requisições

## 🎓 Exemplos de Uso

### Exemplo 1: Busca Completa
```javascript
const fetcher = new SpeciesInfoFetcher();
const info = await fetcher.fetchSpeciesInfo('Boana faber');
console.log(info);
/*
{
    scientificName: "Boana faber",
    commonNames: ["Sapo-ferreiro", "Smith frog"],
    taxonomy: { kingdom: "Animalia", ... },
    description: "Boana faber é uma espécie...",
    conservation: "LC - Least Concern",
    image: "https://upload.wikimedia.org/...",
    sources: [...]
}
*/
```

### Exemplo 2: Cache
```javascript
// Primeira busca (API call)
const info1 = await fetcher.fetchSpeciesInfo('Boana faber'); // ~2s

// Segunda busca (cache)
const info2 = await fetcher.fetchSpeciesInfo('Boana faber'); // <50ms
```

### Exemplo 3: Limpar Cache
```javascript
fetcher.clearCache(); // Remove todas as entradas do cache
```

## 🔮 Melhorias Futuras

### Planejadas:
- [ ] **iNaturalist API**: Mais fotos e observações
- [ ] **AmphibiaWeb**: Banco específico de anfíbios
- [ ] **Cache persistente**: LocalStorage para manter entre sessões
- [ ] **Traduções**: i18n completo para múltiplos idiomas
- [ ] **Mapa de distribuição**: Visualizar onde a espécie é encontrada
- [ ] **Áudio de referência**: Links para gravações da espécie

### Possíveis Melhorias:
- [ ] **Gráficos**: Visualizar status de conservação ao longo do tempo
- [ ] **Comparação**: Comparar múltiplas espécies lado a lado
- [ ] **Exportar**: Salvar informações em PDF
- [ ] **Favoritos**: Marcar espécies de interesse

## 📚 Referências

- **GBIF API Docs**: https://www.gbif.org/developer/summary
- **Wikipedia API Docs**: https://www.mediawiki.org/wiki/API:Main_page
- **Wikidata API Docs**: https://www.wikidata.org/wiki/Wikidata:Data_access

## 📄 Licença

Esta funcionalidade utiliza apenas APIs públicas e gratuitas. Todos os dados são propriedade de suas respectivas fontes (GBIF, Wikipedia, Wikidata) e estão sujeitos às suas licenças:

- **GBIF**: CC0 (domínio público)
- **Wikipedia**: CC BY-SA 3.0
- **Wikidata**: CC0 (domínio público)

---

**Desenvolvido para BioAcustic** 🐸  
*Sistema de Classificação de Anfíbios por Vocalização*
