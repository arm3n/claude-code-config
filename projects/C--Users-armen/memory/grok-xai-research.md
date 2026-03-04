# Grok (xAI) Research — 2026-03-02

## Decision: NOT ADDED (yet)
Grok evaluated for Claude Code ecosystem (server #20). Verdict: skip for now. Revisit if directional prediction market trading or >1M context needs arise.

## Research Reports (saved to ~/)
- `~/grok-xai-research-2026-03-02.md` — API capabilities, models, pricing, benchmarks, MCP servers
- `~/grok-prediction-market-edge-research-2026-03-02.md` — real-time trading edge, X sentiment, latency
- `~/grok-mcp-integration-feasibility-2026-03-02.md` — integration feasibility, redundancy, cost

## Key Models & Pricing
| Model | Context | Input $/MTok | Output $/MTok | Cached $/MTok |
|---|---|---|---|---|
| grok-4-1-fast-reasoning | 2M | $0.20 | $0.50 | $0.05 (75% off) |
| grok-4-0709 (Grok 4) | 256K | $3.00 | $15.00 | $0.75 (75% off) |
| grok-code-fast-1 | 256K | $0.20 | $1.50 | $0.02 (90% off) |

### Hidden 128K Pricing Cliff (NOT on official docs page)
- >128K tokens: input doubles to $0.40/MTok, output to $1.00/MTok
- Cached rate stays flat at $0.05/MTok regardless of context length
- Full 2M uncached = ~$0.78/request; cached = ~$0.10
- Sources: OpenRouter metadata, Techloy, PromptLayer

## Unique Value: Only Real-Time X/Twitter Search
- `x_search` API tool ($5/1K calls) — query-initiated, NOT streaming firehose
- Returns natural language summaries with citations, NOT structured JSON (no engagement metrics)
- Consumer Grok processes 68M posts/day from firehose; API does NOT expose this
- xAI's own sentiment cookbook uses X API v2 Filtered Stream, not x_search

## Caching: Automatic Only (vs Gemini Explicit)
- No named caches, no TTL control, no cache IDs
- Prefix-based KV-cache matching — probabilistic, not deterministic
- `x-grok-conv-id` header improves cluster routing affinity (no guarantee)
- Responses API (`/v1/responses`) has `previous_response_id` for server-side conversation state (30-day retention) — closest analog to gemini-create-cache
- Chat Completions API is deprecated/legacy
- No Gemini-equivalent MCP server exists for large-context caching workflow

### Why Gemini Caching Remains Superior
- Explicit: create named cache → set TTL → guaranteed hits → 90% discount
- Grok: send prompt → hope prefix cached → 75% discount → no persistence guarantee
- Gemini charges storage ($1-4.50/MTok/hr); Grok has $0 storage but unreliable hits
- For "cache codebase, query 10+ times" workflow: Gemini wins decisively

### Where Grok 2M Context Would Win
- One-shot mega-context analysis exceeding Gemini's 1M ceiling
- Budget-constrained repeated queries (4-8x cheaper if cache holds)
- Codebase + live X data in same context window (unique capability)

## Collections (RAG Alternative)
- Managed RAG: upload docs → semantic+keyword hybrid search → $2.50/1K searches
- Up to 100MB/file, 100K files/account, 100GB storage
- Alternative to context stuffing for "find relevant code" queries
- Worse for full-architecture understanding (need model to see everything)

## Prediction Markets: X Sentiment = Noise for MM
- Alpha Arena S1 (crypto): Grok lost -45.3% — "worst kind of reactive trader"
- Alpha Arena S1.5 (stocks): Grok won +12.11% — but directional, not MM
- For hedged MM: sentiment adds lag, worsens adverse selection (the #1 failure mode)
- Polymarket-X partnership (June 2025) is consumer integration, not alpha signal

## Redundancy: 90% Overlap with Existing Stack
- Web search: Brave, Exa, Perplexity already cover
- Reasoning: Claude Opus 4.6, Perplexity already cover
- Large context: Gemini 1M already covers (with better caching)
- Only gap: live X/Twitter search — nothing in current 19 servers does this

## MCP Servers (If Needed Later)
- `guzus/grok-mcp` — Python/uvx, X search focused, citations
- `stat-guy/grok-search-mcp` — JS/npx, structured web+news+X analysis (best fit for Windows)
- `merterbak/Grok-MCP` — most feature-complete (vision, gen)
- All single-digit contributor repos, immature ecosystem

## Gemini's Take (9/10 consensus)
- "Textbook Shiny-Object Syndrome"
- Tool-calling accuracy degrades as tool count increases — 20th server adds routing noise
- Gap is in execution of Polymarket bot, not in capabilities
- Suggested pruning existing stack rather than expanding

## If Reconsidering
- Use `grok-4-1-fast-reasoning` via `stat-guy/grok-search-mcp` (npx, Windows-friendly)
- Budget: ~$11/month at 50-100 queries/day
- $25 signup credit (one-time) — zero risk to test
- Don't add to main MCP config — run standalone to avoid tool-routing bloat
- For 2M context: use Responses API + `previous_response_id`, not Chat Completions
