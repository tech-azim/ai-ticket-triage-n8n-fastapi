import { Ticket, CreateTicketPayload, AnalysisPayload } from "@/types/ticket";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchTickets(): Promise<Ticket[]> {
  const res = await fetch(`${API_BASE}/tickets/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

export async function fetchTicket(id: number): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/tickets/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch ticket");
  return res.json();
}

export async function createTicket(
  payload: CreateTicketPayload,
): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/tickets/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create ticket");
  return res.json();
}

export async function patchTicketAnalysis(
  id: number,
  payload: AnalysisPayload,
): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/tickets/${id}/analysis`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to patch ticket");
  return res.json();
}
