# 智能旅行攻略助手 · 项目技术规格说明

> **定位**：面向真实用户的 AI 旅行攻略 Agent，结合 3D 地球探索 + 对话式规划的工作流，覆盖发现 → 攻略 → 规划 → 导出的完整链路。

---

## 1. 项目概览

### 1.1 背景与目标

用户在规划旅行时面临信息碎片化的问题：景点、交通、住宿、天气、预算需要在多个平台间切换查询，且难以整合成结构化行程。传统旅行助手仅有聊天界面，缺乏直观的地理探索入口。本项目构建一个**带 3D 地球交互的旅行攻略 Agent**，用户通过点击地球探索目的地 → Agent 自动获取攻略 → 用户确认后进入对话式行程规划，最终输出可导出的行程方案。

### 1.2 核心能力矩阵

| 能力域 | 具体实现 | 对应 JD 要求 |
|---|---|---|
| 3D 地球交互 | react-globe.gl 实现可点击地球 + 热力图 + 时区光照 | WebGL、Three.js |
| 意图理解 | 多轮对话 + Structured Output 提取旅行参数 | Prompt Engineering、结构化输出 |
| 工具调用 | 高德 MCP（天气/POI/路线）+ Tavily Search（攻略检索）+ Unsplash（景点图片）+ 汇率 | MCP 协议、Tool Calling、多模态 |
| 任务编排 | 基于 LangGraph 的有状态 Workflow | Agent、Workflow |
| 结果输出 | Markdown/PDF 行程单生成 | 文件处理 |
| 可观测性 | 全链路日志 + 成本/延迟统计 | 日志记录、测试集建设 |

---

## 2. 系统架构

