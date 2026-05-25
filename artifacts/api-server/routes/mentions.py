from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from database import get_db
from models import Mention, MentionList

router = APIRouter()


@router.get("/mentions", response_model=MentionList)
def list_mentions(
    keyword_id: Optional[int] = Query(None),
    sentiment: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    filters = []
    params: dict = {"limit": limit, "offset": offset}

    if keyword_id is not None:
        filters.append("keyword_id = :keyword_id")
        params["keyword_id"] = keyword_id
    if sentiment:
        filters.append("sentiment = :sentiment")
        params["sentiment"] = sentiment
    if platform:
        filters.append("platform = :platform")
        params["platform"] = platform

    where = ("WHERE " + " AND ".join(filters)) if filters else ""

    rows = db.execute(
        text(f"SELECT * FROM mentions {where} ORDER BY mentioned_at DESC LIMIT :limit OFFSET :offset"),
        params,
    ).fetchall()

    total_row = db.execute(text(f"SELECT COUNT(*) FROM mentions {where}"), params).fetchone()
    total = total_row[0] if total_row else 0

    return {"mentions": [dict(r._mapping) for r in rows], "total": total}


@router.get("/mentions/{id}", response_model=Mention)
def get_mention(id: int, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT * FROM mentions WHERE id = :id"), {"id": id}).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Mention not found")
    return dict(row._mapping)


@router.post("/mentions/scan")
def trigger_scan(db: Session = Depends(get_db)):
    """Simulate a Reddit scan: generates mock mentions for each tracked keyword."""
    import random
    from datetime import datetime, timezone

    keywords = db.execute(text("SELECT * FROM keywords")).fetchall()
    new_mentions = 0
    new_alerts = 0

    subreddits = ["entrepreneur", "smallbusiness", "startups", "marketing", "ecommerce", "saas"]
    sentiments = ["positive", "neutral", "negative"]
    sentiment_weights = [0.35, 0.40, 0.25]

    for kw in keywords:
        count = random.randint(1, 4)
        for _ in range(count):
            sentiment = random.choices(sentiments, weights=sentiment_weights)[0]
            upvotes = random.randint(0, 500)
            is_urgent = sentiment == "negative" and random.random() < 0.4
            is_complaint = sentiment == "negative" and random.random() < 0.6
            subreddit = random.choice(subreddits)
            score = round(random.uniform(-1.0, 1.0), 3)

            row = db.execute(
                text("""
                    INSERT INTO mentions
                        (keyword_id, platform, title, body, url, author, subreddit,
                         sentiment, sentiment_score, upvotes, is_urgent, is_complaint, mentioned_at)
                    VALUES
                        (:keyword_id, 'reddit',
                         :title, :body, :url, :author, :subreddit,
                         :sentiment, :sentiment_score, :upvotes, :is_urgent, :is_complaint, :mentioned_at)
                    RETURNING id
                """),
                {
                    "keyword_id": kw.id,
                    "title": f"Discussion about {kw.text} in r/{subreddit}",
                    "body": f"People are talking about {kw.text}. {'This is a serious issue.' if is_complaint else 'Overall positive experience.'}",
                    "url": f"https://reddit.com/r/{subreddit}/comments/{random.randint(100000,999999)}",
                    "author": f"u/user_{random.randint(1000,9999)}",
                    "subreddit": subreddit,
                    "sentiment": sentiment,
                    "sentiment_score": score,
                    "upvotes": upvotes,
                    "is_urgent": is_urgent,
                    "is_complaint": is_complaint,
                    "mentioned_at": datetime.now(timezone.utc),
                },
            ).fetchone()
            mention_id = row[0]
            new_mentions += 1

            # Auto-generate alerts
            if sentiment == "negative":
                db.execute(
                    text("""
                        INSERT INTO alerts (type, mention_id, keyword_id, message)
                        VALUES ('negative_mention', :mention_id, :keyword_id,
                                :message)
                    """),
                    {
                        "mention_id": mention_id,
                        "keyword_id": kw.id,
                        "message": f"Negative mention of '{kw.text}' detected on Reddit (r/{subreddit})",
                    },
                )
                new_alerts += 1
            elif upvotes > 200:
                db.execute(
                    text("""
                        INSERT INTO alerts (type, mention_id, keyword_id, message)
                        VALUES ('high_engagement', :mention_id, :keyword_id, :message)
                    """),
                    {
                        "mention_id": mention_id,
                        "keyword_id": kw.id,
                        "message": f"High-engagement mention of '{kw.text}' with {upvotes} upvotes",
                    },
                )
                new_alerts += 1

    db.commit()
    return {"scanned": len(keywords), "new_mentions": new_mentions, "new_alerts": new_alerts}
