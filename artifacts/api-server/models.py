from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel


class KeywordBase(BaseModel):
    text: str
    type: str  # brand | competitor | keyword


class KeywordCreate(KeywordBase):
    pass


class Keyword(KeywordBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MentionBase(BaseModel):
    keyword_id: int
    platform: str = "reddit"
    title: str
    body: Optional[str] = None
    url: str
    author: str
    subreddit: Optional[str] = None
    sentiment: str = "neutral"
    sentiment_score: Optional[float] = None
    upvotes: int = 0
    is_urgent: bool = False
    is_complaint: bool = False
    mentioned_at: datetime


class MentionCreate(MentionBase):
    pass


class Mention(MentionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MentionList(BaseModel):
    mentions: list[Mention]
    total: int


class AlertBase(BaseModel):
    type: str
    mention_id: Optional[int] = None
    keyword_id: Optional[int] = None
    message: str
    is_read: bool = False


class AlertCreate(AlertBase):
    pass


class Alert(AlertBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SummaryBase(BaseModel):
    date: date
    content: str
    top_mentions: str
    main_complaints: str
    trending_discussions: str
    sentiment_overview: str


class SummaryCreate(SummaryBase):
    pass


class Summary(SummaryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ScanResult(BaseModel):
    scanned: int
    new_mentions: int
    new_alerts: int


class DashboardStats(BaseModel):
    total_mentions: int
    positive_mentions: int
    neutral_mentions: int
    negative_mentions: int
    urgent_mentions: int
    complaint_mentions: int
    unread_alerts: int
    tracked_keywords: int


class SentimentTrendPoint(BaseModel):
    date: str
    positive: int
    neutral: int
    negative: int
