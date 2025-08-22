"""
Emotion Analyzer for Mitra AI
Analyzes emotions from user inputs using BERT model
"""

import os
import torch
import json
from datetime import datetime
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from config import SESSIONS_DIR

class EmotionAnalyzer:
    """Analyzes emotions from conversation text using BERT model"""
    
    def __init__(self, model_path="/home/vishalj/mitrallm/fine_tuned_model"):
        self.model_path = model_path
        self.tokenizer = None
        self.model = None
        self.is_initialized = False
        # GoEmotions simplified dataset labels (28 emotions)
        self.emotion_labels = [
            'admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring',
            'confusion', 'curiosity', 'desire', 'disappointment', 'disapproval', 'disgust',
            'embarrassment', 'excitement', 'fear', 'gratitude', 'grief', 'joy', 'love',
            'nervousness', 'optimism', 'pride', 'realization', 'relief', 'remorse',
            'sadness', 'surprise', 'neutral'
        ]
        self.load_model()   
    def load_model(self):
        """Load the emotion analyzer model"""
        try:
            print(f"🔄 Loading emotion analyzer from: {self.model_path}")
            
             
            if not os.path.exists(self.model_path):
                print(f"⚠️ Model path not found: {self.model_path}")
                raise FileNotFoundError(f"Model path not found: {self.model_path}")
            
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_path)
            self.model.eval()
            
            self.is_initialized = True
            print(f"✅ Emotion analyzer loaded successfully")
            print(f"🔍 Debug: is_ready() = {self.is_ready()}")
            return True
            
        except Exception as e:
            print(f"❌ Error loading emotion analyzer: {e}")
            self.model = None
            self.tokenizer = None
            self.is_initialized = False
            print(f"🔍 Debug: is_ready() = {self.is_ready()}")
            return False

    def is_ready(self):
        """Check if the emotion analyzer is ready to use"""
        return self.is_initialized and self.model is not None and self.tokenizer is not None
    
    def analyze_emotion(self, text):
        """Analyze emotion from text input"""
        if not self.model or not self.tokenizer:
            return {"error": "Model not loaded"}
        
        try:
             
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=512
            )
            
             
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
             
            probabilities = predictions[0].tolist()
            
             
            emotion_scores = {
                label: float(prob) for label, prob in zip(self.emotion_labels, probabilities)
            }
            
             
            dominant_emotion = max(emotion_scores, key=emotion_scores.get)
            confidence = emotion_scores[dominant_emotion]
            
            return {
                "dominant_emotion": dominant_emotion,
                "confidence": confidence,
                "all_emotions": emotion_scores,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Error analyzing emotion: {e}")
            return {"error": str(e)}
    
    def log_user_emotion(self, user_input):
        """Log emotion for real-time display only"""
        if not self.model:
            return
        
        try:
            emotion_result = self.analyze_emotion(user_input)
            if "error" not in emotion_result:
                print(f"📊 Detected emotion: {emotion_result['dominant_emotion']} ({emotion_result.get('confidence', 0):.2f})")
        except Exception as e:
            print(f"⚠️ Error in emotion logging: {e}")
    
    def get_session_top_emotions(self, conversation_history, top_k=3):
        """Get the top K emotions from the entire conversation session"""
        if not self.model or not conversation_history:
            return ["neutral"]
        
        try:
            # Collect all user inputs
            all_user_inputs = []
            for turn in conversation_history:
                if turn.get("user"):
                    all_user_inputs.append(turn["user"])
            
            if not all_user_inputs:
                return ["neutral"]
            
             
            emotion_scores = {}
            
            for user_input in all_user_inputs:
                emotion_result = self.analyze_emotion(user_input)
                
                if "error" not in emotion_result:
                    all_emotions = emotion_result.get("all_emotions", {})
                    
                     
                    for emotion, confidence in all_emotions.items():
                        if emotion not in emotion_scores:
                            emotion_scores[emotion] = 0
                        emotion_scores[emotion] += confidence
            
            if not emotion_scores:
                return ["neutral"]
            
             
            top_emotions = sorted(emotion_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
            
             
            return [emotion for emotion, score in top_emotions]
            
        except Exception as e:
            print(f"❌ Error getting session top emotions: {e}")
            return ["neutral"]