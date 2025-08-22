#!/usr/bin/env python3
"""
Session Viewer for Mitra AI
View session summaries with emotion analysis
"""

import os
import json
import argparse
from datetime import datetime
from config import SESSIONS_DIR


def main():
    parser = argparse.ArgumentParser(description="View session data with emotion analysis")
    parser.add_argument('username', help='Username to view sessions for')
    parser.add_argument('--limit', type=int, default=5, help='Number of recent sessions to show')
    parser.add_argument('--detailed', action='store_true', help='Show detailed session information')
    
    args = parser.parse_args()
    
    try:
        sessions = load_user_sessions(args.username, args.limit)
        
        if not sessions:
            print(f"❌ No sessions found for user: {args.username}")
            return
        
        print(f"📊 Recent sessions for {args.username}")
        print("=" * 60)
        
        emotion_counts = {}
        
        for i, session in enumerate(sessions, 1):
            query = session.get('query', 'No query available')
            results = session.get('results', [])
            
            print(f"\n{i}. Query: {query}")
            
            if results and len(results) > 0:
                summary = results[0].get('summary', 'No summary available')
                emotion = results[0].get('emotion', 'unknown')
                
                print(f"   Emotion: {emotion.capitalize()}")
                
                 
                emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
                
                if args.detailed:
                    print(f"   Summary: {summary}")
                else:
                     
                    first_line = summary.split('\n')[0] if summary else 'No summary'
                    print(f"   Summary: {first_line[:80]}{'...' if len(first_line) > 80 else ''}")
            
            print("-" * 40)
            
        
        # Show emotion distribution
        if emotion_counts:
            print(f"\n😊 Emotion Distribution:")
            print("-" * 30)
            total = sum(emotion_counts.values())
            
            for emotion, count in sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True):
                percentage = (count / total) * 100
                print(f"{emotion.capitalize():12}: {count:3} ({percentage:5.1f}%)")
    
    except Exception as e:
        print(f"❌ Error viewing sessions: {e}")


def load_user_sessions(username, limit=5):
    """Load recent session files for a user"""
    sessions = []
    
    if not os.path.exists(SESSIONS_DIR):
        return sessions
    
    # Get all session files for this user
    session_files = []
    for filename in os.listdir(SESSIONS_DIR):
        if filename.startswith(f"session_{username}_") and filename.endswith(".json"):
            session_files.append(filename)
    
    # Sort by filename (which includes timestamp)
    session_files.sort(reverse=True)
    
    # Load the most recent sessions
    for filename in session_files[:limit]:
        filepath = os.path.join(SESSIONS_DIR, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                session_data = json.load(f)
                sessions.append(session_data)
        except Exception as e:
            print(f"⚠️ Error loading session file {filename}: {e}")
    
    return sessions


if __name__ == "__main__":
    main()