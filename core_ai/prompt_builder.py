"""
Prompt building utilities for Mitra AI
Handles chat formatting and conversation management
"""

from config import SYSTEM_PROMPT


class PromptBuilder:
    """Handles prompt formatting for different conversation types"""
    
    @staticmethod
    def format_chat_message(role, content):
        """Format a single chat message in LLaMA format"""
        return f"<|start_header_id|>{role}<|end_header_id|>\n{content}<|eot_id|>"
    
    @staticmethod
    def format_chat_messages(messages):
        """Format multiple chat messages"""
        prompt = ""
        for msg in messages:
            prompt += PromptBuilder.format_chat_message(msg['role'], msg['content'])
        prompt += "<|start_header_id|>assistant<|end_header_id|>\n"
        return prompt
    
    @staticmethod
    def build_therapy_prompt(conversation_history, user_id=None):
        """Build prompt for main therapy conversation, appending personalized prompt to system prompt"""
        from config import BASE_SYSTEM_PROMPT, _build_personalized_prompt
        # Always append personalized prompt to base system prompt
        personalized = _build_personalized_prompt(user_id) if user_id else ""
        system_prompt = BASE_SYSTEM_PROMPT + ("\n\n" + personalized if personalized else "")
        messages = [{"role": "system", "content": system_prompt}]
        # Add conversation history
        for turn in conversation_history:
            messages.append({"role": "user", "content": turn["user"]})
            if turn["response"]:
                messages.append({"role": "assistant", "content": turn["response"]})
        return PromptBuilder.format_chat_messages(messages)
    
    @staticmethod
    def build_summary_prompt(conversation_history, user_name="user"):
        """Build prompt for session summary generation"""
        # Get last 5 conversation turns for highlights
        recent_turns = conversation_history[-5:] if len(conversation_history) > 5 else conversation_history
        
        prompt = (
            "You are Mitra AI's summarizer. You will write a structured and *concise* summary without restating "
            "each turn. Use this exact format"
            "User Emotions"
            "Brief emotional insights"
            "Themes Discussed"
            "Main topics covered"
            "Support Provided by Mitra AI"
            "Type of therapeutic support given"
            "Use only the bullet highlights below to guide your writing"
            "do not quote or copy the conversation text"
            "Conversation Highlights"
        )
        
        # Create highlights from recent turns
        highlights = []
        for turn in recent_turns:
            if turn.get("user") and turn.get("response"):
                user_text = turn["user"][:80] + ("…" if len(turn["user"]) > 80 else "")
                response_text = turn["response"][:80] + ("…" if len(turn["response"]) > 80 else "")
                bullet = f"{user_text} → {response_text}"
                highlights.append(bullet)
        
        if highlights:
            prompt += "\n".join(f"- {h}" for h in highlights) + "\n\n"
        else:
            prompt += "- No conversation highlights available\n\n"
        
        return prompt
    
    @staticmethod
    def build_query_gist_prompt(user_messages):
        """Build prompt to create a brief gist of user's discussion"""
        if not user_messages:
            return "No conversation available"
        
        # Take first 5 messages for gist
        sample_messages = user_messages[:5]
        
        prompt = (
            "Create a 5-8 word summary of what the user discussed. Be clear about what the user discussed about. "
            "Start with 'User felt/asked/was/discussed' etc. Be very concise. User messages:\n" +
            "\n".join([f"- {msg[:100]}" for msg in sample_messages])
        )
        
        return prompt
    
    @staticmethod
    def build_groq_rag_prompt():
        """Build system prompt for Gemini RAG intent detection (updated from Groq)"""
        return (
            "You are Mitra AI, a virtual therapist. Analyze the user's message:\n\n"
            "If the message needs real-time information, local resources, crisis support, "
            "helplines, therapists, hospitals, current statistics, or factual information "
            "that requires web search - respond as Mitra AI with helpful information.\n\n"
            "If it's just emotional support, personal feelings, or general therapy discussion "
            "that doesn't need external data - respond with exactly: 'NO_RAG_NEEDED'\n\n"
            "Focus on Indian context when providing information."
        )
    
    @staticmethod
    def build_context_enhanced_therapy_prompt(conversation_history, context_prompts=None):
        """Build prompt for therapy conversation with FAISS backend context"""
        from config import SYSTEM_PROMPT
        
        # Start with system message
        system_content = SYSTEM_PROMPT
        
        # Add context from FAISS backend if available and it's not the first message
        if context_prompts and len(conversation_history) > 0:
            # Only add context after the first user message
            context_text = "\n\n--- PREVIOUS SESSION INSIGHTS ---\n"
            context_text += "Based on your previous sessions, here are some relevant considerations:\n"
            for i, prompt in enumerate(context_prompts, 1):
                context_text += f"{i}. {prompt}\n"
            context_text += "\nUse this context to provide more personalized and continuity-aware responses.\n"
            context_text += "--- END INSIGHTS ---\n"
            
            system_content += context_text
        
        messages = [{"role": "system", "content": system_content}]
        
        # Add conversation history
        for turn in conversation_history:
            messages.append({"role": "user", "content": turn["user"]})
            if turn["response"]:
                messages.append({"role": "assistant", "content": turn["response"]})
        
        return PromptBuilder.format_chat_messages(messages)