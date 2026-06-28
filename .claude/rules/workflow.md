# Workflow Rules — 智能旅行攻略助手

## 会话协议

### 启动
```
1. git log --oneline -5
2. 读 feature_list.json
3. 读 session-handoff.md
4. 读 DECISIONS.md
5. python verify.py --check-lock && python verify.py
```

### 开发
```
1. python verify.py --lock feat-XXX    ← 取锁
2. 选一个 pending feature（WIP=1）
3. 读 CLAUDE.md 规则索引 → 按需读对应 rules 文件
4. 实现 feature
5. python verify.py --feature <feat-id> 自检
6. 更新 progress.md（记录变更 + 证据）
7. git add + commit（hook 自动跑 lint → doc sync → verify）
8. python verify.py --unlock           ← 释锁
```

### 退出
```
1. python verify.py → 全部通过
2. 更新 progress.md → 记录变更 + 验证证据
3. 更新 session-handoff.md → 写交接要点
4. git add + commit → hook 自动跑 lint → doc sync → verify
```

## Three-Role 模式

| 场景 | 模式 | 做法 |
|------|------|------|
| 修变量名、改文案、加日志 | 直接执行 | 直接改，跑 verify.py 确认 |
| 实现一个组件、加 API | 执行型 | spawn 一个子 Agent（如 Frontend Developer），指定 done_criteria |
| 前后端同时开发 | 并行型 | 同时 spawn Frontend Developer + Backend Architect |
| 同一代码做安全/质量/性能评估 | 并行型 | 同时 spawn 多个只读型子 Agent，各自独立出报告 |
| 多阶段开发（设计→实现→审查） | 流水线型 | 串行 spawn，前一阶段输出做下一阶段输入 |
| 定位→修复→验证→分析 bug | 流水线型 | 每阶段用不同子 Agent，依次执行 |
| Code Review、安全审计 | 只读型 | spawn Code Reviewer 等只读子 Agent，限制 write/edit 工具 |
| feature 完成验收 | 只读型/Evaluator | spawn Evaluator → verify.py + build + Playwright → PASSING 才标记 completed |

## 锁机制

- `python verify.py --lock feat-XXX` — 取锁，防止多人同时改同一 feature
- `python verify.py --check-lock` — 检查锁状态（超时 15 分钟视为 stale）
- `python verify.py --unlock` — 释锁
- 锁文件：`.verify.lock`

## 验收门（Completed Gate）

**Generator 声称完成后，必须 spawn Evaluator 独立验收，PASSING 才可标记 completed。**

```
Generator 报告完成
       ↓
Lead spawn Evaluator (from ~/.claude/agents/engineering-evaluator.md)
  ├── Step 1: python verify.py --feature feat-XXX    ← 静态检查 done_criteria
  ├── Step 2: npm run build (frontend)                ← 构建验证
  ├── Step 3: Playwright MCP → navigate + screenshot  ← 运行时验证
  │         - 启动 dev server
  │         - 访问相关页面
  │         - 验证 UI 元素可见
  │         - 检查控制台无错误
  │         - 回归检查其他页面
  └── Step 4: 输出 verdict
         ↓
   PASSING → Lead 更新 feature_list.json status = completed → commit
   FAILING → Lead 把 Evaluator 反馈发给 Generator 修 → 重新验收
   Evaluator timeout → 重试一次 Evaluator
   双方结果矛盾 → 输出对比报告，人工介入
```

**关键规则：**
- Generator 不能自己证明自己完成
- Evaluator 是只读的（PreToolUse hook 阻止 Write/Edit）
- 验收必须包含静态检查 + 构建 + 运行时验证
- 只有 Evaluator 输出 `VERDICT: PASSING` 才能标记 completed
- **pre-commit hook 的 verify.py 输出不等于 Evaluator 验收。** pre-commit 只做静态检查（文件存在性、内容匹配、类型检查），不包含构建验证和 Playwright MCP 运行时验证。不能用 pre-commit 通过替代 Evaluator agent 验收。

## 验证链

```
git commit → pre-commit hook
  ├─ Layer 1: bash lint_check.sh   (Python 语法 + TS 类型检查)
  ├─ Layer 2: bash done_check.sh   (文档同步检查)
  └─ Layer 3: python verify.py     (独立评估器，按 feature 验证)
```

## Claude Code Hooks

- **PreToolUse Bash** → guard-bash.sh（拦截 rm -rf /, git push --force 等）
- **PreToolUse Write/Edit** → check-secrets.sh（检测 API Key/密码写入）
- **PostToolUse Write/Edit** → typecheck.sh（非阻塞类型检查）
