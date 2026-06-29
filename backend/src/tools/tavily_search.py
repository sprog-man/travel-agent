"""Tavily Search 适配层 — 网络搜索工具."""

import os

import httpx

TAVILY_API_URL = "https://api.tavily.com/search"
DEFAULT_TIMEOUT = 10.0


def _get_tavily_key() -> str:
    """在函数调用时读取 TAVILY_API_KEY."""
    return os.environ.get("TAVILY_API_KEY", "")


async def tavily_search(query: str, max_results: int = 5) -> dict:
    """Tavily 网络搜索.

    Args:
        query: 搜索关键词
        max_results: 最大返回结果数

    Returns:
        搜索结果列表
    """
    api_key = _get_tavily_key()
    if not api_key:
        return {"error": "TAVILY_API_KEY 未配置", "unavailable": True}

    payload = {
        "api_key": api_key,
        "query": query,
        "max_results": max_results,
        "search_depth": "basic",
    }

    try:
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            resp = await client.post(TAVILY_API_URL, json=payload)
            resp.raise_for_status()
            data = resp.json()

        results = data.get("results", [])
        return {
            "results": [
                {
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "content": r.get("content", ""),
                    "score": r.get("score", 0),
                }
                for r in results
            ],
            "answer": data.get("answer", ""),
            "unavailable": False,
        }
    except Exception as e:
        return {"error": str(e), "unavailable": True}
