# Auto Memory

## User Setup
- Windows machine, user: armen
- Node.js at `C:\Program Files\nodejs\npx.cmd`
- Has `uv`/`uvx` installed for Python MCP servers
- Claude Code with Opus 4.6, extra usage enabled
- User prefers autonomous execution without asking permission
- Currently on Max 20x ($200/mo) subscription plan

## MCP Configuration
- 14 MCP servers configured in `~/.claude.json` (user-level `mcpServers` section)
- Original 9: sequential-thinking, exa, tavily, brave-search, perplexity, context7, firecrawl, gemini-gmail, gmail
- Added 5: memory, youtube-transcript, wayback-machine, playwright, paper-search
- NPX-based MCPs need full path `C:\Program Files\nodejs\npx.cmd` with PATH env on Windows
- Paper-search uses `uvx` (Python-based)

## Key Files Created
- `~/.claude/CLAUDE.md` - Research-optimized system prompt for Opus 4.6
- `~/.claude/skills/deep-research/SKILL.md` - 6-phase deep research skill
- `~/.claude/agents/web-researcher.md` - Custom research subagent with MCP tool whitelist
- `~/.local/bin/reports/max-vs-api-fast-mode-2026-02-09.md` - 140+ source research report

## Force Opus 4.6 Everywhere
- Set via `setx` (persisted to user env, requires restart of Claude Code):
  - `CLAUDE_CODE_SUBAGENT_MODEL=claude-opus-4-6` — default for subagents using `inherit`
  - `ANTHROPIC_DEFAULT_OPUS_MODEL=claude-opus-4-6`
  - `ANTHROPIC_DEFAULT_SONNET_MODEL=claude-opus-4-6` — remaps Sonnet alias to Opus
  - `ANTHROPIC_DEFAULT_HAIKU_MODEL=claude-opus-4-6` — remaps Haiku alias to Opus
- Must use full model name (`claude-opus-4-6`), not alias (`opus`) for env vars
- Built-in Explore/Guide agents are hardcoded to Haiku; alias remapping overrides this
- Related GitHub issues: #5456, #13434, #18346, #10993

## Opus 4.6 Prompting Notes
- More responsive to system prompt than prior models; use moderate language not CAPS
- Extended thinking deprecated; use adaptive thinking with effort levels
- Tends to over-engineer and over-spawn subagents; needs explicit guardrails
- State instructions once; it follows precisely without repetition
- Interleaved thinking is automatic; reflects between tool calls

## API Setup & Billing Switching
- Setting up Anthropic API account (console.anthropic.com) for hybrid usage
- API tiers: Tier 1 ($5), Tier 2 ($40, 7d), Tier 3 ($200, 14d), Tier 4 ($400, 30d)
- Tier 4 required for 1M context — 30-day wait is the real gate
- Max subscription and API billing are completely separate systems
- Individual accounts are fine — no "organization" required
- Switching: `/logout` → uses ANTHROPIC_API_KEY env var; `/login` → back to subscription
- Set API key: `[System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "key", "User")`
- No automatic fallback from subscription to API yet (GitHub #2944, #3835 — open)
- Workaround: keep two terminal tabs (one subscription, one API) and switch when hitting limits
- Session context lost on switch, but CLAUDE.md and memory files persist

## Opus 4.6 Pricing & Plans (researched 2026-02-09)
- See detailed notes: [pricing-research.md](pricing-research.md)
- Context window: 200K default, 1M beta (API Tier 4 / pay-as-you-go only)
- 1M on Max subscription: advertised but repeatedly broken (GitHub issues #15057, #23700)
- Enable 1M: `/model opus[1m]` (requires API key, not subscription)
- Fast mode: `/fast` toggle, 6x pricing ($30/$150 MTok), 2.5x speed, same model
- Fast mode >200K: 12x pricing ($60/$225 MTok)
- Fast mode is ALWAYS extra usage, even on subscription (never deducted from plan)
- Opus 4.6 uses ~5x more tokens than 4.5 due to adaptive thinking
- `effort: medium` saves 23% output tokens but loses ~4pp on hard coding tasks (65.4→61.1% Terminal-Bench)
- Use medium for routine work, high for complex tasks — don't blindly default to medium
- See detailed notes: [effort-levels.md](effort-levels.md)
