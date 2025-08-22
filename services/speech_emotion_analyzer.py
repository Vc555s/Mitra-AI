"""
Speech Emotion Recognition for MindTalk
Analyzes emotional content from audio using multiple approaches
"""

import numpy as np
import librosa
import joblib
from typing import Dict, Any, Optional
import io
import wave
from pathlib import Path
import logging

try:
    # Try importing advanced emotion recognition libraries
    import torch
    import transformers
    from transformers import pipeline
    ADVANCED_MODELS_AVAILABLE = True
except ImportError:
    ADVANCED_MODELS_AVAILABLE = False

try:
    # Basic audio processing
    import scipy.stats as stats
    from sklearn.preprocessing import StandardScaler
    BASIC_PROCESSING_AVAILABLE = True
except ImportError:
    BASIC_PROCESSING_AVAILABLE = False

class SpeechEmotionAnalyzer:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.scaler = StandardScaler()
        self.emotions = ['anger', 'disgust', 'fear', 'happiness', 'sadness', 'surprise', 'neutral']
        
        # Initialize models
        self._init_models()
    
    def _init_models(self):
        """Initialize emotion recognition models"""
        self.models_ready = False
        
        if ADVANCED_MODELS_AVAILABLE:
            try:
                # Try to load Hugging Face emotion recognition model
                self.emotion_classifier = pipeline(
                    "audio-classification",
                    model="ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition",
                    return_all_scores=True
                )
                self.models_ready = True
                self.logger.info("Advanced emotion recognition model loaded")
            except Exception as e:
                self.logger.warning(f"Could not load advanced model: {e}")
                self._fallback_to_basic()
        else:
            self._fallback_to_basic()
    
    def _fallback_to_basic(self):
        """Fallback to basic feature-based emotion recognition"""
        if BASIC_PROCESSING_AVAILABLE:
            self.models_ready = True
            self.logger.info("Using basic feature-based emotion recognition")
        else:
            self.logger.error("No emotion recognition capabilities available")
            self.models_ready = False
    
    def is_ready(self) -> bool:
        """Check if emotion analyzer is ready"""
        return self.models_ready
    
    def extract_audio_features(self, audio_data: bytes) -> Optional[Dict[str, float]]:
        """Extract basic audio features for emotion analysis"""
        try:
            # Convert bytes to numpy array
            audio_array = self._bytes_to_audio_array(audio_data)
            
            if audio_array is None:
                return None
            
            # Extract features using librosa
            features = {}
            
            # Basic audio properties
            features['duration'] = len(audio_array) / 16000  # Assuming 16kHz sample rate
            features['mean_amplitude'] = np.mean(np.abs(audio_array))
            features['std_amplitude'] = np.std(audio_array)
            
            # Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=audio_array, sr=16000)[0]
            features['spectral_centroid_mean'] = np.mean(spectral_centroids)
            features['spectral_centroid_std'] = np.std(spectral_centroids)
            
            # Zero crossing rate
            zcr = librosa.feature.zero_crossing_rate(audio_array)[0]
            features['zcr_mean'] = np.mean(zcr)
            features['zcr_std'] = np.std(zcr)
            
            # MFCC features
            mfccs = librosa.feature.mfcc(y=audio_array, sr=16000, n_mfcc=13)
            for i in range(13):
                features[f'mfcc_{i}_mean'] = np.mean(mfccs[i])
                features[f'mfcc_{i}_std'] = np.std(mfccs[i])
            
            # Pitch/fundamental frequency
            pitches, magnitudes = librosa.core.piptrack(y=audio_array, sr=16000)
            pitch_values = []
            for t in range(pitches.shape[1]):
                index = magnitudes[:, t].argmax()
                pitch = pitches[index, t]
                if pitch > 0:
                    pitch_values.append(pitch)
            
            if pitch_values:
                features['pitch_mean'] = np.mean(pitch_values)
                features['pitch_std'] = np.std(pitch_values)
                features['pitch_min'] = np.min(pitch_values)
                features['pitch_max'] = np.max(pitch_values)
            else:
                features['pitch_mean'] = 0
                features['pitch_std'] = 0
                features['pitch_min'] = 0
                features['pitch_max'] = 0
            
            return features
            
        except Exception as e:
            self.logger.error(f"Error extracting audio features: {e}")
            return None
    
    def _bytes_to_audio_array(self, audio_data: bytes) -> Optional[np.ndarray]:
        """Convert audio bytes to numpy array"""
        try:
            # Try to read as WAV file
            audio_io = io.BytesIO(audio_data)
            with wave.open(audio_io, 'rb') as wav_file:
                frames = wav_file.readframes(-1)
                sound_info = np.frombuffer(frames, dtype=np.int16)
                sound_info = sound_info.astype(np.float32) / 32768.0  # Normalize
                return sound_info
        except Exception as e:
            # If WAV reading fails, try direct conversion
            try:
                audio_array = np.frombuffer(audio_data, dtype=np.int16)
                audio_array = audio_array.astype(np.float32) / 32768.0
                return audio_array
            except Exception as e2:
                self.logger.error(f"Error converting audio data: {e2}")
                return None
    
    def predict_emotion_from_features(self, features: Dict[str, float]) -> Dict[str, Any]:
        """Predict emotion using basic feature analysis"""
        try:
            # Simple rule-based emotion prediction
            # This is a basic implementation - you should train a proper model
            
            emotion_scores = {emotion: 0.0 for emotion in self.emotions}
            
            # Basic heuristics based on audio features
            pitch_mean = features.get('pitch_mean', 0)
            pitch_std = features.get('pitch_std', 0)
            amplitude_mean = features.get('mean_amplitude', 0)
            spectral_centroid = features.get('spectral_centroid_mean', 0)
            
            # High pitch + high variation = excitement/anger
            if pitch_mean > 200 and pitch_std > 50:
                if amplitude_mean > 0.1:
                    emotion_scores['anger'] += 0.3
                    emotion_scores['happiness'] += 0.2
                else:
                    emotion_scores['fear'] += 0.25
            
            # Low pitch + low variation = sadness/neutral
            elif pitch_mean < 150 and pitch_std < 30:
                emotion_scores['sadness'] += 0.3
                emotion_scores['neutral'] += 0.2
            
            # High amplitude = strong emotion
            if amplitude_mean > 0.15:
                emotion_scores['anger'] += 0.2
                emotion_scores['happiness'] += 0.15
            
            # Low amplitude = calm/sad
            elif amplitude_mean < 0.05:
                emotion_scores['sadness'] += 0.2
                emotion_scores['neutral'] += 0.3
            
            # High spectral centroid = bright/happy sounds
            if spectral_centroid > 2000:
                emotion_scores['happiness'] += 0.25
                emotion_scores['surprise'] += 0.15
            
            # Normalize and find dominant emotion
            total_score = sum(emotion_scores.values())
            if total_score > 0:
                emotion_scores = {k: v/total_score for k, v in emotion_scores.items()}
            else:
                # Default to neutral if no clear indicators
                emotion_scores['neutral'] = 1.0
            
            dominant_emotion = max(emotion_scores.items(), key=lambda x: x[1])
            
            return {
                'dominant_emotion': dominant_emotion[0],
                'confidence': dominant_emotion[1],
                'all_emotions': emotion_scores,
                'method': 'feature_based'
            }
            
        except Exception as e:
            self.logger.error(f"Error predicting emotion: {e}")
            return {
                'dominant_emotion': 'neutral',
                'confidence': 0.5,
                'all_emotions': {'neutral': 1.0},
                'method': 'fallback'
            }
    
    def analyze_speech_emotion(self, audio_data: bytes) -> Dict[str, Any]:
        """Main method to analyze emotion from speech audio"""
        if not self.is_ready():
            return {'error': 'Emotion analyzer not ready'}
        
        try:
            # Try advanced model first if available
            if ADVANCED_MODELS_AVAILABLE and hasattr(self, 'emotion_classifier'):
                try:
                    # Convert audio for Hugging Face model
                    audio_array = self._bytes_to_audio_array(audio_data)
                    if audio_array is not None:
                        # Resample to 16kHz if needed
                        audio_resampled = librosa.resample(audio_array, orig_sr=16000, target_sr=16000)
                        
                        # Get emotion predictions
                        results = self.emotion_classifier(audio_resampled)
                        
                        # Process results
                        emotion_scores = {result['label'].lower(): result['score'] for result in results}
                        dominant = max(emotion_scores.items(), key=lambda x: x[1])
                        
                        return {
                            'dominant_emotion': dominant[0],
                            'confidence': dominant[1],
                            'all_emotions': emotion_scores,
                            'method': 'advanced_model'
                        }
                except Exception as e:
                    self.logger.warning(f"Advanced model failed: {e}, falling back to basic analysis")
            
            # Fallback to feature-based analysis
            features = self.extract_audio_features(audio_data)
            if features:
                return self.predict_emotion_from_features(features)
            else:
                return {'error': 'Could not extract audio features'}
                
        except Exception as e:
            self.logger.error(f"Error in emotion analysis: {e}")
            return {'error': str(e)}

# Helper function for integration
def analyze_audio_emotion(audio_data: bytes) -> Dict[str, Any]:
    """Standalone function for emotion analysis"""
    analyzer = SpeechEmotionAnalyzer()
    return analyzer.analyze_speech_emotion(audio_data)