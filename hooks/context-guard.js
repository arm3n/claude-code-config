#!/usr/bin/env node
// PreToolUse hook: injects context warnings when context window is getting full.
// Reads context % from cache written by statusline-command.js.
// Requires 2 consecutive above-threshold readings to fire (debounce).
const fs = require('fs');
const path = require('path');
const os = require('os');

const CACHE = path.join(os.homedir(), '.claude', 'context-pct-cache.json');
const STATE = path.join(os.homedir(), '.claude', 'context-guard-state.json');
const WARN_PCT = 80;
const STOP_PCT = 90;
const CACHE_MAX_AGE_MS = 45 * 1000; // ignore cache older than 45s (prevents stale post-compact values)

// Read cached context percentage
let pct = null;
try {
  const data = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  if (data.ts && (Date.now() - data.ts < CACHE_MAX_AGE_MS)) {
    pct = data.pct;
  }
} catch {
  process.exit(0);
}

if (pct == null || pct < WARN_PCT) {
  // Below threshold — reset consecutive counter
  try { fs.writeFileSync(STATE, JSON.stringify({ count: 0, pct: 0, ts: Date.now() })); } catch {}
  process.exit(0);
}

// Above threshold — check if this is a confirmed reading (2+ consecutive with DIFFERENT cache timestamps)
let state = { count: 0, pct: 0, ts: 0, cacheTs: 0 };
try {
  state = JSON.parse(fs.readFileSync(STATE, 'utf8'));
} catch {}

// Read the cache timestamp to ensure the statusline actually refreshed between readings
let cacheTs = 0;
try {
  const data = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  cacheTs = data.ts || 0;
} catch {}

// Only count as a new reading if the cache timestamp changed (statusline actually refreshed)
const isNewReading = cacheTs !== (state.cacheTs || 0);
const newCount = isNewReading ? (state.count || 0) + 1 : (state.count || 0);
try { fs.writeFileSync(STATE, JSON.stringify({ count: newCount, pct, ts: Date.now(), cacheTs })); } catch {}

// Require 2 consecutive readings with independent statusline refreshes
if (newCount < 2) {
  process.exit(0);
}

let msg;
if (pct >= STOP_PCT) {
  msg =
    `[CONTEXT GUARD] Context window is at ${pct}%. ` +
    `STOP what you are doing after this tool call completes. ` +
    `Do not start any new work. Tell the user to run /handover immediately.`;
} else {
  msg =
    `[CONTEXT GUARD] Context window is at ${pct}%. ` +
    `Start wrapping up your current task. Finish your current step and suggest the user run /handover soon.`;
}

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    permissionDecision: 'allow',
    additionalContext: msg
  }
}));
process.exit(0);
