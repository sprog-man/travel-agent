# Session Handoff

## Last Updated: 2026-06-28

## Current State
- **Active Feature:** None (feat-001 completed)
- **Lock:** Released
- **All Features:** 1/9 completed

## Completed Features
- **feat-001** (M1): 前端骨架 — React + Vite + 入场页 3D 场景 ✅
  - Evaluator VERDICT: PASSING (4/4 layers)
  - Pre-commit hook: 3-layer verification passed

## Next Feature
- **feat-002** (M1): 主界面 — 上下分屏 6:4（地球 + 对话面板）
  - Dependencies: feat-001 ✅
  - Ready to start

## Known Issues
- `frontend/dist/` build artifacts exist but are gitignored
- `.venv/` debug artifacts (pdb.set_trace in pip) — harmless warnings in done_check.sh

## Key Decisions
- Tailwind v3 (not v4) — CommonJS config format
- three.js WebGPU excluded via optimizeDeps.exclude + esbuildOptions.target=esnext
- Pre-commit hook detects staged feature from file paths (not checking all)
- All scripts use `.venv/Scripts/python.exe` (not system Python)
