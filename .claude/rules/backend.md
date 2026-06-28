# Backend Rules — 智能旅行攻略助手

## 项目结构

```
backend/src/
├── main.py               # FastAPI 入口 + WebSocket 路由
├── agent/
│   ├── graph.py          # LangGraph 主图定义
│   ├── nodes/
│   │   ├── intent.py     # 意图提取节点
│   │   ├── planning.py   # 行程规划节点（含反馈重编排）
│   │   ├── image_enrich.py # 景点图片丰富节点
│   │   ├── review.py     # 反馈判断节点
│   │   └── output.py     # 输出节点
│   └── state.py          # TravelState 定义
├── llm/
│   ├── base.py           # LLMProvider 抽象基类
│   ├── openai_provider.py # OpenAI 实现
│   ├── anthropic_provider.py # Anthropic 实现
│   └── factory.py        # Provider 工厂 + 热加载
├── tools/
│   ├── amap_mcp.py       # 高德 MCP 客户端适配层
│   ├── tavily_search.py  # Tavily Search 适配层
│   ├── unsplash_images.py # Unsplash 景点图片检索
│   └── currency.py       # 汇率工具
├── schemas/
│   └── travel.py         # Pydantic 模型
├── output/
│   ├── markdown.py       # Markdown 行程单生成
│   └── pdf.py            # PDF 导出
└── observability/
    ├── logger.py         # Structlog 配置
    └── metrics.py        # 成本/延迟统计
```

## API 规范

- REST 接口：`/api/guide` (POST), `/api/llm-config` (GET/PUT), `/api/export` (POST)
- WebSocket：`/api/plan` 全双工流式通信
- 所有 API 响应使用 Pydantic model 序列化
- 错误码：HTTP 4xx 客户端错误，5xx 服务端错误

## LangGraph 节点约定

- 每个节点是独立函数，接收 `TravelState` 返回 `dict`（部分更新）
- 节点间状态传递通过 `TravelState` TypedDict
- 循环逻辑通过条件边（ConditionalEdge）实现
- `iteration_count` 防死循环，上限 5 次

## 工具层规范

- 所有工具使用 `@tool` 装饰器注册
- 工具函数签名：`(args: dict) -> dict`
- 外部 API 调用必须设置超时（默认 10s）
- 超时/失败时返回 `{"error": "...", "unavailable": true}` 不抛异常
- 独立工具使用 `asyncio.gather` 并发执行

## LLM Provider 规范

- 继承 `LLMProvider` 基类，实现 `chat(messages, tools) -> str`
- 配置从 `config/llm_config.json` 热加载
- JSON 输出解析失败时自动重试 2 次
- 第 3 次失败降级为纯文本模式

## 日志规范

- 使用 structlog 输出 JSONL 结构化日志
- 每请求一条记录到 `logs/requests.jsonl`
- 记录：request_id, timestamp, destination, mcp_calls, llm_tokens, latency_ms, cost_usd, error
- MCP 工具日志单独写入 `logs/mcp/{tool_name}.jsonl`

## 环境变量

必需环境变量（见 `.env.example`）：
- `LLM_API_KEY` — LLM Provider API Key
- `AMAP_KEY` — 高德地图 API Key
- `TAVILY_API_KEY` — Tavily Search API Key
- `UNSPLASH_API_KEY` — Unsplash API Key
- `EXCHANGE_API_KEY` — ExchangeRate-API Key
