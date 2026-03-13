from sqlalchemy import Column, Integer, String, Text, DateTime, Float, func
from app.database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    submitted_by = Column(String(255), nullable=False)
    status = Column(String(50), default="pending")
    urgency_level = Column(String(50), nullable=True)
    severity_score = Column(Integer, nullable=True)
    reasoning = Column(Text, nullable=True)
    # Field baru
    confidence_score = Column(Float, nullable=True)       # 0.0 - 1.0
    detected_language = Column(String(50), nullable=True) # en, id, etc
    similar_ticket_ids = Column(Text, nullable=True)      # JSON string "[1,2,3]"
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())