"""FastAPI 入口 — 智能旅行攻略助手后端."""

import asyncio
import os
from contextlib import asynccontextmanager

import structlog
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from src.schemas.travel import TravelPlanRequest

load_dotenv()

logger = structlog.get_logger()

# 并发保护：限制同时执行的 Agent 图数量
_graph_semaphore = asyncio.Semaphore(5)


def _validate_api_keys():
    """启动时校验必要的 API Key 是否已配置."""
    required_keys = ["AMAP_KEY"]
    optional_keys = ["TAVILY_API_KEY", "UNSPLASH_API_KEY", "EXCHANGE_API_KEY"]
    for key in required_keys:
        if not os.environ.get(key):
            logger.warning("missing_required_api_key", key=key)
    for key in optional_keys:
        if not os.environ.get(key):
            logger.info("optional_api_key_not_set", key=key)


def _validate_cors():
    """启动时校验 CORS 配置，防止生产环境误配."""
    origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
    if "*" in origins:
        logger.warning("cors_wildcard_detected", origins=origins,
                       message="CORS_ORIGINS contains '*' — 不允许在生产环境使用")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理 — 延迟初始化图."""
    _validate_api_keys()
    _validate_cors()

    from src.agent.graph import build_graph
    app.state.travel_graph = build_graph()
    logger.info("graph_initialized")
    yield
    logger.info("backend_stopped")


app = FastAPI(
    title="智能旅行攻略助手",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """健康检查."""
    return {"status": "ok", "service": "travel-agent-backend"}


@app.post("/api/guide")
async def guide(request: TravelPlanRequest):
    """轻量级攻略查询（后续接入 Tavily 搜索）."""
    return {
        "destination": request.destination,
        "message": f"攻略查询功能待实现，目的地：{request.destination}",
    }


@app.websocket("/api/plan")
async def plan_websocket(websocket: WebSocket):
    """行程规划 WebSocket — 全双工流式通信."""
    # TODO: 添加 API Key 认证（生产部署前必须实现）
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()

            try:
                req = TravelPlanRequest(**data)
            except ValidationError as e:
                await websocket.send_json({
                    "type": "error",
                    "content": f"参数错误: {e.error_count()} 个字段校验失败",
                })
                continue

            if _graph_semaphore.locked():
                await websocket.send_json({
                    "type": "error",
                    "content": "服务器繁忙，请稍后重试",
                })
                continue

            initial_state = {
                "user_input": req.message or f"我想去{req.destination}旅行",
                "destination": req.destination,
                "iteration_count": 0,
                "messages": [],
                "tool_calls": [],
            }

            await websocket.send_json({
                "type": "agent_message",
                "content": f"正在为您规划 {req.destination} 的行程...",
            })

            async with _graph_semaphore:
                result = await app.state.travel_graph.ainvoke(initial_state)

            itinerary = result.get("itinerary")
            await websocket.send_json({
                "type": "itinerary",
                "content": itinerary.model_dump() if itinerary else None,
            })

            await websocket.send_json({
                "type": "agent_message",
                "content": "行程规划完成！如需调整请告诉我。",
            })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error("plan_websocket_error", error=str(e))
        try:
            await websocket.send_json({
                "type": "error",
                "content": "行程规划服务暂时不可用，请稍后重试",
            })
        except WebSocketDisconnect:
            pass
        except Exception as inner_e:
            logger.error("failed_to_send_error", inner_error=str(inner_e))
