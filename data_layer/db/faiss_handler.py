import os
import pickle
import faiss
import numpy as np
from datetime import datetime
from sentence_transformers import SentenceTransformer
from zoneinfo import ZoneInfo
from typing import List
import re
import random
from collections import Counter

DIM = 384  
FAISS_INDEX_PATH = "/home/vishalj/mitrallm/data_layer/db/embeddings/index.faiss"
USER_SUMMARIES_PATH = "/home/vishalj/mitrallm/data_layer/db/embeddings/user_summaries.pkl"
USER_EMBEDDINGS_PATH = "/home/vishalj/mitrallm/data_layer/db/embeddings/user_embeddings.pkl"
USER_EMOTIONS_PATH = "/home/vishalj/mitrallm/data_layer/db/embeddings/user_emotions.pkl"
USER_TIMESTAMPS_PATH = "/home/vishalj/mitrallm/data_layer/db/embeddings/user_timestamps.pkl"

os.makedirs("/home/vishalj/mitrallm/data_layer/db/embeddings", exist_ok=True)

model = SentenceTransformer("all-MiniLM-L6-v2")


PROMPT_TEMPLATES = {
    'emotion_focus': [
        "I've noticed {emotion} has been a recurring theme in our sessions. How are you feeling about that today?",
        "You've mentioned feeling {emotion} several times. What's been triggering that emotion lately?",
        "How have you been managing the {emotion} we've discussed in previous sessions?"
    ],
    'progress_reflection': [
        "What's been the most significant change or insight for you since we started working together?",
        "Looking back at our sessions, what progress are you most proud of?",
        "How have you been applying the strategies we've discussed?"
    ],
    'theme_exploration': [
        "I see {theme} has come up in our conversations. How does that relate to what you're experiencing right now?",
        "We've talked about {theme} before. Would you like to explore that further today?",
        "How has your relationship with {theme} evolved since we last discussed it?"
    ],
    'emotional_progression': [
        "I sense there might have been some changes in how you're feeling since our last session. Would you like to share what's been different?",
        "How has your emotional landscape shifted since we last met?",
        "What emotions have been most present for you since our last session?"
    ],
    'wellness_check': [
        "How have you been taking care of yourself since we last spoke?",
        "What self-care practices have been most helpful for you lately?",
        "How are you balancing your needs with the demands in your life?"
    ],
    'current_focus': [
        "What would be most helpful for us to focus on in today's session?",
        "What's been on your mind that you'd like to explore today?",
        "Is there anything specific that feels important to address right now?"
    ]
}


EMOTION_CATEGORIES = {
    'negative': ['anxiety', 'stress', 'overwhelmed', 'frustrated', 'angry', 'sad', 'depressed', 'worried', 'fearful'],
    'positive': ['hopeful', 'confident', 'proud', 'excited', 'grateful', 'content', 'peaceful'],
    'neutral': ['reflective', 'curious', 'determined', 'focused', 'calm', 'balanced']
}


THERAPY_THEMES = {
    'relationships': ['relationship', 'partner', 'family', 'friend', 'communication', 'boundary'],
    'work': ['work', 'job', 'career', 'stress', 'deadline', 'colleague', 'boss'],
    'self_development': ['growth', 'change', 'improvement', 'goal', 'progress', 'development'],
    'trauma': ['trauma', 'past', 'childhood', 'memory', 'trigger', 'healing'],
    'anxiety': ['anxiety', 'worry', 'fear', 'panic', 'stress', 'overwhelm'],
    'depression': ['depression', 'sad', 'hopeless', 'worthless', 'tired', 'empty']
}

if os.path.exists(FAISS_INDEX_PATH):
    index = faiss.read_index(FAISS_INDEX_PATH)
    with open(USER_SUMMARIES_PATH, "rb") as f:
        user_summaries = pickle.load(f)
    with open(USER_EMBEDDINGS_PATH, "rb") as f:
        user_embeddings = pickle.load(f)
    if os.path.exists(USER_EMOTIONS_PATH):
        with open(USER_EMOTIONS_PATH, "rb") as f:
            user_emotions = pickle.load(f)
    else:
        user_emotions = {}
    if os.path.exists(USER_TIMESTAMPS_PATH):
        with open(USER_TIMESTAMPS_PATH, "rb") as f:
            user_timestamps = pickle.load(f)
    else:
        user_timestamps = {}
else:
    index = faiss.IndexFlatL2(DIM)
    user_summaries = {}
    user_embeddings = {}
    user_emotions = {}
    user_timestamps = {}

def save_summary(user_id: str, summary_text: str, emotions: List[str]):
    timestamp = datetime.now(ZoneInfo("Asia/Kolkata")).isoformat()
    
    embedding = model.encode(summary_text).astype(np.float32)
    index.add(embedding.reshape(1, -1))
    
    if user_id not in user_summaries:
        user_summaries[user_id] = []
        user_embeddings[user_id] = []
        user_emotions[user_id] = []
        user_timestamps[user_id] = []
    
    user_summaries[user_id].append(summary_text)
    user_embeddings[user_id].append(embedding.tolist())
    user_emotions[user_id].append(emotions)  
    user_timestamps[user_id].append(timestamp)
    
    faiss.write_index(index, FAISS_INDEX_PATH)
    with open(USER_SUMMARIES_PATH, "wb") as f:
        pickle.dump(user_summaries, f)
    with open(USER_EMBEDDINGS_PATH, "wb") as f:
        pickle.dump(user_embeddings, f)
    with open(USER_EMOTIONS_PATH, "wb") as f:
        pickle.dump(user_emotions, f)
    with open(USER_TIMESTAMPS_PATH, "wb") as f:
        pickle.dump(user_timestamps, f)
    
    return {"message": "Summary saved successfully", "emotions": emotions, "timestamp": timestamp}

