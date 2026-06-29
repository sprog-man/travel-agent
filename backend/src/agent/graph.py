"""LangGraph 主图定义 — 智能旅行攻略 Agent."""

from langgraph.graph import END, StateGraph

from src.agent.state import TravelState
from src.tools import amap_mcp, tavily_search, unsplash_images, currency

# 工具注册表 — 待 intent_node / planning_node 实现后接入 LangGraph tool-use
# TODO: 在 feat-006 中将工具注册为 LangGraph ToolNode，替代当前占位实现
TOOL_REGISTRY = {
    "amap_mcp": amap_mcp,
    "tavily_search": tavily_search,
    "unsplash_images": unsplash_images,
    "currency": currency,
}


def intent_node(state: TravelState) -> dict:
    """意图提取节点 — 从用户输入中提取旅行意图（占位实现）."""
    return {
        "intent": None,
        "messages": state.get("messages", []) + [
            {"role": "agent", "content": "意图提取节点待实现"}
        ],
    }


def planning_node(state: TravelState) -> dict:
    """行程规划节点 — 根据意图生成行程方案（占位实现）.

    每次执行后递增 iteration_count，防止 review_router 死循环。
    """
    return {
        "itinerary": None,
        "iteration_count": state.get("iteration_count", 0) + 1,
        "messages": state.get("messages", []) + [
            {"role": "agent", "content": "行程规划节点待实现"}
        ],
    }


def review_router(state: TravelState) -> str:
    """反馈路由 — 根据迭代次数决定继续优化还是结束.

    注意：这是条件边的路由函数，不是图节点。
    iteration_count 的递增由 planning_node 负责。
    """
    iteration = state.get("iteration_count", 0)
    if iteration >= 5:
        return END
    return "planning"


def build_graph() -> StateGraph:
    """构建 LangGraph 主图结构.

    图结构:
        START → intent_node → planning_node → review_router
                                              ↻ planning_node (iteration_count < 5)
                                              → END (iteration_count ≥ 5)
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
        review_router,
        {"planning": "planning", END: END},
    )

    return graph.compile()
