# 🔧 Troubleshooting - Modelo Não Salvo/Encontrado

## ✅ Verificação Rápida

### 1. Abra o Console do Navegador (F12)

Procure por estas mensagens:

#### ✅ Modelo Salvo Corretamente
```
💾 Salvando modelo...
✅ Modelo salvo com sucesso: bioacustic-browser-model
💾 Metadata salva no localStorage
```

#### ✅ Modelo Carregado Corretamente
```
🔍 Verificando modelo treinado no navegador...
✅ Modelo do navegador carregado com sucesso!
   Classes: Leptodactylus cunicularius, Leptodactylus furnarius, ...
   Treinado em: 03/11/2025 14:30:15
```

#### ❌ Problema: Modelo Não Encontrado
```
ℹ️  Nenhum modelo treinado no navegador encontrado
```

---

## 🐛 Problemas Comuns e Soluções

### Problema 1: "Nenhum modelo salvo"

**Causa**: O modelo não foi salvo após o treinamento

**Solução**:
1. Treine o modelo novamente em `train.html`
2. Após o treinamento terminar, **o modelo é salvo automaticamente**
3. Veja a mensagem: `💾 Modelo salvo automaticamente!`
4. **OU** clique manualmente no botão "💾 Salvar Modelo"

**Verificar**:
```javascript
// Abra o Console (F12) e execute:
// Verificar IndexedDB
const dbNames = await indexedDB.databases();
console.log('Databases:', dbNames);

// Verificar localStorage
console.log('Metadata:', localStorage.getItem('bioacustic-browser-model-metadata'));
```

---

### Problema 2: Modelo salvo mas não carrega

**Causa**: Problema com IndexedDB ou localStorage

**Solução**:

#### Opção A: Verificar Armazenamento do Navegador
1. Abra DevTools (F12)
2. Vá em **Application** (Chrome) ou **Storage** (Firefox)
3. Veja **IndexedDB** → Procure `tensorflowjs`
4. Veja **Local Storage** → Procure `bioacustic-browser-model-metadata`

#### Opção B: Limpar e Retreinar
```javascript
// Console (F12)
// Limpar completamente
localStorage.clear();
await tf.io.removeModel('indexeddb://bioacustic-browser-model');

// Recarregar página e treinar novamente
location.reload();
```

---

### Problema 3: Erro ao salvar (contexto WebGL perdido)

**Causa**: Muitos dados (> 150 amostras) esgotaram memória GPU

**Solução**:
1. Recarregue a página (F5)
2. Use **menos amostras** por vez:
   - Recomendado: 80-100 amostras totais
   - Exemplo: 5 espécies × 16 réplicas = 80 ✅
3. Ou reduza réplicas por arquivo (10-15 em vez de 20)

**Verificar memória antes de treinar**:
```javascript
// Console (F12)
console.log('Memória GPU:', tf.memory());
// Se numTensors > 500, recarregue a página
```

---

### Problema 4: Botão "Salvar Modelo" desabilitado

**Causa**: Modelo ainda não foi treinado nesta sessão

**Solução**:
- O botão só é habilitado **após** treinar
- Se você já treinou antes, o modelo está salvo automaticamente
- Clique em "🧪 Testar Modelo" para abrir a página principal

---

### Problema 5: Página principal não detecta modelo

**Causa**: Ordem de carregamento ou cache

**Solução**:
1. Recarregue a página principal (F5 ou Ctrl+Shift+R)
2. Abra o Console e veja se aparece:
   ```
   🔍 Verificando modelo treinado no navegador...
   ✅ Modelo do navegador carregado com sucesso!
   ```
3. Se não aparecer, volte para `train.html` e salve novamente

---

## 🔍 Diagnóstico Completo

Execute este script no Console (F12) em **train.html**:

