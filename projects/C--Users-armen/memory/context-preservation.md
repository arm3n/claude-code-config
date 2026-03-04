# Context Preservation Notes

> Learned 2026-02-15 from 160+ source deep research.
> Full report: `~/.local/bin/reports/context-preservation-research-2026-02-15.md`

## The Four-Layer Architecture

| Layer | What | Survives | Token Cost |
|-------|------|----------|------------|
| 1. Persistent Rules | CLAUDE.md, MEMORY.md | Everything | 1-10K fixed |
| 2. Within-Session | /compact, subagents | Compaction | Variable |
| 3. Cross-Session Handover | HANDOFF.md via /handover skill | Session restart | 2-5K |
| 4. Long-Term Memory | MCP memory servers, auto-memory | Indefinitely | Per-retrieval |

## Key Findings

- **Handoff > Compact**: A fresh session with 5K handover doc outperforms a compacted session carrying 50K+ degraded history (10x less per message)
- **60-70% rule**: Compact proactively at 60-70% context. Performance degrades at 50%+ even with large windows.
- **Failed approaches are the most valuable handover content** — without them, next session retries the same failed things
- **LLMs track 5-10 rules before silently dropping some** — keep CLAUDE.md at 100-300 lines
- **Observation masking** (hiding old tool outputs) reduces costs 50% with equal performance

## Five Compaction Failure Modes

1. Precise numbers get rounded or dropped
2. Conditional logic (IF/BUT/EXCEPT) collapses into simplified statements
3. Decision rationale (the "why") evaporates — only the "what" survives
4. Cross-document relationships flatten
5. Open questions get silently resolved as settled

## Tool-Specific Notes

### Claude Code
- `claude --continue` / `--resume <id>` / `--fork-session` for session continuity
- `/compact focus on X` for targeted preservation
- Auto-compaction at ~75-92% (improved in v2.0.64+, now instant via background session memory)
- Subagents via Task() get independent context windows — use for exploration
- **PreCompact hook** (added 2026-02-16): auto-backs up transcript + extracts context before compaction
- **SessionStart (compact) hook**: re-injects saved context after compaction
- Status line shows `ctx:XX%` with color thresholds (green/yellow/red) for proactive awareness
- See [hooks.md](./hooks.md) for full details

### MCP Memory Options (if claude-mem gets fixed for Win11)
- **memory-mcp**: Two-tier (CLAUDE.md + .memory/state.json), uses Haiku for extraction
- **MCP Memory Keeper**: Checkpoint-based "save game" pattern, cross-session sharing
- **MCP Memory Service**: Cross-platform, works with 13+ AI tools

## User's API Tier Status
- Currently Tier 2 ($40+ spent, 7+ days)
- 1M context requires Tier 4 ($400+, 30+ days)
- No shortcut to skip the 30-day wait
