# Frontend Rules — 智能旅行攻略助手

## 项目结构

```
frontend/src/
├── main.tsx              # React 入口
├── App.tsx               # 路由：入场页 ↔ 主界面
├── pages/
│   ├── Landing.tsx       # 入场页 3D 场景
│   └── Main.tsx          # 主界面（地球 + 对话分屏）
├── components/
│   ├── Globe.tsx         # 3D 地球组件（react-globe.gl）
│   ├── GlobeHeatmap.tsx  # 热度热力图图层
│   ├── GlobeDaylight.tsx # 时区明暗光照
│   ├── ChatPanel.tsx     # 对话面板
│   ├── SettingsPanel.tsx # LLM 配置页面
│   └── ItineraryCard.tsx # 行程卡片
├── hooks/
│   └── useWebSocket.ts   # WebSocket 连接管理
├── services/
│   └── api.ts            # HTTP + WebSocket 通信
└── styles/
    └── globals.css       # Tailwind + 自定义样式
```

## 组件约定

- 所有组件放在 `components/`，页面放在 `pages/`
- 组件命名：PascalCase，文件名与组件名一致
- 3D 组件使用 react-globe.gl，场景组件使用 react-three-fiber
- 地球组件必须处理窗口 resize（自适应 Canvas 大小）
- 入场页到主界面的过渡使用 CSS opacity transition，不销毁 DOM

## 3D 地球规范

- 使用 `react-globe.gl` 实现基础地球
- 热力图：Hexbin 图层，颜色从蓝（冷）到红（热）渐变
- 时区明暗：根据 UTC 时间计算太阳方位角，动态光照
- 点击检测：Raycaster → 获取坐标 + 城市名 → 调用 `/api/guide`
- 资源清理：组件卸载时 dispose 所有 geometry/texture

## WebSocket 通信

- 使用 `useWebSocket` hook 管理连接生命周期
- 消息类型定义在 `services/api.ts` 中
- 流式消息（agent_message）逐 token 追加到 ChatPanel
- 断线重连：指数退避，最多 5 次

## 状态管理

- 全局状态：React Context（项目初期，不需要 Zustand/Jotai）
- 本地状态：useState + useReducer
- WebSocket 连接状态独立管理

## 样式

- Tailwind CSS 为主，自定义样式放 `globals.css`
- 深色主题：背景 #0a0a0a，文字 #e0e0e0
- 入场页全屏沉浸式，主界面上下分屏 6:4