def get_user_embeddings(user_id: str):
    
    if user_id not in user_embeddings:
        return []
    return user_embeddings[user_id]

def get_user_summaries(user_id: str):
    
    if user_id not in user_summaries:
        return []
    return user_summaries[user_id]

def get_user_emotions(user_id: str):
    if user_id not in user_emotions:
        return []
    return user_emotions[user_id]

def get_user_timestamps(user_id: str):
    if user_id not in user_timestamps:
        return []
    return user_timestamps[user_id]

def get_recent_summaries(user_id: str, count: int = None):
    if user_id not in user_summaries or not user_summaries[user_id]:
        return []
    
    total_sessions = len(user_summaries[user_id])
    if count is None:
        if total_sessions <= 10:
            count = 3
        elif total_sessions <= 30:
            count = 5
        else:
            count = 9
    count = min(count, total_sessions)
    
    recent_summaries = user_summaries[user_id][-count:]
    recent_emotions = user_emotions[user_id][-count:]
    recent_timestamps = user_timestamps[user_id][-count:]
    
    return [
        {
            "summary": summary,
            "emotions": emotions if isinstance(emotions, list) else [emotions],  # Handle backward compatibility
            "timestamp": timestamp
        }
        for summary, emotions, timestamp in zip(recent_summaries, recent_emotions, recent_timestamps)
    ]

def find_similar_summaries_for_user(user_id: str, query_text: str, top_k: int = 3):
    if user_id not in user_summaries or not user_summaries[user_id]:
        return []
    query_embedding = model.encode(query_text).astype(np.float32)
    embs = np.array(user_embeddings[user_id])
    sims = np.dot(embs, query_embedding) / (
        np.linalg.norm(embs, axis=1) * np.linalg.norm(query_embedding) + 1e-8
    )
    indices = np.argsort(sims)[::-1][:top_k]
    return [
        {
            "summary": user_summaries[user_id][i],
            "emotions": user_emotions[user_id][i] if isinstance(user_emotions[user_id][i], list) else [user_emotions[user_id][i]],  # Handle backward compatibility
            "timestamp": user_timestamps[user_id][i]
        }
        for i in indices
    ]

def generate_session_prompts(user_id: str, count: int = 3) -> List[str]:
    # Use a lightweight LLM to generate prompts from recent summaries
    if user_id not in user_summaries or not user_summaries[user_id]:
        return [
            "How are you feeling today?",
            "What's been on your mind lately?",
            "Is there anything specific you'd like to talk about?"
        ]

    recent_summaries = get_recent_summaries(user_id, count=5)
    if not recent_summaries:
        return [
            "How are you feeling today?",
            "What's been on your mind lately?",
            "Is there anything specific you'd like to talk about?"
        ]

    try:
        from transformers import pipeline
        generator = pipeline("text2text-generation", model="google/flan-t5-small")
        # Prepare context for the LLM
        summaries_text = "\n".join([f"Session {i+1}: {s['summary']}" for i, s in enumerate(recent_summaries)])
        prompt = (
            f"Given the following previous session summaries, generate {count} helpful, empathetic, and specific prompts to start the next session. "
            f"Return each prompt as a separate line.\n\n"
            f"Previous session summaries:\n{summaries_text}"
        )
        result = generator(prompt, max_length=128, num_return_sequences=1)
        # Split the output into lines and filter out empty lines
        generated = result[0]['generated_text']
        prompts = [line.strip('- ').strip() for line in generated.split('\n') if line.strip()]
        # If the model returns more than needed, trim; if less, fill with defaults
        if len(prompts) < count:
            defaults = [
                "How are you feeling today?",
                "What's been on your mind lately?",
                "Is there anything specific you'd like to talk about?"
            ]
            prompts += defaults[:count - len(prompts)]
        return prompts[:count]
    except Exception as e:
        # Fallback to template-based prompts if LLM fails
        print(f"[Prompt LLM fallback] {e}")
        prompts = []
        emotion_counts = Counter()
        for session in recent_summaries:
            emotions = session.get('emotions', [])
            for emotion in emotions:
                emotion_counts[emotion] += 1
        if emotion_counts:
            most_common_emotion = emotion_counts.most_common(1)
            if most_common_emotion:
                emotion_name = most_common_emotion[0][0]
                template = random.choice(PROMPT_TEMPLATES['emotion_focus'])
                prompts.append(template.format(emotion=emotion_name))
        if len(recent_summaries) > 1:
            recent_emotions = [s.get('emotions', []) for s in recent_summaries]
            if recent_emotions[-1] != recent_emotions[-2]:
                prompts.append(PROMPT_TEMPLATES['emotional_progression'][0])
        all_summaries_text = ' '.join([s.get('summary', '') for s in recent_summaries])
        for theme_name, keywords in THERAPY_THEMES.items():
            if any(keyword in all_summaries_text.lower() for keyword in keywords):
                template = random.choice(PROMPT_TEMPLATES['theme_exploration'])
                prompts.append(template.format(theme=theme_name))
                break
        if len(recent_summaries) > 1:
            prompts.append(PROMPT_TEMPLATES['wellness_check'][0])
        prompts.append(PROMPT_TEMPLATES['current_focus'][0])
        return prompts[:count]