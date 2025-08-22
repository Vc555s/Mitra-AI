import sqlite3
from typing import List, Tuple
from pathlib import Path
from transformers import pipeline
import json


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = "/home/vishalj/mitrallm/data_layer/db/mood_data.db"

def get_emotion_classifier():
    """Get a lightweight emotion classification pipeline"""
    try:
        classifier = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            return_all_scores=True
        )
        return classifier
    except Exception as e:
        print(f"Warning: Could not load emotion classifier: {e}")
        return None

def extract_emotions(description: str) -> List[str]:
    """Extract top 3 emotions from description using lightweight LLM"""
    if not description:
        return []
    
    classifier = get_emotion_classifier()
    if not classifier:
        
        return fallback_emotion_extraction(description)
    
    try:
        
        results = classifier(description)
        
       
        emotions = []
        if results and len(results) > 0:
        
            sorted_emotions = sorted(results[0], key=lambda x: x['score'], reverse=True)
            emotions = [emotion['label'] for emotion in sorted_emotions[:3]]
        
        return emotions
    except Exception as e:
        print(f"Error in emotion extraction: {e}")
        return fallback_emotion_extraction(description)

def fallback_emotion_extraction(description: str) -> List[str]:
    """Fallback emotion extraction using keyword matching"""
    emotion_keywords = {
        'joy': ['happy', 'joy', 'excited', 'cheerful', 'delighted'],
        'sadness': ['sad', 'depressed', 'melancholy', 'gloomy', 'sorrowful'],
        'anger': ['angry', 'furious', 'irritated', 'annoyed', 'mad'],
        'fear': ['afraid', 'scared', 'terrified', 'anxious', 'worried'],
        'surprise': ['surprised', 'shocked', 'amazed', 'astonished'],
        'disgust': ['disgusted', 'repulsed', 'revolted'],
        'neutral': ['calm', 'neutral', 'content', 'satisfied']
    }
    
    description_lower = description.lower()
    found_emotions = []
    
    for emotion, keywords in emotion_keywords.items():
        if any(keyword in description_lower for keyword in keywords):
            found_emotions.append(emotion)
            if len(found_emotions) >= 3:
                break
    
   
    if not found_emotions:
        found_emotions = ['neutral']
    
    return found_emotions[:3]

def init_db():
    """Initialize database with mood_ratings table"""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS mood_ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            desc TEXT,
            emotions TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)
        conn.commit()

def insert_mood_rating(user_id: str, desc: str = None):
    """Insert a mood rating with automatic emotion extraction"""
    try:
        
        emotions = extract_emotions(desc) if desc else []
        
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO mood_ratings (user_id, desc, emotions)
                VALUES (?, ?, ?)
            """, (user_id, desc, json.dumps(emotions)))
            conn.commit()
        return True
    except Exception as e:
        print(f"Error inserting mood rating: {e}")
        return False

def get_mood_trend(user_id: str) -> List[Tuple[str, str, List[str]]]:
    """Get mood trend for a user with emotions"""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT timestamp, desc, emotions
            FROM mood_ratings
            WHERE user_id = ?
            ORDER BY timestamp ASC
        """, (user_id,))
        
        results = []
        for row in cursor.fetchall():
            timestamp, desc, emotions_json = row
            emotions = json.loads(emotions_json) if emotions_json else []
            results.append((timestamp, desc, emotions))
        
        return results

def get_recent_emotions(user_id: str, limit: int = 5) -> List[Tuple[str, List[str]]]:
    """Get recent emotions for a user (timestamp and emotions only)"""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT timestamp, emotions
            FROM mood_ratings
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        """, (user_id, limit))
        
        results = []
        for row in cursor.fetchall():
            timestamp, emotions_json = row
            emotions = json.loads(emotions_json) if emotions_json else []
            results.append((timestamp, emotions))
        
        return results