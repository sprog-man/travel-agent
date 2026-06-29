"""Pydantic 模型 — 旅行意图与行程数据结构."""

from datetime import date
from enum import Enum

from pydantic import BaseModel, Field


class BudgetLevel(str, Enum):
    """预算水平枚举."""

    BUDGET = "budget"
    MODERATE = "moderate"
    LUXURY = "luxury"


class TravelIntent(BaseModel):
    """用户旅行意图 — 从自然语言中提取的结构化信息."""

    destination: str = Field(description="目的地城市/国家")
    start_date: date | None = Field(default=None, description="出发日期")
    end_date: date | None = Field(default=None, description="返回日期")
    budget: BudgetLevel | None = Field(default=None, description="预算水平")
    num_travelers: int = Field(default=1, ge=1, description="出行人数")
    preferences: list[str] = Field(default_factory=list, description="偏好标签列表")
    summary: str = Field(default="", description="用户原始意图摘要")


class ItineraryItem(BaseModel):
    """行程条目 — 单日或单景点."""

    day: int = Field(ge=1, description="第几天")
    title: str = Field(description="标题")
    description: str = Field(default="", description="详细描述")
    location: str = Field(default="", description="地点")
    duration_hours: float = Field(default=1.0, ge=0, description="预计时长（小时）")
    image_url: str | None = Field(default=None, description="景点配图 URL")


class Itinerary(BaseModel):
    """完整行程方案."""

    destination: str
    start_date: date | None = None
    end_date: date | None = None
    items: list[ItineraryItem] = Field(default_factory=list)
    summary: str = Field(default="", description="行程概要")
    total_cost_estimate: str | None = Field(default=None, description="预估总花费")


class TravelPlanRequest(BaseModel):
    """WebSocket 行程规划请求体."""

    destination: str
    message: str = ""
    preferences: list[str] = Field(default_factory=list)
