# Fix: Restore Full Claude Code Config and Prevent Future Corruption

## Context
Parallel Claude Code sessions caused a race condition writing to `~/.claude.json`, corrupting it. On restart, Claude Code generated a fresh empty config (0 MCPs, `numStartups: 1`, new `firstStartTime`). A previous "fix" didn't survive restart because the restored file was overwritten again before Claude Code exited.

The full config is preserved in `~/.claude/backups/.claude.json.corrupted.1772132427774` (25KB, 19 MCP servers, 213 startups, all project data).

## Step 1: Restore `.claude.json` from golden backup
- **Exit Claude Code first** — this is critical. Claude Code writes `.claude.json` on exit, which will overwrite any restoration done while it's running. That's why the last fix failed.
- Copy `~/.claude/backups/.claude.json.corrupted.1772132427774` → `~/.claude.json`
- Merge in two fields from current file that the backup lacks (newer schema additions):
  - `organizationRole` and `organizationName` in `oauthAccount` (cosmetic, optional)
- Everything else in the backup is the authoritative version

**Files:** `C:\Users\armen\.claude.json`

## Step 2: Create a permanent golden backup
- Copy the restored file to `~/.claude/.claude.json.golden`
- This file is never auto-touched by Claude Code (it only manages `.claude.json`)
- Add to `.claude/.gitignore` so it's not tracked (contains API keys)

**Files:** `C:\Users\armen\.claude\.claude.json.golden`

## Step 3: Create a SessionStart hook to auto-detect and recover corruption
A Node.js script that runs on every session start:
1. Reads `~/.claude.json` and parses it
2. Checks if top-level `mcpServers` key exists and has ≥10 entries
3. If missing/empty/too few → copies from `~/.claude.json.golden` and logs the event
4. If `.claude.json` is unparseable → same recovery

This ensures that even if corruption happens again, the next session auto-heals.

**Files:**
- `C:\Users\armen\.claude\hooks\config-guard.js` (new hook script)
- `C:\Users\armen\.claude\settings.json` (add SessionStart hook entry)

## Step 4: Update MEMORY.md
- Document the 19 MCP count (not 15/18)
- Document the config-guard hook
- Note the root cause and prevention

## Execution Order (CRITICAL)
1. User must **close all Claude Code sessions**
2. Restore `.claude.json` from backup (via terminal/shell outside Claude Code)
3. Create golden backup
4. Create hook script
5. Add hook to settings.json
6. Restart Claude Code — verify all 19 MCPs load

## Verification
- `claude mcp list` should show 19 servers
- Status line should show normal context/usage
- `autoCompactEnabled` should be `false`
- `numStartups` should be 213+ (not 1)
- Run a quick MCP tool (e.g., brave search) to confirm connectivity

## Why the Last Fix Failed
Claude Code auto-saves `.claude.json` on exit. The previous session restored the file, but when that session ended, Claude Code wrote its in-memory (empty) config back to disk, overwriting the fix. **The restore must happen when no Claude Code process is running.**
