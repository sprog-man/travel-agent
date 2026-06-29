"""LangGraph State — TravelState 定义."""

from typing import NotRequired, TypedDict

from src.schemas.travel import Itinerary, TravelIntent


class TravelState(TypedDict):
    """LangGraph 图状态 — 所有节点共享的状态容器.

    必填字段：user_input, destination, iteration_count
    可选字段：使用 NotRequired 标注
    """

    # 必填：用户输入
    user_input: str
    destination: str
    iteration_count: int

    # 可选：意图提取结果
    intent: NotRequired[TravelIntent | None]

    # 可选：行程规划
    itinerary: NotRequired[Itinerary | None]

    # 可选：反馈循环
    user_feedback: NotRequired[str]

    # 可选：消息流
    messages: NotRequired[list[dict]]

    # 可选：工具调用记录
    tool_calls: NotRequired[list[dict]]

    # 可选：错误信息
    error: NotRequired[str | None]
