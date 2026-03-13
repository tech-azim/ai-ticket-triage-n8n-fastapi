from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.ticket import Ticket
from app.schemas.ticket import TicketCreate, TicketAnalysis, TicketResponse
from app.services.n8n_service import trigger_n8n_webhook
from typing import List

router = APIRouter(prefix="/tickets", tags=["tickets"])

@router.post("/", response_model=TicketResponse)
async def create_ticket(payload: TicketCreate, db: AsyncSession = Depends(get_db)):
    ticket = Ticket(**payload.model_dump())
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    await trigger_n8n_webhook(ticket.id, ticket.title, ticket.description)
    return ticket

@router.get("/", response_model=List[TicketResponse])
async def get_tickets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).order_by(Ticket.created_at.desc()))
    return result.scalars().all()

@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: int, db: AsyncSession = Depends(get_db)):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket
@router.patch("/{ticket_id}/analysis", response_model=TicketResponse)
async def update_analysis(ticket_id: int, payload: TicketAnalysis, db: AsyncSession = Depends(get_db)):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket.urgency_level = payload.urgency_level
    ticket.severity_score = payload.severity_score
    ticket.reasoning = payload.reasoning
    ticket.confidence_score = payload.confidence_score
    ticket.detected_language = payload.detected_language
    ticket.similar_ticket_ids = payload.similar_ticket_ids
    ticket.status = "analyzed"
    await db.commit()
    await db.refresh(ticket)
    return ticket