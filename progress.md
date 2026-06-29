# Session Progress Log

## Current State

**Last Updated:** 2026-06-29
**Active Feature:** feat-005 Code Review 修复
**Status:** ✅ COMPLETED

---

## Session: 2026-06-29 — feat-005 前后端联调 WebSocket 通信

### 目标
将前端 useWebSocket hook 接入 ChatPanel，地图点击触发 WebSocket 连接和行程规划。

### 完成的工作

#### 1. ChatPanel WebSocket 接入
- `frontend/src/components/ChatPanel.tsx` — 接收 messages/sendMessage/connectionStatus props
- 显示用户消息、Agent 消息、工具调用状态、行程卡片
- 连接状态指示器（connected/connecting/reconnecting/disconnected）
- 消息自动滚动到底部

#### 2. MainApp 联调
- `frontend/src/pages/MainApp.tsx` — 使用 useWebSocket hook
- 地图点击自动发送规划请求到 /api/plan WebSocket
- 从 Landing 传来目的地时自动触发规划

### 验证
- [x] verify.py --feature feat-005 → 7/7 criteria passed
- [x] TypeScript 类型检查通过
- [x] lint_check.sh → PASS

---

## 下一步计划

### 问题
Code Reviewer 发现 feat-003 + feat-004 后端代码存在 4 个 Critical 和 7 个 Major 问题。

### 修复内容

#### Critical 修复
1. **死循环** — `graph.py:33` planning_node 现在每次执行递增 `iteration_count`
2. **命名误导** — `graph.py:42` `review_node` → `review_router`，明确是路由函数
3. **import 时崩溃** — `main.py:22` `build_graph()` 移到 lifespan 延迟初始化
4. **并发保护** — `main.py:18` 添加 `asyncio.Semaphore(5)` 限制并发

#### Major 修复
1. **API Key 延迟读取** — 4 个工具模块改为函数内 `os.environ.get()` 读取
2. **AMAP_KEY 空值校验** — `amap_mcp.py:17` `_amap_request` 增加空值检查
3. **错误信息不泄露** — `main.py:95` 返回通用错误消息，异常仅写日志
4. **structlog 替代 print** — `main.py:23` 使用 `logger.info()`
5. **CORS 可配置** — `main.py:31` 从环境变量 `CORS_ORIGINS` 读取
6. **TOOL_REGISTRY TODO** — `graph.py:11` 添加注释说明待 feat-006 接入
7. **TravelState total=True** — `state.py:9` 必填字段用默认，可选字段用 `NotRequired`

### 验证
- [x] verify.py --feature feat-003 → 11/11 passed
- [x] verify.py --feature feat-004 → 7/7 passed
- [x] lint_check.sh → PASS

---

## 下一步计划

### 目标
实现高德 MCP 客户端适配层（amap_mcp.py），注册天气/POI/路线 8 个工具到 LangGraph Agent，验证工具调用通过。

### 完成的工作

#### 1. 高德 MCP 工具
- [x] `backend/src/tools/amap_mcp.py` — 8 个高德 API 工具
  - `amap_weather(city)` — 城市天气查询
  - `amap_poi_search(keywords, city, types)` — POI 关键词搜索
  - `amap_route_driving(origin, destination)` — 驾车路线规划
  - `amap_route_walking(origin, destination)` — 步行路线规划
  - `amap_geocode(address, city)` — 地理编码（地址→坐标）
  - `amap_reverse_geocode(location)` — 逆地理编码（坐标→地址）
  - `amap_poi_around(location, types, radius)` — 周边 POI 搜索

#### 2. Tavily 搜索工具
- [x] `backend/src/tools/tavily_search.py` — Tavily 网络搜索适配层
  - `tavily_search(query, max_results)` — 关键词搜索，返回结果+摘要

#### 3. Unsplash 图片工具
- [x] `backend/src/tools/unsplash_images.py` — 景点配图检索
  - `search_poi_images(query, count)` — 搜索景点横版配图

#### 4. 汇率工具
- [x] `backend/src/tools/currency.py` — 汇率查询
  - `get_exchange_rate(base, target)` — 查询币种汇率

#### 5. 工具注册
- [x] `backend/src/agent/graph.py` — TOOL_REGISTRY 字典注册 4 个工具模块

### 验证
- [x] `python verify.py --feature feat-004` → 7/7 criteria passed
- [x] `lint_check.sh` → PASS

### 证据
- `backend/src/tools/amap_mcp.py:1-150` — 8 个高德 API 异步工具
- `backend/src/tools/tavily_search.py:1-55` — Tavily 搜索适配层
- `backend/src/tools/unsplash_images.py:1-55` — Unsplash 图片检索
- `backend/src/tools/currency.py:1-50` — 汇率查询
- `backend/src/agent/graph.py:9-15` — TOOL_REGISTRY 注册

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