```
┌──────────────────────────────────────────────────────────────┐
│                    React 前端（Port 3000）                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  入场页（Landing Page）                   │  │
│  │  全屏 Three.js 场景：旋转地球 + 粒子星光 + 标题 + "开始探索" │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │ 点击进入                         │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │               主界面（上下分屏 6:4）                     │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  上：3D 地球（react-globe.gl）                    │  │  │
│  │  │  - 拖拽旋转 / 滚轮缩放                            │  │  │
│  │  │  - 热度热力图（目的地点颜色深浅）                   │  │  │
│  │  │  - 时区明暗（跟随真实时间日/夜分界线）              │  │  │
│  │  │  - 点击国家/城市 → 选中效果 + 弹出天气信息           │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  下：对话面板                                    │  │  │
│  │  │  - Agent 展示攻略 / 用户输入反馈 / 导出规划       │  │  │
│  │  │  - 流式渲染（WebSocket 逐 token 推送）            │  │  │
│  │  │  - "生成旅行规划" 按钮 + 导出（Markdown/PDF）     │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │ WebSocket
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              FastAPI 后端（Port 8000）                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  LangGraph Agent                                       │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │ Intent   │→ │ Tool Dispatch│→ │ Planning/Output│  │  │
│  │  │ Node     │  │ Node         │  │ Node           │  │  │
│  │  └──────────┘  └──────────────┘  └────────────────┘  │  │
│  │         ↕ StateGraph (追问循环 + 反馈循环)              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌───────────┐  ┌─────────┐  │
│  │ 高德 MCP │  │ Tavily    │  │ Unsplash   │  │ LLM       │  │  汇率   │  │
│  │(天气/POI │  │(攻略检索)  │  │(景点图片)   │  │ Provider  │  │ 工具    │  │
│  │ /路线)   │  │           │  │            │  │ (可配置)  │  │         │  │
│  └──────────┘  └───────────┘  └────────────┘  └────────────┘  └─────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. 技术选型

### 3.1 前端

| 层级 | 技术 | 选型理由 |
|---|---|---|
| 框架 | React 18 + TypeScript | 组件化开发，Three.js 生态最佳适配 |
| 3D 引擎 | Three.js（通过 react-three-fiber + @react-three/drei） | WebGL 标准方案，支持复杂 3D 场景 |
| 地球组件 | react-globe.gl | 开箱即用的 3D 地球，支持热力图/弧线/标记 |
| 构建 | Vite | 快速 HMR，适合 Three.js 项目 |
| 样式 | Tailwind CSS + 自定义深色主题 | 快速搭建 UI，一致性高 |
| 通信 | WebSocket（前端原生 WebSocket API） | 流式推送到对话面板 |

### 3.2 后端

| 层级 | 技术 | 选型理由 |
|---|---|---|
| 语言 | Python 3.11 | 生态完整，与 AI 框架适配最佳 |
| Web 框架 | FastAPI | 原生 WebSocket 支持，异步性能好 |
| Agent 框架 | LangGraph | 支持有状态图、条件分支、人工中断 |
| LLM | 可配置（默认 GPT-4o，支持 Claude / 本地模型） | LLM Provider 抽象层，前端配置页面自由切换 |
| Embedding | text-embedding-3-small | 成本低、中文效果达标 |
| 数据验证 | Pydantic v2 | 强制 Schema 约束，防止 LLM 幻觉导致字段缺失 |
| MCP 服务 | 高德地图 MCP Server + Tavily MCP Server | 高德覆盖天气/POI/路线，Tavily 用于攻略检索 |
| 图片 | Unsplash API | 免费高清图库，按景点名搜索返回高质量旅游图片 |
| 外部 API | ExchangeRate-API（汇率） | 免费额度足够 Demo 使用 |
| 日志 | Structlog + JSONL | 结构化日志，便于后续分析 |
| 包管理 | uv / Poetry | 依赖锁定，环境可复现 |
| 容器化 | Docker + docker-compose | 一键启动 |

---

## 4. 核心模块详细设计

### 4.1 前端模块

#### 4.1.1 入场页（Landing Page）

**效果**：全屏沉浸式 3D 场景，黑色背景，类似 activetheory.net 风格。

**实现**：
- Three.js 场景覆盖全屏，Canvas 自动适配窗口大小
- 3D 地球（react-globe.gl）在场景中央缓慢自转，带经纬线 + 真实卫星贴图
- 粒子系统：500-800 个随机分布在空间中的粒子，大小/透明度随机，缓慢闪烁
- 标题文字 "智能旅行攻略助手"（中文）+ "AI-POWERED TRAVEL PLANNER"（英文），CSS 淡入动画
- "开始探索" 按钮，悬停时发光边框效果，点击后平滑过渡（fade out + 主界面 fade in）

**状态管理**：React state `showLanding` 控制入场页显隐，过渡完成后销毁 Three.js 场景释放资源。

#### 4.1.2 3D 地球组件

**能力**：

| 能力 | 实现方式 |
|---|---|
| 拖拽旋转 / 滚轮缩放 | react-globe.gl 内置 OrbitControls |
| 目的地热度热力图 | 根据城市热度数据生成 Hexbin 图层，颜色从蓝（冷）到红（热）渐变 |
| 时区明暗 | 根据当前 UTC 时间计算太阳方位，在地球上生成动态光照区域 |
| 点击区域 | Raycaster 检测点击，高亮选中区域，弹出信息卡片（城市名 + 实时天气） |

**数据流**：
```
用户点击地球 → 获取坐标 + 城市名 → 调用后端 /api/guide → Tavily 搜索攻略 → 返回前端展示
```

#### 4.1.3 对话面板

- 位于主界面下半部分（40% 高度），可拖拽调整分割比例
- 展示 Agent 输出的攻略内容（Markdown 渲染）
- 用户输入框 + "生成旅行规划" 按钮
- 点击"生成旅行规划" → 触发后端 LangGraph Agent，切换到规划模式
- 规划模式下展示行程草案，用户可输入反馈进行迭代
- 导出按钮（Markdown / PDF）

---

### 4.2 后端 API 设计

| 接口 | 方法 | 用途 | 通信方式 |
|---|---|---|---|
| `/api/guide` | POST | 用户点击地球某区域 → 返回该地攻略 | HTTP 请求-响应 |
| `/api/plan` | WebSocket | 全流程 Agent：意图提取 → MCP 调用 → 规划 → 反馈迭代 | 全双工流式 |
| `/api/llm-config` | GET/PUT | 获取/更新 LLM 配置 | HTTP REST |
| `/api/export` | POST | 导出行程（Markdown/PDF） | HTTP 文件下载 |

**`/api/plan` WebSocket 消息协议**：

```
客户端 → 服务端：
{ "type": "user_message", "content": "我想去京都玩3天" }
{ "type": "user_feedback",  "content": "第三天太赶了" }
{ "type": "generate_plan",  "content": "" }           // 点击"生成规划"按钮

