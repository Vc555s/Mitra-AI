from pydantic import BaseModel
from typing import Optional, List

class MoodRating(BaseModel):
    user_id: str
    desc: str

class SummaryInput(BaseModel):
    user_id: str
    summary_text: str
    emotions: List[str]  

class PromptGenerationRequest(BaseModel):
    user_id: str
    count: Optional[int] = 3  

class ChatRequest(BaseModel):
    user_id: str
    message: str
