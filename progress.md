# Session Progress Log

## Current State

**Last Updated:** 2026-06-29
**Active Feature:** feat-003 (后端骨架)
**Status:** ✅ COMPLETED

---

## Session: 2026-06-29 — feat-003 后端骨架搭建

### 目标
搭建 FastAPI + LangGraph 后端骨架，定义 TravelState（LangGraph StateGraph），搭通意图提取节点和行程规划节点的基本图结构。

### 完成的工作

#### 1. 项目结构
- [x] `backend/pyproject.toml` — 项目元数据 + 依赖（fastapi, langgraph, pydantic, uvicorn 等）
- [x] `backend/.env.example` — 环境变量模板（LLM_API_KEY, AMAP_KEY, TAVILY_API_KEY 等）
- [x] `backend/src/__init__.py`, `backend/src/agent/__init__.py`, `backend/src/schemas/__init__.py` — 包初始化

#### 2. 数据模型
- [x] `backend/src/schemas/travel.py` — TravelIntent（Pydantic v2）+ Itinerary + ItineraryItem
  - TravelIntent: destination, start_date, end_date, budget, num_travelers, preferences, summary
  - BudgetLevel 枚举: budget / moderate / luxury

#### 3. LangGraph State
- [x] `backend/src/agent/state.py` — TravelState（TypedDict）
  - user_input, destination, intent, itinerary, user_feedback, iteration_count, messages, tool_calls, error

#### 4. LangGraph 主图
- [x] `backend/src/agent/graph.py` — StateGraph 构建
  - 图结构: START → intent_node → planning_node → review_node → END / 循环
  - intent_node: 意图提取（占位实现，待集成 LLM）
  - planning_node: 行程规划（占位实现）
  - review_node: 反馈判断，iteration_count ≥ 5 时结束循环

#### 5. FastAPI 入口
- [x] `backend/src/main.py` — FastAPI 入口 + CORS + 路由
  - `GET /api/health` — 健康检查
  - `POST /api/guide` — 轻量级攻略查询
  - `WS /api/plan` — WebSocket 行程规划（全双工流式）
  - CORS 允许 localhost:3000 和 5173

### 验证
- [x] `python verify.py --feature feat-003` → 11/11 criteria passed
- [x] `lint_check.sh` → PASS（Python 语法 + TS 类型检查）
- [x] `done_check.sh` → 文档同步更新中

### 证据
- `backend/pyproject.toml:1-30` — 项目依赖配置
- `backend/src/schemas/travel.py:1-70` — TravelIntent Pydantic 模型
- `backend/src/agent/state.py:1-25` — TravelState TypedDict
- `backend/src/agent/graph.py:1-60` — LangGraph StateGraph 主图
- `backend/src/main.py:1-85` — FastAPI 入口

---

## 下一步计划

- [ ] feat-004: 高德 MCP 工具集成验证
- [ ] feat-005: 前后端联调 — WebSocket 通信打通
- [ ] feat-006: 完整 Agent 工作流

---

## Session: 2026-06-29 — 修复 Vite HMR 与 react-leaflet 冲突

### 问题
用户反馈 localhost:3000 黑屏，控制台错误：
- `Uncaught TypeError: render2 is not a function`
- `Context.Consumer` 警告
- `#root` 元素为空，整个 React 应用崩溃
- 生产构建（端口 3001）正常

### 根本原因
Vite 的 Fast Refresh (HMR) 与 react-leaflet 4.2.1 有兼容性冲突

### 解决方案
#### 1. 禁用 Vite Fast Refresh
- `frontend/vite.config.ts:6-9` — 在 react 插件中设置 `fastRefresh: false`

#### 2. 添加 ErrorBoundary
- `frontend/src/components/ErrorBoundary.tsx:1-63` — 新增错误边界组件
- `frontend/src/pages/MainApp.tsx:7,63-78` — 用 ErrorBoundary 包裹 Map 组件

#### 3. 修复 Map 组件
- `frontend/src/components/Map.tsx:20-28` — 简化 ClickHandler，移除未使用的 map 变量
- `frontend/src/components/Map.tsx:50` — 条件渲染 ClickHandler

#### 4. 清理残留文件
- 删除旧的 3D 组件：`CustomCursor.tsx`, `GlobeHeatmap.tsx`, `GlobeDaylight.tsx`
- 删除 `types/react-globe.gl.d.ts`

### 验证
- [x] 开发服务器 localhost:3000 正常渲染
- [x] 地图、TopNav、ChatPanel 全部显示
- [x] 左右分屏布局正常（60/40）
- [x] TypeScript 类型检查通过
- [x] 已推送到远端 GitHub