服务端 → 客户端：
{ "type": "agent_message",  "content": "好的，我来查一下京都的攻略..." }  // 流式逐 token
{ "type": "tool_call",      "tool": "amap_weather", "status": "start" }
{ "type": "tool_result",    "tool": "amap_weather", "status": "ok", "latency_ms": 320 }
{ "type": "itinerary",      "content": "# 京都3日行程\n...", "images": {"嵐山竹林": ["https://..."], "清水寺": ["https://..."]} }  // 完整行程 + 景点图片
{ "type": "error",          "message": "天气接口超时", "level": "warning" }
```

---

### 4.3 Intent Extraction Node — 意图提取节点

**职责**：从用户自由文本中提取结构化旅行参数，不足时发起追问。

**Pydantic Schema 定义**：

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class TravelIntent(BaseModel):
    destination: str = Field(..., description="目的地城市，标准化为中文全称")
    departure_city: Optional[str] = Field(None, description="出发城市")
    start_date: Optional[date] = Field(None, description="出发日期 YYYY-MM-DD")
    end_date: Optional[date] = Field(None, description="返回日期 YYYY-MM-DD")
    num_travelers: int = Field(default=1, ge=1, le=20)
    budget_cny: Optional[float] = Field(None, description="总预算（人民币）")
    interests: list[str] = Field(
        default_factory=list,
        description="兴趣偏好，如 ['历史文化', '美食', '自然风光']"
    )
    special_requirements: Optional[str] = Field(None, description="特殊需求")
    missing_fields: list[str] = Field(
        default_factory=list,
        description="尚未获取、需追问的字段名列表"
    )
```

**Prompt 设计要点**：
- System Prompt 明确要求输出合法 JSON，且仅输出 JSON
- 使用 Few-shot 示例覆盖「含糊输入」→「标准化输出」的转换
- `missing_fields` 非空时，节点自动生成追问话术后等待用户输入

**兜底策略**：JSON 解析失败时进入 Retry 分支，最多重试 2 次；第 3 次失败降级为纯文本模式返回错误提示。

---

### 4.4 Tool Layer — 工具层

工具分为两类调用路径：

**路径 A：直接 HTTP 调用（点击地球 → 攻略查询）**
- Tavily Search 通过 `/api/guide` 接口直接调用，不走 LangGraph，轻量快速

**路径 B：LangGraph Agent 内注册（规划工作流）**
- 高德 MCP、Unsplash、汇率工具注册到 LangGraph Agent 中，通过 Function Calling 调度

#### 高德地图 MCP Server（天气 / POI / 路线）

| MCP 工具 | 对应能力 | 输入要点 |
|---|---|---|
| `amap_weather` | 实时天气 + 4 日预报 | 城市名（中文） |
| `amap_poi_search` | 关键词搜索 POI | keywords + city |
| `amap_poi_around` | 周边搜索 | keywords + location + radius |
| `amap_poi_detail` | POI 详情（评分/营业时间/图片） | poi_id |
| `amap_direction_driving` | 驾车路线规划 | origin/destination 经纬度 |
| `amap_direction_transit` | 公交/地铁路线 | origin/destination + city |
| `amap_direction_walking` | 步行路线 | origin/destination 经纬度 |
| `amap_direction_bicycling` | 骑行路线 | origin/destination 经纬度 |

#### Tavily Search（攻略检索）

当用户点击地球某区域时调用，通过 Tavily 搜索该地的旅行攻略信息。

| 工具 | 对应能力 | 输入要点 |
|---|---|---|
| `tavily_search` | 检索目的地攻略、景点介绍、旅行贴士 | query + include_domains |

#### 汇率换算

```python
@tool
def convert_currency(amount: float, from_currency: str, to_currency: str) -> dict:
    """实时汇率换算，支持预算本地化显示。"""
```

#### 景点图片检索（Unsplash）

```python
@tool
def search_poi_images(query: str, top_k: int = 3) -> list[dict]:
    """
    通过 Unsplash API 搜索景点图片。
    Args:
        query: 景点名称（如 "京都 清水寺"）
        top_k: 返回图片数量
    Returns:
        包含 photo_url, photographer, alt_description 的列表
    """
```

