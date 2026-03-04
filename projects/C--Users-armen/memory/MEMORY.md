# Memory Index

> Topic files in this directory hold full details. This index stays under 200 lines.

## Critical Rules

**#1 MOST IMPORTANT — VERIFY, DON'T INFER**: Before stating ANY factual claim that could have changed over time, ALWAYS verify with a search first. NEVER rely on training data, specs, general principles, or "common knowledge" alone. This covers technology, health/medical, legal, financial, product behavior, APIs, UI behavior — anything where the ground truth could have shifted since training. If you haven't searched, you don't know. The ONLY exceptions are immutable historical facts (past sports scores, completed weather events, established mathematical/physical constants). When in doubt, search.

- **NEVER do automatic handovers** — only run /handover when the user explicitly asks for it
- **Don't resume task work while handling a separate issue** — wait for explicit go-ahead before continuing beads/tasks
- NEVER guess or fabricate URLs. Use WebSearch/WebFetch to verify first.
- Brave Search: ALWAYS call sequentially (1 req/sec rate limit). Exa can run in parallel.
- When the user provides specific model/year/variant details, ALWAYS verify facts against that exact configuration. Never default to the most common or generic answer.
- **PDF Verification**: ALWAYS visually verify every PDF after generation — read it with the Read tool, audit each page for blank pages/orphans/whitespace, report findings. Details → [pdf-verification.md](./pdf-verification.md)
- **Beads + Plans**: ALWAYS create beads whenever a plan is proposed — plans without beads lose tracking across sessions
- **Service Verification**: After ANY change that touches running services (Docker, reverse proxies, configs), verify front-ends via Chrome DevTools MCP — navigate to the URL and confirm the UI loads

## GitHub
- Username: **arm3n** (not "armen")
- Git config for repos: `user.name=arm3n`, `user.email=arm3n@users.noreply.github.com`
- NEVER use `Co-Authored-By` in commits — creates a separate "claude" contributor on GitHub
- GitHub caches contributor data from old commits; force push doesn't clear it — must delete + recreate repo
- `gh auth refresh -s delete_repo` times out in Claude Code — user must delete repos manually from GitHub Settings
- Repos: `arm3n/claude-deep-research`, `arm3n/tesla-model-x-dashboard`, `arm3n/claude-code-statusline`, `arm3n/claude-code-config`

## User Setup
- Windows 11 25H2+, user: armen
- Claude Code with Opus 4.6, extra usage enabled
- Max 20x ($200/mo) subscription plan
- User wants liberal use of AskUserQuestion to extract better inputs — but NEVER for permission-seeking ("should I proceed?"). See CLAUDE.md § AskUserQuestion Policy.

## PDF Generation → [pdf-generation.md](./pdf-generation.md)
- **3 tools installed**: Typst (npm, best quality), pagedjs-cli (npm, best paged media), WeasyPrint (pip, no Flexbox)
- Typst > Paged.js > Playwright > WeasyPrint for visual quality
- Dark PDFs MUST use `print-color-adjust: exact` or backgrounds get stripped
- Playwright blocks `file://` — serve via `python -m http.server` first
- PrinceXML is gold standard but $495+ (not installed)

## Environment → [environment.md](./environment.md)
- Windows 11 25H2+ (WMIC removed — breaks detached process spawning)
- PowerShell install scripts often fail — use `winget` instead
- `~/.bash_profile` manages PATH for: Node.js, Bun
- **20 MCP servers** top-level only in `~/.claude.json` (consolidated from project-scoped 2026-02-27; Tavily removed)
  - **QMD** added 2026-03-04: local hybrid search (BM25 + vector), 6 tools, CPU mode (`NODE_LLAMA_CPP_GPU=false`; CUDA crashes on 5090)
  - **Scrapling** added 2026-03-01: anti-bot scraping, Cloudflare bypass, self-healing selectors, native MCP (6 tools)
- **3 plugins**: frontend-design, agent-browser (vercel-labs), skill-creator (anthropics/skills)
- VS 2022 Build Tools + CUDA Toolkit 13.1 installed for native Node module compilation
- `MCP_TIMEOUT=30000` in `settings.json` (default 5s too short for heavy MCP servers)
- NPX-based MCPs need full path `C:\Program Files\nodejs\npx.cmd` with PATH env on Windows
- Paper-search uses `uvx` (Python-based)
- **Gemini MCP** (`@rlabs-inc/gemini-mcp`, 30+ tools) — added 2026-02-18, paid Tier 1 API
  - Default model: `gemini-3-pro-preview` (1M context); override via `GEMINI_PRO_MODEL` env var
  - **Gemini 3.1 Pro** launched 2026-02-19: same pricing ($2/$12, $4/$18 at 1M), 2.5x reasoning boost
  - Update env var to `gemini-3.1-pro-preview` for improved reasoning at no extra cost
  - Workflow: "Gemini reads, Claude writes" — delegate >100K context to Gemini, implement in Claude
  - `/gemini` skill at `~/.claude/skills/gemini/SKILL.md`
  - Context caching: `gemini-create-cache` for 90% input cost discount on repeated queries

