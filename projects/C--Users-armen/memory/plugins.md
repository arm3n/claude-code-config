# Plugin Notes

## Claude-mem (UNINSTALLED — 2026-02-05)
- Attempted full setup, hit multiple Windows-specific bugs. Uninstalled.
- **Root cause**: WMIC removal in Win11 25H2+ breaks worker daemon spawning
- **GitHub issues**: #785, #890, #921, #923
- **Symptoms**: MCP server "failed", PostToolUse hook errors on every tool use, worker can't auto-start
- **Architecture**: Bun runtime + worker daemon on port 37777 + SQLite/FTS5 + ChromaDB (disabled on Windows)
- **Decision**: Not worth the workarounds. Using built-in MEMORY.md until Windows support matures.
- **If revisiting**: Check if claude-mem has replaced WMIC with `Start-Process` (PowerShell) or `child_process.spawn({detached:true})` (Node)

## Alternatives Evaluated
| Solution | Status | Notes |
|---|---|---|
| claude-mem | Broken on Win11 25H2+ | Best features but WMIC dependency |
| memory-mcp | Not tested | Lighter, Node-only, likely Windows-safe |
| Basic Memory | Not tested | File-based, simple |
| MCP Memory Keeper | Not tested | Simple key-value |
| MEMORY.md (built-in) | **Active** | Zero dependencies, works perfectly |
