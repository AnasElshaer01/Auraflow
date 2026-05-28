"""
Keyword-based sentiment classifier.

Analyses real Reddit post title + body text and returns:
  - sentiment:       'positive' | 'neutral' | 'negative'
  - sentiment_score: float from -1.0 (most negative) to +1.0 (most positive)
  - is_complaint:    bool — likely a complaint or support request
  - is_urgent:       bool — language suggests urgency / critical issue

No external API required — works offline, instant response.
"""
import re

# ── Word lists ────────────────────────────────────────────────────────────────

POSITIVE = {
    "love", "loved", "loving", "great", "greatest", "amazing", "amazed",
    "excellent", "fantastic", "awesome", "best", "perfect", "perfectly",
    "helpful", "brilliant", "impressed", "impressive", "recommend", "recommended",
    "outstanding", "superb", "wonderful", "pleased", "happy", "thrilled",
    "satisfied", "incredible", "solid", "easy", "smooth", "fast", "reliable",
    "quality", "innovative", "efficient", "effective", "works", "working",
    "flawless", "exceptional", "phenomenal", "top", "delighted", "enjoy",
    "enjoying", "enjoyed", "praise", "praised", "thankful", "grateful",
    "win", "winning", "won", "success", "successful", "better", "best",
    "improved", "upgrade", "10x", "game-changer", "game changer",
}

NEGATIVE = {
    "terrible", "awful", "hate", "hated", "broken", "breaking", "broke",
    "frustrating", "frustrated", "frustration", "useless", "disappointed",
    "disappointing", "annoying", "annoyed", "failure", "fail", "failed",
    "failing", "bad", "poor", "worst", "horrible", "scam", "fraud",
    "misleading", "mislead", "expensive", "overpriced", "slow", "buggy",
    "bug", "crash", "crashes", "crashed", "crashing", "unreliable",
    "rip off", "ripoff", "waste", "wasted", "regret", "avoid", "warning",
    "never again", "unacceptable", "pathetic", "ridiculous", "joke",
    "nightmare", "disaster", "outage", "broken", "down", "offline",
    "unusable", "garbage", "trash", "junk", "pointless", "overrated",
    "fake", "lying", "lied", "deceptive", "dishonest",
}

COMPLAINT_SIGNALS = {
    "complaint", "complain", "complaining", "issue", "problem", "bug",
    "broken", "fix", "fixing", "fixed", "refund", "cancel", "cancelling",
    "cancellation", "disappointed", "frustrated", "not working", "doesn't work",
    "doesnt work", "can't", "cannot", "error", "support", "ticket",
    "charged", "overcharged", "billing", "invoice", "wrong charge",
    "help", "stuck", "lost data", "data loss",
}

URGENT_SIGNALS = {
    "urgent", "emergency", "critical", "immediately", "asap", "broken",
    "down", "outage", "offline", "not working", "data loss", "breach",
    "hacked", "hack", "security", "vulnerability", "exploit",
}

# ── Classifier ────────────────────────────────────────────────────────────────

def _tokenise(text: str) -> set[str]:
    """Lowercase and extract all word tokens from text."""
    return set(re.findall(r"\b[\w'-]+\b", text.lower()))


def classify(title: str, body: str) -> dict:
    """
    Classify the sentiment and flags of a Reddit post.

    Args:
        title: Post title
        body:  Post body / selftext (may be empty)

    Returns:
        dict with keys: sentiment, sentiment_score, is_complaint, is_urgent
    """
    combined = f"{title} {body}"
    words = _tokenise(combined)

    pos_hits = len(words & POSITIVE)
    neg_hits = len(words & NEGATIVE)

    # Score: each positive word +0.3, each negative word -0.4 (negativity bias)
    raw = (pos_hits * 0.3) - (neg_hits * 0.4)
    score = round(max(-1.0, min(1.0, raw)), 3)

    if score > 0.1:
        sentiment = "positive"
    elif score < -0.1:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    # Multi-word phrase check (supplement token set)
    combined_lower = combined.lower()
    complaint_phrases = {"not working", "doesn't work", "doesnt work",
                         "rip off", "data loss", "wrong charge"}
    urgent_phrases    = {"data loss", "not working", "security breach"}

    is_complaint = bool(
        (words & COMPLAINT_SIGNALS)
        or any(p in combined_lower for p in complaint_phrases)
    ) and sentiment != "positive"

    is_urgent = bool(
        (words & URGENT_SIGNALS)
        or any(p in combined_lower for p in urgent_phrases)
    )

    return {
        "sentiment":       sentiment,
        "sentiment_score": score,
        "is_complaint":    is_complaint,
        "is_urgent":       is_urgent,
    }
