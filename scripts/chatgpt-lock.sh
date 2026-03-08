#!/bin/bash
# chatgpt-lock.sh — Acquire/release/check a lock for ChatGPT Chrome session.
# Prevents multiple Claude Code instances from using ChatGPT simultaneously.
#
# Usage:
#   chatgpt-lock.sh acquire [timeout_seconds]  — acquire lock (default 300s timeout)
#   chatgpt-lock.sh release                    — release lock
#   chatgpt-lock.sh status                     — check if locked (exit 0=free, 1=locked)
#
# Lock includes PID of holder for stale lock detection.

LOCKFILE="C:/Users/armen/AppData/Local/Temp/chatgpt-chrome.lock"

case "${1:-status}" in
  acquire)
    TIMEOUT="${2:-300}"
    ELAPSED=0

    while [ "$ELAPSED" -lt "$TIMEOUT" ]; do
      # Check for stale lock (holder PID no longer exists)
      if [ -f "$LOCKFILE" ]; then
        HOLDER_PID=$(cat "$LOCKFILE" 2>/dev/null | head -1)
        if [ -n "$HOLDER_PID" ] && ! kill -0 "$HOLDER_PID" 2>/dev/null; then
          rm -f "$LOCKFILE"  # stale lock
        fi
      fi

      # Try to acquire
      if ( set -o noclobber; echo "$$" > "$LOCKFILE" ) 2>/dev/null; then
        echo "acquired"
        exit 0
      fi

      sleep 5
      ELAPSED=$((ELAPSED + 5))
      echo "  [${ELAPSED}s] Waiting for ChatGPT lock (held by PID $(cat "$LOCKFILE" 2>/dev/null))..." >&2
    done

    echo "ERROR: Lock timeout after ${TIMEOUT}s" >&2
    exit 1
    ;;

  release)
    rm -f "$LOCKFILE"
    echo "released"
    ;;

  status)
    if [ -f "$LOCKFILE" ]; then
      HOLDER_PID=$(cat "$LOCKFILE" 2>/dev/null | head -1)
      if [ -n "$HOLDER_PID" ] && kill -0 "$HOLDER_PID" 2>/dev/null; then
        echo "locked by PID $HOLDER_PID"
        exit 1
      else
        rm -f "$LOCKFILE"  # stale
        echo "free (stale lock cleaned)"
        exit 0
      fi
    fi
    echo "free"
    exit 0
    ;;

  *)
    echo "Usage: chatgpt-lock.sh {acquire|release|status} [timeout]" >&2
    exit 1
    ;;
esac
