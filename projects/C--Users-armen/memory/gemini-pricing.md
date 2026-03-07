# Gemini 3.1 Pro Pricing & Caching (verified 2026-03-06, 47 sources + Gemini audit)

## Context Window
- **1M tokens max** (1,048,576 input, 64K-65K output)
- NOT 2M — that was Gemini 1.5 Pro. Multiple sources incorrectly claim 2M for 3.1 Pro.

## API Pricing (two tiers, 200K cliff)

| Context tier | Input/MTok | Output/MTok | Cached read/MTok |
|---|---|---|---|
| <= 200K tokens | $2.00 | $12.00 | $0.20 |
| > 200K tokens | $4.00 | $18.00 | $0.40 |

- **Cliff pricing**: once total input exceeds 200K, ALL tokens reprice at higher tier (no blending)
- Same 2x/1.5x cliff structure as Opus 4.6 ($5/$25 -> $10/$37.50)
- Gemini is ~2.5x cheaper than Opus at every context size
- Batch API: 50% discount (24hr delivery window)
- Thinking tokens billed as output — can be 5K-20K tokens at High level

## Context Caching

### Implicit (automatic, free)
- Minimum: 4,096 tokens for Gemini 3.1 Pro
- No storage cost, no guaranteed savings
- ~33% hit rate (only public data point, from r/n8n)
- Tip: identical prefix content, rapid successive calls

### Explicit (manual, guaranteed)
- Minimum: 4,096 tokens (was 32,768 on older models — Gemini confirmed the reduction)
- Cache write: standard input rate (one-time)
- Cache read: $0.20/MTok (<=200K) or $0.40/MTok (>200K) — **90% discount**
- Storage: **$4.50/MTok/hour** (this is the hidden cost killer)
- Default TTL: 1 hour (configurable, min ~300s)
- Warning: 10M cached continuously = $45/hr = $1,080/day

### Break-even
- At 50K cache, 3 calls: caching is SLIGHTLY MORE expensive than uncached ($0.49 vs $0.43/task)
- Break-even at ~3.6 calls per cache TTL window (including creation cost)
- At 10+ calls: explicit caching clearly wins (60-70% savings)

## User's Verification Workflow Cost
- 3-call split-brain, ~50K context/task, ~40 tasks/month
- Uncached: ~$0.43/task → **~$17/month**
- Explicit cache: ~$0.49/task → ~$20/month (worse!)
- Implicit cache (~33% hit): ~$0.38/task → **~$15/month** (best)

## Recommendations
1. Do NOT use explicit caching for 3-call workflows — storage exceeds savings
2. Use implicit caching: fire 3 calls rapidly with identical prefixes
3. Stay under 200K total tokens per call — the single biggest cost lever
4. Monthly Gemini bill is ~$15-20 — no action needed

## Gotchas
- Safety-rejected requests still consume full tokens (3.1 Pro runs inference then refuses)
- Cached tokens still count toward 200K cliff threshold
- No free tier for 3.1 Pro (unlike Flash)
- Known bug: some Tier 1 accounts get `max_total_token_count=0` error on explicit caching

## Reports
- GPT-5.4 research (75+ sources): `~/Downloads/GPT-5.4-Research-Report-2026-03-06.md`
- Gemini pricing agent reports: saved in agent task output files
