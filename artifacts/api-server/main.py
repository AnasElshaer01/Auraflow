import os
import json
import re
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from dotenv import load_dotenv

load_dotenv()

from database import init_db, engine
from routes import keywords, mentions, alerts, summaries, dashboard
from sqlalchemy import text


def _snake_to_camel(name: str) -> str:
    components = name.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


def _convert_keys(obj):
    if isinstance(obj, dict):
        return {_snake_to_camel(k): _convert_keys(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_convert_keys(i) for i in obj]
    return obj


app = FastAPI(title="ListenAI API", version="1.0.0")


@app.middleware("http")
async def camel_case_middleware(request: Request, call_next):
    response = await call_next(request)
    ct = response.headers.get("content-type", "")
    if "application/json" in ct:
        body = b""
        async for chunk in response.body_iterator:
            body += chunk
        data = json.loads(body)
        camel = _convert_keys(data)
        new_body = json.dumps(camel).encode()
        headers = dict(response.headers)
        headers["content-length"] = str(len(new_body))
        return Response(
            content=new_body,
            status_code=response.status_code,
            headers=headers,
            media_type="application/json",
        )
    return response


@app.on_event("startup")
def startup_event():
    init_db()
    _seed_demo_data()


def _seed_demo_data():
    """Seed demo data only if tables are empty."""
    import random
    from datetime import datetime, timezone, timedelta

    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM keywords")).fetchone()[0]
        if count > 0:
            return  # already seeded

        # Seed keywords
        kw_rows = conn.execute(text("""
            INSERT INTO keywords (text, type) VALUES
                ('Acme Corp', 'brand'),
                ('TechRival', 'competitor'),
                ('product launch', 'keyword')
            RETURNING id, text, type
        """)).fetchall()

        subreddits = ["entrepreneur", "smallbusiness", "startups", "marketing", "ecommerce"]
        sentiments = ["positive", "neutral", "negative"]
        weights = [0.35, 0.40, 0.25]

        titles = {
            "positive": [
                "Really impressed with {kw} lately",
                "Why {kw} is crushing it this year",
                "{kw} just saved our team hours every week",
                "Huge fan of what {kw} is doing",
            ],
            "neutral": [
                "Anyone else using {kw}?",
                "Comparing options — thoughts on {kw}?",
                "What's the current opinion on {kw}?",
                "Looking for info about {kw}",
            ],
            "negative": [
                "{kw} support is really frustrating",
                "Disappointed with {kw} this quarter",
                "Major issues with {kw} — is anyone else seeing this?",
                "{kw} needs to fix their pricing ASAP",
            ],
        }

        now = datetime.now(timezone.utc)
        mention_ids = []

        for kw in kw_rows:
            for day_offset in range(7):
                dt = now - timedelta(days=day_offset, hours=random.randint(0, 23))
                count_today = random.randint(2, 6)
                for _ in range(count_today):
                    sentiment = random.choices(sentiments, weights=weights)[0]
                    upvotes = random.randint(0, 400)
                    is_complaint = sentiment == "negative" and random.random() < 0.6
                    is_urgent = is_complaint and random.random() < 0.4
                    subreddit = random.choice(subreddits)
                    title = random.choice(titles[sentiment]).format(kw=kw.text)
                    score = round(random.uniform(-1.0, 1.0), 3)

                    row = conn.execute(text("""
                        INSERT INTO mentions
                            (keyword_id, platform, title, body, url, author, subreddit,
                             sentiment, sentiment_score, upvotes, is_urgent, is_complaint, mentioned_at)
                        VALUES
                            (:kid, 'reddit', :title, :body, :url, :author, :subreddit,
                             :sentiment, :score, :upvotes, :urgent, :complaint, :dt)
                        RETURNING id
                    """), {
                        "kid": kw.id,
                        "title": title,
                        "body": f"Full discussion about {kw.text}. {'This is a real issue.' if is_complaint else 'Great experiences overall.'}",
                        "url": f"https://reddit.com/r/{subreddit}/comments/{random.randint(100000,999999)}",
                        "author": f"u/user_{random.randint(1000, 9999)}",
                        "subreddit": subreddit,
                        "sentiment": sentiment,
                        "score": score,
                        "upvotes": upvotes,
                        "urgent": is_urgent,
                        "complaint": is_complaint,
                        "dt": dt,
                    }).fetchone()
                    mention_ids.append((row[0], sentiment, kw.id, upvotes, subreddit, kw.text))

        # Seed alerts for negative / high-engagement
        for mid, sentiment, kid, upvotes, subreddit, kw_text in mention_ids:
            if sentiment == "negative":
                conn.execute(text("""
                    INSERT INTO alerts (type, mention_id, keyword_id, message)
                    VALUES ('negative_mention', :mid, :kid, :msg)
                """), {
                    "mid": mid, "kid": kid,
                    "msg": f"Negative mention of '{kw_text}' detected in r/{subreddit}"
                })
            elif upvotes > 200:
                conn.execute(text("""
                    INSERT INTO alerts (type, mention_id, keyword_id, message)
                    VALUES ('high_engagement', :mid, :kid, :msg)
                """), {
                    "mid": mid, "kid": kid,
                    "msg": f"High-engagement post about '{kw_text}' with {upvotes} upvotes in r/{subreddit}"
                })

        conn.commit()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(keywords.router, prefix="/api")
app.include_router(mentions.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(summaries.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/api/healthz")
def health_check():
    return {"status": "ok"}