**调用时机**：Planning Node 生成完整行程后，由 `image_enrich_node` 提取行程中所有景点名称，**并发调用** `search_poi_images` 为每个景点获取图片，将图片 URL 注入行程数据结构中。

---

### 4.5 Planning Node — 行程规划节点

**职责**：整合工具输出，生成每日行程方案，支持用户反馈迭代。

**Workflow 状态定义（LangGraph）**：

```python
from typing import TypedDict, Annotated
import operator

class TravelState(TypedDict):
    messages: Annotated[list, operator.add]   # 对话历史（含用户反馈）
    intent: TravelIntent                        # 结构化意图
    tool_results: dict                          # 工具调用结果缓存
    itinerary: Optional[str]                   # 生成的行程方案
    user_feedback: Optional[str]               # 用户对行程的修改意见
    poi_images: dict                            # { "景点名": [图片URL, ...] } 图片缓存
    iteration_count: int                       # 防死循环计数（上限 5 次）
    error_log: list[dict]                      # 错误记录
```

**节点流转逻辑**：

```
                         ┌──────────────────────────┐
                         │  用户反馈："第三天太赶了"   │
                         └──────────┬───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │          review_node          │
                    │ 判断：反馈 → 回planning重新编排 │
                    │      批准 → 输出给用户，END    │
                    └───────────────┬───────────────┘
                                    │
         ┌──────────────┐          │
         │ clarify_node │ ← missing│
         └──────┬───────┘   ┌─────┘
                │           │
    START → intent_node ────┘
                   │ 意图完整
                   ▼
          tool_dispatch_node
                   │ (并行调用高德 MCP 天气/POI/路线 + 汇率)
                   ▼
             planning_node ←────────── 用户反馈后重新编排
                   │
          image_enrich_node
                   │ (提取景点名 → 并发 Unsplash 搜图 → 注入 poi_images)
                   ▼
             output_node → review_node → [反馈?] → planning_node
                                       → [批准] → END
```

**两处循环，LangGraph 的核心价值**：
1. **意图追问循环**：intent_node → [字段缺失] → clarify_node → intent_node，确保参数完整后才调度工具
2. **行程反馈循环**：output_node → review_node → [用户反馈] → planning_node → output_node，支持多轮迭代修改。每次迭代 `iteration_count` +1，超过 5 次强制输出

**并行工具调用**：使用 `asyncio.gather` 并发执行独立工具（高德 MCP 天气/POI/路线 + 汇率），减少等待时间。

---

### 4.6 Output Handler — 输出模块

支持三种输出格式：

**格式一：Markdown 行程单（内嵌景点图片）**
```markdown
# 京都 5 日行程 | 2 人 | 预算 ¥8,000

## 第 1 天：抵达 + 岚山漫游
- **09:00** 抵达京都站，办理入住
- **11:00** 嵐山竹林 | 步行 15 分钟 | 门票免费
  ![嵐山竹林](https://images.unsplash.com/photo-...)
- **14:00** 天龙寺 | 门票 ¥600
  ![天龙寺](https://images.unsplash.com/photo-...)
```

**格式二：结构化 JSON（含图片字段）**
```json
{
  "destination": "京都",
  "days": [
    {
      "day": 1,
      "activities": [
        {
          "time": "11:00",
          "poi": "嵐山竹林",
          "image": "https://images.unsplash.com/photo-...",
          "note": "建议工作日上午前往，人流较少"
        }
      ]
    }
  ]
}
```

**格式三：PDF 导出**（调用 `weasyprint` 将 Markdown 渲染为 PDF，图片同步嵌入）

---

### 4.7 LLM Provider Configuration — LLM 配置模块

**职责**：提供统一的 LLM 调用抽象层，用户通过前端配置页面自由选择要使用的 LLM Provider 和模型，无需修改后端代码。

**设计要点**：
- 定义 `LLMProvider` 抽象基类，声明 `chat(messages, tools) → str` 统一接口
- 内置 OpenAI（GPT-4o / GPT-4o-mini）和 Anthropic（Claude 3.5 Sonnet）两种实现
- 预留本地模型扩展接口（Ollama / vLLM），接入时只需新增 Provider 子类
- Provider 实现可插拔，通过配置文件或环境变量决定当前激活的 Provider

