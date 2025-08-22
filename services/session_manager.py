"""
Session Management for Mitra AI
Handles conversation storage, summaries, and user profiles with emotion integration
"""

import os
import json
import math
from datetime import datetime, timedelta
from config import SESSIONS_DIR, SESSION_TIMEOUT_HOURS
from core_ai.prompt_builder import PromptBuilder
from data_layer.db.faiss_handler import save_summary, get_recent_summaries

class SessionManager:
    """Manages user sessions, conversation history, and summaries with emotions"""
    
    def __init__(self, user_name):
        self.user_name = user_name
        self.conversation = []
        self.session_start = datetime.now()
        self.last_activity = datetime.now()
    
    def add_turn(self, user_input, response):
        """Add a conversation turn to the session"""
        self.conversation.append({
            "user": user_input,
            "response": response,
            "timestamp": datetime.now().isoformat()
        })
        self.last_activity = datetime.now()
    
    def is_session_expired(self):
        """Check if session has expired due to inactivity"""
        time_since_last = datetime.now() - self.last_activity
        return time_since_last > timedelta(hours=SESSION_TIMEOUT_HOURS)
    
    def get_conversation_length(self):
        """Get the number of conversation turns"""
        return len(self.conversation)
    
    def get_recent_conversation(self, num_turns=10):
        """Get recent conversation turns"""
        return self.conversation[-num_turns:] if self.conversation else []
    
    '''def generate_summary(self, llm_manager, emotion_analyzer=None, backend_connector=None):
        """
        Generate structured summary with top 3 emotions and save to user's JSON file
        Also store in FAISS backend if available
        """
        if not self.conversation:
            print("⚠️ No conversation to summarize")
            return "No conversation available"
        
        print("📝 Generating session summary with emotion analysis...")
        
        # Build summarization prompt
        prompt = PromptBuilder.build_summary_prompt(self.conversation, self.user_name)
        
        print(f"📊 Generating comprehensive summary...")
        
        try:
            # Generate summary with better parameters to avoid repetition
            summary = llm_manager.generate_response(
                prompt,
                max_tokens=500,  # Reduced to avoid repetitive output
                temperature=0.2,  # Lower temperature for more focused output
                top_p=0.8,
                stop=["<|eot_id|>", "```", "python", "import"]  # Stop at code blocks
            )
            
            # Clean up summary - remove raw dialogue patterns if they appear
            if any(label in summary for label in ["User:", "Mitra AI:", "```", "python", "import"]):
                print("⚠️ Unwanted content detected — regenerating.")
                retry_prompt = prompt + "\n\n⚠️ IMPORTANT: Only provide the ### formatted summary. Do NOT include any code, 'User:', 'Mitra AI:', or Python examples."
                summary = llm_manager.generate_response(
                    retry_prompt,
                    max_tokens=500,
                    temperature=0.1,  # Very low temperature for clean output
                    top_p=0.7,
                    stop=["<|eot_id|>", "```", "python", "import", "def "]
                )
            
            # Clean up markdown formatting issues in summary
            cleaned_summary = self._clean_summary_formatting(summary)
            
            # Get top 3 emotions from conversation
            top_emotions = ["neutral"]
            if emotion_analyzer:
                top_emotions = emotion_analyzer.get_session_top_emotions(self.conversation, top_k=3)
                if not top_emotions:
                    top_emotions = ["neutral"]
            
            # Save to local JSON file
            self._save_summary_to_file(cleaned_summary, top_emotions)
            
            # NEW: Store in FAISS backend for future context retrieval
            if backend_connector and backend_connector.enabled:
                success = backend_connector.store_session_summary(
                    self.user_name, 
                    cleaned_summary, 
                    top_emotions
                )
                if success:
                    print("✅ Session stored in FAISS backend")
                else:
                    print("⚠️ Failed to store session in FAISS backend")
            
            return cleaned_summary
            
        except Exception as e:
            print(f"❌ Error generating summary: {e}")
            return "Error generating summary"'''
    def generate_summary(self, llm_manager, emotion_analyzer=None):
        """
        Generate structured summary with top 3 emotions and save to FAISS
        """
        if not self.conversation:
            print("⚠️ No conversation to summarize")
            return "No conversation available"
        
        print("📝 Generating session summary with emotion analysis...")
        
        # Build summarization prompt
        prompt = PromptBuilder.build_summary_prompt(self.conversation, self.user_name)
        
        try:
            summary = llm_manager.generate_response(
                prompt,
                max_tokens=500,
                temperature=0.2,
                top_p=0.8,
                stop=["<|eot_id|>", "```", "python", "import"]
            )
            
            if any(label in summary for label in ["User:", "Mitra AI:", "```", "python", "import"]):
                print("⚠️ Unwanted content detected — regenerating.")
                retry_prompt = prompt + "\n\n⚠️ IMPORTANT: Only provide the ### formatted summary."
                summary = llm_manager.generate_response(
                    retry_prompt,
                    max_tokens=500,
                    temperature=0.1,
                    top_p=0.7,
                    stop=["<|eot_id|>", "```", "python", "import", "def "]
                )
            
            cleaned_summary = self._clean_summary_formatting(summary)
            
            # Get top emotions
            top_emotions = ["neutral"]
            if emotion_analyzer:
                top_emotions = emotion_analyzer.get_session_top_emotions(self.conversation, top_k=3) or ["neutral"]
            
            # Save directly to FAISS
            self._save_summary_to_file(cleaned_summary, top_emotions)
            
            return cleaned_summary
            
        except Exception as e:
            print(f"❌ Error generating summary: {e}")
            return "Error generating summary"

    def _clean_summary_formatting(self, summary):
        """Clean up markdown formatting issues in the summary"""
        # Replace problematic markdown patterns
        summary = summary.replace('\\n\\n###', '\n\n###')
        summary = summary.replace('\\n###', '\n###')
        summary = summary.replace('\\n-', '\n-')
        summary = summary.replace('\\n', '\n')
        
        # Ensure proper spacing around headers
        summary = summary.replace('\n###', '\n\n###')
        summary = summary.replace('###\n', '### ')
        
        # Clean up extra whitespace
        lines = [line.strip() for line in summary.split('\n')]
        cleaned_lines = []
        
        for line in lines:
            if line:
                cleaned_lines.append(line)
            elif cleaned_lines and cleaned_lines[-1]:  # Only add blank line if previous wasn't blank
                cleaned_lines.append('')
        
        return '\n'.join(cleaned_lines)
  
    def _generate_query_gist(self, llm_manager):
        """Generate a brief gist of what the user discussed"""
        if not self.conversation:
            return "No conversation available"
        
        user_messages = [turn["user"] for turn in self.conversation]
        
        try:
            gist_prompt = PromptBuilder.build_query_gist_prompt(user_messages)
            
            gist = llm_manager.generate_response(
                gist_prompt,
                max_tokens=30,  # Slightly increased for better gists
                temperature=0.2,
                stop=["<|eot_id|>", "\n"]
            )
            
            # Clean and validate gist
            gist = gist.strip()
            if len(gist.split()) > 12 or not gist:
                return "User discussed personal concerns"
            
            return gist
            
        except Exception as e:
            print(f"⚠️ Error generating query gist: {e}")
            return "User discussed personal concerns"
    
    '''def _save_summary_to_file(self, summary_text, emotions_list):
        """Save session summary to user's JSON file in the simplified format"""
        try:
            # Ensure sessions directory exists
            os.makedirs(SESSIONS_DIR, exist_ok=True)
            
            # User's JSON file path
            user_file = os.path.join(SESSIONS_DIR, f"{self.user_name}.json")
            
            # Create new session record with the ACTUAL detailed summary and top 3 emotions
            new_session = {
                "user_id": self.user_name,
                "summary_text": summary_text,  # Now this will be the detailed ### format
                "emotions": emotions_list  # List of top 3 emotions
            }
            
            # Load existing data or create new list
            sessions = []
            if os.path.exists(user_file):
                try:
                    with open(user_file, "r", encoding="utf-8") as f:
                        sessions = json.load(f)
                except Exception as e:
                    print(f"⚠️ Error reading existing file, creating new: {e}")
                    sessions = []
            
            # Append new session
            sessions.append(new_session)
            
            # Save updated data
            with open(user_file, "w", encoding="utf-8") as f:
                json.dump(sessions, f, ensure_ascii=False, indent=2)
            
            print(f"📄 Session appended to → {user_file}")
            print(f"😊 Top emotions: {', '.join(emotions_list)}")
            
        except Exception as e:
            print(f"❌ Error saving summary: {e}")'''
    def _save_summary_to_file(self, summary_text, emotions_list):
        """Save session summary to FAISS instead of local JSON"""
        try:
            # Store in FAISS
            success = save_summary(self.user_name, summary_text, emotions_list)
            if success:
                print(f"✅ Session stored in FAISS for user {self.user_name}")
                print(f"😊 Top emotions: {', '.join(emotions_list)}")
            else:
                print(f"⚠️ Failed to store session in FAISS for user {self.user_name}")
        except Exception as e:
            print(f"❌ Error saving summary to FAISS: {e}")
    def load_previous_sessions(self, limit=5):
        """Load previous session summaries for this user from FAISS"""
        try:
            sessions = get_recent_summaries(self.user_name, limit)
            return sessions if sessions else []
        except Exception as e:
            print(f"⚠️ Error loading previous sessions from FAISS: {e}")
            return []
    
    '''def load_previous_sessions(self, limit=5):
        """Load previous session summaries for this user"""
        try:
            user_file = os.path.join(SESSIONS_DIR, f"{self.user_name}.json")
            
            if not os.path.exists(user_file):
                return []
            
            with open(user_file, "r", encoding="utf-8") as f:
                sessions = json.load(f)
            
            # Return most recent sessions (last 'limit' entries)
            return sessions[-limit:] if len(sessions) > limit else sessions
            
        except Exception as e:
            print(f"⚠️ Error loading previous sessions: {e}")
            return []'''
    
    def get_session_stats(self):
        """Get session statistics"""
        return {
            "user_name": self.user_name,
            "session_duration": str(datetime.now() - self.session_start),
            "conversation_turns": len(self.conversation),
            "last_activity": self.last_activity.isoformat(),
            "is_expired": self.is_session_expired()
        }