import httpx
import os

async def trigger_n8n_webhook(ticket_id: int, title: str, description: str):
    webhook_url = os.getenv("N8N_WEBHOOK_URL")
    payload = {
        "ticket_id": ticket_id,
        "title": title,
        "description": description
    }
    print(f"[n8n trigger] sending to: {webhook_url}")
    print(f"[n8n trigger] payload: {payload}")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(webhook_url, json=payload, timeout=10)
            print(f"[n8n trigger] response: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"[n8n trigger error] {e}")