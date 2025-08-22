"""
Chat Interface for Mitra AI with Speech Input and Speech Emotion Recognition
Handles the main chat loop and user interaction with emotion analysis and speech recognition
"""

import threading
import requests
from datetime import datetime
from core_ai.llm_chat import LLMManager
from core_ai.prompt_builder import PromptBuilder
from services.rag_handler import RAGHandler
from services.session_manager import SessionManager
from services.emotion_analyzer import EmotionAnalyzer
from services.speech_handler import SpeechInputHandler
from services.speech_emotion_analyzer import SpeechEmotionAnalyzer  # NEW IMPORT

API_BASE_URL = "http://localhost:8000" 

class MitraAIChatInterface:
    """Main chat interface for Mitra AI with emotion analysis and speech input"""
    
    def __init__(self, user_name="default_user"):
        self.user_name = user_name
        self.llm_manager = LLMManager()   
        self.rag_handler = RAGHandler()
        self.session_manager = SessionManager(user_name)
        self.speech_handler = SpeechInputHandler()
        self.emotion_analyzer = EmotionAnalyzer()
        self.speech_emotion_analyzer = SpeechEmotionAnalyzer()   
        
         
        if self.emotion_analyzer.is_ready():
            print("😊 Text emotion analyzer is ready")
        else:
            print("⚠️ Text emotion analyzer not loaded - continuing without text emotion analysis")
        
         
        if self.speech_emotion_analyzer.is_ready():
            print("🎤 Speech emotion analyzer is ready")
        else:
            print("⚠️ Speech emotion analyzer not loaded - continuing without speech emotion analysis")
        
        if self.speech_handler.enabled:
            print("🎤 Speech input is ready")
        else:
            print("⚠️ Speech input not available - continuing with text only")

    def _generate_therapy_response(self, user_input):
        """Generate therapy response using local LLM (no FAISS context)"""
        try:
             
            conversation_history = self.session_manager.get_recent_conversation()
             
            conversation_history.append({"user": user_input, "response": ""})
            prompt = PromptBuilder.build_therapy_prompt(conversation_history)
            print("🧠 Using standard prompt")
             
            conversation_turns = len(conversation_history)
            user_input_length = len(user_input.split())
            if conversation_turns <= 3:
                base_tokens = 150
            elif conversation_turns <= 8:
                base_tokens = 250
            else:
                base_tokens = 350
            if user_input_length > 50:
                token_adjustment = min(100, user_input_length // 2)
            elif user_input_length < 10:
                token_adjustment = -30
            else:
                token_adjustment = 0
            max_tokens = min(max(100, base_tokens + token_adjustment), 500)
            response = self.llm_manager.generate_response(
                prompt,
                max_tokens=max_tokens,
                temperature=0.6,
                top_p=0.9,
                stop=["<|eot_id|>"]
            )
            return response
        except Exception as e:
            print(f"⚠️ Error generating therapy response: {e}")
            return "I understand you're sharing something important with me. Could you help me understand a bit more?"

    def start_chat(self):
        """Start the main chat loop with speech input option"""
        print("\n🧠 Mitra AI: Hi, I'm here to support you. What's on your mind?")
        
        if self.speech_handler.enabled:
            print("💡 Tip: Type 's' for speech input, or just type your message")
        
        while True:
            try:
                 
                user_input = self._get_user_input()
                
                if not user_input or not user_input.strip():
                    continue
                
                user_input = user_input.strip()
                
                 
                self._analyze_user_emotion(user_input)
                
                # Check for session timeout
                if self.session_manager.is_session_expired():
                    print("\n⏳ Session timed out. Generating summary...\n")
                    self._end_session()
                    break
                
                # Check for exit commands
                if user_input.lower() in ["exit", "bye", "quit", "goodbye"]:
                    print("\n✅ Ending session. Generating summary...\n")
                    self._end_session()
                    break
                
                # Process user input
                response = self._process_user_input(user_input)
                print(f"\n🧠 Mitra AI: {response}")
                
                # Add to session
                self.session_manager.add_turn(user_input, response)
                
            except KeyboardInterrupt:
                print("\n\n⚠️ Chat interrupted by user. Generating summary...\n")
                self._end_session()
                break
            except Exception as e:
                print(f"\n❌ Error in chat: {e}")
                print("Please try again or type 'exit' to end the session.")
    
    def _get_user_input(self):
        """Get user input via text or speech with emotion analysis"""
        if self.speech_handler.enabled:
            user_input = input("\nYou (type 's' for speech): ").strip()
            
            if user_input.lower() == 's':
                print("\n🎤 Starting speech input...")
                
                # Store both text and audio data for emotion analysis
                speech_result = {"text": None, "audio_data": None}
                
                def speech_worker():
                    # NEW: Try to get both text and audio data
                    if hasattr(self.speech_handler, 'get_speech_input_with_audio'):
                        text, audio_data = self.speech_handler.get_speech_input_with_audio()
                        speech_result["text"] = text
                        speech_result["audio_data"] = audio_data
                    else:
                        # Fallback to original method if new method not implemented
                        speech_result["text"] = self.speech_handler.get_speech_input()
                
                speech_thread = threading.Thread(target=speech_worker)
                speech_thread.daemon = True
                speech_thread.start()
                
                # Wait for speech input with option to cancel
                print("⏹️  Press Enter to stop recording early...")
                
                # Create input listener
                input_thread = threading.Thread(target=lambda: input())
                input_thread.daemon = True
                input_thread.start()
                
                # Wait for either speech completion or user stopping
                speech_thread.join(timeout=6)  # Slightly longer than max recording time
                
                if speech_thread.is_alive():
                    self.speech_handler.stop_recording()
                    speech_thread.join(timeout=2)
                
                if speech_result["text"]:
                    print(f"✅ Speech recognized: '{speech_result['text']}'")
                    
                     
                    
                    return speech_result["text"]
                else:
                    print("❌ No speech recognized. Please try typing instead.")
                    return input("You: ").strip()
            else:
                return user_input
        else:
            return input("\nYou: ").strip()
    
    def _handle_speech_input(self):
        """Handle speech input in separate thread"""
        return self.speech_handler.get_speech_input()
    
    def _analyze_user_emotion(self, user_input):
        """Analyze and log emotion from user input for real-time feedback"""
        if self.emotion_analyzer.model:
            self.emotion_analyzer.log_user_emotion(user_input)
    
    def _process_user_input(self, user_input):
        """Process user input and generate appropriate response"""
        try:
             
            needs_rag, groq_response = self.rag_handler.check_rag_need(user_input)
            
            if needs_rag and groq_response:
                 
                print(f"🔍 External information provided by Mitra AI")
                return groq_response
            else:
                 
                return self._generate_therapy_response(user_input)
                
        except Exception as e:
            print(f"⚠️ Error processing input: {e}")
            return "I'm sorry, I encountered an issue. Could you please try rephrasing that?"
    
    def _end_session(self):
        """End the current session and send summary to backend via API with both emotion types"""
        try:
            self.speech_handler.cleanup()

             
            summary_text = self.session_manager.generate_summary(
                self.llm_manager,
                self.emotion_analyzer if self.emotion_analyzer.model else None
            )

             
            text_emotions_list = (
                self.emotion_analyzer.get_session_top_emotions(3)
                if self.emotion_analyzer and self.emotion_analyzer.model
                else []
            )

             
            speech_emotions_list = []
            
             

             
            all_emotions = list(set(text_emotions_list + speech_emotions_list))
            
             
            if not all_emotions:
                all_emotions = ["neutral"]

             
            payload = {
                "user_id": self.user_name,
                "summary_text": summary_text,
                "emotions": all_emotions
            }
            resp = requests.post(f"{API_BASE_URL}/api/summary/save", json=payload)
            resp.raise_for_status()
            print(f"✅ Session stored via API for user {self.user_name}")
            
             
            if text_emotions_list:
                print(f"😊 Text emotions: {', '.join(text_emotions_list)}")
            if speech_emotions_list:
                print(f"🎤 Speech emotions: {', '.join(speech_emotions_list)}")
            if all_emotions:
                print(f"📊 Combined emotions: {', '.join(all_emotions)}")

             
            print("📝 Session Summary:")
            print("-" * 50)
            print(summary_text)
            print("-" * 50)

             
            stats = self.session_manager.get_session_stats()
            print(f"\n📊 Session completed:")
            print(f"   Duration: {stats['session_duration']}")
            print(f"   Turns: {stats['conversation_turns']}")
            print(f"   User: {stats['user_name']}")

        except Exception as e:
            print(f"❌ Error ending session: {e}")
    
    def show_previous_sessions(self):
        """Show previous session summaries for this user"""
        previous_sessions = self.session_manager.load_previous_sessions()
        
        if not previous_sessions:
            print(f"\n📋 No previous sessions found for user: {self.user_name}")
            return
        
        for i, session in enumerate(previous_sessions, 1):
            user_id = session.get('user_id', 'Unknown user')
            summary_text = session.get('summary_text', 'No summary available')
            emotion = session.get('emotion', 'unknown')
            
            print(f"\n{i}. User: {user_id}")
            print(f"   Summary: {summary_text}")
            print(f"   Emotion: {emotion.capitalize()}")
            print("-" * 40)