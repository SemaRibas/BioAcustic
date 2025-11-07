# 🔥 Firebase - Biblioteca Compartilhada de Espécies

## 📋 Visão Geral

O sistema Firebase foi configurado para funcionar como uma **biblioteca compartilhada de espécies** entre todos os usuários do BioAcustic.

### ✅ O que É Sincronizado

- ✓ Nome científico
- ✓ Nome comum
- ✓ Taxonomia (família, ordem, classe, etc.)
- ✓ Descrição da espécie
- ✓ Status de conservação
- ✓ URL da imagem
- ✓ Contador de áudios (indicador, não os arquivos)

### ❌ O que NÃO É Sincronizado

- ✗ Arquivos de áudio (permanecem locais no IndexedDB)
- ✗ Dados de análises
- ✗ Modelos treinados
- ✗ Histórico de treinamento

## 🎯 Propósito

Criar uma biblioteca colaborativa onde todos os usuários podem:

1. **Compartilhar** informações detalhadas sobre espécies
2. **Importar** dados de espécies cadastradas por outros usuários
3. **Manter privacidade** dos áudios e modelos (ficam locais)
4. **Enriquecer** o banco de dados coletivamente

## 🔧 Configuração

### Credenciais Firebase

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBIueZNb1hPR2pwcrfPxFbwGIJoB9OIbNM",
  authDomain: "studio-2303145907-57188.firebaseapp.com",
  projectId: "studio-2303145907-57188",
  storageBucket: "studio-2303145907-57188.firebasestorage.app",
  messagingSenderId: "538093909283",
  appId: "1:538093909283:web:d6b2e884ef4fd1a3548896"
};
```

### Estrutura do Firestore

```
📦 Firestore Database
└── 📁 species (collection)
    ├── 📄 leptodactylus_camaquara (document)
    │   ├── scientificName: "Leptodactylus camaquara"
    │   ├── commonName: "Rã-assobiadora"
    │   ├── taxonomy: { family: "Leptodactylidae", ... }
    │   ├── description: "..."
    │   ├── conservation: "LC"
    │   ├── imageUrl: "https://..."
    │   ├── audioCount: 15
    │   ├── lastModified: Timestamp
    │   └── createdAt: "2025-11-06T..."
    │
    └── 📄 [outras espécies...]
```

## 🚀 Funcionalidades

### 1. 📤 Enviar para Nuvem

Sincroniza todas as espécies locais para o Firebase.

```javascript
// Uso programático
const result = await firebaseManager.syncAllSpeciesToCloud(storage);

// Resultado
{
  success: true,
  results: {
    success: 5,  // Espécies sincronizadas
    failed: 0,   // Falhas
    total: 5     // Total processado
  }
}
```

### 2. 📥 Baixar da Nuvem

Importa todas as espécies da biblioteca Firebase para o dispositivo local.

```javascript
// Uso programático
const result = await firebaseManager.importAllSpeciesFromCloud(storage);

// Comportamento
// - Adiciona novas espécies
// - Atualiza espécies existentes (preserva áudios locais)
// - Mescla informações (prioriza dados mais completos)
```

### 3. 📊 Estatísticas

Visualiza informações sobre a biblioteca compartilhada.

```javascript
const result = await firebaseManager.getLibraryStats();

// Retorna
{
  success: true,
  stats: {
    totalSpecies: 42,
    withImages: 38,
    withDescription: 40,
    withConservation: 42,
    families: 12,
    orders: 8
  }
}
```

## 🎨 Interface do Usuário

### Botão "Biblioteca"

Localizado no header da página de espécies, abre um menu dropdown com 3 opções:

1. **📤 Enviar para Nuvem**
   - Ícone: Upload
   - Cor: Azul
   - Ação: Sincroniza espécies locais → Firebase

2. **📥 Baixar da Nuvem**
   - Ícone: Download
   - Cor: Verde
   - Ação: Firebase → Espécies locais

3. **📊 Estatísticas**
   - Ícone: Gráfico
   - Cor: Roxo
   - Ação: Mostra dados da biblioteca

### Confirmações

Todas as operações pedem confirmação antes de executar:

```
🔄 Sincronizar com Firebase?

Isso enviará TODAS as suas espécies para a biblioteca compartilhada.
⚠️ Apenas informações das espécies serão enviadas (sem áudios).

