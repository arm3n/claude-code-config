# Restore .claude.json from corrupted backup

## Context
Claude Code detected `.claude.json` as corrupted (likely due to concurrent session writes) and replaced it with a fresh config. The original 25KB config is preserved intact at `~/.claude/backups/.claude.json.corrupted.1772132427774`.

## Steps
1. Back up current `.claude.json` (the fresh one) as `.claude.json.fresh-reset-backup`
2. Copy `~/.claude/backups/.claude.json.corrupted.1772132427774` → `~/.claude.json`
3. Verify the restored file has `numStartups: 213` and populated `mcpServers`
4. User restarts Claude Code session to pick up restored MCPs

## Verification
- `claude mcp list` should show all 18 servers
- `numStartups` should be 213 (not 1)
- `autoCompactEnabled` should be `false`
