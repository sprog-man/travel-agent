# Workflow Rules — 智能旅行攻略助手

## 会话协议

### 启动
```
1. git log --oneline -5
2. 读 feature_list.json
3. 读 session-handoff.md
4. 读 DECISIONS.md
5. python verify.py
```

### 开发
```
1. 选一个 pending feature（WIP=1）
2. 读 CLAUDE.md 规则索引 → 按需读对应 rules 文件
3. 实现 feature
4. python verify.py --feature <feat-id> 自检
5. 更新 progress.md（记录变更 + 证据）
6. git add + commit（hook 自动跑 lint → doc sync → verify）
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
| 实现一个组件、加 API | 执行型 | spawn 一个子 Agent（如 Frontend Developer） |
| 前后端同时开发 | 并行型 | 同时 spawn Frontend Developer + Backend Architect |
| feature 完成验收 | 只读型/Evaluator | spawn Evaluator → verify.py → PASSING 才标记 completed |

## 验收门

Generator 声称完成后，必须 spawn Evaluator 独立验收：
1. `python verify.py --feature <feat-id>`
2. `npm run build` (frontend)
3. PASSING → 标记 `feature_list.json` status = completed
4. FAILING → 反馈 Generator 修改后重新验收

## 验证链

```
git commit → pre-commit hook
  ├─ Layer 1: bash lint_check.sh   (Python 语法 + TS 类型检查)
  ├─ Layer 2: bash done_check.sh   (文档同步检查)
  └─ Layer 3: python verify.py     (独立评估器)
```

## Claude Code Hooks

- **PreToolUse Bash** → guard-bash.sh（拦截 rm -rf /, git push --force 等）
- **PreToolUse Write/Edit** → check-secrets.sh（检测 API Key/密码写入）
- **PostToolUse Write/Edit** → typecheck.sh（非阻塞类型检查）
