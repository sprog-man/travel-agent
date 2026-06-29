"""Unsplash 景点图片检索工具."""

import os

import httpx

UNSPLASH_API_URL = "https://api.unsplash.com/search/photos"
DEFAULT_TIMEOUT = 10.0


def _get_unsplash_key() -> str:
    """在函数调用时读取 UNSPLASH_API_KEY."""
    return os.environ.get("UNSPLASH_API_KEY", "")


async def search_poi_images(query: str, count: int = 3) -> dict:
    """搜索景点配图.

    Args:
        query: 景点名称或关键词
        count: 返回图片数量（限制 1-30）

    Returns:
        图片 URL 列表
    """
    api_key = _get_unsplash_key()
    if not api_key:
        return {"error": "UNSPLASH_API_KEY 未配置", "unavailable": True}
    count = min(max(count, 1), 30)

    headers = {"Authorization": f"Client-ID {api_key}"}
    params = {"query": query, "per_page": count, "orientation": "landscape"}

    try:
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            resp = await client.get(UNSPLASH_API_URL, headers=headers, params=params)
            resp.raise_for_status()
            data = resp.json()

        photos = data.get("results", [])
        return {
            "images": [
                {
                    "url": p.get("urls", {}).get("regular", ""),
                    "thumb": p.get("urls", {}).get("thumb", ""),
                    "description": p.get("description", p.get("alt_description", "")),
                    "author": p.get("user", {}).get("name", ""),
                }
                for p in photos
            ],
            "total": data.get("total", 0),
            "unavailable": False,
        }
    except Exception as e:
        return {"error": str(e), "unavailable": True}
