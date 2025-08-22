"""
LLM Chat functionality for Mitra AI
Handles model loading and chat generation
"""

import os
from llama_cpp import Llama
from config import LLAMA_PATH, QWEN_PATH, N_GPU_LAYERS, N_CTX


class LLMManager:
    """Manages local LLM models (LLaMA and Qwen)"""
    
    def __init__(self):
        self.llm = None
        self.model_name = None
        self.load_model()
    
    def load_model(self):
        """Load LLaMA model with fallback to Qwen"""
        try:
            self.llm = self._load_llm_model(LLAMA_PATH)
            self.model_name = "LLaMA 3.1"
            print("✅ LLaMA 3.1 loaded successfully.")
        except Exception as e:
            print(f"❌ LLaMA failed to load: {e}")
            try:
                self.llm = self._load_llm_model(QWEN_PATH)
                self.model_name = "Qwen 2.5"
                print("✅ Fallback Qwen 2.5 loaded successfully.")
            except Exception as e2:
                print(f"❌ Both models failed to load: {e2}")
                raise Exception("Failed to load any LLM model")
    
    def _load_llm_model(self, model_path):
        """Helper method to load a specific LLM model"""
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")
        
        print(f"🔄 Loading model: {os.path.basename(model_path)}")
        
        return Llama(
            model_path=model_path,
            n_ctx=N_CTX,
            n_gpu_layers=N_GPU_LAYERS,
            n_threads=os.cpu_count(),
            f16_kv=True,
            use_mmap=True,
            use_mlock=False
        )
    
    def generate_response(self, prompt, max_tokens=200, temperature=0.6, top_p=0.9, stop=None):
        """Generate response using the loaded model"""
        if not self.llm:
            raise Exception("No model loaded")
        
        if stop is None:
            stop = ["<|eot_id|>"]
        
        response = self.llm(
            prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            stop=stop
        )
        
        return response["choices"][0]["text"].strip()
    
    def get_model_info(self):
        """Get information about the currently loaded model"""
        return {
            "name": self.model_name,
            "loaded": self.llm is not None,
            "context_size": N_CTX
        }
    
    #before streaming
    