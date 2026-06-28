#!/usr/bin/env bash
# guard-bash.sh — PreToolUse: Bash 危险命令拦截

PYTHON=""
for candidate in python3 python py; do
  p=$(command -v "$candidate" 2>/dev/null || true)
  if [ -n "$p" ] && [[ "$p" != *"WindowsApps"* ]] && [[ "$p" != *"/Windows/"* ]]; then
    PYTHON="$p"
    break
  fi
done
if [ -z "$PYTHON" ]; then
  exit 0
fi

INPUT_FILE=$(mktemp)
trap "rm -f $INPUT_FILE" EXIT

if [ -n "${TOOL_INPUT:-}" ]; then
  echo "$TOOL_INPUT" > "$INPUT_FILE"
else
  cat > "$INPUT_FILE"
fi

"$PYTHON" - "$INPUT_FILE" <<'PYEOF'
import sys, json, re

with open(sys.argv[1]) as f:
    try:
        data = json.load(f)
    except:
        sys.exit(0)

cmd = data.get('command', '') if isinstance(data, dict) else ''
if not cmd:
    sys.exit(0)

if '[allow-danger]' in cmd:
    sys.exit(0)

patterns = [
    (r'rm\s+-rf\s+(\/|~|\$HOME)', 'rm -rf /'),
    (r'git\s+push.*--force', 'git push --force'),
    (r'git\s+reset.*--hard', 'git reset --hard'),
    (r'git\s+clean\s+-fd', 'git clean -fd'),
    (r'chmod\s+-R\s+777', 'chmod -R 777'),
]

for pattern, name in patterns:
    if re.search(pattern, cmd):
        print(f'[BLOCKED] Dangerous command: {name}', file=sys.stderr)
        print(f'  To allow, append [allow-danger] to command.', file=sys.stderr)
        sys.exit(2)

sys.exit(0)
PYEOF
