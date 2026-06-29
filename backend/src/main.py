"""FastAPI 入口 — 智能旅行攻略助手后端."""

from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from src.agent.graph import build_graph

load_dotenv()

travel_graph = build_graph()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理."""
    print("🚀 智能旅行攻略助手后端启动")
    yield
    print("👋 服务关闭")


app = FastAPI(
    title="智能旅行攻略助手",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """健康检查."""
    return {"status": "ok", "service": "travel-agent-backend"}


@app.post("/api/guide")
async def guide(request: dict):
    """轻量级攻略查询（同步 HTTP，后续连接 Tavily 搜索）."""
    destination = request.get("destination", "")
    return {
        "destination": destination,
        "message": f"攻略查询功能待实现，目的地：{destination}",
    }


@app.websocket("/api/plan")
async def plan_websocket(websocket: WebSocket):
    """行程规划 WebSocket — 全双工流式通信."""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            destination = data.get("destination", "")
            message = data.get("message", "")

            initial_state = {
                "user_input": message or f"我想去{destination}旅行",
                "destination": destination,
                "iteration_count": 0,
                "messages": [],
                "tool_calls": [],
            }

            await websocket.send_json({
                "type": "agent_message",
                "content": f"正在为您规划 {destination} 的行程...",
            })

            result = await travel_graph.ainvoke(initial_state)

            await websocket.send_json({
                "type": "itinerary",
                "content": result.get("itinerary"),
            })

            await websocket.send_json({
                "type": "agent_message",
                "content": "行程规划完成！如需调整请告诉我。",
            })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({
                "type": "error",
                "content": str(e),
            })
        except Exception:
            pass
