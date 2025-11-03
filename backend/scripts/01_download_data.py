"""
Script de Aquisição de Dados de Áudio de Anfíbios
Fase 1: Download e Organização de Dados do Xeno-canto

Autor: Projeto BioAcustic
Data: Novembro 2025
"""

import os
import json
import requests
import pandas as pd
from pathlib import Path
from typing import List, Dict
import time
from tqdm import tqdm


class XenoCantoDownloader:
    """
    Classe para download de vocalizações de anfíbios do Xeno-canto
    """
    
    BASE_URL = "https://xeno-canto.org/api/2/recordings"
    
    def __init__(self, output_dir: str = "./data/raw"):
        """
        Inicializa o downloader
        
        Args:
            output_dir: Diretório base para salvar os arquivos
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def search_species(self, species_name: str, country: str = "", 
                       quality: str = "A", max_results: int = 100) -> List[Dict]:
        """
        Busca gravações de uma espécie no Xeno-canto
        
        Args:
            species_name: Nome científico da espécie (ex: "Boana faber")
            country: País (código ISO, ex: "Brazil")
            quality: Qualidade mínima (A, B, C, D, E)
            max_results: Número máximo de resultados
            
        Returns:
            Lista de dicionários com metadados das gravações
        """
        query_parts = [species_name]
        
        if country:
            query_parts.append(f"cnt:{country}")
        if quality:
            query_parts.append(f"q>={quality}")
            
        query = " ".join(query_parts)
        
        params = {
            "query": query
        }
        
        print(f"🔍 Buscando: {query}")
        
        try:
            response = requests.get(self.BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
            recordings = data.get("recordings", [])
            print(f"✅ Encontradas {len(recordings)} gravações")
            
            return recordings[:max_results]
            
        except Exception as e:
            print(f"❌ Erro na busca: {e}")
            return []
    
    def download_recording(self, recording: Dict, species_dir: Path) -> bool:
        """
        Baixa uma gravação individual
        
        Args:
            recording: Dicionário com metadados da gravação
            species_dir: Diretório da espécie
            
        Returns:
            True se sucesso, False caso contrário
        """
        try:
            xc_id = recording.get("id")
            file_url = recording.get("file")
            
            if not file_url:
                return False
            
            # Nome do arquivo
            file_name = f"XC{xc_id}.mp3"
            file_path = species_dir / file_name
            
            # Verificar se já existe
            if file_path.exists():
                print(f"⏭️  Já existe: {file_name}")
                return True
            
            # Download
            response = requests.get(file_url, stream=True)
            response.raise_for_status()
            
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Salvar metadados
            metadata_path = species_dir / f"XC{xc_id}_metadata.json"
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(recording, f, indent=2, ensure_ascii=False)
            
            return True
            
        except Exception as e:
            print(f"❌ Erro ao baixar {xc_id}: {e}")
            return False
    
    def download_species_dataset(self, species_name: str, 
                                  max_recordings: int = 100,
                                  country: str = "Brazil",
                                  quality: str = "A") -> Dict:
        """
        Baixa dataset completo de uma espécie
        
        Args:
            species_name: Nome científico da espécie
            max_recordings: Número máximo de gravações
            country: País
            quality: Qualidade mínima
            
        Returns:
            Dicionário com estatísticas do download
        """
        # Criar diretório da espécie
        species_safe_name = species_name.replace(" ", "_")
        species_dir = self.output_dir / species_safe_name
        species_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"\n📦 Processando: {species_name}")
        print(f"📁 Diretório: {species_dir}")
        
        # Buscar gravações
        recordings = self.search_species(
            species_name, 
            country=country, 
            quality=quality,
            max_results=max_recordings
        )
        
        if not recordings:
            return {"species": species_name, "downloaded": 0, "total": 0}
        
        # Download com progress bar
        successful = 0
        failed = 0
        
        for recording in tqdm(recordings, desc=f"Baixando {species_name}"):
            if self.download_recording(recording, species_dir):
                successful += 1
            else:
                failed += 1
            
            # Rate limiting (ser gentil com o servidor)
            time.sleep(0.5)
        
        # Criar arquivo de resumo
        summary = {
            "species": species_name,
            "total_found": len(recordings),
            "downloaded": successful,
            "failed": failed,
            "country": country,
            "quality": quality
        }
        
        summary_path = species_dir / "download_summary.json"
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Download concluído: {successful}/{len(recordings)} gravações")
        
        return summary
    
    def download_multiple_species(self, species_list: List[str], 
                                   recordings_per_species: int = 100) -> pd.DataFrame:
        """
        Baixa datasets de múltiplas espécies
        
        Args:
            species_list: Lista de nomes científicos
            recordings_per_species: Número de gravações por espécie
            
        Returns:
            DataFrame com resumo dos downloads
        """
        results = []
        
        for species in species_list:
            summary = self.download_species_dataset(
                species, 
                max_recordings=recordings_per_species
            )
            results.append(summary)
            
            # Pausa entre espécies
            time.sleep(2)
        
        # Criar DataFrame de resumo
        df = pd.DataFrame(results)
        
        # Salvar CSV de resumo geral
        summary_csv = self.output_dir / "dataset_summary.csv"
        df.to_csv(summary_csv, index=False)
        
        print("\n" + "="*60)
        print("📊 RESUMO GERAL DO DOWNLOAD")
        print("="*60)
        print(df.to_string(index=False))
        print(f"\nTotal de gravações baixadas: {df['downloaded'].sum()}")
        
        return df


def main():
    """
    Função principal de exemplo
    """
    # Lista de espécies alvo (exemplo - anfíbios brasileiros comuns)
    SPECIES_LIST = [
        "Boana faber",
        "Boana albopunctata",
        "Scinax fuscomarginatus",
        "Dendropsophus minutus",
        "Leptodactylus fuscus",
        "Physalaemus cuvieri",
        "Rhinella ornata",
        "Hypsiboas lundii"
    ]
    
    # Configurações
    OUTPUT_DIR = "./backend/data/raw"
    RECORDINGS_PER_SPECIES = 50  # Começar pequeno para teste
    
    # Inicializar downloader
    downloader = XenoCantoDownloader(output_dir=OUTPUT_DIR)
    
    # Download
    print("🐸 Iniciando download de vocalizações de anfíbios...")
    print(f"📝 Espécies: {len(SPECIES_LIST)}")
    print(f"🎯 Meta: {RECORDINGS_PER_SPECIES} gravações por espécie\n")
    
    df_summary = downloader.download_multiple_species(
        SPECIES_LIST,
        recordings_per_species=RECORDINGS_PER_SPECIES
    )
    
    print("\n✅ Download completo!")
    print(f"📁 Dados salvos em: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
