# Mitra-AI 🤝🧠  

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg?logo=python)](https://www.python.org/)  
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)](https://nextjs.org/)  
[![HuggingFace](https://img.shields.io/badge/🤗-Transformers-yellow.svg)](https://huggingface.co/)  
[![Flask](https://img.shields.io/badge/Flask-Backend-lightgrey?logo=flask)](https://flask.palletsprojects.com/)  
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)  

An **empathetic multilingual mental health companion** powered by **LLMs, emotion recognition, and memory retrieval**, enabling safe, contextual, and accessible conversations in **English, Hindi, and Marathi**.  

---

## 🚀 Overview  
MitraAI blends **AI-driven dialogue, dual emotion analysis, and speech interaction** into a holistic mental health assistant:  

- 🧩 **Dialogue Models**: Fine-tuned **LLaMA + Qwen** for empathetic conversations  
- 💡 **Dynamic Prompts**: **MiniLM L6 v2** for personalized responses  
- ❤️ **Emotion Analysis**:  
  - Text → **BERT** (97% accuracy)  
  - Speech → **wav2vec2**  
- 🗂 **Memory Retrieval**: **FAISS** + LLM summaries for contextual continuity  
- 🔗 **RAG + Groq**: Real-time support (e.g., suicide helplines & resources)  
- 🎙 **Voice Support**: Google **Speech-to-Text & Text-to-Speech**  

---

## ⚡ Quick Start  

```bash
# Clone repo
git clone https://github.com/Vc555s/Mitra-AI.git
cd Mitra-AI

# Backend (Flask API)
pip install -r requirements.txt
python main.py

# Frontend (Next.js)
cd app
npm install
npm run dev
