"""
Script de Conversão de Modelo para TensorFlow.js
Fase 4: Conversão e Otimização para Web

Autor: Projeto BioAcustic
Data: Novembro 2025
"""

import os
import subprocess
import json
from pathlib import Path
import shutil


def convert_model_to_tfjs(input_model_path: str,
                          output_dir: str,
                          quantization: bool = True,
                          weight_shard_size_mb: int = 4):
    """
    Converte modelo Keras/TensorFlow para formato TensorFlow.js
    
    Args:
        input_model_path: Caminho do modelo .h5 ou SavedModel
        output_dir: Diretório de saída para modelo convertido
        quantization: Se deve aplicar quantização uint8
        weight_shard_size_mb: Tamanho dos shards em MB
    """
    input_path = Path(input_model_path)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    print("🔄 Conversão de Modelo para TensorFlow.js")
    print("="*60)
    print(f"📥 Input:  {input_path}")
    print(f"📤 Output: {output_path}")
    print(f"🗜️  Quantização: {'Sim (uint8)' if quantization else 'Não'}")
    print(f"📦 Shard size: {weight_shard_size_mb} MB")
    print("="*60)
    
    # Determinar formato do modelo
    if input_path.suffix == '.h5':
        input_format = 'keras'
        print("📋 Formato detectado: Keras (.h5)")
    elif input_path.is_dir():
        input_format = 'tf_saved_model'
        print("📋 Formato detectado: TensorFlow SavedModel")
    else:
        raise ValueError(f"Formato de modelo não suportado: {input_path}")
    
    # Montar comando
    cmd = [
        'tensorflowjs_converter',
        '--input_format', input_format,
        '--output_format', 'tfjs_layers_model',
        '--weight_shard_size_bytes', str(weight_shard_size_mb * 1024 * 1024)
    ]
    
    # Adicionar quantização se solicitado
    if quantization:
        cmd.extend(['--quantize_uint8', '*'])
    
    # Adicionar paths
    cmd.extend([str(input_path), str(output_path)])
    
    print(f"\n🚀 Executando conversão...")
    print(f"   Comando: {' '.join(cmd)}\n")
    
    try:
        # Executar conversão
        result = subprocess.run(
            cmd,
            check=True,
            capture_output=True,
            text=True
        )
        
        print("✅ Conversão concluída com sucesso!")
        print(result.stdout)
        
        # Listar arquivos gerados
        generated_files = list(output_path.iterdir())
        print(f"\n📁 Arquivos gerados ({len(generated_files)}):")
        
        total_size = 0
        for file in sorted(generated_files):
            size = file.stat().st_size
            total_size += size
            size_mb = size / (1024 * 1024)
            print(f"   {file.name:40s} {size_mb:8.2f} MB")
        
        print(f"\n📊 Tamanho total: {total_size / (1024 * 1024):.2f} MB")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro na conversão:")
        print(e.stderr)
        return False
    except FileNotFoundError:
        print("❌ Erro: tensorflowjs_converter não encontrado!")
        print("   Instale com: pip install tensorflowjs")
        return False