**前端配置页面**：
- 在主界面增加「设置」入口
- 提供 Provider 下拉选择框（OpenAI / Claude / 本地模型）
- 对应 API Key / Base URL / 模型名称输入框
- Temperature、Max Tokens 等常用参数滑块
- 配置保存后立即生效，无需重启服务

**配置存储**：
```python
from pydantic import BaseModel
from typing import Optional

class LLMConfig(BaseModel):
    provider: str = "openai"                  # openai / anthropic / local
    model: str = "gpt-4o"
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 4096
```

配置文件写入 `config/llm_config.json`，支持热加载。

---

### 4.8 可观测性 & 调试

#### 日志输出

每次请求输出结构化日志到 `logs/requests.jsonl`，同时终端实时打印摘要：

```python
{
    "request_id": "a1b2c3d4",
    "timestamp": "2026-06-27T10:30:00",
    "destination": "京都",
    "mcp_calls": [
        {"tool": "amap_weather", "args": {"city": "京都"}, "latency_ms": 320, "success": true},
        {"tool": "amap_poi_search", "args": {"keywords": "京都景点", "city": "京都"}, "latency_ms": 450, "success": true}
    ],
    "llm_tokens": {"prompt": 1200, "completion": 800, "provider": "gpt-4o"},
    "latency_ms": {"intent": 850, "tools": 1200, "planning": 2100, "total": 4150},
    "cost_usd": 0.012,
    "error": null
}
```

#### MCP 工具调试

| 日志位置 | 内容 | 查看方式 |
|---|---|---|
| `logs/requests.jsonl` | 每请求全链路摘要 | `tail -f logs/requests.jsonl` |
| `logs/mcp/{tool_name}.jsonl` | 每个 MCP 工具的入参/返回值明细 | 按工具名拆分 |
| `logs/states/*.json` | LangGraph 节点间状态快照（含 feedback 轮次） | 调试死循环或字段丢失 |
| 终端 stdout | 实时进度摘要 | 直接看命令行 |

#### 降级策略

- 高德 MCP 超时 → 日志记录 `mcp_timeout`，不阻断流程，该工具返回值标记 `"unavailable"`
- LLM JSON 解析失败 → 自动重试 2 次，日志记录 `parse_retry_count`
- Tavily Search 无结果 → 降级提示"暂未收录该地攻略"，不阻塞规划流程
- 任意阶段抛异常 → 日志写入 `error` 字段含完整 traceback，用户端返回友好提示

#### 测试集验证

构建 50 条测试 Case，覆盖：
- **正常路径**：完整参数输入 → 验证行程结构完整性
- **边界场景**：极短行程（1 天）、超大团（15 人）、小众目的地
- **兜底验证**：工具 API 超时 → 验证降级逻辑
- **多轮追问**：故意省略日期/预算 → 验证追问流程正确收敛
- **反馈迭代**：用户对行程提出"时间太紧"→ 验证规划节点重新编排不超过 5 轮

---

## 5. 项目结构

