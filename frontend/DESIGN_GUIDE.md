# 🎨 Guia de Estilo - BioAcustic Design System

## Visão Geral

O BioAcustic utiliza um design system moderno e consistente, focado em usabilidade, acessibilidade e estética profissional para aplicações científicas.

## 🎨 Paleta de Cores

### Cores Primárias (Verde Natural)
- **Primary 500**: `#22c55e` - Cor principal, representa natureza e vida
- **Primary 600**: `#16a34a` - Variação mais escura para hover
- **Primary 50**: `#f0fdf4` - Fundos suaves

### Cores Secundárias (Azul Tecnologia)
- **Secondary 500**: `#3b82f6` - Tecnologia e confiança
- **Secondary 600**: `#2563eb` - Hover states

### Cores de Acento
- **Accent Amber**: `#f59e0b` - Alertas e avisos
- **Accent Emerald**: `#10b981` - Sucesso
- **Accent Purple**: `#8b5cf6` - Treinamento e features especiais

### Cores Neutras
- **Gray 50-900**: Escala completa de cinzas para textos e fundos

### Cores Semânticas
- **Success**: `#10b981` - Operações bem-sucedidas
- **Warning**: `#f59e0b` - Avisos
- **Error**: `#ef4444` - Erros
- **Info**: `#3b82f6` - Informações

## 📝 Tipografia

### Fonte Principal
**Inter** - Fonte moderna, limpa e altamente legível
- Display/Títulos: **Inter 700-800** (Bold/ExtraBold)
- Corpo: **Inter 400-600** (Regular/SemiBold)
- Monospace: **Fira Code** para código

### Hierarquia de Tamanhos
```
h1: 3rem (48px)    - Títulos principais
h2: 2.25rem (36px) - Subtítulos de seção
h3: 1.875rem (30px)- Títulos de card
h4: 1.5rem (24px)  - Subtítulos
h5: 1.25rem (20px) - Títulos menores
Body: 1rem (16px)  - Texto padrão
Small: 0.875rem (14px) - Textos secundários
```

## 🧩 Componentes

### Botões

#### Botão Primário
```html
<button class="btn btn-primary">
    🧠 Ação Principal
</button>
```
- Gradiente verde
- Sombra suave
- Hover: levanta e aumenta sombra

#### Botão Secundário
```html
<button class="btn btn-secondary">
    📄 Ação Secundária
</button>
```
- Fundo branco
- Borda cinza
- Hover: fundo cinza claro

#### Botão Ghost
```html
<button class="btn btn-ghost">
    ℹ️ Ação Terciária
</button>
```
- Transparente
- Hover: fundo cinza claro

#### Tamanhos
- `.btn-sm` - Pequeno
- `.btn` - Padrão
- `.btn-lg` - Grande

### Cards

#### Card Padrão
```html
<div class="card">
    <div class="card-header">
        <h3>Título do Card</h3>
    </div>
    <div class="card-body">
        Conteúdo
    </div>
    <div class="card-footer">
        Rodapé (opcional)
    </div>
</div>
```

- Fundo branco
- Borda sutil
- Sombra suave
- Hover: aumenta sombra

### Badges

```html
<span class="badge badge-success">✅ Sucesso</span>
<span class="badge badge-warning">⚠️ Aviso</span>
<span class="badge badge-error">❌ Erro</span>
<span class="badge badge-info">ℹ️ Info</span>
```

### Inputs

```html
<input type="text" class="input" placeholder="Digite algo...">
```

- Borda cinza
- Focus: borda verde + sombra verde
- Padding confortável

### Alertas

```html
<div class="alert alert-success">
    ✅ Operação concluída com sucesso!
</div>

<div class="alert alert-warning">
    ⚠️ Atenção: verifique os dados
</div>

<div class="alert alert-error">
    ❌ Erro ao processar
</div>

<div class="alert alert-info">
    ℹ️ Informação adicional
</div>
```

### Progress Bar

