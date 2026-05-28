import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from typing import Generator

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create tables if they don't exist."""
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS keywords (
                id SERIAL PRIMARY KEY,
                text TEXT NOT NULL,
                type TEXT NOT NULL CHECK (type IN ('brand', 'competitor', 'keyword')),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS mentions (
                id SERIAL PRIMARY KEY,
                keyword_id INTEGER NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
                platform TEXT NOT NULL DEFAULT 'reddit',
                title TEXT NOT NULL,
                body TEXT,
                url TEXT NOT NULL,
                author TEXT NOT NULL,
                subreddit TEXT,
                sentiment TEXT NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
                sentiment_score REAL,
                upvotes INTEGER NOT NULL DEFAULT 0,
                is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
                is_complaint BOOLEAN NOT NULL DEFAULT FALSE,
                mentioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                reddit_id TEXT UNIQUE
            )
        """))
        # Migrate existing tables that don't have reddit_id yet
        conn.execute(text("""
            ALTER TABLE mentions ADD COLUMN IF NOT EXISTS reddit_id TEXT UNIQUE
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS alerts (
                id SERIAL PRIMARY KEY,
                type TEXT NOT NULL CHECK (type IN ('negative_mention', 'high_engagement', 'competitor_spike')),
                mention_id INTEGER REFERENCES mentions(id) ON DELETE SET NULL,
                keyword_id INTEGER REFERENCES keywords(id) ON DELETE SET NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS summaries (
                id SERIAL PRIMARY KEY,
                date DATE NOT NULL,
                content TEXT NOT NULL,
                top_mentions TEXT NOT NULL,
                main_complaints TEXT NOT NULL,
                trending_discussions TEXT NOT NULL,
                sentiment_overview TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """))
        conn.commit()
