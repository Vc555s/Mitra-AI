 

import io
try:
    import sounddevice as sd
except ImportError:
    sd = None
import wave
import threading
import time
from google.cloud import speech
import os
from config import GOOGLE_SPEECH_CREDENTIALS_PATH

class SpeechInputHandler:
    def __init__(self):
        if sd is None:
            print("⚠️ PyAudio not installed — speech input disabled.")
            self.enabled = False
            self.audio = None
            self.format = None
            self.channels = None
            self.rate = None
            self.chunk = None
            return

         
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = GOOGLE_SPEECH_CREDENTIALS_PATH
        try:
            self.client = speech.SpeechClient()
            self.enabled = True
            self.channels = 1
            self.rate = 16000  # Sample rate
            self.is_recording = False
        except Exception as e:
            print(f"⚠️ Speech-to-text initialization failed: {e}")
            self.enabled = False
    
    def record_audio(self, duration=None):
        """Record audio from microphone"""
        if not self.enabled:
            return None
        
        try:
            print("🎤 Listening... (Press Enter to stop or speak for up to 5 seconds)")
            
            stream = self.audio.open(
                format=self.format,
                channels=self.channels,
                rate=self.rate,
                input=True,
                frames_per_buffer=self.chunk
            )
            
            frames = []
            self.is_recording = True
            
             
            start_time = time.time()
            max_duration = duration or self.record_seconds
            
            while self.is_recording and (time.time() - start_time) < max_duration:
                try:
                    data = stream.read(self.chunk, exception_on_overflow=False)
                    frames.append(data)
                except Exception as e:
                    print(f"⚠️ Audio read error: {e}")
                    break
            
            stream.stop_stream()
            stream.close()
            
            if frames:
                 
                audio_data = b''.join(frames)
                return self._create_wav_data(audio_data)
            else:
                return None
                
        except Exception as e:
            print(f"❌ Recording error: {e}")
            return None
    
    def _create_wav_data(self, audio_data):
        """Convert raw audio data to WAV format"""
        wav_buffer = io.BytesIO()
        
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(self.channels)
            wav_file.setsampwidth(self.audio.get_sample_size(self.format))
            wav_file.setframerate(self.rate)
            wav_file.writeframes(audio_data)
        
        return wav_buffer.getvalue()
    
    def transcribe_audio(self, audio_data):
        """Convert audio data to text using Google Speech-to-Text"""
        if not self.enabled or not audio_data:
            return None
        
        try:
             
            audio = speech.RecognitionAudio(content=audio_data)
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=self.rate,
                language_code="en-IN",   
                alternative_language_codes=["hi-IN"],   
                enable_automatic_punctuation=True,
                model="latest_long"
            )
            
             
            response = self.client.recognize(config=config, audio=audio)
            
            if response.results:
                transcript = response.results[0].alternatives[0].transcript
                confidence = response.results[0].alternatives[0].confidence
                
                print(f"🎯 Transcribed: '{transcript}' (confidence: {confidence:.2f})")
                return transcript.strip()
            else:
                print("🔇 No speech detected")
                return None
                
        except Exception as e:
            print(f"❌ Transcription error: {e}")
            return None
    
    def get_speech_input(self, prompt="🎤 Press 's' for speech input or type your message: "):
        """Get input via speech recognition"""
        if not self.enabled:
            return None
        
        try:
             
            audio_data = self.record_audio()
            if not audio_data:
                return None
            
             
            transcript = self.transcribe_audio(audio_data)
            return transcript
            
        except Exception as e:
            print(f"❌ Speech input error: {e}")
            return None
    
    def stop_recording(self):
        """Stop audio recording"""
        self.is_recording = False
    
    def cleanup(self):
        """Clean up audio resources"""
        try:
            self.audio.terminate()
        except:
            pass
    
    def get_speech_input_with_audio(self):
     
        try:
            if not self.enabled:
                return None, None
        
            print("🎤 Recording... (speak now)")
        
         
            audio_data = self._record_audio()
        
            if audio_data is None:
                return None, None
        
            print("🔄 Converting speech to text...")
        
         
            text = self._transcribe_audio_data(audio_data)
        
         
            return text, audio_data
        
        except Exception as e:
            print(f"❌ Error in speech input with audio: {e}")
            return None, None

    def _record_audio(self):
        try:
         
            pass
        except Exception as e:
            print(f"❌ Error recording audio: {e}")
            return None