## Force Opus 4.6 Everywhere
- `CLAUDE_CODE_SUBAGENT_MODEL=claude-opus-4-6` — default for subagents
- `ANTHROPIC_DEFAULT_SONNET_MODEL=claude-opus-4-6` — remaps Sonnet alias to Opus
- `ANTHROPIC_DEFAULT_HAIKU_MODEL=claude-opus-4-6` — remaps Haiku alias to Opus
- Must use full model name (`claude-opus-4-6`), not alias for env vars
- Related GitHub issues: #5456, #13434, #18346, #10993

## Opus 4.6 Prompting Notes
- More responsive to system prompt than prior models; use moderate language not CAPS
- Extended thinking deprecated; use adaptive thinking with effort levels
- Tends to over-engineer and over-spawn subagents; needs explicit guardrails
- State instructions once; it follows precisely without repetition

## Gmail Search Protocol
- **Step 1**: Gemini (`gemini-gmail`) — broad natural language query, cheap tokens, gets the lay of the land
- **Step 2**: Gmail API (`gmail > search_emails`) — targeted Gmail syntax query, returns IDs+subjects+dates (very light)
- **Step 3**: Gmail API (`gmail > read_email`) — ONLY on specific message IDs that matter (expensive: full thread bodies)
- NEVER read full threads blindly; a single long thread can burn 10k+ tokens
- Run Gemini FIRST, then API only if Gemini is too vague or can't surface specifics

## Research Methodology Overhaul (2026-03-03) → [research-methodology-fixes.md](./research-methodology-fixes.md)
13 fixes across 3 Gemini audit rounds. Key changes to CLAUDE.md + both SKILLs:
- **9-step workflow**: SCOPE+Domain Matrix → DISCOVER+BSH → DEEPEN → EXTRACT (before reason) → ORPHAN CHECK → REASON → VERIFY → GEMINI (3-call split-brain) → REPORT
- **Domain Matrix**: 4 mandatory lenses (political, geoeconomic, non-state, historical) with diversity threshold
- **Blind Spot Hunter**: fires during Discovery, references Domain Matrix scope (not analysis)
- **Orphan Check**: one-pass scan for 1-2 mention terms, deep-dive each, no recursion
- **Gemini split-brain**: Blind (independent) → Auditor (SAFE, cache-first) → Actuary (lateral critique). Never combine convergent+divergent.
- **Exa**: mechanism hunter alongside Brave, not after. **Perplexity**: early contested-theory + late synthesis
- **PDF routing**: Jina for HTML/text, Gemini for PDFs (native multimodal)
- Iran analysis deliverable: `~/Downloads/Iran_Analysis_Rebuttal_2026-03-03_v2.pdf`

## Search → [search-protocol.md](./search-protocol.md)
- "Deep search" / "saturated search" = max out all 3 engines
- Target: 60-100+ unique sources, deduplicated across engines

## Pricing & Effort → [pricing-research.md](./pricing-research.md) / [effort-levels.md](./effort-levels.md)
- Opus 4.6: $5/$25 MTok (standard), 6x for fast mode, 2x/1.5x for 1M context
- Max 20x ≈ $2,678-3,650/mo API equivalent — keep for daily coding
- **1M context on Max: always "extra usage"** — NOT included in subscription quota
  - ALL tokens repriced at premium when >200K input (cliff, not marginal) — verified 10+ sources
  - Opus 1M: $10/$37.50; Sonnet 1M: $6/$22.50 per MTok
  - Typical session: $15-37 extra; heavy daily use: ~$1K-1.5K/mo on top of $200 sub
  - Full 1M pricing report: `~/.local/bin/reports/1m-context-pricing-max-subscription-2026-02-18.md`
- Effort medium saves 23% tokens but loses ~4pp on hard tasks — use high for complex work
- Fast mode is ALWAYS extra usage, even on subscription
- Full pricing report: `~/.local/bin/reports/max-vs-api-fast-mode-2026-02-09.md`

