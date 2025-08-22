#!/usr/bin/env python3
""" 
Mitra AI - Virtual Therapist
Main entry point for the application with emotion analysis

Usage:
    python main.py <username>
    python main.py --info
    python main.py --history <username>
"""

import sys
import argparse
from chat_interface import MitraAIChatInterface
from services.speech_handler import SpeechInputHandler


# speech_handler = SpeechInputHandler()
# if speech_handler.enabled:
#     transcript = speech_handler.get_speech_input()
# else:
#     transcript = input("Type your message: ")
# print(transcript)
# speech_handler.cleanup()

# Handle PyAudio dependency gracefully
try:
    from services.speech_handler import SpeechInputHandler
    SPEECH_AVAILABLE = True
except ImportError as e:
    SPEECH_AVAILABLE = False
    print(f"⚠️  Speech functionality not available: {e}")
    print("   Running in text-only mode...")

# Only initialize speech handler if available
if SPEECH_AVAILABLE:
    try:
        speech_handler = SpeechInputHandler()
        if speech_handler.enabled:
            transcript = speech_handler.get_speech_input()
        else:
            transcript = input("Type your message: ")
        print(transcript)
        speech_handler.cleanup()
    except Exception as e:
        print(f"⚠️  Speech handler initialization failed: {e}")
        print("   Falling back to text input...")
        SPEECH_AVAILABLE = False

def get_user_input():
    """Get user input with speech support if available"""
    if SPEECH_AVAILABLE:
        try:
            speech_handler = SpeechInputHandler()
            if speech_handler.enabled:
                print("🎤 Listening... (speak now)")
                transcript = speech_handler.get_speech_input()
                speech_handler.cleanup()
                return transcript
        except Exception as e:
            print(f"⚠️  Speech input failed: {e}")
            print("   Falling back to text input...")
    
    return input("💬 Type your message: ")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Mitra AI - Virtual Therapist",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py john               # Start chat with user 'john'
  python main.py --info             # Show system information
  python main.py --history john     # Show previous sessions for 'john'
        
        """
    )
        
    parser.add_argument(
        'username', 
        nargs='?',
        help='Username for the session (required for chat)'
    )
        
    parser.add_argument(
        '--info', 
        action='store_true',
        help='Show system information and exit'
    )
        
    parser.add_argument(
        '--history', 
        metavar='USERNAME',
        help='Show previous sessions for specified user'
    )
        
    args = parser.parse_args()
        
    try:
        # Show system info
        if args.info:
            show_system_info()
            return
                
        # Show user history
        if args.history:
            show_user_history(args.history)
            return
        
        # Check if username is provided for chat
        if not args.username:
            print("❌ Error: Username is required!")
            print("Usage: python main.py <username>")
            print("Example: python main.py john")
            sys.exit(1)
                
        # Start chat session
        print("🚀 Starting Mitra AI...")
        print("=" * 50)
                
        chat_interface = MitraAIChatInterface(args.username)
        chat_interface.start_chat()
                
        print("\n👋 Thank you for using Mitra AI. Take care!")
            
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye! Take care!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error starting Mitra AI: {e}")
        print("Please check your configuration and try again.")
        sys.exit(1)


def show_system_info():
    """Show system information"""
    print("🔍 Mitra AI System Information")
    print("=" * 50)
        
    try:
        # Initialize chat interface to get system info
        chat_interface = MitraAIChatInterface("info_user")
        info = chat_interface.get_system_info()
                
        # Display LLM info
        print("\n🤖 Local LLM Model:")
        llm_info = info['llm_info']
        print(f"   Name: {llm_info['name']}")
        print(f"   Loaded: {llm_info['loaded']}")
        print(f"   Context Size: {llm_info['context_size']} tokens")
                
        # Display RAG info
        print("\n🔍 RAG Handler (Groq API):")
        rag_info = info['rag_info']
        print(f"   Model: {rag_info['model']}")
        print(f"   API Key Configured: {rag_info['api_key_configured']}")
        print(f"   Fallback Keywords: {len(rag_info['fallback_keywords'])} keywords")
        
        # Display Emotion Analyzer info
        print("\n😊 Emotion Analyzer:")
        emotion_info = info['emotion_analyzer_info']
        print(f"   Loaded: {emotion_info['loaded']}")
        print(f"   Model Path: {emotion_info['model_path']}")
        print(f"   Emotion Labels: {', '.join(emotion_info['labels'])}")
                
        # Display session info
        print("\n📊 Session Management:")
        session_info = info['session_info']
        print(f"   User: {session_info['user_name']}")
        print(f"   Turns: {session_info['conversation_turns']}")
                
        print("\n✅ System check completed successfully!")
            
    except Exception as e:
        print(f"❌ Error getting system info: {e}")


def show_user_history(username):
    """Show previous sessions for a user"""
    print(f"📋 Loading session history for: {username}")
    print("=" * 50)
        
    try:
        # Create a temporary chat interface to access session manager
        chat_interface = MitraAIChatInterface(username)
        chat_interface.show_previous_sessions()
            
    except Exception as e:
        print(f"❌ Error loading user history: {e}")


if __name__ == "__main__":
    main()