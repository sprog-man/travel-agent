"""汇率查询工具."""

import os

import httpx

EXCHANGE_API_URL = "https://v6.exchangerate-api.com/v6"
DEFAULT_TIMEOUT = 10.0


def _get_exchange_key() -> str:
    """在函数调用时读取 EXCHANGE_API_KEY."""
    return os.environ.get("EXCHANGE_API_KEY", "")


async def get_exchange_rate(base_currency: str = "CNY", target_currency: str = "USD") -> dict:
    """查询汇率.

    Args:
        base_currency: 源币种（默认人民币）
        target_currency: 目标币种（默认美元）

    Returns:
        汇率数据
    """
    api_key = _get_exchange_key()
    if not api_key:
        return {"error": "EXCHANGE_API_KEY 未配置", "unavailable": True}

    url = f"{EXCHANGE_API_URL}/{api_key}/pair/{base_currency}/{target_currency}"

    try:
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

        if data.get("result") == "success":
            return {
                "base": base_currency,
                "target": target_currency,
                "rate": data.get("conversion_rate", 0),
                "unavailable": False,
            }
        return {"error": data.get("error-type", "汇率查询失败"), "unavailable": True}
    except Exception as e:
        return {"error": str(e), "unavailable": True}
