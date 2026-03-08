#!/bin/bash
# chatgpt-query.sh — Send a prompt to ChatGPT via agent-browser and wait for response.
# Uses the 3-step inject/poll/extract pattern to avoid agent-browser eval timeouts.
# Acquires a lock to prevent concurrent access from multiple Claude Code instances.
#
# Usage: chatgpt-query.sh [--port PORT] [--setup] [--no-lock] "prompt" [max_wait_seconds]
#   --port PORT    CDP port (default: 9222)
#   --setup        Launch Chrome + inject functions before sending
#   --no-lock      Skip lock acquisition (caller manages locking)
#
# Output: Full response text on stdout

# Parse flags
PORT="9222"
SETUP=false
USE_LOCK=true
while [[ "$1" == --* ]]; do
  case "$1" in
    --port) PORT="$2"; shift 2 ;;
    --setup) SETUP=true; shift ;;
    --no-lock) USE_LOCK=false; shift ;;
    *) echo "Unknown flag: $1" >&2; exit 1 ;;
  esac
done

PROMPT="$1"
MAX_WAIT="${2:-300}"
SESSION="chatgpt-${PORT}"
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -z "$PROMPT" ]; then
  echo "Usage: chatgpt-query.sh [--port PORT] [--setup] [--no-lock] \"prompt\" [max_wait_seconds]" >&2
  exit 1
fi

# Acquire lock
if [ "$USE_LOCK" = true ]; then
  LOCK_RESULT=$(bash "$SCRIPTS_DIR/chatgpt-lock.sh" acquire 300 2>&1)
  if [ $? -ne 0 ]; then
    echo "ERROR: Could not acquire ChatGPT lock: $LOCK_RESULT" >&2
    exit 1
  fi
  trap 'bash "$SCRIPTS_DIR/chatgpt-lock.sh" release >/dev/null 2>&1' EXIT
fi

# Setup: launch Chrome and inject functions if requested
if [ "$SETUP" = true ]; then
  LAUNCHED_PORT=$(bash "$SCRIPTS_DIR/chatgpt-chrome.sh" "$PORT")
  if [ "$LAUNCHED_PORT" != "$PORT" ]; then
    echo "ERROR: Failed to launch Chrome on port $PORT" >&2
    exit 1
  fi
  sleep 2
  agent-browser --session "$SESSION" --cdp "$PORT" open https://chatgpt.com >/dev/null 2>&1
  sleep 2
  agent-browser --session "$SESSION" --cdp "$PORT" eval --stdin < "$SCRIPTS_DIR/chatgpt-send.js" >/dev/null 2>&1
  echo "Setup complete on port $PORT" >&2
fi

# Step 1: Inject prompt
TMPFILE=$(mktemp)
JSON_PROMPT=$(printf '%s' "$PROMPT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>process.stdout.write(JSON.stringify(d)))")
cat > "$TMPFILE" <<JSEOF
(async () => { return await chatgpt_inject($JSON_PROMPT); })()
JSEOF
INJECT_RESULT=$(agent-browser --session "$SESSION" --cdp "$PORT" eval --stdin < "$TMPFILE" 2>&1)
rm -f "$TMPFILE"
if ! echo "$INJECT_RESULT" | grep -q "sent"; then
  echo "ERROR: Failed to inject prompt: $INJECT_RESULT" >&2
  exit 1
fi

# Wait for prompt to be submitted and old state to clear
sleep 5

# Step 2: Poll for completion — require BOTH done=true AND msgCount > 0
# This prevents false positives from stale good-response buttons
ELAPSED=0
POLL_INTERVAL=5
while [ "$ELAPSED" -lt "$MAX_WAIT" ]; do
  sleep "$POLL_INTERVAL"
  ELAPSED=$((ELAPSED + POLL_INTERVAL))

  STATUS=$(agent-browser --session "$SESSION" --cdp "$PORT" eval "chatgpt_poll()" 2>&1 | perl -pe 's/\e\[[0-9;]*m//g')

  # Must have done:true AND at least one assistant message with content
  if echo "$STATUS" | grep -q 'done.*true.*msgCount.*[1-9]'; then
    sleep 1
    agent-browser --session "$SESSION" --cdp "$PORT" eval "chatgpt_extract()" 2>&1 | perl -pe 's/\e\[[0-9;]*m//g'
    exit 0
  fi

  echo "  [${ELAPSED}s] Still generating..." >&2
done

echo "ERROR: Timeout after ${MAX_WAIT}s" >&2
exit 1
