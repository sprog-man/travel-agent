"""Unsplash 景点图片检索工具."""

import os

import httpx

UNSPLASH_API_URL = "https://api.unsplash.com/search/photos"
UNSPLASH_API_KEY = os.getenv("UNSPLASH_API_KEY", "")
DEFAULT_TIMEOUT = 10.0


async def search_poi_images(query: str, count: int = 3) -> dict:
    """搜索景点配图.

    Args:
        query: 景点名称或关键词
        count: 返回图片数量

    Returns:
        图片 URL 列表
    """
    if not UNSPLASH_API_KEY:
        return {"error": "UNSPLASH_API_KEY 未配置", "unavailable": True}

    headers = {"Authorization": f"Client-ID {UNSPLASH_API_KEY}"}
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
