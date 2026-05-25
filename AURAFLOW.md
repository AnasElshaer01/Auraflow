# AuraFlow — Brand, Design & Technical Reference

> AI-powered social listening and brand intelligence platform. Monitors Reddit 24/7, classifies mentions with AI sentiment analysis, and delivers daily intelligence reports for SMBs.

---

## Brand Identity

### Essence

AuraFlow represents continuous, silent awareness of digital conversations. The brand fuses:

- **Nordic minimalism** — calm, dark, structured, analytical
- **Intelligence infrastructure** — observatory-level awareness (Palantir / Datadog register)
- **High-end AI tooling** — precise, omnipresent, inevitable

The emotional promise: *"My brand is always watched and protected. I can see what others miss."*

### Brand Archetype

**The Strategist** — analytical, controlled, commanding. Not a tool; a strategic intelligence advantage.

### Tagline

> *Your brand. Always watched.*

### Voice & Tone

- Labels: `UPPERCASE · TRACKED · SPACED` — intelligence dashboard vocabulary
- Body: calm, direct, no hype
- Actions: "Scan", "Acknowledge", "Track signal" — not "click here"
- Status vocabulary: signals, intelligence, monitoring active, live

---

## Color System

All colors are defined as HSL CSS variables in `artifacts/dashboard/src/index.css`.

| Token | HSL | Hex (approx) | Usage |
|---|---|---|---|
| `--background` | `218 28% 5%` | `#0B0F15` | Page background — deep Nordic charcoal |
| `--card` | `218 26% 8%` | `#101621` | Card / panel surfaces |
| `--card-border` | `218 24% 13%` | `#181F2E` | Card borders |
| `--primary` | `188 92% 52%` | `#07D3E8` | Icy cyan — the signal accent |
| `--primary-foreground` | `218 28% 5%` | `#0B0F15` | Text on primary (dark on cyan) |
| `--foreground` | `210 16% 80%` | `#C5CBD4` | Main body text — off-white |
| `--muted-foreground` | `215 14% 46%` | `#697584` | Labels, metadata |
| `--muted` | `218 22% 10%` | `#141A25` | Muted backgrounds |
| `--accent` | `188 55% 11%` | `#0D2028` | Subtle teal highlight backgrounds |
| `--accent-foreground` | `188 92% 65%` | `#5AE8F8` | Text on accent |
| `--destructive` | `350 72% 58%` | `#E04060` | Errors, negative signals |
| `--border` | `218 24% 13%` | `#181F2E` | All borders |
| `--sidebar` | `218 32% 4%` | `#090D14` | Sidebar — darkest surface |
| `--sidebar-border` | `218 24% 10%` | `#141A27` | Sidebar borders |

### Semantic badge palette (always dark-native)

| Signal | Background | Text |
|---|---|---|
| Positive | `bg-emerald-950/70` | `text-emerald-400` |
| Negative | `bg-red-950/70` | `text-red-400` |
| Neutral | `bg-slate-800/80` | `text-slate-400` |
| Urgent | `bg-amber-950/60` | `text-amber-400` |
| Brand | `bg-primary/10` | `text-primary` |
| Competitor | `bg-orange-950/60` | `text-orange-400` |
| Engagement | `bg-emerald-950/60` | `text-emerald-400` |
| Competitor spike | `bg-amber-950/60` | `text-amber-400` |

---

## Typography

**Primary font:** Inter (Google Fonts — `wght@300;400;500;600;700`)

```css
--app-font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
```

### Scale & treatment

| Element | Size | Weight | Tracking |
|---|---|---|---|
| Section labels | `text-[9-10px]` | `font-semibold` | `tracking-[0.14-0.18em]` + `uppercase` |
| Nav items | `text-[12px]` | `font-medium` | `tracking-wide` |
| Body text | `text-xs` / `text-sm` | `font-normal` | Default |
| Page headings | `text-lg` / `text-xl` | `font-semibold` | `tracking-tight` |
| Hero headings | `text-5xl–7xl` | `font-semibold` | `tracking-[-0.03em]` |
| Stats / numbers | Any | `font-semibold` | `tabular-nums` |