```javascript
console.log('='.repeat(60));
console.log('🔍 DIAGNÓSTICO DO MODELO');
console.log('='.repeat(60));

// 1. Verificar localStorage
const metadata = localStorage.getItem('bioacustic-browser-model-metadata');
if (metadata) {
    console.log('✅ Metadata encontrado no localStorage');
    console.log(JSON.parse(metadata));
} else {
    console.log('❌ Metadata NÃO encontrado');
}

// 2. Verificar IndexedDB
const dbRequest = indexedDB.open('tensorflowjs');
dbRequest.onsuccess = () => {
    console.log('✅ IndexedDB acessível');
    
    const db = dbRequest.result;
    const stores = Array.from(db.objectStoreNames);
    console.log('Object Stores:', stores);
    
    if (stores.length > 0) {
        const tx = db.transaction(stores[0], 'readonly');
        const store = tx.objectStore(stores[0]);
        const getAllRequest = store.getAllKeys();
        
        getAllRequest.onsuccess = () => {
            console.log('Chaves no IndexedDB:', getAllRequest.result);
        };
    }
};

dbRequest.onerror = () => {
    console.log('❌ Erro ao acessar IndexedDB');
};

// 3. Verificar TensorFlow.js
console.log('TensorFlow.js:', tf.version);
console.log('Backend:', tf.getBackend());
console.log('Memória GPU:', tf.memory());

console.log('='.repeat(60));
```

---

## 💾 Exportar/Importar Modelo Manualmente

Se o salvamento automático falhar, você pode exportar manualmente:

### Exportar Modelo (train.html)

```javascript
// Console (F12) após treinar
const model = trainer.model;

// Salvar como download
await model.save('downloads://meu-modelo');

// Também exportar metadata
const metadata = {
    numClasses: trainer.classNames.length,
    classNames: trainer.classNames,
    trainedAt: new Date().toISOString()
};
const blob = new Blob([JSON.stringify(metadata)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'metadata.json';
a.click();
```

### Importar Modelo (index.html)

```javascript
// Console (F12)
import { ModelManager } from './js/model.js';
const manager = new ModelManager();

// Carregar do arquivo local
const model = await tf.loadLayersModel('file://path/to/model.json');
manager.model = model;
manager.classNames = ['Espécie 1', 'Espécie 2', ...];
manager.isLoaded = true;

console.log('✅ Modelo carregado manualmente');
```

---

## 🎯 Checklist Final

Antes de relatar problema, verifique:

- [ ] Treinamento completou com sucesso (viu "✅ Treinamento concluído!")
- [ ] Viu mensagem "💾 Modelo salvo automaticamente!"
- [ ] Console não mostra erros em vermelho
- [ ] Recarregou a página principal após treinar
- [ ] Navegador suporta IndexedDB (Chrome, Firefox, Edge)
- [ ] Não está em aba anônima/privada (IndexedDB desabilitado)
- [ ] Tem espaço em disco (modelo ~10-50MB)

---

## 🆘 Ainda com Problema?

### Solução Garantida: Modo Manual

1. **Treine em train.html**
2. **Após treinar**, no Console (F12):
   ```javascript
   // Forçar salvamento
   await trainer.saveModel();
   console.log('✅ Modelo salvo!');
   ```
3. **Na página principal (index.html)**, no Console:
   ```javascript
   // Forçar recarga do modelo
   location.reload();
   ```
4. **Verifique** se aparece:
   ```
   ✅ Modelo do navegador carregado com sucesso!
   ```

---

## 📊 Informações do Sistema

Para reportar problema, inclua:

```javascript
// Console (F12)
console.log({
    userAgent: navigator.userAgent,
    tfVersion: tf.version.tfjs,
    backend: tf.getBackend(),
    memory: tf.memory(),
    localStorage: !!window.localStorage,
    indexedDB: !!window.indexedDB,
    modelMetadata: localStorage.getItem('bioacustic-browser-model-metadata')
});
```

---

## ✅ Funcionou?

Se o modelo foi salvo e carregado com sucesso, você verá:

### Em train.html:
- Banner verde "✅ Modelo Carregado"
- Espécies listadas em badges verdes
- Botões "💾 Salvar Modelo" e "🧪 Testar Modelo" habilitados

### Em index.html:
- Mensagem no console: "✅ Modelo do navegador carregado com sucesso!"
- Pode fazer upload de áudio e classificar
- Resultados aparecem com espécies treinadas

🎉 **Sucesso!** Agora o modelo está pronto para uso!
