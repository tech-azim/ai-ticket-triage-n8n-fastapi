from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TicketCreate(BaseModel):
    title: str
    description: str
    submitted_by: str

class TicketAnalysis(BaseModel):
    urgency_level: str
    severity_score: int
    reasoning: str
    confidence_score: Optional[float] = None
    detected_language: Optional[str] = None
    similar_ticket_ids: Optional[str] = None

class TicketResponse(BaseModel):
    id: int
    title: str
    description: str
    submitted_by: str
    status: str
    urgency_level: Optional[str] = None
    severity_score: Optional[int] = None
    reasoning: Optional[str] = None
    confidence_score: Optional[float] = None
    detected_language: Optional[str] = None
    similar_ticket_ids: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True