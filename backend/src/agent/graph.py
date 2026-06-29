"""LangGraph 主图定义 — 智能旅行攻略 Agent."""

from typing import Literal

from langgraph.graph import END, StateGraph

from src.agent.state import TravelState


def intent_node(state: TravelState) -> dict:
    """意图提取节点 — 从用户输入中提取旅行意图（占位实现）."""
    return {
        "intent": None,
        "messages": state.get("messages", []) + [
            {"role": "agent", "content": "意图提取节点待实现"}
        ],
    }


def planning_node(state: TravelState) -> dict:
    """行程规划节点 — 根据意图生成行程方案（占位实现）."""
    return {
        "itinerary": None,
        "messages": state.get("messages", []) + [
            {"role": "agent", "content": "行程规划节点待实现"}
        ],
    }


def review_node(state: TravelState) -> Literal["planning", "__end__"]:
    """反馈判断节点 — 根据迭代次数决定是否继续优化."""
    iteration = state.get("iteration_count", 0)
    if iteration >= 5:
        return END
    return "planning"


def build_graph() -> StateGraph:
    """构建 LangGraph 主图结构.

    图结构:
        START → intent_node → planning_node → review_node
                                              ↻ planning_node (反馈循环)
                                              → END
    """
    graph = StateGraph(TravelState)

    # 注册节点
    graph.add_node("intent", intent_node)
    graph.add_node("planning", planning_node)

    # 设置入口
    graph.set_entry_point("intent")

    # 添加边
    graph.add_edge("intent", "planning")
    graph.add_conditional_edges(
        "planning",
        review_node,
        {"planning": "planning", END: END},
    )

    return graph.compile()