## API Setup & Billing Switching
- API tiers: Tier 1 ($5), Tier 2 ($40, 7d), Tier 3 ($200, 14d), Tier 4 ($400, 30d)
- Tier 4 required for 1M context — 30-day wait is the real gate
- Max subscription and API billing are completely separate systems
- Switching: `/logout` → uses ANTHROPIC_API_KEY env var; `/login` → back to subscription
- No automatic fallback from subscription to API yet (GitHub #2944, #3835)
- Workaround: keep two terminal tabs (one subscription, one API)

## Plugins → [plugins.md](./plugins.md)
- claude-mem: UNINSTALLED (2026-02-05) — broken on Win11 25H2+ due to WMIC removal
- Currently using built-in MEMORY.md — revisit claude-mem when Windows bugs are fixed

## Context Preservation Best Practices → [context-preservation.md](./context-preservation.md)
- Core principle: "write to disk, not conversation" — persist decisions to files, not chat history
- **Auto-compact DISABLED** (`~/.claude.json` → `autoCompactEnabled: false`) — all compaction is manual
- `/handover` writes to disk in ONE tool call first (auto-compact resilient) — then updates MEMORY.md after
- **Context Guard hook** auto-warns Claude at 80% and stops it at 90% (no manual monitoring needed)
- Workflow: context guard warns → run `/handover` → `/compact` or `/clear` after
- Handoff > compact: fresh session + 5K handover beats compacted 50K degraded context
- One session per task; `/clear` between unrelated tasks
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` env var exists to set trigger % (default ~95%) if re-enabled
- 5 compaction failure modes: number rounding, conditional collapse, rationale loss, relationship flattening, silent resolution
- Full research: `~/.local/bin/reports/context-preservation-research-2026-02-15.md` (160+ sources)

## Hooks → [hooks.md](./hooks.md)
- **Context Guard** (PreToolUse): warns Claude at 80% ctx, tells it to stop at 90% and suggest /handover
  - Reads `~/.claude/context-pct-cache.json` (written by status line on every refresh)
  - Uses `additionalContext` injection — no hard blocking, Claude follows instructions
- **Gemini Delegate** (PreToolUse, matcher: `Read`): suggests Gemini for large file reads
  - Dynamic threshold: warns when file tokens > 25% of remaining context
  - Absolute floor: never warns for files <40KB (~10K tokens)
  - Suggests: gemini-create-cache, Task subagent summary, or targeted offset/limit
  - Advisory only — never blocks reads
- **PreCompact** hook: backs up transcript + extracts recent context before compaction
- **SessionStart (compact)** hook: re-injects saved context after auto-compact
- **Notification** hook: PowerShell toast notifications
- Scripts at `~/.claude/hooks/` (Node.js, not bash — jq not in PATH on Windows)

## Status Line
- `~/.claude/statusline-command.js` — pure Node.js (bash/MSYS2 fork failures killed the .sh version on Windows)
- Shows: user@host, MSYSTEM, cwd, git branch, **context %**, **5h % + reset countdown**, **7d % + reset countdown**
- Reset countdowns use definitive `anthropic-ratelimit-unified-{5h,7d}-reset` headers (Unix epoch) — no guessing
- Format: `5h:49%(1h52m) 7d:10%(6d)` — days shown when >24h
- Context colors: green <50%, yellow 50-69%, red 70%+
- Plan usage colors: green <50%, yellow 50-79%, red 80%+
- Plan usage via direct Anthropic API probe (1-token Haiku request, reads rate limit headers)
- Plan usage cached to `~/.claude/plan-usage-cache.json` with 5-min TTL — no dependency on api-dashboard
- Also writes `~/.claude/context-pct-cache.json` on every refresh (consumed by context-guard hook)
- OAuth token read from `~/.claude/.credentials.json`

## Git Commit Rules
- **NEVER add `Co-Authored-By` trailers** to commits — user wants sole attribution to `arm3n`
- Commit author is `arm3n <arm3n@users.noreply.github.com>` — do not use "Armen" or "armen"

## Gaming PC → [gaming-optimization.md](./gaming-optimization.md)
- i9-13900K + RTX 5090 + 32GB DDR5-6000, 5120x2160 165Hz G-Sync
- **Optimized 2026-02-27**: 7 fixes applied, 3 skipped (Gemini low-impact), 137+ sources
- Key corrections: Balanced power plan, NVCP V-Sync ON, driver-level cap 162, DLSS Balanced at 5K2K
- VBS on 25H2 requires BIOS VT-x disable (registry/bcdedit insufficient)
- Driver: 591.86 (595.59 pulled); NV Profile Inspector CLI broken — use NVCP GUI
- Full completion report: `~/gaming-optimization/COMPLETED-2026-02-27.md`

## Tesla Model X (Owned) → [tesla-model-x-buying.md](./tesla-model-x-buying.md)
- **Purchased:** 2023 Model X Plaid, Feb 2026. 22" Turbine wheels.
- **WTPP:** $25/mo, covers wheels+tires for road hazard. Keep ALL tire service at Tesla (third-party tires void wheel coverage).
- WTPP decision report: `~/tesla-wtpp-decision-report-2026-02-26.md` (65+ sources)
- Tesla ESA: $150/mo, subscribe before factory warranty expires (~2027)
- Best third-party warranty: XCare EV or Amber; AVOID CarShield/Endurance
- ESA/warranty research: `~/tesla-esa-vs-third-party-warranty-research.md`

## API Dashboard → [api-dashboard.md](./api-dashboard.md)
- `~/api-dashboard` — Node.js/Express on `127.0.0.1:3456`, GitHub dark theme
- Tracks 6 services: Claude plan usage, Perplexity, Brave, Exa, Gemini, Jina
- Perplexity: `pwm.EXE` scrapes web session (`perplexity-web-mcp-cli` v0.7.1)
  - **Pro Search limit is 200** (not 300) — confirmed 2026-03-01
  - Pro resets weekly; Deep Research resets monthly
  - Old `perplexity_*` MCP tools ≠ new `pplx_*` tools (different servers, different billing)
  - JSONL tool call counts ≠ successful searches (many fail silently)
- Brave: polls every 5min (costs 1 query each), free tier 2,000/month
- Exa/Gemini/Jina: counted from JSONL session files (MCP tool_use blocks)
- Conversation history browser at `/history.html` with full-text search + export

## Polymarket MM Bot → [polymarket-mm-bot.md](./polymarket-mm-bot.md)
- `~/polymarket-mm-bot/` — hedged liquidity provision bot for Polymarket CLOB
- Research complete (200+ sources, Gemini-reviewed). Paper is AI-generated but strategy is real.
- Realistic returns: 15-30% APY (NOT the paper's 790% APY fantasy)
- CRITICAL risks: adverse selection, capital asphyxiation (need mergePositions), regulatory (CEA)
- Config: $5K-$25K, Python, dev local + EU VPS, single account

## Grok (xAI) → [grok-xai-research.md](./grok-xai-research.md)
- **Decision: NOT ADDED** (2026-03-02, 60+ sources, Gemini consensus 9/10)
- Only unique value: real-time X/Twitter search via `x_search` ($5/1K calls) — no other tool does this
- 90% redundant with existing stack (Brave, Exa, Perplexity, Gemini cover everything else)
- 2M context at $0.20/MTok (cheapest) but **hidden 128K cliff doubles price** to $0.40; cached stays $0.05
- Caching is automatic-only (no named caches, no TTL) — inferior to Gemini's explicit caching for repeated queries
- X sentiment is noise for MM bots; marginal signal for directional trading only
- Revisit if: need >1M context (Gemini ceiling), pivot to directional prediction trading, or need live X data

## Gemini Sessions → [gemini-sessions/](./gemini-sessions/)
- One file per session: `gemini-sessions/YYYY-MM-DD-topic.md`
- Source files at `~/.claude/gemini-sessions/` (persist on disk; caches expire after 24h TTL)
- **Rehydration rule**: On session resume, ALWAYS recreate caches from source files. Assume TTL expired.
- Active caches (recreate from source files if expired):
  - `noritz-nrc111sv-repair-vs-replace-2026-02-28` (100+ sources, water heater EC 92 analysis)
  - `nioh3-parry-deflect-research-2026-02-23` (55+ sources)
  - `synology-nas-docker-gluetun-fix-2026-02-24` (NAS docker setup)
  - `firecrawl-jina-mcp-research-2026-02-24` (Firecrawl removal + Jina Reader eval, 7 MCPs compared)
  - `prep-zone-redesign-2026-02-24` (15 key files: handover, plan, all components/layouts/pages/config)

## Private Repo Sharing (2026-03-03)
- GitHub has NO native "anyone with link can view" for private repos — feature request open since 2016, no roadmap
- **Safe options**: GitFront (deploy key, read-only, single repo), PrivateGitHub.link (self-hostable, fine-grained PAT), GitShare (expiring links + analytics, credit-based pricing)
- **AVOID GitPeek** (git-peek-five.vercel.app): requests full `repo` OAuth scope (read/WRITE to ALL repos), 6 commits from single dev (Jul 2025), no security audit, no caching (burns GitHub API rate limit). OAuth scope is hardcoded server-side — cannot be changed by user.
- Personal repos have NO read-only collaborator role — only orgs support Read/Write/Admin granularity
- Full research: 100+ sources across Brave/Exa/Perplexity/Jina in this session

## Key Config Files
- Skills: `~/.claude/skills/{deep-research,handover,gemini}/SKILL.md`
- Hooks: `~/.claude/hooks/{context-guard,gemini-delegate,pre-compact,post-compact}.js`
- Status line: `~/.claude/statusline-command.js`
- Reports: `~/.local/bin/reports/` (pricing, context preservation, 1M pricing)
