#!/usr/bin/env bash
# check-secrets.sh — PreToolUse: Write|Edit 敏感信息检测

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

if not isinstance(data, dict):
    sys.exit(0)

content = data.get('new_string', '') or data.get('content', '')
if not content:
    sys.exit(0)

patterns = [
    (r'AKIA[0-9A-Z]{16}', 'AWS Access Key'),
    (r'ghp_[a-zA-Z0-9]{36}', 'GitHub PAT'),
    (r'sk-[a-zA-Z0-9]{32,}', 'API Secret Key'),
    (r'(?i)password\s*[:=]\s*[\x22\x27][^\x22\x27]+[\x22\x27]', 'Password'),
    (r'(?i)(api[_-]?key|secret|token)\s*[:=]\s*[\x22\x27][^\x22\x27]+[\x22\x27]', 'Secret/Key/Token'),
]

for pattern, name in patterns:
    if re.search(pattern, content):
        print(f'[BLOCKED] Potential {name} detected', file=sys.stderr)
        sys.exit(2)

sys.exit(0)
PYEOF
