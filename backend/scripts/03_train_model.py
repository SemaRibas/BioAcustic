"""
Script de Treinamento do Modelo de Classificação de Anfíbios
Fase 3: Modelagem e Treinamento com CNN (Transfer Learning)

Autor: Projeto BioAcustic
Data: Novembro 2025
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2, EfficientNetB0
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint, TensorBoard
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json
from datetime import datetime
from tqdm import tqdm
import warnings
warnings.filterwarnings('ignore')


class AmphibianClassifier:
    """
    Classe para treinamento do modelo de classificação de anfíbios
    """
    
    def __init__(self, 
                 input_shape=(128, 128, 3),
                 num_classes=None,
                 architecture='mobilenet',
                 learning_rate=0.0001):
        """
        Inicializa o classificador
        
        Args:
            input_shape: Shape do input (altura, largura, canais)
            num_classes: Número de classes (espécies)
            architecture: 'mobilenet' ou 'efficientnet'
            learning_rate: Taxa de aprendizado
        """
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.architecture = architecture
        self.learning_rate = learning_rate
        self.model = None
        self.history = None
        self.class_names = []
        
        print("🧠 Inicializando Classificador de Anfíbios")
        print(f"   Arquitetura: {architecture}")
        print(f"   Input shape: {input_shape}")
        print(f"   Learning rate: {learning_rate}")
    
    def load_dataset(self, data_dir: str, test_size=0.15, val_size=0.15):
        """
        Carrega dataset de espectrogramas
        
        Args:
            data_dir: Diretório com pastas de espécies
            test_size: Proporção do conjunto de teste
            val_size: Proporção do conjunto de validação
            
        Returns:
            Tupla (X_train, X_val, X_test, y_train, y_val, y_test)
        """
        data_path = Path(data_dir)
        
        # Coletar todos os espectrogramas
        X = []
        y = []
        
        species_dirs = sorted([d for d in data_path.iterdir() if d.is_dir()])
        self.class_names = [d.name for d in species_dirs]
        self.num_classes = len(self.class_names)
        
        print(f"\n📂 Carregando dataset de {data_dir}")
        print(f"🐸 Espécies encontradas: {self.num_classes}")
        print(f"   {', '.join(self.class_names)}")
        
        # Carregar espectrogramas
        for class_idx, species_dir in enumerate(tqdm(species_dirs, desc="Carregando espécies")):
            species_name = species_dir.name
            
            # Buscar arquivos .npy
            spec_files = list(species_dir.glob("*.npy"))
            
            for spec_file in spec_files:
                try:
                    # Carregar espectrograma
                    mel_spec = np.load(spec_file)
                    
                    # Converter para formato de imagem (128, 128, 3)
                    # Replicar canal único para 3 canais (RGB simulado)
                    mel_spec_rgb = self._prepare_spectrogram(mel_spec)
                    
                    X.append(mel_spec_rgb)
                    y.append(class_idx)
                    
                except Exception as e:
                    print(f"⚠️  Erro ao carregar {spec_file}: {e}")
        
        # Converter para arrays NumPy
        X = np.array(X, dtype=np.float32)
        y = np.array(y)
        
        print(f"\n✅ Dataset carregado:")
        print(f"   Total de amostras: {len(X)}")
        print(f"   Shape: {X.shape}")
        
        # Normalizar para [0, 1]
        X = (X - X.min()) / (X.max() - X.min())
        
        # Split train/temp
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=(test_size + val_size), random_state=42, stratify=y
        )
        
        # Split val/test
        val_ratio = val_size / (test_size + val_size)
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=(1 - val_ratio), random_state=42, stratify=y_temp
        )
        
        print(f"\n📊 Split de dados:")
        print(f"   Treino:     {len(X_train):5d} amostras ({len(X_train)/len(X)*100:.1f}%)")
        print(f"   Validação:  {len(X_val):5d} amostras ({len(X_val)/len(X)*100:.1f}%)")
        print(f"   Teste:      {len(X_test):5d} amostras ({len(X_test)/len(X)*100:.1f}%)")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def _prepare_spectrogram(self, mel_spec: np.ndarray) -> np.ndarray:
        """
        Prepara espectrograma para input da CNN
        
        Args:
            mel_spec: Mel-espectrograma 2D
            
        Returns:
            Espectrograma 3D (altura, largura, 3)
        """
        # Redimensionar para 128x128 se necessário
        if mel_spec.shape != (128, 128):
            from scipy.ndimage import zoom
            zoom_factors = (128 / mel_spec.shape[0], 128 / mel_spec.shape[1])
            mel_spec = zoom(mel_spec, zoom_factors, order=1)
        
        # Replicar para 3 canais
        mel_spec_rgb = np.stack([mel_spec] * 3, axis=-1)
        
        return mel_spec_rgb
    
    def build_model(self):
        """
        Constrói modelo com Transfer Learning
        """
        print(f"\n🏗️  Construindo modelo ({self.architecture})...")
        
        # Base model (pré-treinado)
        if self.architecture == 'mobilenet':
            base_model = MobileNetV2(
                input_shape=self.input_shape,
                include_top=False,
                weights='imagenet'
            )
        elif self.architecture == 'efficientnet':
            base_model = EfficientNetB0(
                input_shape=self.input_shape,
                include_top=False,
                weights='imagenet'
            )
        else:
            raise ValueError(f"Arquitetura não suportada: {self.architecture}")
        
        # Congelar base model inicialmente
        base_model.trainable = False
        
        # Construir modelo completo
        model = models.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.BatchNormalization(),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(self.num_classes, activation='softmax')
        ], name='AmphibianClassifier')
        
        # Compilar
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=self.learning_rate),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
        )
        
        self.model = model
        
        print("✅ Modelo construído")
        print(f"   Parâmetros treináveis: {model.count_params():,}")
        
        return model
    
    def train(self, X_train, y_train, X_val, y_val, 
              epochs=50, batch_size=32, 
              output_dir='./backend/models'):
        """
        Treina o modelo
        
        Args:
            X_train: Dados de treino
            y_train: Labels de treino
            X_val: Dados de validação
            y_val: Labels de validação
            epochs: Número de épocas
            batch_size: Tamanho do batch
            output_dir: Diretório para salvar modelo
            
        Returns:
            History object
        """
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Timestamp para versionamento
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        model_name = f"amphibian_classifier_{self.architecture}_{timestamp}"
        model_dir = output_path / model_name
        model_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"\n🎯 Iniciando treinamento...")
        print(f"   Épocas: {epochs}")
        print(f"   Batch size: {batch_size}")
        print(f"   Modelo será salvo em: {model_dir}")
        
        # Callbacks
        callbacks = [
            EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7,
                verbose=1
            ),
            ModelCheckpoint(
                filepath=str(model_dir / 'best_model.h5'),
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            ),
            TensorBoard(
                log_dir=str(model_dir / 'logs'),
                histogram_freq=1
            )
        ]
        
        # Treinar
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        self.history = history
        
        # Salvar modelo final
        self.model.save(str(model_dir / 'final_model.h5'))
        
        # Salvar classe names
        with open(model_dir / 'class_names.json', 'w') as f:
            json.dump(self.class_names, f, indent=2)
        
        # Salvar configuração
        config = {
            'architecture': self.architecture,
            'input_shape': self.input_shape,
            'num_classes': self.num_classes,
            'learning_rate': self.learning_rate,
            'epochs_trained': len(history.history['loss']),
            'timestamp': timestamp
        }
        with open(model_dir / 'config.json', 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"\n✅ Treinamento concluído!")
        print(f"📁 Modelo salvo em: {model_dir}")
        
        return history
    
    def plot_training_history(self, save_path=None):
        """
        Plota histórico de treinamento
        
        Args:
            save_path: Caminho para salvar figura (opcional)
        """
        if self.history is None:
            print("⚠️  Nenhum histórico de treinamento disponível")
            return
        
        fig, axes = plt.subplots(1, 2, figsize=(15, 5))
        
        # Loss
        axes[0].plot(self.history.history['loss'], label='Treino')
        axes[0].plot(self.history.history['val_loss'], label='Validação')
        axes[0].set_title('Loss')
        axes[0].set_xlabel('Época')
        axes[0].set_ylabel('Loss')
        axes[0].legend()
        axes[0].grid(True)
        
        # Accuracy
        axes[1].plot(self.history.history['accuracy'], label='Treino')
        axes[1].plot(self.history.history['val_accuracy'], label='Validação')
        axes[1].set_title('Accuracy')
        axes[1].set_xlabel('Época')
        axes[1].set_ylabel('Accuracy')
        axes[1].legend()
        axes[1].grid(True)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=150, bbox_inches='tight')
            print(f"📊 Gráfico salvo em: {save_path}")
        else:
            plt.show()
        
        plt.close()
    
    def evaluate(self, X_test, y_test):
        """
        Avalia modelo no conjunto de teste
        
        Args:
            X_test: Dados de teste
            y_test: Labels de teste
            
        Returns:
            Dicionário com métricas
        """
        print("\n📊 Avaliando modelo no conjunto de teste...")
        
        # Predições
        y_pred_probs = self.model.predict(X_test, verbose=0)
        y_pred = np.argmax(y_pred_probs, axis=1)
        
        # Métricas
        test_loss, test_acc, test_top3 = self.model.evaluate(X_test, y_test, verbose=0)
        
        print(f"\n✅ Resultados no Teste:")
        print(f"   Loss: {test_loss:.4f}")
        print(f"   Accuracy: {test_acc:.4f}")
        print(f"   Top-3 Accuracy: {test_top3:.4f}")
        
        # Classification Report
        print("\n📋 Classification Report:")
        print(classification_report(y_test, y_pred, target_names=self.class_names))
        
        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        
        return {
            'test_loss': test_loss,
            'test_accuracy': test_acc,
            'test_top3_accuracy': test_top3,
            'confusion_matrix': cm,
            'y_pred': y_pred,
            'y_test': y_test
        }
    
    def plot_confusion_matrix(self, cm, save_path=None):
        """
        Plota matriz de confusão
        
        Args:
            cm: Matriz de confusão
            save_path: Caminho para salvar (opcional)
        """
        plt.figure(figsize=(10, 8))
        sns.heatmap(
            cm, 
            annot=True, 
            fmt='d', 
            cmap='Blues',
            xticklabels=self.class_names,
            yticklabels=self.class_names
        )
        plt.title('Matriz de Confusão')
        plt.ylabel('Real')
        plt.xlabel('Predito')
        plt.xticks(rotation=45, ha='right')
        plt.yticks(rotation=0)
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=150, bbox_inches='tight')
            print(f"📊 Matriz de confusão salva em: {save_path}")
        else:
            plt.show()
        
        plt.close()


def main():
    """
    Função principal de treinamento
    """
    # Configurações
    DATA_DIR = "./backend/data/processed/spectrograms"
    MODEL_DIR = "./backend/models"
    
    # Hiperparâmetros
    ARCHITECTURE = 'mobilenet'  # 'mobilenet' ou 'efficientnet'
    LEARNING_RATE = 0.0001
    EPOCHS = 50
    BATCH_SIZE = 32
    
    print("🐸 Sistema de Classificação de Anfíbios - Treinamento")
    print("="*60)
    
    # Inicializar classificador
    classifier = AmphibianClassifier(
        input_shape=(128, 128, 3),
        architecture=ARCHITECTURE,
        learning_rate=LEARNING_RATE
    )
    
    # Carregar dataset
    X_train, X_val, X_test, y_train, y_val, y_test = classifier.load_dataset(
        data_dir=DATA_DIR,
        test_size=0.15,
        val_size=0.15
    )
    
    # Construir modelo
    model = classifier.build_model()
    model.summary()
    
    # Treinar
    history = classifier.train(
        X_train, y_train,
        X_val, y_val,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        output_dir=MODEL_DIR
    )
    
    # Plotar histórico
    classifier.plot_training_history(
        save_path=f"{MODEL_DIR}/training_history.png"
    )
    
    # Avaliar
    results = classifier.evaluate(X_test, y_test)
    
    # Plotar matriz de confusão
    classifier.plot_confusion_matrix(
        results['confusion_matrix'],
        save_path=f"{MODEL_DIR}/confusion_matrix.png"
    )
    
    print("\n✅ Pipeline de treinamento completo!")


if __name__ == "__main__":
    main()