def create_model_metadata(model_dir: str, 
                          class_names_path: str,
                          config_path: str,
                          output_dir: str):
    """
    Cria arquivo de metadados para o modelo web
    
    Args:
        model_dir: Diretório do modelo original
        class_names_path: Caminho do arquivo class_names.json
        config_path: Caminho do arquivo config.json
        output_dir: Diretório de saída (onde está o modelo TF.js)
    """
    print("\n📝 Criando metadados do modelo...")
    
    # Carregar class names
    with open(class_names_path, 'r') as f:
        class_names = json.load(f)
    
    # Carregar config
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    # Criar metadados completos
    metadata = {
        "modelInfo": {
            "name": "Amphibian Bioacoustic Classifier",
            "version": config.get('timestamp', '1.0.0'),
            "architecture": config.get('architecture', 'mobilenet'),
            "description": "Classificador de espécies de anfíbios baseado em vocalizações"
        },
        "inputSpec": {
            "shape": config.get('input_shape', [128, 128, 3]),
            "dtype": "float32",
            "range": [0, 1],
            "description": "Mel-espectrograma normalizado (128x128x3)"
        },
        "outputSpec": {
            "shape": [config.get('num_classes', len(class_names))],
            "dtype": "float32",
            "description": "Probabilidades para cada espécie"
        },
        "classes": class_names,
        "numClasses": len(class_names),
        "preprocessing": {
            "sampleRate": 22050,
            "duration": 3.0,
            "nMels": 128,
            "nFFT": 2048,
            "hopLength": 512,
            "fmin": 50,
            "fmax": 8000
        },
        "performance": {
            "trainingEpochs": config.get('epochs_trained', 'N/A'),
            "learningRate": config.get('learning_rate', 0.0001)
        },
        "usage": {
            "loadModel": "tf.loadLayersModel('./model.json')",
            "predict": "model.predict(tf.tensor4d([melSpectrogram]))"
        }
    }
    
    # Salvar metadados
    metadata_path = Path(output_dir) / 'metadata.json'
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Metadados criados: {metadata_path}")
    
    # Copiar class_names.json também
    shutil.copy(class_names_path, Path(output_dir) / 'class_names.json')
    print(f"✅ Copiado: class_names.json")


