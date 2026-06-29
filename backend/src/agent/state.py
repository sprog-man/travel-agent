"""LangGraph State — TravelState 定义."""

from typing import TypedDict

from src.schemas.travel import Itinerary, TravelIntent


class TravelState(TypedDict, total=False):
    """LangGraph 图状态 — 所有节点共享的状态容器."""

    # 用户输入
    user_input: str
    destination: str

    # 意图提取结果
    intent: TravelIntent | None

    # 行程规划
    itinerary: Itinerary | None

    # 反馈循环
    user_feedback: str
    iteration_count: int

    # 消息流
    messages: list[dict]

    # 工具调用记录
    tool_calls: list[dict]

    # 错误信息
    error: str | None
