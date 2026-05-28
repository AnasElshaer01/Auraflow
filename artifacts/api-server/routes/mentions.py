from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from database import get_db
from models import Mention, MentionList, ScanResult
import reddit_client
import hn_client
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
    Scan for real mentions of every tracked keyword.

    Source priority:
      1. Reddit via PRAW — used when REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET are set.
      2. HackerNews Algolia API — automatic fallback when Reddit credentials are absent.

    For each keyword:
      - Fetches real posts from the active source
      - Classifies sentiment from actual title + body text
      - Inserts new mentions, skipping duplicates (deduped by external ID)
      - Generates alerts for negative sentiment and high-engagement posts
    """
    keywords = db.execute(text("SELECT id, text, type FROM keywords")).fetchall()

    use_reddit  = reddit_client.is_configured()
    source_name = "Reddit" if use_reddit else "HackerNews"
    platform    = "reddit" if use_reddit else "hackernews"
    print(f"[scan] Using source: {source_name}")

    total_new_mentions = 0
    total_new_alerts   = 0
    total_skipped      = 0

    for kw in keywords:
        if use_reddit:
            posts = reddit_client.search_posts(kw.text, limit=25, time_filter="week")
        else:
            posts = hn_client.search_stories(kw.text, limit=25, time_filter="pastWeek")

        print(f"[scan] '{kw.text}' → {len(posts)} posts from {source_name}")

        for post in posts:
            external_id = post.get("reddit_id") or post.get("external_id")
            if not external_id:
                continue

            classified = classify(post["title"], post.get("body", "") or "")

            mentioned_at = (
                datetime.fromtimestamp(post["created_utc"], tz=timezone.utc)
                if post.get("created_utc")
                else datetime.now(timezone.utc)
            )

            # subreddit is only meaningful for Reddit posts
            subreddit = post.get("subreddit") if use_reddit else None

            row = db.execute(
                text("""
                    INSERT INTO mentions
                        (keyword_id, platform, title, body, url, author, subreddit,
                         sentiment, sentiment_score, upvotes, is_urgent, is_complaint,
                         mentioned_at, reddit_id)
                    VALUES
                        (:keyword_id, :platform, :title, :body, :url, :author, :subreddit,
                         :sentiment, :sentiment_score, :upvotes, :is_urgent, :is_complaint,
                         :mentioned_at, :reddit_id)
                    ON CONFLICT (reddit_id) DO NOTHING
                    RETURNING id
                """),
                {
                    "keyword_id":      kw.id,
                    "platform":        platform,
                    "title":           post["title"],
                    "body":            post["body"] or None,
                    "url":             post["url"],
                    "author":          post["author"],
                    "subreddit":       subreddit,
                    "sentiment":       classified["sentiment"],
                    "sentiment_score": classified["sentiment_score"],
                    "upvotes":         post["upvotes"],
                    "is_urgent":       classified["is_urgent"],
                    "is_complaint":    classified["is_complaint"],
                    "mentioned_at":    mentioned_at,
                    "reddit_id":       external_id,
                },
            ).fetchone()

            if row is None:
                total_skipped += 1
                continue

            mention_id = row[0]
            total_new_mentions += 1

            # ── Alert generation ────────────────────────────────────────────
            source_label = f"r/{subreddit}" if subreddit else source_name

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
                            f"Negative mention of '{kw.text}' on {source_label}: "
                            f"{post['title'][:80]}"
                        ),
                    },
                )
                total_new_alerts += 1

            if post["upvotes"] > 100:
                pts_label = "upvotes" if use_reddit else "points"
                db.execute(
                    text("""
                        INSERT INTO alerts (type, mention_id, keyword_id, message)
                        VALUES ('high_engagement', :mid, :kid, :msg)
                    """),
                    {
                        "mid": mention_id,
                        "kid": kw.id,
                        "msg": (
                            f"High-engagement post about '{kw.text}' on {source_label} "
                            f"— {post['upvotes']} {pts_label}"
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
                            f"Competitor '{kw.text}' trending on {source_label} "
                            f"with {post['upvotes']} engagement"
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
