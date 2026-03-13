export interface Ticket {
  id: number;
  title: string;
  description: string;
  submitted_by: string;
  status: "pending" | "analyzed" | "error";
  urgency_level?: "Low" | "Medium" | "High" | "Critical";
  severity_score?: number;
  reasoning?: string;
  confidence_score?: number;
  detected_language?: string;
  similar_ticket_ids?: string;
  escalation_note?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  submitted_by: string;
}

export interface AnalysisPayload {
  urgency_level: string;
  severity_score: number;
  reasoning: string;
  confidence_score: number;
  detected_language: string;
  similar_ticket_ids: string;
}
