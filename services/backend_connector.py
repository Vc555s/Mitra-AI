"""
Backend Connector for Mitra AI
Connects to FAISS backend for context-aware prompts
"""

import requests
import json
from typing import List, Dict, Optional
import time

class BackendConnector:
    def __init__(self, backend_url="http://localhost:8000"):
        self.backend_url = backend_url
        self.enabled = self._check_backend_availability()
        self.session = requests.Session()   
        
    def _check_backend_availability(self):
        """Check if the FAISS backend is available with retry"""
        for attempt in range(3):
            try:
                response = self.session.get(f"{self.backend_url}/", timeout=3)
                if response.status_code == 200:
                    return True
            except:
                if attempt < 2:
                    time.sleep(1)   
        return False
    
    def store_session_summary(self, user_id: str, summary_text: str, emotions: List[str]) -> bool:
        """Store session summary with retry logic"""
        if not self.enabled:
            return False
            
        for attempt in range(2):
            try:
                payload = {
                    "user_id": user_id,
                    "summary_text": summary_text,
                    "emotions": emotions
                }
                
                response = self.session.post(
                    f"{self.backend_url}/api/summary/save",
                    json=payload,
                    timeout=15
                )
                
                if response.status_code == 200:
                    return True
                    
            except Exception as e:
                print(f"⚠️ Backend storage attempt {attempt + 1} failed: {e}")
                if attempt == 0:
                    time.sleep(2)   
                    
        return False
    
    
    def get_context_prompts(self, user_id: str, count: int = 3) -> List[str]:
        """Get context-aware prompts from FAISS backend"""
        if not self.enabled:
            return []
        
        try:
            payload = {
                "user_id": user_id,
                "count": count
            }
            
            response = requests.post(
                f"{self.backend_url}/api/prompts/generate",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("prompts", [])
            else:
                return []
                
        except Exception as e:
            print(f"⚠️ Error getting context prompts: {e}")
            return []