**Key rule:** All uppercase labels use wide letter-spacing. All headings use tight negative tracking. Numbers always use `tabular-nums`.

---

## Visual Language

### Logo mark — Signal Observatory Motif

Concentric signal rings with cardinal axis tick marks — an abstract radar / observatory schematic. The center node pulses to indicate live monitoring.

```svg
<!-- Core structure -->
<circle r="2" fill="primary" />           <!-- Central node -->
<circle r="4.5" stroke="primary" op=0.5 /> <!-- Inner ring -->
<circle r="7" stroke="primary" op=0.25 />  <!-- Outer ring -->
<line …/>  <!-- Cardinal ticks at N/E/S/W -->
```

### Motion

- `animate-ping` on the center node and status dots — live system signal
- `signal-pulse` keyframe (opacity 1 → 0.6 → 1, 2.4s) on unread indicators
- Outer rings rotate slowly at different speeds/directions on the landing hero
- `intelligence-grid` CSS class: 40×40px grid at 2.5% primary opacity — applied to content areas

### Radius

`--radius: 0.375rem` — sharper than typical SaaS (0.5–0.75rem), reinforcing precision

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Python 3.11 |
| Framework | FastAPI |
| Server | Uvicorn (with `--reload` in dev) |
| ORM | SQLAlchemy (Core, raw SQL for schema) |
| Database driver | psycopg2-binary |
| Database | PostgreSQL (Replit managed, `DATABASE_URL`) |
| Schema init | `init_db()` in `database.py` — raw SQL DDL, idempotent |
| Seed data | `_seed_demo_data()` in `main.py` — seeds only when keywords table is empty |
| camelCase middleware | Custom Starlette `BaseHTTPMiddleware` in `main.py` that converts all JSON response keys from `snake_case` to `camelCase` |
| Env | `python-dotenv` via `load_dotenv()` |

### Frontend

| Layer | Technology |
|---|---|
| Build tool | Vite 7 |
| UI framework | React 18 |
| Language | TypeScript 5 |
| Routing | Wouter (hash-free, base-path aware) |
| Data fetching | TanStack Query v5 |
| API hooks | Orval — generated from OpenAPI spec (`lib/api-spec/openapi.yaml`) |
| Component library | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Date formatting | date-fns |
| Form validation | React Hook Form + Zod |
| Font | Inter (Google Fonts) |

### Monorepo

| Package | Path | Role |
|---|---|---|
| `@workspace/dashboard` | `artifacts/dashboard` | React + Vite frontend |
| `@workspace/api-server` | `artifacts/api-server` | FastAPI Python backend |
| `@workspace/api-spec` | `lib/api-spec` | OpenAPI 3.0 spec + Orval config |
| `@workspace/api-client-react` | `lib/api-client-react` | Generated React Query hooks + Zod schemas |
| `@workspace/mockup-sandbox` | `artifacts/mockup-sandbox` | Component preview server (Vite) |

---

## Architecture Decisions

### 1. FastAPI over Node.js/Express
User explicitly required a Python backend. FastAPI was chosen for its automatic OpenAPI generation, Pydantic validation, and async-native design.

### 2. camelCase middleware
The frontend API contract (OpenAPI spec) uses camelCase field names (`totalMentions`, `isRead`). Python/SQLAlchemy uses `snake_case`. Rather than aliasing every Pydantic model, a single Starlette middleware in `main.py` intercepts all JSON responses and recursively converts keys — zero per-route overhead.

### 3. Contract-first API design
The OpenAPI spec (`lib/api-spec/openapi.yaml`) is the source of truth. Orval generates React Query hooks and Zod schemas from it. The backend is then implemented to match — ensuring type safety across the boundary without manual synchronization.

### 4. Raw SQL DDL for schema
SQLAlchemy Core (not ORM declarative) is used for schema creation via raw SQL in `database.py`. This keeps the database layer explicit and avoids ORM magic in a simple CRUD context.

### 5. Seed-once pattern
`_seed_demo_data()` checks whether the `keywords` table is empty before inserting demo data. Safe to call on every startup — idempotent by design.

