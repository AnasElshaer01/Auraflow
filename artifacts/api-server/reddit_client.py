"""
Reddit public JSON API client — no OAuth key required.
Reddit's public search endpoint works with just a User-Agent header.
Rate limit: ~60 req/min. We sleep between keyword scans to stay safe.
"""
import time
import requests
from typing import Optional

HEADERS = {
    "User-Agent": "AuraFlow/1.0 social-listening-platform (by /u/auraflow_bot)"
}
BASE_URL = "https://www.reddit.com"
REQUEST_TIMEOUT = 12


def _parse_post(child: dict) -> dict:
    post = child.get("data", {})
    permalink = post.get("permalink", "")
    return {
        "reddit_id":    post.get("name", ""),           # e.g. t3_abc123
        "title":        post.get("title", "")[:500],
        "body":         (post.get("selftext", "") or "")[:2000],
        "url":          f"https://reddit.com{permalink}" if permalink else post.get("url", ""),
        "author":       f"u/{post.get('author', '[deleted]')}",
        "subreddit":    post.get("subreddit", ""),
        "upvotes":      max(0, post.get("ups", 0)),
        "num_comments": post.get("num_comments", 0),
        "created_utc":  post.get("created_utc", 0),
    }


def search_posts(query: str, limit: int = 25, time_filter: str = "week") -> list[dict]:
    """
    Search Reddit for posts matching `query` using the public JSON API.

    Args:
        query:       keyword or phrase to search for
        limit:       max results (1-100)
        time_filter: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'

    Returns:
        List of post dicts with keys: reddit_id, title, body, url, author,
        subreddit, upvotes, num_comments, created_utc
    """
    params = {
        "q":     query,
        "sort":  "new",
        "limit": min(limit, 100),
        "type":  "link",
        "t":     time_filter,
    }
    try:
        resp = requests.get(
            f"{BASE_URL}/search.json",
            params=params,
            headers=HEADERS,
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
        children = data.get("data", {}).get("children", [])
        return [_parse_post(c) for c in children if c.get("kind") == "t3"]
    except requests.exceptions.Timeout:
        print(f"[reddit_client] Timeout searching for '{query}'")
        return []
    except requests.exceptions.HTTPError as e:
        print(f"[reddit_client] HTTP {e.response.status_code} for '{query}'")
        return []
    except Exception as e:
        print(f"[reddit_client] Error for '{query}': {e}")
        return []


def search_subreddit(subreddit: str, query: str, limit: int = 25) -> list[dict]:
    """
    Search within a specific subreddit.
    """
    params = {
        "q":         query,
        "restrict_sr": "true",
        "sort":      "new",
        "limit":     min(limit, 100),
    }
    try:
        resp = requests.get(
            f"{BASE_URL}/r/{subreddit}/search.json",
            params=params,
            headers=HEADERS,
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        children = resp.json().get("data", {}).get("children", [])
        return [_parse_post(c) for c in children if c.get("kind") == "t3"]
    except Exception as e:
        print(f"[reddit_client] Error in r/{subreddit} for '{query}': {e}")
        return []
