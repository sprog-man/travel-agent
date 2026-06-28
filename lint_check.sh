#!/bin/bash
# lint_check.sh — Syntax + TypeScript typecheck for smart-travel-assistant
# Called by pre-commit hook and verify.py

echo "Running lint checks..."
ERRORS=0

# Python syntax check via virtual env
if [ -f ".venv/Scripts/python.exe" ]; then
  PY=".venv/Scripts/python.exe"
elif [ -f ".venv/bin/python" ]; then
  PY=".venv/bin/python"
elif command -v python &>/dev/null; then
  PY=$(command -v python)
else
  PY=$(command -v python3 2>/dev/null || command -v python 2>/dev/null)
fi

if [ -n "$PY" ] && [ -f "$PY" ]; then
  echo "  Using Python: $PY"
  if ! "$PY" lint_check.py 2>&1; then
    ERRORS=$((ERRORS + 1))
  fi
fi

# TypeScript typecheck
if command -v npx &>/dev/null; then
  if [ -f "frontend/tsconfig.json" ]; then
    echo "  Running frontend typecheck..."
    if ! npx tsc --noEmit -p frontend/tsconfig.json; then
      echo "  [TSC] frontend typecheck failed"
      ERRORS=$((ERRORS + 1))
    fi
  fi
  if [ -f "backend/tsconfig.json" ]; then
    echo "  Running backend typecheck..."
    if ! npx tsc --noEmit -p backend/tsconfig.json; then
      echo "  [TSC] backend typecheck failed"
      ERRORS=$((ERRORS + 1))
    fi
  fi
fi

# Frontend build check
if [ -f "frontend/package.json" ]; then
  echo "  Checking frontend dependencies..."
  if [ ! -d "frontend/node_modules" ]; then
    echo "  [WARN] frontend/node_modules not found — run 'npm install' in frontend/"
  fi
fi

if [ "$ERRORS" -gt 0 ]; then
  echo "  $ERRORS error(s) found."
  exit 1
fi

echo "  OK — all checks clean."
exit 0
