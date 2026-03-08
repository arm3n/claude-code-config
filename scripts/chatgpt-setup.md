# ChatGPT Webchat Automation Setup

## Quick Start (for Claude Code)

### 1. Launch Chrome with CDP
```bash
taskkill //F //IM chrome.exe 2>/dev/null
sleep 2
"/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --remote-debugging-port=9222 \
  --user-data-dir="C:/Users/armen/AppData/Local/Temp/chrome-chatgpt-profile" \
  https://chatgpt.com &disown
sleep 5
```

NOTE: Must use a temp profile (Chrome won't debug its default profile).
The temp profile persists login across restarts if not deleted.

### 2. Connect agent-browser
```bash
agent-browser --session chatgpt --cdp 9222 open https://chatgpt.com
```

### 3. Login (if needed)
- Click "Log in" → fill email `armen@armen.am` → "Continue with password"
- Password from 1Password: `op item get 6l3vvfnlrd4p5w7wsplv3ns344 --fields password --reveal`
- If email verification required: check Gmail via `mcp__gemini-gmail__search_gmail`
- Model should default to 5.4 Thinking (persists in account settings)

### 4. Inject functions
```bash
agent-browser --session chatgpt --cdp 9222 eval --stdin < ~/.claude/scripts/chatgpt-send.js
```

This loads 4 functions: `chatgpt_inject`, `chatgpt_poll`, `chatgpt_extract`, `chatgpt_send`.

### 5. Use — 3-step pattern (RECOMMENDED for Thinking model)

agent-browser eval has a ~60s connection timeout, but GPT-5.4 Thinking with web
search routinely takes 2-4 minutes. Use the 3-step pattern:

```bash
# Step 1: Inject prompt (returns instantly)
agent-browser --session chatgpt --cdp 9222 eval --stdin <<'EVALEOF'
(async () => { return await chatgpt_inject("Your prompt here"); })()
EVALEOF

# Step 2: Poll until done (every 15s)
agent-browser --session chatgpt --cdp 9222 eval "chatgpt_poll()"
# Returns: {"done":false,"generating":true,"msgCount":1}
# Repeat with sleep 15 between calls until done:true

# Step 3: Extract response
agent-browser --session chatgpt --cdp 9222 eval "chatgpt_extract()"
```

Or use the bash helper:
```bash
bash ~/.claude/scripts/chatgpt-query.sh "Your prompt here" 300
```

### 5b. Use — convenience wrapper (fast responses only)

For simple prompts that complete in <60s, `chatgpt_send()` still works as a
single eval call:

```bash
agent-browser --session chatgpt --cdp 9222 eval --stdin <<'EVALEOF'
(async () => { return await window.chatgpt_send("What is 7 * 8?"); })()
EVALEOF
```

## Concurrency / Multi-Session

**Problem**: Multiple Claude Code instances sharing one Chrome instance interfere with
each other — ChatGPT's SPA state is shared across tabs.

**Solution**: `chatgpt-query.sh` acquires a file lock (`chatgpt-lock.sh`) so only one
Claude Code instance uses ChatGPT at a time. The split-brain protocol already requires
ChatGPT calls 4-6 to be sequential, so this is not a bottleneck.

- Lock file: `$TEMP/chatgpt-chrome.lock` (includes holder PID, auto-cleans stale locks)
- `chatgpt-query.sh` acquires lock automatically; use `--no-lock` to manage manually
- `chatgpt-lock.sh acquire/release/status` for manual lock management
- If a second instance needs ChatGPT while the lock is held, it waits up to 300s

## Key Facts
- Real Chrome (not Playwright) bypasses Cloudflare Turnstile
- Real Chrome does NOT strip DOM text — direct innerText extraction works
- Playwright-launched browsers DO strip DOM text — need Copy button + clipboard fallback
- good-response-turn-action-button = response complete signal
- Each chatgpt_inject() call starts a new chat (avoids stale completion signals)
- GPT-5.4 Thinking + web search: expect 2-4 minutes per response
- 1Password item ID: 6l3vvfnlrd4p5w7wsplv3ns344

## Pressure Test Results (2026-03-08)
- **Test 1 (Actuary)**: Multi-paragraph adversarial prompt with special characters ("quotes & ampersands", <angle brackets>, em—dashes, ellipsis…). All chars survived injection. 3,824-char structured response with verdicts, confidence, evidence. ~4 min.
- **Test 2 (SAFE)**: Factual error detection. New-chat isolation worked (no stale signals from Test 1). 1,815-char response. ~1.5 min.
- **Test 3 (Blind Reviewer)**: 3-question geopolitical research. 3-step inject/poll/extract pattern validated end-to-end. 225s generation time. Full sourced response with Reuters/Commons Library citations.
