"""
HackerNews Algolia search API client.

Completely free, no authentication required, works from all IP ranges
including cloud/datacenter environments.

API docs: https://hn.algolia.com/api
"""
import requests
from typing import Optional

ALGOLIA_BASE = "https://hn.algolia.com/api/v1"
HEADERS = {"User-Agent": "AuraFlow/1.0"}
REQUEST_TIMEOUT = 12


def _parse_hit(hit: dict) -> dict:
    obj_id   = hit.get("objectID", "")
    url      = hit.get("url") or f"https://news.ycombinator.com/item?id={obj_id}"
    hn_url   = f"https://news.ycombinator.com/item?id={obj_id}"
    return {
        "external_id":  f"hn_{obj_id}",
        "title":        (hit.get("title") or "")[:500],
        "body":         (hit.get("story_text") or "")[:2000],
        "url":          hn_url,        # always link to the HN discussion
        "source_url":   url,           # original article URL
        "author":       hit.get("author", "unknown"),
        "subreddit":    None,          # not applicable for HN
        "upvotes":      hit.get("points") or 0,
        "num_comments": hit.get("num_comments") or 0,
        "created_utc":  hit.get("created_at_i") or 0,
    }


def search_stories(
    query: str,
    limit: int = 25,
    time_filter: str = "pastWeek",
) -> list[dict]:
    """
    Search HackerNews stories matching `query`.

    Args:
        query:       keyword or phrase to search for
        limit:       max results (1-1000, default 25)
        time_filter: 'last24h' | 'pastWeek' | 'pastMonth' | 'pastYear' | 'allTime'

    Returns:
        List of post dicts: external_id, title, body, url, source_url,
        author, subreddit, upvotes, num_comments, created_utc
    """
    params = {
        "query":       query,
        "tags":        "story",
        "hitsPerPage": min(limit, 100),
    }
    if time_filter:
        params["numericFilters"] = _time_filter_to_numeric(time_filter)

    try:
        resp = requests.get(
            f"{ALGOLIA_BASE}/search",
            params=params,
            headers=HEADERS,
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        hits = resp.json().get("hits", [])
        return [_parse_hit(h) for h in hits]
    except requests.exceptions.Timeout:
        print(f"[hn_client] Timeout searching for '{query}'")
        return []
    except requests.exceptions.HTTPError as e:
        print(f"[hn_client] HTTP {e.response.status_code} for '{query}'")
        return []
    except Exception as e:
        print(f"[hn_client] Error for '{query}': {e}")
        return []


def _time_filter_to_numeric(time_filter: str) -> str:
    """Convert named time filter to Algolia numericFilters string."""
    import time
    now = int(time.time())
    windows = {
        "last24h":   now - 86_400,
        "pastWeek":  now - 604_800,
        "pastMonth": now - 2_592_000,
        "pastYear":  now - 31_536_000,
    }
    cutoff = windows.get(time_filter)
    if cutoff:
        return f"created_at_i>{cutoff}"
    return ""