### 证据
- `frontend/vite.config.ts:6-9` — Fast Refresh 配置
- `frontend/src/components/ErrorBoundary.tsx:1-63` — 错误边界实现
- `frontend/src/pages/MainApp.tsx:63-78` — Map 组件包裹
- `app-final-working.png` — 最终正常渲染截图

---

## Session: 2026-06-29 — 布局优化（左右分屏）

### 问题
用户反馈原浮动布局不合理：
- ChatPanel 只有 380px 太小
- 需要手动展开才能使用
- 地图和对话无法同时查看

### 解决方案
改为左右分屏布局（60% 地图 + 40% ChatPanel）

#### 变更文件
- [x] MainApp.tsx 布局重构
  - `frontend/src/pages/MainApp.tsx:1-84` — 从浮动层改为 flex 左右分屏
  - 左侧 60%: 地图容器（w-[60%]）
  - 右侧 40%: ChatPanel（w-[40%], border-l）
- [x] ChatPanel 简化
  - `frontend/src/components/ChatPanel.tsx:1-120` — 移除折叠/展开逻辑
  - 改为固定全高面板（h-full）
  - 移除 Framer Motion 动画和状态管理

### 布局优势
1. 地图和对话同时可见，无需切换
2. ChatPanel 有足够空间（40% 屏幕宽度）
3. 60/40 黄金比例，视觉平衡
4. 更符合用户实际使用习惯

### 证据
- `frontend/src/pages/MainApp.tsx:49-73` — flex 分屏布局实现
- `frontend/src/components/ChatPanel.tsx:23-120` — 固定全高面板

---

## Session: 2026-06-29 — 前端架构决策：3D → 2D

### 背景
用户明确要求放弃 3D 地球方案（Three.js/react-globe.gl），改为 2D 地图前端。

### 架构决策
- ❌ **废弃方案**：Three.js + react-globe.gl 3D 地球交互
  - 理由：性能问题、移动端兼容性差、开发复杂度高
- ✅ **新方案**：Leaflet 2D 地图 + OpenStreetMap
  - 理由：成熟稳定、移动端友好、开发效率高、社区支持好

### 完成的工作

#### 1. 架构重构
- [x] 移除所有 Three.js 依赖
  - `frontend/package.json` — 删除 three, @react-three/fiber, @react-three/drei, react-globe.gl
  - 删除 `frontend/src/components/Globe.tsx`
  - 删除 `frontend/src/scenes/` 目录
- [x] 安装 Leaflet 2D 地图库
  - `frontend/package.json` — 添加 leaflet@1.9.4, react-leaflet@4.2.1, @types/leaflet

#### 2. 核心组件实现
- [x] **Map.tsx** — Leaflet 2D 地图
  - `frontend/src/components/Map.tsx:1-56` — MapContainer + TileLayer + ClickHandler
  - OpenStreetMap 瓦片图层
  - 点击地图触发回调
- [x] **MainApp.tsx** — 主应用页面
  - `frontend/src/pages/MainApp.tsx` — 左右分屏布局（地图 60% + ChatPanel 40%）
  - TopNavBar + LocationInfoCard 层级管理
- [x] **TopNavBar.tsx** — 顶部导航栏
  - `frontend/src/components/TopNavBar.tsx` — Fixed top, glass morphism 背景
  - 品牌标识 + 搜索框 + 设置图标
- [x] **ChatPanel.tsx** — 对话面板
  - `frontend/src/components/ChatPanel.tsx` — 右侧固定面板，消息列表 + 输入框
- [x] **LocationInfoCard.tsx** — 地图点击卡片
  - `frontend/src/components/LocationInfoCard.tsx` — 浮动卡片，显示位置信息

#### 3. 路由系统
- [x] 设置 BrowserRouter 路由
  - `frontend/src/App.tsx` — BrowserRouter + Routes，定义 `/`, `/app` 路由

### 验证
- [x] TypeScript 类型检查通过
- [x] 构建验证通过（npm run build）
- [x] 运行时验证（localhost:3000 正常渲染）

### 证据
- `frontend/src/App.tsx:1-20` — BrowserRouter 路由系统
- `frontend/src/pages/MainApp.tsx:1-98` — 主应用页面
- `frontend/src/components/Map.tsx:1-56` — Leaflet 2D 地图
- `frontend/package.json` — Leaflet 依赖已安装，Three.js 依赖已移除

---

## 下一步计划

- [ ] 实现 WebSocket 通信（feat-005）
- [ ] 集成后端 LangGraph Agent API
- [ ] 地理编码服务（目的地搜索 → 地图定位）
- [ ] 反向地理编码（地图点击 → 地点名称）
