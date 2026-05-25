# AuraFlow

AI-powered social listening and brand intelligence platform. Monitors Reddit 24/7, classifies mentions with AI sentiment analysis, and delivers daily intelligence reports for SMBs.

**Live preview:** `/` — marketing landing page · `/app` — intelligence dashboard

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.11) + Uvicorn |
| Database | PostgreSQL 16 + SQLAlchemy Core |
| Frontend | React 18 + Vite 7 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| API contract | OpenAPI 3.0 → Orval (generated hooks + Zod schemas) |
| Package manager | pnpm workspaces (monorepo) |

---

## Local development

### Prerequisites

- **Node.js 20+** and **pnpm** — `npm install -g pnpm`
- **Python 3.11+** and **pip**
- **Docker** (for Postgres) — [docker.com](https://docs.docker.com/get-docker/)

### First-time setup

```bash
git clone <your-repo-url>
cd auraflow

# 1. Bootstrap everything (Postgres, Python deps, Node deps, .env)
make setup

# 2. Edit .env if you want a custom Postgres URL or session secret
# (defaults work out of the box with docker-compose)
```

### Running the app

Open **two terminals**:

```bash
# Terminal 1 — API server (FastAPI, port 8080)
make api

# Terminal 2 — Frontend (Vite dev server, port 5173)
make frontend
```

Or run both at once (requires `concurrently`):

```bash
npm install -g concurrently
make devp
```

Open **http://localhost:5173** in your browser.

> The Vite dev server proxies all `/api/*` requests to `http://localhost:8080` automatically — no extra config needed.

### Available make targets

| Command | Description |
|---|---|
| `make setup` | First-time setup: copies `.env`, starts Postgres, installs all deps |
| `make db` | Start Postgres container only |
| `make api` | Start the FastAPI server |
| `make frontend` | Start the Vite dev server |
| `make devp` | Start both servers in parallel (needs `concurrently`) |
| `make stop` | Stop Docker containers |
| `make clean` | Remove Docker containers **and** the Postgres data volume |

---

## Environment variables

Copy `.env.example` → `.env` and set:

| Variable | Description | Local default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/auraflow` |
| `SESSION_SECRET` | Session signing key | Any random string |

> In Replit, both are injected automatically as secrets — no `.env` file needed there.

---

## Project structure

```
auraflow/
├── artifacts/
│   ├── api-server/          # FastAPI backend
│   │   ├── main.py          # App entry point, middleware, seed data
│   │   ├── database.py      # DB connection + schema init (raw SQL DDL)
│   │   ├── models.py        # Pydantic request/response models
│   │   ├── routes/          # Route handlers per domain
│   │   └── requirements.txt # Python dependencies
│   └── dashboard/           # React + Vite frontend
│       ├── src/
│       │   ├── pages/       # landing.tsx, dashboard.tsx, mentions.tsx, …
│       │   ├── components/  # layout.tsx, shadcn/ui components
│       │   └── index.css    # AuraFlow design system (CSS variables)
│       └── vite.config.ts
├── lib/
│   ├── api-spec/            # OpenAPI 3.0 spec + Orval config
│   └── api-client-react/    # Generated React Query hooks + Zod schemas
├── docker-compose.yml       # Local Postgres
├── Makefile                 # Dev shortcuts
├── .env.example             # Environment variable template
└── AURAFLOW.md              # Full brand, design & technical reference
```

---

## API routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/healthz` | Health check |
| `GET` | `/api/dashboard/stats` | Aggregate stats |
| `GET` | `/api/dashboard/sentiment-trend` | 7-day sentiment trend |
| `GET/POST` | `/api/keywords` | List / create keywords |
| `DELETE` | `/api/keywords/{id}` | Remove a keyword |
| `GET` | `/api/mentions` | Mention feed (filterable) |
| `POST` | `/api/mentions/scan` | Trigger Reddit scan |
| `GET` | `/api/alerts` | Alert feed |
| `POST` | `/api/alerts/{id}/read` | Acknowledge alert |
| `POST` | `/api/alerts/read-all` | Acknowledge all alerts |
| `GET/POST` | `/api/summaries` | List / generate AI summaries |

---

## Regenerating API client

After changing `lib/api-spec/openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates all React Query hooks and Zod schemas in `lib/api-client-react/`.

---

## Deploying

This project is designed for **Replit Deployments**. Push the button in the Replit UI — the platform handles build, TLS, and hosting.

For self-hosted deployment, build the frontend and serve it behind a reverse proxy alongside the FastAPI server:

```bash
# Build frontend
PORT=80 BASE_PATH=/ pnpm --filter @workspace/dashboard run build
# dist is at artifacts/dashboard/dist/public/

# Run API in production
uvicorn artifacts/api-server/main:app --host 0.0.0.0 --port 8080 --workers 2
```

---

See [`AURAFLOW.md`](./AURAFLOW.md) for the complete brand identity, color system, architecture decisions, and database schema reference.
