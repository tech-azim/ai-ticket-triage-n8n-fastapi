# 🎫 AI Ticket Triage System

An AI-powered support ticket triage system that automatically classifies ticket urgency using LLM, detects similar tickets, and supports multiple languages.

![System Flow](https://via.placeholder.com/800x100/1a1a2e/white?text=User+Form+→+FastAPI+→+MySQL+→+n8n+→+Groq+LLM+→+Dashboard)

---

## 🏗️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend API | FastAPI (Python) |
| Database | MySQL 8.0 |
| Workflow Automation | n8n (self-hosted via Docker) |
| LLM Provider | Groq API (llama-3.3-70b-versatile) |
| Frontend | Next.js (React) |
| ORM | SQLAlchemy (async) |
| Containerization | Docker Compose |

---

## ✨ Features

- **Auto Triage** — AI classifies urgency: `Low`, `Medium`, `High`, `Critical`
- **Severity Scoring** — Numeric score 1–100
- **Confidence Scoring** — How confident the AI is in its analysis (0.0–1.0)
- **Multi-language Support** — Auto-detects ticket language (EN, ID, etc.)
- **Similar Ticket Detection** — Finds related tickets from history
- **Auto Escalation** — Generates escalation note for Critical tickets
- **Real-time Dashboard** — Live status updates via polling

---

## 📁 Project Structure

```
ai-ticket-triage/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   └── ticket.py
│   │   ├── schemas/
│   │   │   └── ticket.py
│   │   ├── routes/
│   │   │   └── tickets.py
│   │   └── services/
│   │       └── n8n_service.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Dashboard
│   │   ├── submit/page.tsx    # Submit form
│   │   └── tickets/[id]/page.tsx  # Ticket detail
│   └── ...
├── n8n/
│   └── workflow.json          # n8n workflow export
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

- Docker & Docker Compose
- Python 3.8+
- Node.js 18+
- Groq API Key (free at [console.groq.com](https://console.groq.com))

---

### 1. Clone Repository

```bash
git clone <repository-url>
cd ai-ticket-triage
```

---

### 2. Environment Variables

Copy `.env.example` and fill in the values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# MySQL
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=ticket_db
MYSQL_USER=ticket_user
MYSQL_PASSWORD=ticket_pass

# FastAPI
DATABASE_URL=mysql+aiomysql://ticket_user:ticket_pass@localhost:3307/ticket_db
N8N_WEBHOOK_URL=http://localhost:5678/webhook/ticket-triage

# Groq
GROQ_API_KEY=your_groq_api_key_here

# n8n callback to FastAPI
FASTAPI_CALLBACK_URL=http://host.docker.internal:8000/tickets
```

---

### 3. Start Infrastructure (MySQL + n8n)

```bash
docker compose up -d
```

Verify containers are running:

```bash
docker ps
```

Expected output:
```
ticket_mysql   Up   0.0.0.0:3307->3306/tcp
ticket_n8n     Up   0.0.0.0:5678->5678/tcp
```

---

### 4. Setup MySQL User

```bash
docker exec -it ticket_mysql mysql -u root -p
# Enter password: rootpassword
```

```sql
CREATE USER 'ticket_user'@'%' IDENTIFIED BY 'ticket_pass';
GRANT ALL PRIVILEGES ON ticket_db.* TO 'ticket_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

---

### 5. Setup Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install fastapi uvicorn sqlalchemy aiomysql pymysql greenlet httpx python-dotenv
```

Run the server:

```bash
uvicorn app.main:app --reload --port 8000
```

Verify at: `http://localhost:8000/docs` ✅

---

### 6. Setup n8n Workflow

1. Open `http://localhost:5678`
2. Create account and login
3. Click **"+"** → New Workflow
4. Click menu **⋮** → **Import from file**
5. Upload `n8n/workflow.json`
6. Set up Groq credential:
   - Go to **Settings → Credentials → New**
   - Select **"Header Auth"**
   - Name: `Groq API`
   - Header Name: `Authorization`
   - Header Value: `Bearer YOUR_GROQ_API_KEY`
7. In **"Call Groq API"** node and **"Generate Escalation Note"** node, set Authentication to your `Groq API` credential
8. Toggle workflow **Inactive → Active**

---

### 7. Setup Frontend (Next.js)

```bash
cd frontend
pnpm install
pnpm run dev
```

Open `http://localhost:3000` ✅

---

## 🔄 System Flow

```
1. User submits ticket via Next.js form
         ↓
2. POST /tickets → FastAPI saves to MySQL (status: pending)
         ↓
3. FastAPI triggers n8n webhook
         ↓
4. n8n fetches recent tickets for context
         ↓
5. n8n sends ticket to Groq LLM with context
         ↓
6. Groq returns: urgency_level + severity_score + confidence_score
              + detected_language + similar_ticket_ids + reasoning
         ↓
7. [If Critical] → Generate escalation note
         ↓
8. n8n calls PATCH /tickets/{id}/analysis → update MySQL (status: analyzed)
         ↓
9. Next.js dashboard shows results via polling
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tickets/` | Create new ticket |
| `GET` | `/tickets/` | Get all tickets |
| `GET` | `/tickets/{id}` | Get ticket detail |
| `PATCH` | `/tickets/{id}/analysis` | Update AI analysis (n8n callback) |

Full API docs: `http://localhost:8000/docs`

---

## 🧪 Testing

### Test Full End-to-End Flow

```bash
# Submit a ticket
curl -X POST http://localhost:8000/tickets/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login gagal terus",
    "description": "Sejak kemarin tidak bisa login, muncul error 500",
    "submitted_by": "user@example.com"
  }'

# Wait 5 seconds, then check result
curl http://localhost:8000/tickets/1
```

### Test Critical Ticket (triggers escalation)

```bash
curl -X POST http://localhost:8000/tickets/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sistem pembayaran down total",
    "description": "Seluruh transaksi gagal sejak 30 menit lalu, ribuan user tidak bisa checkout, kerugian terus bertambah",
    "submitted_by": "ops@company.com"
  }'
```

### Test Multi-language

```bash
curl -X POST http://localhost:8000/tickets/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Payment gateway timeout",
    "description": "Payment gateway keeps timing out for all users, critical revenue impact",
    "submitted_by": "eng@company.com"
  }'
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE tickets (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  title             VARCHAR(255) NOT NULL,
  description       TEXT NOT NULL,
  submitted_by      VARCHAR(255) NOT NULL,
  status            VARCHAR(50) DEFAULT 'pending',
  urgency_level     VARCHAR(50),           -- Low|Medium|High|Critical (AI)
  severity_score    INT,                   -- 1-100 (AI)
  reasoning         TEXT,                  -- AI explanation
  confidence_score  FLOAT,                 -- 0.0-1.0 (AI)
  detected_language VARCHAR(50),           -- ISO 639-1 code (AI)
  similar_ticket_ids TEXT,                 -- JSON array of IDs (AI)
  created_at        DATETIME DEFAULT NOW(),
  updated_at        DATETIME DEFAULT NOW() ON UPDATE NOW()
);
```

---

## 🔧 n8n Workflow Nodes

| Node | Function |
|------|----------|
| Webhook | Receives trigger from FastAPI |
| Respond to Webhook | Immediately acknowledges request |
| Fetch Recent Tickets | GET all tickets for similarity context |
| Prepare Context | Formats data + handles webhook body parsing |
| Call Groq API | Sends ticket to LLM for analysis |
| Parse & Validate Response | Sanitizes and validates AI output |
| Is Critical? | Branches flow for Critical tickets |
| Generate Escalation Note | Extra LLM call for escalation summary |
| Merge Escalation | Appends escalation note to reasoning |
| Error Fallback | Handles LLM failures gracefully |
| Callback FastAPI | PATCH endpoint to update ticket analysis |

---

## 🐛 Troubleshooting

**MySQL Access Denied**
```bash
docker exec -it ticket_mysql mysql -u root -p
# Re-run CREATE USER and GRANT commands
```

**n8n can't reach FastAPI**
```
# n8n runs in Docker, use host.docker.internal instead of localhost
http://host.docker.internal:8000/tickets/
```

**Port 3306 already in use**
```yaml
# docker-compose.yml — change host port
ports:
  - "3307:3306"
```

**DATABASE_URL not found**
```bash
# Make sure .env is in backend/ directory
cp .env backend/.env
```

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MYSQL_ROOT_PASSWORD` | MySQL root password | `rootpassword` |
| `MYSQL_DATABASE` | Database name | `ticket_db` |
| `MYSQL_USER` | MySQL user | `ticket_user` |
| `MYSQL_PASSWORD` | MySQL user password | `ticket_pass` |
| `DATABASE_URL` | SQLAlchemy connection string | `mysql+aiomysql://...` |
| `N8N_WEBHOOK_URL` | n8n webhook endpoint | `http://localhost:5678/webhook/ticket-triage` |
| `GROQ_API_KEY` | Groq API key | `gsk_...` |
| `FASTAPI_CALLBACK_URL` | FastAPI callback base URL | `http://host.docker.internal:8000/tickets` |

---

## 👨‍💻 Author

Built as part of technical assessment for Junior-Mid Developer position.

> ⚠️ **Security Note:** Never commit `.env` file with real credentials. Always use `.env.example` as template.