```html
<div class="progress">
    <div class="progress-bar" style="width: 75%"></div>
</div>
```

- Gradiente verde
- Transição suave
- Altura: 8px

### Loading Spinner

```html
<span class="spinner"></span>
```

- Animação de rotação
- Cor atual do contexto

## 🎭 Animações

### Fade In
```css
.fade-in {
    animation: fadeIn 0.3s ease-out;
}
```

### Scale In
```css
.scale-in {
    animation: scaleIn 0.2s ease-out;
}
```

### Pulse
```css
.pulse {
    animation: pulse 2s ease-in-out infinite;
}
```

## 📐 Espaçamento

Sistema de espaçamento consistente:

```
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
--space-3xl: 64px
```

### Uso
```html
<div style="margin-bottom: var(--space-lg);">...</div>
<div style="padding: var(--space-xl);">...</div>
```

## 🔲 Border Radius

```
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-2xl: 24px
--radius-full: 9999px (círculo)
```

## 🌓 Sombras

```
--shadow-sm: Sombra sutil
--shadow-md: Sombra média
--shadow-lg: Sombra grande
--shadow-xl: Sombra extra grande
--shadow-2xl: Sombra massiva
```

## 📱 Responsividade

### Breakpoints
```
Mobile: < 768px
Tablet: 768px - 1024px
Desktop: > 1024px
```

### Grid Responsivo
```html
<div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-xl);">
    <!-- Conteúdo -->
</div>
```

## ♿ Acessibilidade

### Cores
- Contraste mínimo: 4.5:1 para texto normal
- Contraste mínimo: 3:1 para texto grande

### Interatividade
- Todos os elementos interativos têm estados de hover e focus
- Focus visível com outline ou sombra

### Semântica
- HTML semântico (header, nav, main, section, article, footer)
- ARIA labels quando necessário

## 🚀 Boas Práticas

### 1. Consistência
- Use sempre as variáveis CSS do design system
- Não crie cores ou tamanhos personalizados

### 2. Hierarquia Visual
- Use tamanhos e pesos de fonte apropriados
- Espaçamento adequado entre elementos

### 3. Feedback do Usuário
- Animações e transições suaves
- Estados claros (loading, success, error)
- Mensagens descritivas

### 4. Performance
- Animações em transform e opacity (GPU accelerated)
- Lazy loading de imagens
- Minificação de assets

## 🎨 Exemplos de Uso

### Hero Section
```html
<section class="hero-gradient" style="padding: var(--space-3xl) 0;">
    <div class="container text-center">
        <h2 style="font-size: 3rem; font-weight: 800; color: white;">
            Título Impactante
        </h2>
        <p style="font-size: 1.25rem; color: rgba(255,255,255,0.95);">
            Subtítulo descritivo
        </p>
    </div>
</section>
```

### Upload Zone
```html
<div class="upload-zone" id="dropZone">
    <input type="file" id="fileInput" style="display: none;">
    <div style="font-size: 3rem;">📁</div>
    <p style="font-weight: 600;">Clique ou arraste arquivos</p>
    <p style="font-size: 0.875rem; color: var(--gray-500);">
        Formatos aceitos
    </p>
</div>
```

### Result Card
```html
<div class="result-card">
    <div class="flex items-center justify-between">
        <div>
            <h4 style="font-weight: 700;">Nome da Espécie</h4>
            <p style="font-size: 0.875rem; color: var(--gray-600);">
                Nome científico
            </p>
        </div>
        <span class="badge badge-success">95%</span>
    </div>
    <div class="confidence-bar-container">
        <div class="confidence-bar" style="width: 95%"></div>
    </div>
</div>
```

## 📚 Recursos

- [Inter Font](https://fonts.google.com/specimen/Inter)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

## 🔄 Versionamento

**Versão atual**: 1.0.0  
**Última atualização**: Novembro 2025

---

**Desenvolvido para o Projeto BioAcustic** 🐸