Deseja continuar?
```

## 🔒 Segurança e Privacidade

### O que é Público

- ✅ Informações taxonômicas (dados científicos)
- ✅ Descrições e fotos (educacionais)
- ✅ Status de conservação (público por natureza)

### O que é Privado

- 🔒 Arquivos de áudio (permanecem no dispositivo)
- 🔒 Modelos de IA treinados (locais)
- 🔒 Histórico de análises (local)
- 🔒 Configurações pessoais (local)

## 💡 Casos de Uso

### Usuário 1: Pesquisador

1. Cadastra 20 espécies com fotos e descrições detalhadas
2. Clica em "Enviar para Nuvem"
3. Compartilha conhecimento com a comunidade

### Usuário 2: Estudante

1. Acessa o sistema pela primeira vez
2. Clica em "Baixar da Nuvem"
3. Recebe as 20 espécies do Pesquisador
4. Pode treinar modelos localmente com seus próprios áudios

### Usuário 3: Conservacionista

1. Importa biblioteca (20 espécies)
2. Adiciona 10 novas espécies ameaçadas
3. Envia para nuvem (agora 30 espécies disponíveis)
4. Todos se beneficiam

## 🛠️ API do Firebase Manager

### Métodos Disponíveis

```javascript
// Sincronizar uma espécie
await firebaseManager.syncSpeciesToCloud(species);

// Buscar uma espécie
await firebaseManager.getSpeciesFromCloud(scientificName);

// Buscar todas as espécies
await firebaseManager.getAllSpeciesFromCloud();

// Deletar espécie
await firebaseManager.deleteSpeciesFromCloud(scientificName);

// Importar espécie específica
await firebaseManager.importSpeciesFromCloud(scientificName, storage);

// Sincronizar todas
await firebaseManager.syncAllSpeciesToCloud(storage);

// Importar todas
await firebaseManager.importAllSpeciesFromCloud(storage);

// Estatísticas
await firebaseManager.getLibraryStats();

// Verificar conexão
firebaseManager.isConnected();
```

## 📝 Regras de Mesclagem

Quando uma espécie já existe localmente e é importada da nuvem:

1. **ID local é preservado** (mantém vínculos com áudios)
2. **Áudios locais são preservados** (não são afetados)
3. **Informações são mescladas**:
   - Prioriza dados não-vazios
   - Combina taxonomia (merge de objetos)
   - Mantém `audioCount` local (mais preciso)

```javascript
// Exemplo de mesclagem
const finalSpecies = {
    ...existing,                    // Dados locais base
    commonName: cloud || existing,   // Prioriza nuvem se existir
    taxonomy: { ...existing, ...cloud }, // Mescla objetos
    audioCount: existing.audioCount  // Mantém local
};
```

## ⚙️ Configuração do Firestore (Console Firebase)

### Índices Necessários

```
Collection: species
Fields:
  - scientificName (Ascending)
  - lastModified (Descending)
```

### Regras de Segurança

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /species/{speciesId} {
      // Todos podem ler
      allow read: if true;
      
      // Todos podem escrever (biblioteca colaborativa)
      allow write: if true;
      
      // Em produção, adicionar autenticação:
      // allow write: if request.auth != null;
    }
  }
}
```

## 🎓 Boas Práticas

### Para Usuários

1. ✅ **Sempre preencha dados completos** antes de sincronizar
2. ✅ **Baixe a biblioteca** antes de começar a cadastrar
3. ✅ **Envie para nuvem** após cadastrar novas espécies
4. ✅ **Verifique estatísticas** periodicamente

### Para Desenvolvedores

1. ✅ Sempre use `try-catch` nas operações Firebase
2. ✅ Mostre feedback visual (loading, sucesso, erro)
3. ✅ Peça confirmação antes de operações em lote
4. ✅ Sanitize IDs de documentos (remove caracteres especiais)
5. ✅ Use `serverTimestamp()` para timestamps

## 🐛 Troubleshooting

### Erro: "Permission Denied"

**Causa**: Regras de segurança muito restritivas  
**Solução**: Verifique regras no Console Firebase

### Erro: "Failed to fetch"

**Causa**: Sem conexão com internet  
**Solução**: Verificar conexão de rede

### Sincronização lenta

**Causa**: Muitas espécies (>100)  
**Solução**: Normal, aguardar conclusão

### Espécies duplicadas

**Causa**: Nome científico diferente (maiúsculas/minúsculas)  
**Solução**: Sistema normaliza automaticamente

## 📚 Recursos

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Queries](https://firebase.google.com/docs/firestore/query-data/queries)
- [Firebase Console](https://console.firebase.google.com/)

## 🤝 Contribuindo

Para expandir funcionalidades:

1. Adicione métodos em `firebase-config.js`
2. Exporte pelo singleton `firebaseManager`
3. Importe e use nas páginas
4. Adicione UI correspondente
5. Documente aqui

---

**Versão**: 1.0.0  
**Última Atualização**: 06/11/2025  
**Autor**: BioAcustic Team
