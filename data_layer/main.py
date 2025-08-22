 
import sys
import os
from pathlib import Path
 
ROOT_DIR = Path(__file__).parent.parent
sys.path.append(str(ROOT_DIR))

 
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from data_layer.api.routes import router  
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from config import GOOGLE_CREDENTIALS_PATH, GOOGLE_SPEECH_CREDENTIALS_PATH

app = FastAPI(title="MindTalk API", version="1.0.0")

 
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://accounts.google.com",
        "http://202.149.199.26:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key="b3f8c2e4d1a9e7f6c5b2a1d3f4e6c7b8")

@app.get("/")
def root():
    return {"message": "MindTalk API is running"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "google_credentials_set": bool(GOOGLE_CREDENTIALS_PATH),
        "google_speech_credentials_set": bool(GOOGLE_SPEECH_CREDENTIALS_PATH),
        "credentials_file_exists": os.path.exists(GOOGLE_CREDENTIALS_PATH),
        "speech_credentials_file_exists": os.path.exists(GOOGLE_SPEECH_CREDENTIALS_PATH)
    }

app.include_router(router)