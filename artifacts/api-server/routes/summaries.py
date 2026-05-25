from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import date, datetime, timezone
from database import get_db
from models import Summary

router = APIRouter()


@router.get("/summaries", response_model=list[Summary])
def list_summaries(limit: int = Query(10), db: Session = Depends(get_db)):
    rows = db.execute(
        text("SELECT * FROM summaries ORDER BY date DESC LIMIT :limit"),
        {"limit": limit},
    ).fetchall()
    return [dict(r._mapping) for r in rows]


@router.post("/summaries/generate", response_model=Summary, status_code=201)
def generate_summary(db: Session = Depends(get_db)):
    """Generate a daily AI summary based on today's mentions."""
    today = date.today().isoformat()

    # Gather today's mention stats
    stats = db.execute(text("""
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) AS pos,
            SUM(CASE WHEN sentiment = 'neutral'  THEN 1 ELSE 0 END) AS neu,
            SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) AS neg,
            SUM(CASE WHEN is_complaint THEN 1 ELSE 0 END) AS complaints
        FROM mentions
        WHERE DATE(mentioned_at) = CURRENT_DATE
    """)).fetchone()

    total = stats[0] or 0
    pos = stats[1] or 0
    neu = stats[2] or 0
    neg = stats[3] or 0
    complaints = stats[4] or 0

    # Get top upvoted titles
    top_rows = db.execute(text("""
        SELECT title, author, subreddit, upvotes, sentiment
        FROM mentions
        WHERE DATE(mentioned_at) = CURRENT_DATE
        ORDER BY upvotes DESC
        LIMIT 5
    """)).fetchall()

    top_mentions = "; ".join(
        f'"{r.title}" by {r.author} ({r.upvotes} upvotes, {r.sentiment})'
        for r in top_rows
    ) or "No mentions today."

    # Complaint titles
    complaint_rows = db.execute(text("""
        SELECT title, subreddit FROM mentions
        WHERE DATE(mentioned_at) = CURRENT_DATE AND is_complaint = TRUE
        LIMIT 5
    """)).fetchall()

    main_complaints = "; ".join(
        f'"{r.title}" in r/{r.subreddit}' for r in complaint_rows
    ) or "No complaints detected today."

    # Trending subreddits
    trend_rows = db.execute(text("""
        SELECT subreddit, COUNT(*) AS cnt FROM mentions
        WHERE DATE(mentioned_at) = CURRENT_DATE AND subreddit IS NOT NULL
        GROUP BY subreddit ORDER BY cnt DESC LIMIT 5
    """)).fetchall()

    trending = ", ".join(
        f"r/{r.subreddit} ({r.cnt} mentions)" for r in trend_rows
    ) or "No subreddit activity today."

    sentiment_overview = (
        f"Today: {total} total mentions — {pos} positive ({round(pos/total*100) if total else 0}%), "
        f"{neu} neutral ({round(neu/total*100) if total else 0}%), "
        f"{neg} negative ({round(neg/total*100) if total else 0}%). "
        f"{complaints} complaints detected."
    )

    content = (
        f"## Daily Summary — {today}\n\n"
        f"**Overview:** {sentiment_overview}\n\n"
        f"**Top Mentions:** {top_mentions}\n\n"
        f"**Main Complaints:** {main_complaints}\n\n"
        f"**Trending Discussions:** {trending}"
    )

    row = db.execute(text("""
        INSERT INTO summaries (date, content, top_mentions, main_complaints, trending_discussions, sentiment_overview)
        VALUES (:date, :content, :top_mentions, :main_complaints, :trending_discussions, :sentiment_overview)
        RETURNING *
    """), {
        "date": today,
        "content": content,
        "top_mentions": top_mentions,
        "main_complaints": main_complaints,
        "trending_discussions": trending,
        "sentiment_overview": sentiment_overview,
    }).fetchone()
    db.commit()

    return dict(row._mapping)
