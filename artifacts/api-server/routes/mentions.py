from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from database import get_db
from models import Mention, MentionList, ScanResult
import reddit_client
from sentiment import classify

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
    filters: list[str] = []
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

    total_row = db.execute(
        text(f"SELECT COUNT(*) FROM mentions {where}"), params
    ).fetchone()
    total = total_row[0] if total_row else 0

    return {"mentions": [dict(r._mapping) for r in rows], "total": total}


@router.get("/mentions/{id}", response_model=Mention)
def get_mention(id: int, db: Session = Depends(get_db)):
    row = db.execute(
        text("SELECT * FROM mentions WHERE id = :id"), {"id": id}
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Mention not found")
    return dict(row._mapping)


@router.post("/mentions/scan", response_model=ScanResult)
def trigger_scan(db: Session = Depends(get_db)):
    """
    Scan Reddit for real mentions of every tracked keyword using PRAW.

    Requires REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET to be set in environment.
    Returns a 503 with a clear message if credentials are missing.

    For each keyword:
      - Searches r/all via PRAW with sort=new, time_filter=week
      - Classifies sentiment from real post title + body text
      - Inserts new mentions, skips duplicates (deduped by reddit_id)
      - Generates alerts for negative sentiment, high engagement, competitor spikes
    """
    if not reddit_client.is_configured():
        raise HTTPException(
            status_code=503,
            detail=(
                "Reddit credentials not configured. "
                "Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in Replit Secrets, "
                "then restart the server."
            ),
        )

    keywords = db.execute(text("SELECT id, text, type FROM keywords")).fetchall()

    total_new_mentions = 0
    total_new_alerts   = 0
    total_skipped      = 0

    for kw in keywords:
        posts = reddit_client.search_posts(kw.text, limit=25, time_filter="week")
        print(f"[scan] '{kw.text}' → {len(posts)} posts from Reddit")

        for post in posts:
            if not post.get("reddit_id"):
                continue

            classified = classify(post["title"], post.get("body", "") or "")

            mentioned_at = (
                datetime.fromtimestamp(post["created_utc"], tz=timezone.utc)
                if post.get("created_utc")
                else datetime.now(timezone.utc)
            )

            row = db.execute(
                text("""
                    INSERT INTO mentions
                        (keyword_id, platform, title, body, url, author, subreddit,
                         sentiment, sentiment_score, upvotes, is_urgent, is_complaint,
                         mentioned_at, reddit_id)
                    VALUES
                        (:keyword_id, 'reddit', :title, :body, :url, :author, :subreddit,
                         :sentiment, :sentiment_score, :upvotes, :is_urgent, :is_complaint,
                         :mentioned_at, :reddit_id)
                    ON CONFLICT (reddit_id) DO NOTHING
                    RETURNING id
                """),
                {
                    "keyword_id":      kw.id,
                    "title":           post["title"],
                    "body":            post["body"] or None,
                    "url":             post["url"],
                    "author":          post["author"],
                    "subreddit":       post["subreddit"],
                    "sentiment":       classified["sentiment"],
                    "sentiment_score": classified["sentiment_score"],
                    "upvotes":         post["upvotes"],
                    "is_urgent":       classified["is_urgent"],
                    "is_complaint":    classified["is_complaint"],
                    "mentioned_at":    mentioned_at,
                    "reddit_id":       post["reddit_id"],
                },
            ).fetchone()

            if row is None:
                total_skipped += 1
                continue

            mention_id = row[0]
            total_new_mentions += 1

            subreddit_label = f"r/{post['subreddit']}" if post.get("subreddit") else "Reddit"

            if classified["sentiment"] == "negative":
                db.execute(
                    text("""
                        INSERT INTO alerts (type, mention_id, keyword_id, message)
                        VALUES ('negative_mention', :mid, :kid, :msg)
                    """),
                    {
                        "mid": mention_id,
                        "kid": kw.id,
                        "msg": (
                            f"Negative mention of '{kw.text}' in "
                            f"{subreddit_label}: {post['title'][:80]}"
                        ),
                    },
                )
                total_new_alerts += 1

            if post["upvotes"] > 100:
                db.execute(
                    text("""
                        INSERT INTO alerts (type, mention_id, keyword_id, message)
                        VALUES ('high_engagement', :mid, :kid, :msg)
                    """),
                    {
                        "mid": mention_id,
                        "kid": kw.id,
                        "msg": (
                            f"High-engagement post about '{kw.text}' in "
                            f"{subreddit_label} — {post['upvotes']} upvotes"
                        ),
                    },
                )
                total_new_alerts += 1

            if kw.type == "competitor" and post["upvotes"] > 50:
                db.execute(
                    text("""
                        INSERT INTO alerts (type, mention_id, keyword_id, message)
                        VALUES ('competitor_spike', :mid, :kid, :msg)
                    """),
                    {
                        "mid": mention_id,
                        "kid": kw.id,
                        "msg": (
                            f"Competitor '{kw.text}' trending in "
                            f"{subreddit_label} with {post['upvotes']} upvotes"
                        ),
                    },
                )
                total_new_alerts += 1

    db.commit()

    return {
        "scanned":      len(keywords),
        "new_mentions": total_new_mentions,
        "new_alerts":   total_new_alerts,
        "skipped":      total_skipped,
    }
