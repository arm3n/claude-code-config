# Kalshi Strategy Audit (2026-03-05)

## Overview
3-session deep research audit for automated Kalshi prediction market trading bot. 360+ total sources, Gemini-verified.
- User parameters: $50K-$200K capital, EV-positive variance accepted
- Session 1: Price Extremes & Calibration (120+ sources)
- Session 2: Information Edges (120+ sources)
- Session 3: Market Microstructure (100+ sources)

## Reports
- `~/reports/kalshi-price-extremes-strategy-audit-2026-03-05.md` — Session 1
- `~/reports/kalshi-information-edges-strategy-audit-2026-03-05.md` — Session 2
- `~/reports/kalshi-market-microstructure-strategy-audit-2026-03-05.md` — Session 3

## Handovers
- `~/.claude/handovers/HANDOVER-2026-03-05-kalshi-microstructure-audit.md` — Latest (Session 3)
- `~/.claude/handovers/HANDOVER-2026-03-05-kalshi-information-edges-audit.md` — Session 2
- `~/.claude/handovers/HANDOVER-2026-03-05-kalshi-price-extremes-audit.md` — Session 1

## Top 3 Strategies (Final Ranking)
1. **Market-making in underserved categories** (Weather+Sports) — +1.12% structural maker edge, exploits Optimism Tax + FLB + YES/NO asymmetry
2. **Intra-platform lead-lag** (Kim et al. arXiv:2602.07048) — +205% PnL via Granger causality + LLM semantic filter on Kalshi Economics, daily holds
3. **Weather bleeder-side MM** — 5-10c edges, slow convergence + 2.57pp maker-taker gap

## Critical Findings
- **Theta doesn't exist in prediction markets** — category error from options framework
- **Be a maker, not a taker** — takers lose -1.12% across 72.1M trades (Becker 2026)
- **Cross-platform arb is dead for retail** — 2.7s lifespan, 73% captured by sub-100ms bots
- **Mean-reversion doesn't survive costs** — Moskowitz (JoF) confirms for sports
- **Manipulation persists 60 days** — Rasooly & Rozzi, 817 markets
- **25% of Polymarket volume is wash trading** — Columbia SSRN 5714122
- **Kim et al. has ZERO transaction cost modeling** — real returns likely lower

## Beads (Task Tracking)
> Consolidated into `kalshi-bot.md` § Beads (2026-03-06). Strategy beads are under P3.
| ID | Subject | Status |
|----|---------|--------|
| 1-3 | Sessions 1-3 research | completed |
| 4 | Synthesize into final strategy table | pending → kalshi-bot.md `strategy-synthesis` |
| 5 | Replicate Kim et al. pipeline | pending → kalshi-bot.md `kim-replicate` |
| 6 | Build MM bot (Weather+Sports) | completed (kalshi-weather-mm deployed) |
| 7 | Tax consultation (Section 1256) | pending → kalshi-bot.md `tax-consultation` |
| 8 | Verify Kim et al. post-2025 performance | pending → kalshi-bot.md `kim-verify` |

## Key Academic Papers
- Kim et al. arXiv:2602.07048 — LLM lead-lag (+205% PnL, Kalshi Economics)
- Saguillo et al. arXiv:2508.03474 — $39.6M Polymarket arb on-chain
- Rasooly & Rozzi arXiv:2503.03312 — 60-day manipulation persistence
- Gebele & Matthes arXiv:2601.01706 — 1,218% cross-platform arb (TU Munich)
- Becker (jbecker.dev 2026) — 72.1M trade maker/taker analysis
- Sirolly et al. SSRN 5714122 — 25% wash trading (Columbia)
- Diercks/Katz/Wright (Fed 2026) — Kalshi beats Bloomberg CPI

## Operational Warnings
- Jina extraction agents: split into 1-2 URLs each — large batches stall silently
- Gemini-search: MUST call sequentially (parallel fails)
- Kalshi fee rounding: 50% effective fee on $0.02 single-contract fills
- Tax phantom income: cross-platform arb may create untaxable losses if crypto/1256 can't net
- Polymarket API: 60 orders/minute hard cap
- Kalshi API: public for market data, no auth needed for prices
