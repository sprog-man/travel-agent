# CLAUDE.md — 智能旅行攻略助手 · 项目宪法

## 项目概述

AI 驱动的旅行攻略 Agent：3D 地球探索 → 对话式攻略 → LangGraph 行程规划 → 可导出行程单。

**技术栈**：React 18 + TypeScript + Vite + Three.js/react-globe.gl (前端, Port 3000) + FastAPI + LangGraph + Python 3.11 (后端, Port 8000)

**架构**：前后端分离，WebSocket 实时通信。

## 关键命令

```bash
# 前端
cd frontend && npm install && npm run dev          # 开发 3000
cd frontend && npx tsc --noEmit                    # 类型检查

# 后端
cd backend && pip install -e .                     # 安装依赖
uvicorn src.main:app --reload --port 8000          # 开发

# 验证
python verify.py                                   # 独立评估器
python verify.py --feature feat-XXX                # 验证特定功能
python verify.py --self-test                       # 自测所有 handler
python verify.py --lock feat-XXX                   # 取锁（WIP=1）
python verify.py --unlock                          # 释锁
python verify.py --check-lock                      # 检查锁状态
bash lint_check.sh                                 # 语法+类型检查
bash done_check.sh                                 # 文档同步检查

# Docker
docker-compose up -d                               # 一键启动
```

## 规则索引

| 文件 | 职责 |
|------|------|
| [.claude/rules/workflow.md](.claude/rules/workflow.md) | 验证链 / Three-Role / 会话协议 |
| [.claude/rules/quality.md](.claude/rules/quality.md) | 代码规范 / commit 格式 |
| [.claude/rules/frontend.md](.claude/rules/frontend.md) | React / Three.js / 组件约定 |
| [.claude/rules/backend.md](.claude/rules/backend.md) | FastAPI / LangGraph / 工具层约定 |

## 目录结构

```
smart-travel-assistant/
├── frontend/src/          # React + Vite + Three.js
├── backend/src/           # FastAPI + LangGraph Agent
├── config/                # LLM 配置 + 热度数据
├── tests/                 # 测试用例 + 评估管道
└── .claude/rules/         # 规则细则
```

## 核心约束

1. **一次一个 feature。** WIP=1，先 `--lock feat-XXX` 再开发，完成后 `--unlock`。
2. **验证后声称完成。** `python verify.py` 以 Evaluator verdict 为准。
3. **先读规则再改代码。** 改前端先读 `frontend.md`，改后端先读 `backend.md`。
4. **CLAUDE.md ≤ 80 行。** 详细规则放 `.claude/rules/`。
5. **不漂移。** 不修改当前 feature 无关的文件。
6. **提交信息使用中文。** 方便追溯和阅读。
