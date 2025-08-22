 



from fastapi import HTTPException, APIRouter, UploadFile, File, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from data_layer.model.schemas import MoodRating, SummaryInput, PromptGenerationRequest
from data_layer.db.sqlite_handler import insert_mood_rating, get_mood_trend, get_recent_emotions
from data_layer.db.faiss_handler import (
    save_summary,  
    get_user_summaries,
    get_user_emotions,
    get_user_timestamps,
    find_similar_summaries_for_user,
    get_recent_summaries,
    generate_session_prompts
)
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
import os
import sys
import logging
from chat_interface import MitraAIChatInterface
from services.speech_handler import SpeechInputHandler
from services.speech_emotion_analyzer import SpeechEmotionAnalyzer
from config import GOOGLE_CREDENTIALS_PATH

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# OAuth configuration
config = Config('.env')
oauth = OAuth(config)

oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    access_token_url='https://oauth2.googleapis.com/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/v2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v2/',
    client_kwargs={'scope': 'openid email profile'},
)

class ChatRequest(BaseModel):
    user_id: str
    message: str
    emotion_data: dict = None   

try:
    speech_handler = SpeechInputHandler()
    speech_emotion_analyzer = SpeechEmotionAnalyzer()
    logger.info("Speech services initialized successfully")
except Exception as e:
    logger.error(f"Error initializing speech services: {e}")
    speech_handler = None
    speech_emotion_analyzer = None

# Authentication routes
@router.get('/api/auth/google/login')
async def login_via_google(request: Request):
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get('/api/auth/google/callback')
async def google_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user = await oauth.google.parse_id_token(request, token)
        # You can now use user info (user['email'], user['name'], etc.)
        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Mood-related routes
@router.post("/api/mood/save")
def save_mood(data: MoodRating):
    success = insert_mood_rating(
        user_id=data.user_id,
        desc=data.desc
    )
    if success:
        return {"message": "Mood saved successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to save mood")

@router.get("/api/mood/trend/{user_id}")
def fetch_mood_trend(user_id: str):
    trend = get_mood_trend(user_id)
    return {
        "user_id": user_id,
        "mood_trend": [
            {
                "timestamp": t,
                "desc": d,
                "emotions": e
            }
            for t, d, e in trend
        ]
    }

@router.get("/api/mood/recent-emotions/{user_id}")
def fetch_recent_emotions(user_id: str, limit: int = 1):
    if limit > 20:  
        limit = 20
    
    emotions = get_recent_emotions(user_id, limit)
    return {
        "user_id": user_id,
        "recent_emotions": [
            {
                "timestamp": t,
                "emotions": e
            }
            for t, e in emotions
        ]
    }

# Summary-related routes
@router.post("/api/summary/save")
def save_summary_route(data: SummaryInput):
    try:
        result = save_summary(data.user_id, data.summary_text, data.emotions)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/summary/recent/{user_id}")
