# 🎵 Áudios de Exemplo para Teste

## Onde Conseguir Áudios de Anfíbios

### 1. Xeno-canto (Recomendado) 🌟

**Site:** https://xeno-canto.org/

A maior base de dados de vocalizações de anfíbios do mundo!

**Como usar:**
1. Pesquise por espécie: https://xeno-canto.org/explore?query=Boana+faber
2. Ouça as gravações
3. Clique em "Download" para baixar
4. Use no BioAcustic!

**Espécies brasileiras populares:**
- **Boana faber**: https://xeno-canto.org/explore?query=Boana+faber
- **Boana albopunctata**: https://xeno-canto.org/explore?query=Boana+albopunctata
- **Scinax fuscomarginatus**: https://xeno-canto.org/explore?query=Scinax+fuscomarginatus
- **Dendropsophus minutus**: https://xeno-canto.org/explore?query=Dendropsophus+minutus
- **Leptodactylus fuscus**: https://xeno-canto.org/explore?query=Leptodactylus+fuscus
- **Physalaemus cuvieri**: https://xeno-canto.org/explore?query=Physalaemus+cuvieri
- **Rhinella ornata**: https://xeno-canto.org/explore?query=Rhinella+ornata
- **Hypsiboas lundii**: https://xeno-canto.org/explore?query=Hypsiboas+lundii

### 2. Fonoteca Neotropical Jacques Vielliard

**Site:** https://www2.ib.unicamp.br/fnjv/

Acervo da Unicamp com gravações de anfíbios brasileiros.

### 3. Animal Sound Archive

**Site:** https://www.tierstimmenarchiv.de/

Arquivo de sons de animais do Museum für Naturkunde Berlin.

### 4. Macaulay Library

**Site:** https://www.macaulaylibrary.org/

Cornell Lab of Ornithology - inclui alguns anfíbios.

### 5. Grave Seus Próprios Áudios! 🎤

**Equipamento:**
- Smartphone moderno (bom para começar)
- Gravador de áudio dedicado (melhor qualidade)
- Microfone externo (opcional)

**Dicas de gravação:**
1. **Quando gravar**: Noite/madrugada (anfíbios são mais ativos)
2. **Onde gravar**: Próximo a corpos d'água (lagos, rios, brejos)
3. **Como gravar**:
   - Mantenha-se quieto
   - Aproxime-se devagar
   - Grave pelo menos 10-30 segundos
   - Tente minimizar ruídos de fundo
4. **Metadados importantes**:
   - Data e hora
   - Local (GPS se possível)
   - Condições climáticas
   - Identificação da espécie (se souber)

## 📁 Organização Recomendada

Organize seus áudios por espécie:

```
meus_audios/
├── boana_faber/
│   ├── audio_001.wav
│   ├── audio_002.wav
│   ├── audio_003.wav
│   └── ...
├── scinax_fuscomarginatus/
│   ├── audio_001.wav
│   ├── audio_002.wav
│   └── ...
└── rhinella_ornata/
    ├── audio_001.wav
    └── ...
```

## 🎯 Quantos Áudios Preciso?

### Para Treinamento no Navegador:

| Cenário | Mínimo | Recomendado | Ideal |
|---------|--------|-------------|-------|
| **Por espécie** | 5 áudios | 10-15 áudios | 20+ áudios |
| **Total** | 10 áudios (2 sp) | 30-45 áudios (3 sp) | 100+ áudios (5+ sp) |
| **Acurácia esperada** | 60-70% | 75-85% | 85-92% |

### Para Pipeline Python:

| Cenário | Mínimo | Recomendado | Ideal |
|---------|--------|-------------|-------|
| **Por espécie** | 20 áudios | 50 áudios | 100+ áudios |
| **Total** | 100 áudios (5 sp) | 500 áudios (10 sp) | 2000+ áudios (20+ sp) |
| **Acurácia esperada** | 75-85% | 88-95% | 95-99% |

## ⚙️ Formatos de Áudio Suportados

### Formatos Aceitos:
- ✅ **WAV** (sem compressão, melhor qualidade)
- ✅ **MP3** (comprimido, menor tamanho)
- ✅ **OGG** (open source, boa qualidade)
- ✅ **FLAC** (compressão sem perdas)

### Especificações Recomendadas:
- **Sample Rate**: 22050 Hz ou superior
- **Bit Depth**: 16-bit ou superior
- **Canais**: Mono (preferencial) ou Stereo
- **Duração**: 3-10 segundos (ideal)

### Conversão de Formatos:

