"""
Reddit client using PRAW (Python Reddit API Wrapper).

Uses Reddit's official OAuth2 application-only flow — no username/password required,
just a client_id and client_secret from a Reddit app (script type).

If credentials are not set in env, is_configured() returns False and the scan
endpoint falls back to HackerNews automatically.

Creating a Reddit app:
  1. Go to https://www.reddit.com/prefs/apps
  2. Click "create another app" → choose type: script
  3. Name: AuraFlow, Redirect URI: http://localhost
  4. client_id  = short string directly under the app name
  5. secret     = the "secret" field
  6. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in Replit Secrets
"""
import os
import praw
from typing import Optional

USER_AGENT = "AuraFlow/1.0 social-listening-platform"


def is_configured() -> bool:
    """Return True if Reddit OAuth credentials are present in environment."""
    return bool(
        os.environ.get("REDDIT_CLIENT_ID")
        and os.environ.get("REDDIT_CLIENT_SECRET")
    )


def _get_client() -> Optional[praw.Reddit]:
    client_id     = os.environ.get("REDDIT_CLIENT_ID")
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET")
    if not client_id or not client_secret:
        return None
    return praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=USER_AGENT,
    )


def search_posts(
    query: str,
    limit: int = 25,
    time_filter: str = "week",
    subreddit: str = "all",
) -> list[dict]:
    """
    Search Reddit for posts matching `query` using PRAW.

    Args:
        query:       keyword or phrase to search for
        limit:       max results per search (1-100)
        time_filter: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
        subreddit:   subreddit name, or 'all' for site-wide search

    Returns:
        List of post dicts, or empty list if credentials not configured.
    """
    reddit = _get_client()
    if not reddit:
        print("[reddit_client] Credentials not configured — skipping Reddit scan")
        return []

    posts: list[dict] = []
    try:
        results = reddit.subreddit(subreddit).search(
            query,
            sort="new",
            time_filter=time_filter,
            limit=limit,
        )
        for submission in results:
            try:
                author_name = submission.author.name if submission.author else "[deleted]"
            except Exception:
                author_name = "[deleted]"

            posts.append({
                "reddit_id":    f"t3_{submission.id}",
                "title":        (submission.title or "")[:500],
                "body":         (submission.selftext or "")[:2000],
                "url":          f"https://reddit.com{submission.permalink}",
                "author":       f"u/{author_name}",
                "subreddit":    submission.subreddit.display_name,
                "upvotes":      max(0, submission.score),
                "num_comments": submission.num_comments,
                "created_utc":  int(submission.created_utc),
            })
    except praw.exceptions.PRAWException as e:
        print(f"[reddit_client] PRAW error for '{query}': {e}")
    except Exception as e:
        print(f"[reddit_client] Unexpected error for '{query}': {e}")

    return posts
