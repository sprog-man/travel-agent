#!/usr/bin/env bash
# typecheck.sh — PostToolUse: Write|Edit 后自动跑类型检查
# 根据改动的文件路径自动选择检查 frontend 或 backend

file="${TOOL_INPUT_FILE_PATH:-}"
[[ -n "${file}" ]] || exit 0

case "${file}" in
  */frontend/*)
    if [[ -f "frontend/tsconfig.json" ]]; then
      npx tsc --noEmit -p frontend/tsconfig.json 2>/dev/null || echo "  [TYPECHECK] Frontend type errors found (non-blocking)" >&2
    fi
    ;;
  */backend/*)
    if [[ -f "backend/tsconfig.json" ]]; then
      npx tsc --noEmit -p backend/tsconfig.json 2>/dev/null || echo "  [TYPECHECK] Backend type errors found (non-blocking)" >&2
    fi
    ;;
esac

exit 0