def create_test_html(output_dir: str):
    """
    Cria arquivo HTML simples para testar o modelo
    
    Args:
        output_dir: Diretório onde está o modelo TF.js
    """
    html_content = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste do Modelo TF.js - Anfíbios</title>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #2c3e50; }
        .status { 
            padding: 10px; 
            margin: 10px 0;
            border-radius: 5px;
        }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
        button {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover { background: #2980b9; }
        #results {
            margin-top: 20px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐸 Teste do Modelo TensorFlow.js</h1>
        <p>Teste de carregamento e inferência básica do modelo de classificação de anfíbios.</p>
        
        <div id="status" class="status info">Aguardando carregamento...</div>
        
        <button onclick="loadAndTest()">Carregar e Testar Modelo</button>
        
        <div id="results"></div>
    </div>

    <script>
        let model = null;
        let metadata = null;

        async function loadAndTest() {
            const statusDiv = document.getElementById('status');
            const resultsDiv = document.getElementById('results');
            
            try {
                // Carregar metadados
                statusDiv.innerHTML = '⏳ Carregando metadados...';
                statusDiv.className = 'status info';
                
                const metadataResponse = await fetch('./metadata.json');
                metadata = await metadataResponse.json();
                
                console.log('Metadados:', metadata);
                
                // Carregar modelo
                statusDiv.innerHTML = '⏳ Carregando modelo TensorFlow.js...';
                
                model = await tf.loadLayersModel('./model.json');
                
                statusDiv.innerHTML = '✅ Modelo carregado com sucesso!';
                statusDiv.className = 'status success';
                
                // Exibir informações do modelo
                let info = '<h3>📊 Informações do Modelo:</h3>';
                info += `<p><strong>Nome:</strong> ${metadata.modelInfo.name}</p>`;
                info += `<p><strong>Arquitetura:</strong> ${metadata.modelInfo.architecture}</p>`;
                info += `<p><strong>Versão:</strong> ${metadata.modelInfo.version}</p>`;
                info += `<p><strong>Número de classes:</strong> ${metadata.numClasses}</p>`;
                info += `<p><strong>Classes:</strong> ${metadata.classes.join(', ')}</p>`;
                
                // Teste de inferência com input dummy
                info += '<h3>🧪 Teste de Inferência:</h3>';
                info += '<p>Gerando input de teste (espectrograma dummy)...</p>';
                
                const inputShape = metadata.inputSpec.shape;
                const dummyInput = tf.randomNormal([1, ...inputShape]);
                
                const startTime = performance.now();
                const predictions = model.predict(dummyInput);
                const endTime = performance.now();
                
                const probabilities = await predictions.data();
                const inferenceTime = (endTime - startTime).toFixed(2);
                
                info += `<p><strong>Tempo de inferência:</strong> ${inferenceTime} ms</p>`;
                info += '<p><strong>Probabilidades (top 3):</strong></p>';
                info += '<ul>';
                
                // Ordenar e mostrar top 3
                const probs = Array.from(probabilities);
                const sortedIndices = probs
                    .map((prob, idx) => ({prob, idx}))
                    .sort((a, b) => b.prob - a.prob)
                    .slice(0, 3);
                
                sortedIndices.forEach(item => {
                    const className = metadata.classes[item.idx];
                    const prob = (item.prob * 100).toFixed(2);
                    info += `<li>${className}: ${prob}%</li>`;
                });
                
                info += '</ul>';
                
                // Limpeza
                dummyInput.dispose();
                predictions.dispose();
                
                resultsDiv.innerHTML = info;
                
            } catch (error) {
                statusDiv.innerHTML = `❌ Erro: ${error.message}`;
                statusDiv.className = 'status error';
                console.error('Erro completo:', error);
            }
        }

        // Auto-carregar ao abrir a página
        window.addEventListener('load', () => {
            setTimeout(loadAndTest, 500);
        });
    </script>
</body>
</html>
"""
    
    test_html_path = Path(output_dir) / 'test_model.html'
    with open(test_html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ Arquivo de teste criado: {test_html_path}")
    print(f"   Abra em um navegador (com servidor HTTP) para testar")


def main():
    """
    Função principal de conversão
    """
    # Configurações - AJUSTAR CONFORME SEU AMBIENTE
    MODEL_PATH = "./backend/models/best_model.h5"  # ou caminho do SavedModel
    OUTPUT_DIR = "./frontend/assets/model"
    
    # Caminhos de metadados
    MODEL_DIR = Path(MODEL_PATH).parent
    CLASS_NAMES_PATH = MODEL_DIR / "class_names.json"
    CONFIG_PATH = MODEL_DIR / "config.json"
    
    print("🌐 Sistema de Conversão para Web - TensorFlow.js")
    print("="*60)
    
    # Verificar se modelo existe
    if not Path(MODEL_PATH).exists():
        print(f"❌ Modelo não encontrado: {MODEL_PATH}")
        print("\n💡 Dica: Execute primeiro o script 03_train_model.py")
        return
    
    # 1. Converter modelo
    success = convert_model_to_tfjs(
        input_model_path=MODEL_PATH,
        output_dir=OUTPUT_DIR,
        quantization=True,  # Reduz tamanho em ~4x
        weight_shard_size_mb=4
    )
    
    if not success:
        print("\n❌ Conversão falhou!")
        return
    
    # 2. Criar metadados
    if CLASS_NAMES_PATH.exists() and CONFIG_PATH.exists():
        create_model_metadata(
            model_dir=str(MODEL_DIR),
            class_names_path=str(CLASS_NAMES_PATH),
            config_path=str(CONFIG_PATH),
            output_dir=OUTPUT_DIR
        )
    else:
        print("⚠️  Arquivos de metadados não encontrados, pulando...")
    
    # 3. Criar HTML de teste
    create_test_html(OUTPUT_DIR)
    
    print("\n" + "="*60)
    print("✅ CONVERSÃO COMPLETA!")
    print("="*60)
    print(f"\n📁 Modelo TF.js salvo em: {OUTPUT_DIR}")
    print("\n📋 Próximos passos:")
    print("   1. Inicie um servidor HTTP local:")
    print(f"      cd {OUTPUT_DIR}")
    print("      python -m http.server 8000")
    print("   2. Abra no navegador:")
    print("      http://localhost:8000/test_model.html")
    print("   3. Integre o modelo na aplicação frontend")


if __name__ == "__main__":
    main()