def get_recent_summaries_route(user_id: str, count: int = None):
    try:
        recent_summaries = get_recent_summaries(user_id, count)
        return {
            "user_id": user_id,
            "recent_summaries": recent_summaries,
            "count": len(recent_summaries),
            "total_sessions": len(get_user_summaries(user_id))
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/api/summary/search/{user_id}")
def search_user_summaries_route(user_id: str, query: str, top_k: int = 3):
    try:
        results = find_similar_summaries_for_user(user_id, query, top_k)
        return {
            "user_id": user_id,
            "query": query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/summary/text/{user_id}")
def get_summaries_route(user_id: str):
    try:
        summaries = get_user_summaries(user_id)
        emotions = get_user_emotions(user_id)
        timestamps = get_user_timestamps(user_id)
        return {
            "user_id": user_id,
            "summaries": summaries,
            "emotions": emotions,
            "timestamps": timestamps
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/api/prompts/generate")
def generate_prompts_route(data: PromptGenerationRequest):
    try:
        prompts = generate_session_prompts(data.user_id, data.count)
        return {
            "user_id": data.user_id,
            "prompts": prompts,
            "count": len(prompts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Speech and emotion analysis routes
@router.post("/api/speech-to-text")
async def speech_to_text(audio: UploadFile = File(...)):
    """Convert speech audio to text with emotion analysis"""
    try:
        logger.info(f"Processing audio file: {audio.filename}, content_type: {audio.content_type}")
        
        # Read audio file content
        audio_content = await audio.read()
        logger.info(f"Audio content size: {len(audio_content)} bytes")
        
        if len(audio_content) == 0:
            return {"error": "Empty audio file"}
        
        result = {
            "text": None, 
            "emotion": None,
            "audio_length": len(audio_content),
            "processing_status": {}
        }
        
        # Convert speech to text
        try:
            if speech_handler and speech_handler.enabled:
                logger.info("Starting speech-to-text conversion")
                text = speech_handler.transcribe_audio(audio_content)
                result["text"] = text
                result["processing_status"]["speech_to_text"] = "success" if text else "no_speech_detected"
                logger.info(f"Speech-to-text result: {text}")
            else:
                result["processing_status"]["speech_to_text"] = "disabled"
                logger.warning("Speech handler is disabled or not initialized")
        except Exception as e:
            logger.error(f"Speech-to-text error: {str(e)}")
            result["processing_status"]["speech_to_text"] = f"error: {str(e)}"
        
        # Analyze speech emotion
        try:
            if speech_emotion_analyzer and speech_emotion_analyzer.is_ready():
                logger.info("Starting emotion analysis")
                emotion_result = speech_emotion_analyzer.analyze_speech_emotion(audio_content)
                
                if "error" not in emotion_result:
                    result["emotion"] = {
                        "dominant": emotion_result["dominant_emotion"],
                        "confidence": emotion_result["confidence"],
                        "all_emotions": emotion_result.get("all_emotions", {}),
                        "method": emotion_result.get("method", "unknown")
                    }
                    result["processing_status"]["emotion_analysis"] = "success"
                    logger.info(f"Emotion analysis result: {emotion_result['dominant_emotion']} ({emotion_result['confidence']:.2f})")
                else:
                    result["processing_status"]["emotion_analysis"] = f"error: {emotion_result['error']}"
                    logger.error(f"Emotion analysis error: {emotion_result['error']}")
            else:
                result["processing_status"]["emotion_analysis"] = "not_ready"
                logger.warning("Emotion analyzer is not ready or not initialized")
        except Exception as e:
            logger.error(f"Emotion analysis exception: {str(e)}")
            result["processing_status"]["emotion_analysis"] = f"exception: {str(e)}"
        
        logger.info(f"Final result: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Speech-to-text endpoint error: {str(e)}")
        return {"error": f"Processing error: {str(e)}"}

# Health check endpoint for speech services
@router.get("/api/speech/health")
async def speech_health_check():
    """Check the health of speech services"""
    return {
        "speech_to_text_enabled": speech_handler.enabled if speech_handler else False,
        "emotion_analysis_ready": speech_emotion_analyzer.is_ready() if speech_emotion_analyzer else False,
        "speech_handler_initialized": speech_handler is not None,
        "emotion_analyzer_initialized": speech_emotion_analyzer is not None,
        "status": "healthy" if (speech_handler or speech_emotion_analyzer) else "degraded"
    }

# Chat endpoint with emotion support
@router.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """Handle chat requests with optional emotion data"""
    try:
        # Initialize chat interface with user ID
        chat_interface = MitraAIChatInterface(request.user_id)
        
        # Log emotion data if provided
        if request.emotion_data:
            logger.info(f"Chat request includes emotion data: {request.emotion_data}")
            # You can store emotion data in database or use it to influence response
            # For now, we'll just log it, but you can extend this to:
            # 1. Store emotion in database
            # 2. Use emotion to modify AI response tone
            # 3. Track emotional patterns over time
        
        # Generate response
        response = chat_interface._process_user_input(request.message)
        
        return {
            "response": response,
            "status": "success",
            "emotion_processed": bool(request.emotion_data)
        }
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat request: {str(e)}"
        )

# Additional endpoint for testing speech functionality
@router.post("/api/test-speech")
async def test_speech_functionality():
    """Test speech services without audio file"""
    try:
        result = {
            "speech_handler": {
                "initialized": speech_handler is not None,
                "enabled": speech_handler.enabled if speech_handler else False,
            },
            "emotion_analyzer": {
                "initialized": speech_emotion_analyzer is not None,
                "ready": speech_emotion_analyzer.is_ready() if speech_emotion_analyzer else False,
            }
        }
        
        if speech_handler:
            result["speech_handler"]["client_available"] = hasattr(speech_handler, 'client') and speech_handler.client is not None
        
        return result
    except Exception as e:
        return {"error": str(e)}


@router.post("/api/text-to-speech")
async def text_to_speech(request: Request):
    try:
        # Use main credentials for text-to-speech
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = GOOGLE_CREDENTIALS_PATH
        from google.cloud import texttospeech
        import base64
        
        data = await request.json()
        text = data.get("text", "")
        
        if not text:
            raise HTTPException(status_code=400, detail="No text provided")
        
        client = texttospeech.TextToSpeechClient()
        synthesis_input = texttospeech.SynthesisInput(text=text)
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
            name="en-US-Neural2-F"
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        audio_base64 = base64.b64encode(response.audio_content).decode('utf-8')
        return {
            "audio_data": audio_base64,
            "content_type": "audio/mpeg",
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Text-to-speech error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")

from fastapi.responses import StreamingResponse
from google.cloud import texttospeech
import io

