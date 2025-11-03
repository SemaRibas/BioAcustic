"""
Script de Pré-processamento de Áudio e Extração de Features
Fase 2: Conversão de áudio para Mel-Espectrogramas

Autor: Projeto BioAcustic
Data: Novembro 2025
"""

import os
import numpy as np
import librosa
import librosa.display
import matplotlib.pyplot as plt
from pathlib import Path
from typing import Tuple, Optional
import json
from tqdm import tqdm
import warnings
warnings.filterwarnings('ignore')


class AudioPreprocessor:
    """
    Classe para pré-processamento de áudio e extração de features
    """
    
    def __init__(self,
                 sample_rate: int = 22050,
                 duration: float = 3.0,
                 n_mels: int = 128,
                 n_fft: int = 2048,
                 hop_length: int = 512,
                 fmin: float = 50.0,
                 fmax: float = 8000.0):
        """
        Inicializa o preprocessador
        
        Args:
            sample_rate: Taxa de amostragem alvo (Hz)
            duration: Duração dos segmentos de áudio (segundos)
            n_mels: Número de bandas Mel
            n_fft: Tamanho da janela FFT
            hop_length: Stride entre janelas
            fmin: Frequência mínima (Hz)
            fmax: Frequência máxima (Hz)
        """
        self.sample_rate = sample_rate
        self.duration = duration
        self.n_mels = n_mels
        self.n_fft = n_fft
        self.hop_length = hop_length
        self.fmin = fmin
        self.fmax = fmax
        
        # Calcular número de amostras por segmento
        self.n_samples = int(sample_rate * duration)
        
        print("🎛️  Configuração do Preprocessador:")
        print(f"   Sample Rate: {sample_rate} Hz")
        print(f"   Duração: {duration}s ({self.n_samples} samples)")
        print(f"   Mel bands: {n_mels}")
        print(f"   Range de frequência: {fmin}-{fmax} Hz")
    
    def load_audio(self, file_path: str) -> Tuple[np.ndarray, int]:
        """
        Carrega arquivo de áudio
        
        Args:
            file_path: Caminho do arquivo
            
        Returns:
            Tupla (áudio, sample_rate)
        """
        try:
            y, sr = librosa.load(file_path, sr=self.sample_rate)
            return y, sr
        except Exception as e:
            print(f"❌ Erro ao carregar {file_path}: {e}")
            return None, None
    
    def normalize_audio(self, y: np.ndarray) -> np.ndarray:
        """
        Normaliza áudio para range [-1, 1]
        
        Args:
            y: Array de áudio
            
        Returns:
            Áudio normalizado
        """
        max_val = np.abs(y).max()
        if max_val > 0:
            return y / max_val
        return y
    
    def segment_audio(self, y: np.ndarray, overlap: float = 0.0) -> list:
        """
        Segmenta áudio longo em clipes curtos
        
        Args:
            y: Array de áudio
            overlap: Porcentagem de sobreposição (0.0 a 1.0)
            
        Returns:
            Lista de segmentos
        """
        segments = []
        
        # Calcular stride
        stride = int(self.n_samples * (1 - overlap))
        
        # Segmentar
        for start in range(0, len(y) - self.n_samples + 1, stride):
            segment = y[start:start + self.n_samples]
            
            # Verificar se não é só silêncio
            if np.abs(segment).max() > 0.01:  # Threshold de ruído
                segments.append(segment)
        
        return segments
    
    def pad_or_truncate(self, y: np.ndarray) -> np.ndarray:
        """
        Ajusta áudio para duração exata
        
        Args:
            y: Array de áudio
            
        Returns:
            Áudio ajustado
        """
        if len(y) > self.n_samples:
            # Truncar
            return y[:self.n_samples]
        elif len(y) < self.n_samples:
            # Pad com zeros
            padding = self.n_samples - len(y)
            return np.pad(y, (0, padding), mode='constant')
        return y
    
    def compute_mel_spectrogram(self, y: np.ndarray) -> np.ndarray:
        """
        Calcula Mel-Espectrograma
        
        Args:
            y: Array de áudio
            
        Returns:
            Mel-espectrograma em escala dB
        """
        # Calcular espectrograma Mel
        mel_spec = librosa.feature.melspectrogram(
            y=y,
            sr=self.sample_rate,
            n_mels=self.n_mels,
            n_fft=self.n_fft,
            hop_length=self.hop_length,
            fmin=self.fmin,
            fmax=self.fmax
        )
        
        # Converter para escala dB
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        
        return mel_spec_db
    
    def save_spectrogram_image(self, mel_spec_db: np.ndarray, 
                                output_path: str, 
                                title: Optional[str] = None):
        """
        Salva espectrograma como imagem PNG
        
        Args:
            mel_spec_db: Mel-espectrograma em dB
            output_path: Caminho para salvar
            title: Título do plot (opcional)
        """
        plt.figure(figsize=(10, 4))
        librosa.display.specshow(
            mel_spec_db,
            sr=self.sample_rate,
            hop_length=self.hop_length,
            x_axis='time',
            y_axis='mel',
            fmin=self.fmin,
            fmax=self.fmax,
            cmap='viridis'
        )
        plt.colorbar(format='%+2.0f dB')
        
        if title:
            plt.title(title)
        else:
            plt.title('Mel-Spectrogram')
        
        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches='tight')
        plt.close()
    
    def save_spectrogram_npy(self, mel_spec_db: np.ndarray, output_path: str):
        """
        Salva espectrograma como arquivo NumPy (.npy)
        
        Args:
            mel_spec_db: Mel-espectrograma em dB
            output_path: Caminho para salvar
        """
        np.save(output_path, mel_spec_db)
    
    def process_audio_file(self, 
                           input_path: str, 
                           output_dir: str,
                           save_images: bool = False,
                           save_npy: bool = True,
                           overlap: float = 0.0) -> int:
        """
        Processa um arquivo de áudio completo
        
        Args:
            input_path: Caminho do arquivo de áudio
            output_dir: Diretório para salvar espectrogramas
            save_images: Se deve salvar imagens PNG
            save_npy: Se deve salvar arrays NumPy
            overlap: Sobreposição para segmentação
            
        Returns:
            Número de espectrogramas gerados
        """
        # Carregar áudio
        y, sr = self.load_audio(input_path)
        if y is None:
            return 0
        
        # Normalizar
        y = self.normalize_audio(y)
        
        # Segmentar
        segments = self.segment_audio(y, overlap=overlap)
        
        if not segments:
            print(f"⚠️  Nenhum segmento válido em {Path(input_path).name}")
            return 0
        
        # Criar diretório de saída
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Processar cada segmento
        base_name = Path(input_path).stem
        count = 0
        
        for i, segment in enumerate(segments):
            # Ajustar duração
            segment = self.pad_or_truncate(segment)
            
            # Gerar espectrograma
            mel_spec = self.compute_mel_spectrogram(segment)
            
            # Salvar
            file_base = f"{base_name}_seg{i:03d}"
            
            if save_npy:
                npy_path = output_path / f"{file_base}.npy"
                self.save_spectrogram_npy(mel_spec, str(npy_path))
            
            if save_images:
                img_path = output_path / f"{file_base}.png"
                self.save_spectrogram_image(
                    mel_spec, 
                    str(img_path),
                    title=f"{base_name} - Segment {i}"
                )
            
            count += 1
        
        return count
    
    def process_dataset(self, 
                        input_dir: str, 
                        output_base_dir: str,
                        save_images: bool = False,
                        overlap: float = 0.0) -> dict:
        """
        Processa dataset completo de múltiplas espécies
        
        Args:
            input_dir: Diretório com pastas de espécies
            output_base_dir: Diretório base para saída
            save_images: Se deve salvar imagens PNG
            overlap: Sobreposição para segmentação
            
        Returns:
            Dicionário com estatísticas do processamento
        """
        input_path = Path(input_dir)
        output_path = Path(output_base_dir)
        
        stats = {
            "species": [],
            "audio_files": [],
            "spectrograms_generated": [],
            "total_spectrograms": 0
        }
        
        # Iterar sobre pastas de espécies
        species_dirs = [d for d in input_path.iterdir() if d.is_dir()]
        
        print(f"\n🐸 Processando {len(species_dirs)} espécies...")
        
        for species_dir in species_dirs:
            species_name = species_dir.name
            print(f"\n📁 Espécie: {species_name}")
            
            # Criar diretório de saída
            output_species_dir = output_path / species_name
            output_species_dir.mkdir(parents=True, exist_ok=True)
            
            # Buscar arquivos de áudio
            audio_files = list(species_dir.glob("*.mp3")) + \
                         list(species_dir.glob("*.wav")) + \
                         list(species_dir.glob("*.flac"))
            
            print(f"   Arquivos de áudio: {len(audio_files)}")
            
            # Processar cada arquivo
            total_specs = 0
            for audio_file in tqdm(audio_files, desc=f"   Processando"):
                n_specs = self.process_audio_file(
                    str(audio_file),
                    str(output_species_dir),
                    save_images=save_images,
                    overlap=overlap
                )
                total_specs += n_specs
            
            print(f"   ✅ Gerados {total_specs} espectrogramas")
            
            # Salvar estatísticas
            stats["species"].append(species_name)
            stats["audio_files"].append(len(audio_files))
            stats["spectrograms_generated"].append(total_specs)
            stats["total_spectrograms"] += total_specs
        
        # Salvar resumo
        summary_path = output_path / "preprocessing_summary.json"
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2)
        
        print("\n" + "="*60)
        print("📊 RESUMO DO PRÉ-PROCESSAMENTO")
        print("="*60)
        for i, species in enumerate(stats["species"]):
            print(f"{species:30s} | {stats['audio_files'][i]:3d} áudios | "
                  f"{stats['spectrograms_generated'][i]:4d} specs")
        print("="*60)
        print(f"TOTAL: {stats['total_spectrograms']} espectrogramas")
        
        return stats


def main():
    """
    Função principal de exemplo
    """
    # Configurações
    INPUT_DIR = "./backend/data/raw"
    OUTPUT_DIR = "./backend/data/processed/spectrograms"
    
    # Parâmetros do preprocessador
    preprocessor = AudioPreprocessor(
        sample_rate=22050,
        duration=3.0,
        n_mels=128,
        n_fft=2048,
        hop_length=512,
        fmin=50.0,
        fmax=8000.0
    )
    
    # Processar dataset
    print("🎵 Iniciando pré-processamento de áudio...")
    
    stats = preprocessor.process_dataset(
        input_dir=INPUT_DIR,
        output_base_dir=OUTPUT_DIR,
        save_images=False,  # True para salvar PNGs (útil para debug)
        overlap=0.0  # 0.0 = sem overlap, 0.5 = 50% overlap
    )
    
    print("\n✅ Pré-processamento completo!")
    print(f"📁 Espectrogramas salvos em: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
