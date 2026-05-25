.PHONY: setup db api frontend dev stop clean

# ── First-time setup ──────────────────────────────────────────────────────────
setup:
	@echo "→ Copying .env.example to .env (if not already present)"
	@[ -f .env ] || cp .env.example .env
	@echo "→ Starting Postgres container"
	docker compose up -d postgres
	@echo "→ Waiting for Postgres to be healthy"
	@until docker compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@echo "→ Installing Python dependencies"
	pip install -r artifacts/api-server/requirements.txt
	@echo "→ Installing Node dependencies"
	pnpm install
	@echo ""
	@echo "✓ Setup complete. Run 'make dev' to start both servers."

# ── Individual services ───────────────────────────────────────────────────────
db:
	docker compose up -d postgres

api:
	cd artifacts/api-server && \
	  set -a && [ -f ../../.env ] && . ../../.env; set +a && \
	  uvicorn main:app --host 0.0.0.0 --port 8080 --reload

frontend:
	PORT=5173 BASE_PATH=/ pnpm --filter @workspace/dashboard run dev

# ── Run both servers in parallel (requires two terminals or a process manager) ─
dev:
	@echo "Starting AuraFlow locally…"
	@echo "  API    → http://localhost:8080"
	@echo "  Web    → http://localhost:5173"
	@echo ""
	@echo "Run 'make api' in one terminal and 'make frontend' in another."
	@echo "Or use: npm install -g concurrently && make devp"

devp:
	@npx concurrently \
	  --names "api,web" \
	  --prefix-colors "cyan,magenta" \
	  "make api" \
	  "make frontend"

# ── Teardown ──────────────────────────────────────────────────────────────────
stop:
	docker compose stop

clean:
	docker compose down -v
	@echo "Postgres data volume removed."
