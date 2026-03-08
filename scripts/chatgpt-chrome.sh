#!/bin/bash
# chatgpt-chrome.sh — Launch an isolated Chrome instance for ChatGPT automation.
# Each instance gets its own CDP port and temp profile = full isolation.
#
# Usage: chatgpt-chrome.sh [port]
#   port defaults to 9222. Use 9223, 9224, etc. for parallel sessions.
#
# Output: prints the port number on success
#
# The profile dir is per-port, so login persists per-port across restarts.

PORT="${1:-9222}"
PROFILE_DIR="C:/Users/armen/AppData/Local/Temp/chrome-chatgpt-${PORT}"

# Check if port is already in use
if curl -s "http://localhost:${PORT}/json/version" >/dev/null 2>&1; then
  echo "$PORT" # already running
  exit 0
fi

"/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --remote-debugging-port="$PORT" \
  --user-data-dir="$PROFILE_DIR" \
  https://chatgpt.com &disown 2>/dev/null

# Wait for CDP to come up
for i in $(seq 1 10); do
  sleep 1
  if curl -s "http://localhost:${PORT}/json/version" >/dev/null 2>&1; then
    echo "$PORT"
    exit 0
  fi
done

echo "ERROR: Chrome failed to start on port $PORT" >&2
exit 1