```
smart-travel-guide/
├── README.md
├── docker-compose.yml
│
├── frontend/                         # React 前端
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx                  # React 入口
│       ├── App.tsx                   # 路由：入场页 ↔ 主界面
│       ├── pages/
│       │   ├── Landing.tsx           # 入场页 3D 场景
│       │   └── Main.tsx              # 主界面（地球 + 对话分屏）
│       ├── components/
│       │   ├── Globe.tsx             # 3D 地球组件（react-globe.gl）
│       │   ├── GlobeHeatmap.tsx      # 热度热力图图层
│       │   ├── GlobeDaylight.tsx     # 时区明暗光照
│       │   ├── ChatPanel.tsx         # 对话面板
│       │   ├── SettingsPanel.tsx     # LLM 配置页面
│       │   └── ItineraryCard.tsx     # 行程卡片
│       ├── hooks/
│       │   └── useWebSocket.ts       # WebSocket 连接管理
│       ├── services/
│       │   └── api.ts                # HTTP + WebSocket 通信
│       └── styles/
│           └── globals.css           # Tailwind + 自定义样式
│
├── backend/                            # FastAPI 后端
│   ├── pyproject.toml
│   ├── .env.example
│   └── src/
│       ├── main.py                   # FastAPI 入口 + WebSocket 路由
│       ├── agent/
│       │   ├── graph.py              # LangGraph 主图定义
│       │   ├── nodes/
│       │   │   ├── intent.py         # 意图提取节点
│       │   │   ├── planning.py       # 行程规划节点（含反馈重编排）
│       │   │   ├── image_enrich.py   # 景点图片丰富节点
│       │   │   ├── review.py         # 反馈判断节点
│       │   │   └── output.py         # 输出节点
│       │   └── state.py              # TravelState 定义
│       ├── llm/
│       │   ├── base.py               # LLMProvider 抽象基类
│       │   ├── openai_provider.py    # OpenAI 实现
│       │   ├── anthropic_provider.py # Anthropic 实现
│       │   └── factory.py            # Provider 工厂 + 热加载
│       ├── tools/
│       │   ├── amap_mcp.py           # 高德 MCP 客户端适配层
│       │   ├── tavily_search.py        # Tavily Search 适配层
│       │   ├── unsplash_images.py      # Unsplash 景点图片检索
│       │   └── currency.py           # 汇率工具
│       ├── schemas/
│       │   └── travel.py             # Pydantic 模型
│       ├── output/
│       │   ├── markdown.py
│       │   └── pdf.py
│       └── observability/
│           ├── logger.py             # Structlog 配置
│           └── metrics.py            # 成本/延迟统计
│
├── config/
│   ├── llm_config.json               # LLM Provider 配置文件
│   └── destination_heatmap.json      # 目的地热度数据（供前端热力图）
│
└── tests/
    ├── test_cases.jsonl               # 50 条测试 Case
    ├── test_intent.py
    ├── test_tools.py
    └── eval_pipeline.py               # 批量评估脚本
```

---

## 6. 开发里程碑

| 阶段 | 时间 | 交付物 |
|---|---|---|
| **M1**：前端骨架 | 第 1 周 | React + Vite 项目搭建，入场页 3D 场景，3D 地球可旋转 |
| **M2**：后端骨架 | 第 2 周 | FastAPI + LangGraph 图搭通，高德 MCP 工具调用验证通过 |
| **M3**：前后端联调 | 第 3 周 | WebSocket 通信打通，点击地球 → 获取攻略 → 对话展示 |
| **M4**：规划工作流 | 第 4 周 | 完整 Agent 工作流（意图 → 工具 → 规划 → 反馈），测试 Case 通过 |
| **M5**：产品化 | 第 5 周 | LLM 配置页面 + 导出功能 + Docker 化，README 完整 |

---

## 7. 简历提炼要点

**架构一句话**：React + Three.js 3D 地球前端，Python FastAPI + LangGraph Agent 后端，通过 WebSocket 实时通信，实现从地理探索到行程规划的完整链路。

**可量化成果（待填入实测值）**：
- 意图提取准确率 **XX%**（50 条测试集）
- 端到端延迟 P95 **X.Xs**（并行工具调用优化后）
- 单次请求平均成本 **$0.0XX**
- 工具调用成功率 **XX%**（含超时兜底逻辑）

**技术亮点**：
1. **高德 MCP 集成**，通过 MCP 协议将天气/POI/路线 8 个工具注册到 LangGraph Agent，无需手写 REST 调用
2. **3D 地球交互**，react-globe.gl 实现可点击地球 + 热度热力图 + 时区光照
3. **Unsplash 景点图片增强**，行程中每个景点自动配图，输出可视化行程单
4. **Pydantic Schema 强约束** + JSON Retry 兜底，解决 LLM 输出不稳定问题
5. **异步并行工具调用**，相比串行减少约 40% 等待时间
6. **结构化可观测日志**，每次请求记录 Token 消耗、耗时分布、失败原因

---

## 8. 环境配置

```bash
# 后端
cd backend
cp .env.example .env
# 填入 LLM_API_KEY / AMAP_KEY（高德 MCP） / TAVILY_API_KEY / UNSPLASH_API_KEY / EXCHANGE_API_KEY
pip install -e .
uvicorn src.main:app --reload --port 8000

# 前端
cd frontend
npm install
npm run dev

# Docker 一键启动
docker-compose up -d
```

---

*最后更新：2026-06-28 | 版本：v2.0*