### 6. Always-dark theme
Rather than toggling dark mode, the CSS variables in `:root` are set to the AuraFlow dark palette directly. `document.documentElement.classList.add("dark")` is called in `main.tsx` so Tailwind `dark:` utility variants activate — all page components use `dark:` prefixed colors, which automatically apply.

### 7. Path-based routing via proxy
The Replit shared proxy routes `/api` to the FastAPI server (port 8080) and `/` to the Vite dev server. The frontend uses relative API URLs — no hardcoded hostnames, no Vite proxy config needed.

---

## API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/healthz` | Health check |
| `GET` | `/api/dashboard/stats` | Aggregate stats |
| `GET` | `/api/dashboard/sentiment-trend` | 7-day daily sentiment counts |
| `GET` | `/api/keywords` | List tracked keywords |
| `POST` | `/api/keywords` | Create keyword |
| `DELETE` | `/api/keywords/{id}` | Delete keyword |
| `GET` | `/api/mentions` | List mentions (filters: sentiment, keywordId, limit, offset) |
| `GET` | `/api/alerts` | List alerts (filters: unreadOnly, limit) |
| `POST` | `/api/alerts/{id}/read` | Mark alert read |
| `POST` | `/api/alerts/read-all` | Mark all alerts read |
| `GET` | `/api/summaries` | List AI summaries |
| `POST` | `/api/summaries/generate` | Generate new summary |
| `POST` | `/api/mentions/scan` | Trigger Reddit scan |

---

## Database Schema

```sql
keywords   (id, text, type, created_at)
mentions   (id, keyword_id, reddit_id, title, body, url, author, subreddit,
            score, upvotes, num_comments, sentiment, is_urgent, is_complaint,
            mentioned_at, created_at)
alerts     (id, mention_id, keyword_id, type, message, is_read, created_at)
summaries  (id, date, sentiment_overview, top_mentions, main_complaints,
            trending_discussions, created_at)
```

---

## App Routes

| URL | Component | Notes |
|---|---|---|
| `/` | `Landing` | Marketing / product landing page |
| `/app` | `Dashboard` | Intelligence overview with stats + charts |
| `/app/mentions` | `Mentions` | Filterable mention feed (sentiment, keyword) |
| `/app/keywords` | `Keywords` | Add / remove tracked signals |
| `/app/alerts` | `Alerts` | Alert feed with acknowledge actions |
| `/app/summaries` | `Summaries` | AI daily intelligence reports |

---

## Key Files

| File | Purpose |
|---|---|
| `artifacts/api-server/main.py` | FastAPI app, camelCase middleware, seed data, startup |
| `artifacts/api-server/database.py` | DB connection, `init_db()`, `get_db()` |
| `artifacts/api-server/models.py` | Pydantic request/response models |
| `artifacts/api-server/routes/*.py` | Route handlers (keywords, mentions, alerts, summaries, dashboard) |
| `artifacts/dashboard/src/index.css` | Full AuraFlow CSS variable design system |
| `artifacts/dashboard/src/main.tsx` | Entry point — activates dark class on html |
| `artifacts/dashboard/src/App.tsx` | Routing (Landing at `/`, app at `/app/*`) |
| `artifacts/dashboard/src/components/layout.tsx` | Sidebar navigation, AuraFlow branding |
| `artifacts/dashboard/src/pages/landing.tsx` | Product landing page |
| `lib/api-spec/openapi.yaml` | OpenAPI 3.0 source of truth |
| `lib/api-client-react/` | Orval-generated hooks + Zod schemas |

---

## Running Locally

```bash
# API server (FastAPI)
cd artifacts/api-server && uvicorn main:app --host 0.0.0.0 --port 8080 --reload

# Frontend (React + Vite)
pnpm --filter @workspace/dashboard run dev

# Regenerate API hooks from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Type check
pnpm run typecheck
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Replit managed) |
| `SESSION_SECRET` | Yes | Session signing secret |
| `PORT` | Auto | Assigned by Replit workflow per artifact |

---

*Last updated: May 2026 · AuraFlow v1.0*
