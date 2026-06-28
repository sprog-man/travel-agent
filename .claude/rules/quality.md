# Quality Rules — 智能旅行攻略助手

## 代码规范

### Python (Backend)
- 遵循 PEP 8，行宽 100 字符
- 所有函数必须有 docstring（Google 风格）
- 使用 Pydantic v2 做数据验证
- 异步优先：I/O 操作使用 `async/await`
- 工具函数使用 `@tool` 装饰器注册到 LangGraph
- 错误处理：所有外部 API 调用必须有 try/except + 降级策略

### TypeScript (Frontend)
- 严格模式：`strict: true` in tsconfig.json
- 组件使用 functional + hooks，禁止 class component
- Props 必须定义 interface，禁止 `any`
- 3D 场景资源在组件卸载时清理（dispose geometry/textures）
- WebSocket 消息使用 discriminated union type

## Commit 格式

遵循 Conventional Commits：
```
<type>(<scope>): <subject>

<body> (optional)
<footer> (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Examples:
```
feat(frontend): add globe heatmap layer with hexbin colors
fix(backend): handle amap weather timeout gracefully
docs: update DECISIONS.md with LLM provider choice
```

## 文档同步

每次代码变更必须同步更新：
- `progress.md` — 记录变更内容和证据（文件:行号）
- `DECISIONS.md` — 仅架构决策变更时更新
- `feature_list.json` — 完成 feature 时更新 status

## 安全

- API Key 永远不硬编码，使用 `.env` 文件
- `.env` 文件加入 `.gitignore`
- `.env.example` 记录所有必需环境变量
- secrets hook 自动检测敏感信息写入
