from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import DashboardStats, SentimentTrendPoint

router = APIRouter()


@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    mentions = db.execute(text("""
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) AS positive,
            SUM(CASE WHEN sentiment = 'neutral'  THEN 1 ELSE 0 END) AS neutral,
            SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) AS negative,
            SUM(CASE WHEN is_urgent   THEN 1 ELSE 0 END) AS urgent,
            SUM(CASE WHEN is_complaint THEN 1 ELSE 0 END) AS complaint
        FROM mentions
    """)).fetchone()

    unread = db.execute(
        text("SELECT COUNT(*) FROM alerts WHERE is_read = FALSE")
    ).fetchone()[0]

    keywords = db.execute(
        text("SELECT COUNT(*) FROM keywords")
    ).fetchone()[0]

    return DashboardStats(
        total_mentions=mentions[0] or 0,
        positive_mentions=mentions[1] or 0,
        neutral_mentions=mentions[2] or 0,
        negative_mentions=mentions[3] or 0,
        urgent_mentions=mentions[4] or 0,
        complaint_mentions=mentions[5] or 0,
        unread_alerts=unread or 0,
        tracked_keywords=keywords or 0,
    )


@router.get("/dashboard/sentiment-trend", response_model=list[SentimentTrendPoint])
def get_sentiment_trend(db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT
            TO_CHAR(DATE(mentioned_at), 'Mon DD') AS date,
            SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) AS positive,
            SUM(CASE WHEN sentiment = 'neutral'  THEN 1 ELSE 0 END) AS neutral,
            SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) AS negative
        FROM mentions
        WHERE mentioned_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(mentioned_at)
        ORDER BY DATE(mentioned_at) ASC
    """)).fetchall()

    return [
        SentimentTrendPoint(
            date=r.date,
            positive=r.positive or 0,
            neutral=r.neutral or 0,
            negative=r.negative or 0,
        )
        for r in rows
    ]
