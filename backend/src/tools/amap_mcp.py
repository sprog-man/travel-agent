"""高德 MCP 客户端适配层 — 天气/POI/路线工具."""

import os

import httpx

AMAP_BASE_URL = "https://restapi.amap.com/v3"
DEFAULT_TIMEOUT = 10.0


def _get_amap_key() -> str:
    """在函数调用时读取 AMAP_KEY，避免 import 时 .env 尚未加载导致为空."""
    return os.environ.get("AMAP_KEY", "")


async def _amap_request(path: str, params: dict) -> dict:
    """发送高德 API 请求."""
    api_key = _get_amap_key()
    if not api_key:
        return {"error": "AMAP_KEY 未配置", "unavailable": True}
    params["key"] = api_key
    params["output"] = "json"
    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
        resp = await client.get(f"{AMAP_BASE_URL}{path}", params=params)
        resp.raise_for_status()
        return resp.json()


async def amap_weather(city: str) -> dict:
    """查询城市天气.

    Args:
        city: 城市名称或编码

    Returns:
        天气数据字典
    """
    try:
        data = await _amap_request("/weather/weatherInfo", {"city": city})
        if data.get("status") == "1":
            return {"city": city, "weather": data.get("lives", [{}])[0], "unavailable": False}
        return {"error": data.get("info", "未知错误"), "unavailable": True}
    except Exception as e:
        return {"error": str(e), "unavailable": True}


async def amap_poi_search(keywords: str, city: str = "", types: str = "") -> dict:
    """POI 关键词搜索.

    Args:
        keywords: 搜索关键词
        city: 限定城市
        types: POI 类型编码

    Returns:
        POI 搜索结果
    """
    params = {"keywords": keywords}
    if city:
        params["city"] = city
    if types:
        params["types"] = types
    try:
        data = await _amap_request("/place/text", params)
        if data.get("status") == "1":
            return {
                "pois": data.get("pois", []),
                "count": int(data.get("count", 0)),
                "unavailable": False,
            }
        return {"error": data.get("info", "搜索失败"), "unavailable": True}
    except Exception as e:
        return {"error": str(e), "unavailable": True}


async def amap_route_driving(origin: str, destination: str) -> dict:
    """驾车路线规划.

    Args:
        origin: 起点坐标（经纬度，逗号分隔）
        destination: 终点坐标

    Returns:
        驾车路线数据
    """
    try:
        data = await _amap_request(
            "/direction/driving", {"origin": origin, "destination": destination}
        )
        if data.get("status") == "1":
            return {"route": data.get("route", {}), "unavailable": False}
        return {"error": data.get("info", "路线规划失败"), "unavailable": True}
    except Exception as e:
        return {"error": str(e), "unavailable": True}


async def amap_route_walking(origin: str, destination: str) -> dict:
    """步行路线规划.

    Args:
        origin: 起点坐标
        destination: 终点坐标

    Returns:
        步行路线数据
    """
    try:
        data = await _amap_request(
            "/direction/walking", {"origin": origin, "destination": destination}
        )
        if data.get("status") == "1":
            return {"route": data.get("route", {}), "unavailable": False}
        return {"error": data.get("info", "步行路线规划失败"), "unavailable": True}
    except Exception as e:
        return {"error": str(e), "unavailable": True}


async def amap_geocode(address: str, city: str = "") -> dict:
    """地理编码 — 地址转坐标.

    Args:
        address: 结构化地址
        city: 城市

    Returns:
        坐标信息
    """
    params = {"address": address}
    if city:
        params["city"] = city
    try:
        data = await _amap_request("/geocode/geo", params)
        if data.get("status") == "1":
            geocodes = data.get("geocodes", [])
            if geocodes:
                return {"location": geocodes[0].get("location"), "unavailable": False}
        return {"error": data.get("info", "地理编码失败"), "unavailable": True}
    except Exception as e:
        return {"error": str(e), "unavailable": True}


async def amap_reverse_geocode(location: str) -> dict:
    """逆地理编码 — 坐标转地址.

    Args:
        location: 经纬度坐标（逗号分隔）

    Returns:
        地址信息
    """
    try:
        data = await _amap_request("/geocode/regeo", {"location": location})
        if data.get("status") == "1":
            regeo = data.get("regeocode", {})
            return {
                "address": regeo.get("formatted_address", ""),
                "unavailable": False,
            }
        return {"error": data.get("info", "逆地理编码失败"), "unavailable": True}
    except Exception as e:
        return {"error": str(e), "unavailable": True}


async def amap_poi_around(location: str, types: str = "", radius: int = 3000) -> dict:
    """周边 POI 搜索.

    Args:
        location: 中心点坐标
        types: POI 类型
        radius: 搜索半径（米）

    Returns:
        周边 POI 结果
    """
    params = {"location": location, "radius": str(radius)}
    if types:
        params["types"] = types
    try:
        data = await _amap_request("/place/around", params)
        if data.get("status") == "1":
            return {
                "pois": data.get("pois", []),
                "count": int(data.get("count", 0)),
                "unavailable": False,
            }
        return {"error": data.get("info", "周边搜索失败"), "unavailable": True}
    except Exception as e:
        return {"error": str(e), "unavailable": True}
