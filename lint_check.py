#!/usr/bin/env python3
"""lint_check.py — Python syntax check (called by lint_check.sh)"""
import ast
import os
import sys

errors = []
for root, dirs, files in os.walk("."):
    dirs[:] = [d for d in dirs if d not in ("node_modules", ".git", "__pycache__", ".venv")]
    for fname in files:
        if fname.endswith(".py"):
            fp = os.path.join(root, fname)
            try:
                with open(fp, encoding="utf-8") as fh:
                    ast.parse(fh.read(), filename=fp)
            except SyntaxError as e:
                errors.append(f"[SYNTAX] {fp}: {e}")

if errors:
    for err in errors:
        print(err, file=sys.stderr)
    sys.exit(1)

sys.exit(0)
