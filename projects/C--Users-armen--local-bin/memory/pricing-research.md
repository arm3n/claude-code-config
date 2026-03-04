# Claude Opus 4.6 Pricing Research (2026-02-09)

Full report: `~/.local/bin/reports/max-vs-api-fast-mode-2026-02-09.md` (140+ sources)

## Token Pricing Matrix

| Mode | Input/MTok | Output/MTok | Multiplier |
|------|-----------|-------------|------------|
| Standard (≤200K) | $5 | $25 | 1x |
| 1M Context (>200K) | $10 | $37.50 | 2x/1.5x |
| Fast (≤200K) | $30 | $150 | 6x |
| Fast + 1M (>200K) | $60 | $225 | 12x/9x |
| Batch | $2.50 | $12.50 | 0.5x |
| Cache read | $0.50 | — | 0.1x |
| Cache write (5min) | $6.25 | — | 1.25x |

## Subscription Plans
- Free: $0, Sonnet/Haiku only, limited
- Pro: $20/mo, ~45 msg/5hr, all models
- Max 5x: $100/mo, ~225 msg/5hr — BEST VALUE (74x API equivalent)
- Max 20x: $200/mo, ~900 msg/5hr (only 2x weekly limit vs 5x plan)
- Team: $25-150/seat/mo
- Enterprise: custom

## Key Findings

### Max 20x API Equivalent Value
- ~$2,678/mo (Reddit token math)
- ~$3,650/mo (Reddit instrumentation study)
- 18.3x cheaper than API (instrumentation)
- Max 5x is 74x multiplier vs Max 20x at 13x — 5x is the sweet spot

### Fast Mode
- Same model, 2.5x faster output, 6x cost
- 50% intro discount until Feb 16, 2026
- ALWAYS billed as extra usage (even on subscription)
- Switching mid-conversation reprices ENTIRE context at fast uncached rate
- Fast/standard modes do NOT share prompt cache — switching = cache miss
- Fast mode >200K = 12x standard pricing ($60/$225)
- Net cost efficiency: 2.4x more per unit of work per unit of time (6x cost / 2.5x speed)
- ROI positive for developers earning $50+/hr

### 1M Context Window
- API Tier 4+: works reliably with `anthropic-beta: context-1m-2025-08-07`
- Max subscription: repeatedly broken (Issues #15057, #23700, #23472, #23822)
- Enable in Claude Code: `/model opus[1m]`
- Bigger context = more input tokens per turn (3-4x) = higher cost
- Blended 200k/1M pricing depends on session length distribution

### Adaptive Thinking (Hidden Cost)
- Opus 4.6 uses ~5x more tokens than 4.5 due to adaptive thinking
- Thinking tokens billed as output @ $25/MTok
- This is the #1 cost optimization for API users
- See detailed effort level notes: [effort-levels.md](effort-levels.md)

### Subscription Risk Factors
- Quota burn rate: 10x variance documented (GitHub #22435, mitmproxy analysis)
- 522-thumbs-up issue: instant limit hits on Max 20x (#16157)
- MCP server requests may incur hidden API costs (Issue #1785)
- Third-party tool access blocked (Jan 2026 OAuth crackdown)

## Cost Scenarios (Full Max 20x Intensity)

| Scenario | Monthly Cost | Context | Speed |
|----------|-------------|---------|-------|
| Max 20x subscription | $200 | 200K | Standard |
| API standard (200K) | ~$75 | 200K | Standard |
| API standard (effort:medium) | ~$90-150 | 200K | Standard |
| API 1M context | ~$275-325 | 1M | Standard |
| API 1M + effort:medium | ~$200-325 | 1M | Standard |
| API 1M + 30% fast | ~$450 | 1M | Mixed |
| Max + fast extra | ~$317 | 200K | Mixed |

## Recommendation
- **Daily coding**: Keep Max 20x (absorbs 5x thinking overhead)
- **Deep work needing full context**: API with `opus[1m]` + `effort:medium`
- **Optimal**: Hybrid — Max for daily, API key for 1M sessions
- **Effort**: Use medium for routine work, high for complex tasks (see effort-levels.md)

## Competitive Context
| Model | Input/MTok | Output/MTok | Context |
|-------|-----------|-------------|---------|
| Opus 4.6 | $5 | $25 | 1M beta |
| GPT-5.2 | $2.50 | $10 | 128K |
| Gemini 3 Pro | $1.25 | $5 | 1M |

Opus 4.6 is 2-4x pricier but +144 Elo vs GPT-5.2. Gemini 3 Pro is 1.8x faster than standard Opus at 0.45x price.