**Usando FFmpeg:**
```bash
# WAV para MP3
ffmpeg -i audio.wav -codec:a libmp3lame -qscale:a 2 audio.mp3

# MP3 para WAV
ffmpeg -i audio.mp3 -acodec pcm_s16le -ar 22050 audio.wav

# Cortar áudio (10 segundos)
ffmpeg -i audio.wav -ss 00:00:00 -t 00:00:10 audio_cortado.wav

# Converter para mono
ffmpeg -i audio.wav -ac 1 audio_mono.wav

# Reduzir sample rate
ffmpeg -i audio.wav -ar 22050 audio_22k.wav
```

## 🔊 Qualidade do Áudio

### Sinais de Boa Qualidade:
- ✅ Vocalização clara e audível
- ✅ Ruído de fundo mínimo
- ✅ Sem clipping (distorção por volume alto)
- ✅ SNR (Signal-to-Noise Ratio) alto

### Problemas Comuns:

**1. Muito ruído de fundo**
- **Causa**: Vento, chuva, tráfego, outros animais
- **Solução**: Grave em condições calmas ou use filtros de áudio

**2. Volume muito baixo**
- **Causa**: Distância grande do animal
- **Solução**: Aproxime-se mais (com cuidado) ou use amplificação

**3. Clipping/Distorção**
- **Causa**: Volume de gravação muito alto
- **Solução**: Reduza sensibilidade do microfone

**4. Áudio muito curto**
- **Causa**: Gravação interrompida
- **Solução**: Grave por mais tempo (>5 segundos)

## 🛠️ Ferramentas de Edição de Áudio

### Audacity (Gratuito)
**Site:** https://www.audacityteam.org/

**Recursos úteis:**
- Cortar/dividir áudios
- Remover ruído de fundo
- Normalizar volume
- Converter formatos
- Ver espectrograma

**Tutorial rápido:**
1. Abrir áudio: File > Open
2. Selecionar trecho: Click & Drag
3. Cortar: Ctrl+X
4. Remover ruído:
   - Selecione trecho apenas com ruído
   - Effect > Noise Reduction > Get Noise Profile
   - Selecione áudio completo
   - Effect > Noise Reduction > OK
5. Normalizar: Effect > Normalize
6. Exportar: File > Export > Export as WAV/MP3

### Outras Ferramentas:

- **Raven Lite** (Cornell Lab): Análise de bioacústica
- **Sonic Visualiser**: Visualização avançada
- **Praat**: Análise fonética
- **Ocenaudio**: Editor simples e rápido

## 📚 Dataset Exemplo Completo

### Baixar Dataset de Demonstração:

Use o script Python incluído:

```bash
cd backend/scripts
python 01_download_data.py
```

Isso irá baixar automaticamente áudios de 8 espécies do Xeno-canto!

**Espécies incluídas:**
1. Boana faber
2. Boana albopunctata
3. Scinax fuscomarginatus
4. Dendropsophus minutus
5. Leptodactylus fuscus
6. Physalaemus cuvieri
7. Rhinella ornata
8. Hypsiboas lundii

**Configuração do script:**
- 20 áudios por espécie
- Qualidade A e B (alta qualidade)
- Metadata incluído (JSON)

## 🎓 Exemplo Prático: Treinamento Rápido

### Cenário: 3 Espécies da Mata Atlântica

**1. Baixar áudios do Xeno-canto:**

```python
# Edite backend/scripts/01_download_data.py

ESPECIES = [
    "Boana faber",           # Rã-ferreira
    "Scinax fuscomarginatus", # Perereca
    "Rhinella ornata"         # Sapo-cururu
]

SAMPLES_PER_SPECIES = 15
```

Execute:
```bash
python backend/scripts/01_download_data.py
```

**2. Acesse train.html:**
```
http://localhost:8000/train.html
```

**3. Adicione os áudios:**
- Espécie 1: Arraste 15 áudios de `data/raw/Boana_faber/`
- Espécie 2: Arraste 15 áudios de `data/raw/Scinax_fuscomarginatus/`
- Espécie 3: Arraste 15 áudios de `data/raw/Rhinella_ornata/`

**4. Treine e use!**

Total: 45 áudios → ~85% acurácia em ~25 minutos! 🎉

## 📞 Suporte

**Problemas com áudios?**
- Verifique formato (WAV, MP3, OGG)
- Confirme que áudio é válido (abra no player)
- Veja console do navegador (F12) para erros
- Consulte TROUBLESHOOTING.md

**Dúvidas sobre qualidade?**
- Ouça o áudio: vocalização está clara?
- Abra no Audacity: espectrograma mostra padrões?
- Teste com outro áudio da mesma espécie

---

**🐸 Divirta-se coletando e classificando vocalizações de anfíbios!**
