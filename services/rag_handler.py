"""
RAG (Retrieval Augmented Generation) Handler
Uses Groq API for external knowledge and real-time information
"""

import time
from groq import Groq
from config import GROQ_API_KEY, RAG_KEYWORDS
from core_ai.prompt_builder import PromptBuilder


class RAGHandler:
    """Handles external knowledge retrieval using Groq API"""
    
    def __init__(self):
        self.client = Groq(api_key=GROQ_API_KEY)
        self.model_name = "llama3-70b-8192"
    
    def check_rag_need(self, user_text):
        """
        Determine if user query needs external information using Groq API
        Returns: (needs_rag: bool, groq_response: str or None)
        """
        try:
            # Build intent detection messages
            intent_messages = [
                {
                    "role": "system",
                    "content": PromptBuilder.build_groq_rag_prompt()
                },
                {
                    "role": "user",
                    "content": user_text
                }
            ]
            
            # Call Groq API
            completion = self.client.chat.completions.create(
                model=self.model_name,
                messages=intent_messages,
                temperature=0.3
            )
            
            response = completion.choices[0].message.content.strip()
            
            # Add delay after Groq generation (rate limiting)
            time.sleep(3)
            
            # Check if RAG is needed
            if response == "NO_RAG_NEEDED":
                return False, None
            else:
                return True, response
                
        except Exception as e:
            print(f"⚠ Groq API error: {e}")
            
            # Fallback to keyword-based detection
            needs_rag = self._fallback_rag_detection(user_text)
            return needs_rag, None
    
    def _fallback_rag_detection(self, user_text):
        """Fallback method using keyword detection"""
        user_lower = user_text.lower()
        return any(keyword in user_lower for keyword in RAG_KEYWORDS)
    
    def get_api_info(self):
        """Get information about Groq API configuration"""
        return {
            "model": self.model_name,
            "api_key_configured": bool(GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here"),
            "fallback_keywords": RAG_KEYWORDS
        }