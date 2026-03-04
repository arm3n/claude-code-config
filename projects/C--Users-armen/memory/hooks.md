# Claude Code Hooks

> Configured in `~/.claude/settings.json` under `"hooks"`.

## Available Hook Events (14 total)

| Event | When | Can Block? | Matchers |
|-------|------|-----------|----------|
| SessionStart | Session begins/resumes | No | `startup`, `resume`, `clear`, `compact` |
| UserPromptSubmit | Before Claude processes prompt | Yes | — |
| PreToolUse | Before tool executes | Yes | Tool name |
| PermissionRequest | Permission dialog appears | Yes | Tool name |
| PostToolUse | After tool succeeds | No | Tool name |
| PostToolUseFailure | After tool fails | No | Tool name |
| Notification | Notification sent | No | `permission_prompt`, `idle_prompt`, etc. |
| SubagentStart | Subagent spawned | No | Agent type |
| SubagentStop | Subagent finishes | Yes | Agent type |
| Stop | Claude finishes responding | Yes | — |
| TeammateIdle | Agent teammate about to idle | Yes | — |
| TaskCompleted | Task marked completed | Yes | — |
| PreCompact | Before compaction | No | `manual`, `auto` |
| SessionEnd | Session terminates | No | `clear`, `logout`, etc. |

## Currently Configured Hooks

### 1. PreCompact (added 2026-02-16)
- **Script**: `~/.claude/hooks/pre-compact.js` (Node.js)
- **Matcher**: `""` (both manual and auto)
- **What it does**:
  - Reads transcript JSONL from `hook.transcript_path`
  - Extracts last 10 user messages, last 5 assistant outputs, file paths from tool calls
  - Saves `~/.claude/handovers/pre-compact-latest.md` (for re-injection)
  - Saves `~/.claude/handovers/pre-compact-{timestamp}.md` (timestamped copy)
  - Backs up raw transcript to `~/.claude/handovers/transcripts/transcript-{timestamp}.jsonl`
- Also deletes `context-pct-cache.json` to prevent context-guard from reading stale pre-compact values (added 2026-03-03)
- **Limitation**: Mechanical extraction only — can't synthesize like `/handover` skill

### 2. SessionStart (compact) (added 2026-02-16)
- **Script**: `~/.claude/hooks/post-compact.js` (Node.js)
- **Matcher**: `"compact"` (only fires after compaction, not on startup/resume/clear)
- **What it does**:
  - Reads `~/.claude/handovers/pre-compact-latest.md`
  - Returns `additionalContext` JSON so Claude sees it post-compaction
- **Pattern**: PreCompact saves → SessionStart re-injects (save-and-restore)

### 3. Config Guard — SessionStart (added 2026-02-26)
- **Script**: `~/.claude/hooks/config-guard.js` (Node.js)
- **Matcher**: `""` (fires on every session start)
- **What it does**:
  - Reads `~/.claude.json` and checks if `mcpServers` has ≥10 entries
  - If missing/empty/too few → restores from `~/.claude/.claude.json.golden` (19 MCPs)
  - Preserves current `oauthAccount` and `cachedGrowthBookFeatures` during merge
  - Logs all restore events to `~/.claude/config-guard.log`
  - Returns `additionalContext` telling Claude to inform user to restart
- **Why**: Parallel sessions can race-write `.claude.json`, corrupting it (happened 2026-02-26)
- **Golden backup**: `~/.claude/.claude.json.golden` — auto-synced by the guard when healthy config has MCP changes
- **Restore script**: `~/.claude/restore-config.cmd` for manual recovery outside Claude Code

### 4. Context Guard — PreToolUse (added 2026-02-17)
- **Script**: `~/.claude/hooks/context-guard.js` (Node.js)
- **Matcher**: `""` (fires on all tool calls)
- **What it does**:
  - Reads `~/.claude/context-pct-cache.json` (written by statusline-command.js on every refresh)
  - Injects `additionalContext` into Claude's context at two thresholds:
    - **80%**: "Start wrapping up, suggest /handover soon"
    - **90%**: "STOP. Tell user to run /handover immediately"
  - No hard blocking — Claude follows the injected instructions
  - Cache staleness: ignores values older than 2 minutes
- **Design**: Hook events don't receive `context_window` data (only status line does), so the status line bridges the gap by writing to a shared cache file
- **Pattern**: statusline writes % → PreToolUse reads % → injects warning → Claude acts

### 5. Notification (existing)
- **Script**: `~/.claude/notify.ps1` (PowerShell)
- **Matcher**: `""` (all notification types)
- **What it does**: Windows toast notifications

## Hook Input Schema (stdin JSON)

PreToolUse receives:
```json
{
  "session_id": "...",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/dir",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": { "command": "..." },
  "tool_use_id": "toolu_01ABC..."
}
```

PreCompact receives:
```json
{
  "session_id": "...",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/dir",
  "hook_event_name": "PreCompact",
  "trigger": "manual" | "auto",
  "custom_instructions": ""
}
```

SessionStart receives:
```json
{
  "session_id": "...",
  "source": "compact" | "startup" | "resume" | "clear",
  ...
}
```

## Hook Output (stdout JSON)

Exit code 0 with JSON stdout:
- `systemMessage`: warning shown to user
- `hookSpecificOutput.additionalContext`: injected into Claude's context (PreToolUse, PostToolUse, SessionStart, etc.)
- `hookSpecificOutput.permissionDecision`: "allow" or "deny" (PreToolUse only)

Exit code 2: blocks the action (for blocking-capable events), stderr shown to Claude.

## Notes
- Hooks run shell commands, NOT Claude skills — can't invoke `/handover` from a hook
- PreCompact cannot block compaction (exit code 2 only shows stderr)
- Hook events do NOT receive `context_window` data — only the status line gets it
- Use Node.js for JSON parsing in hook scripts — `jq` not reliably in PATH on Windows
- NEVER use bash scripts for statusline/hooks on Windows — MSYS2 fork failures silently kill `$()` subshells
- Pure Node.js scripts work reliably (statusline was rewritten from .sh to .js after bash version silently failed)
- Best practice: still run `/handover` manually when context is high; hooks are a safety net
