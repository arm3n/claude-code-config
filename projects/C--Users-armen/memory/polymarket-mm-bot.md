# Kalshi Trading Bot (formerly Polymarket Multi-Strategy)

## Project
- Location: `~/polymarket-mm-bot/`
- Beads: prefix `polymarket-mm`, SQLite, stealth mode
- Plan: `~/.claude/plans/polymorphic-stirring-flamingo.md` (NEEDS MAJOR REWRITE for Kalshi-only hybrid strategy)
- Master research: `~/polymarket-mm-bot/research/beyond-mm-comprehensive-research-2026-03-02.md` (358+ sources)
- LLM ensemble research: `~/reports/llm-ensemble-forecasting-edge-2026-03-04.md` (200+ sources)
- Gemini review: `~/polymarket-mm-bot/research/gemini-critical-review-beyond-mm-2026-03-02.md`
- Strategy handover: `~/.claude/handovers/HANDOVER-2026-03-05-kalshi-strategy-research.md`
- GitHub: `arm3n/polymarket-mm-bot` (private), master branch, 5 commits
- **PLATFORM: Kalshi ONLY** (user is US-based, dropped Polymarket 2026-03-05)

## Origin
- Viral tweet @xmayeth Mar 2 2026 (567K views) — "leaked" paper from top-20 quant team
- Paper is AI-generated marketing fluff. But underlying strategy (hedged LP) is real.
- Expanded from pure MM to multi-strategy after 358+ source deep research + Gemini review

## Revised Strategy (Hybrid, Kalshi-Only, Staged Scaling)
- **Stage 1** ($5-10K, validate): MM on 5-10 liquid markets + LLM screening. Prove signal.
- **Stage 2** ($25-50K, scale): 15-25 markets, MM + directional + high-prob bonds. $2-6K/mo target.
- **Stage 3** ($50-100K+, optimize): Full hybrid, 20-40 markets. $4-15K/mo target.
- Three revenue layers: spread capture + LLM-screened directional bets + high-probability bonds
- **FRAME SHIFT (2026-03-05)**: Pure MM insufficient for small operator. Top earners are directional specialists (96% win rate, Gemini-verified). LLM highest value as market screener, not continuous quoter (MIT/Kalshi paper arXiv:2602.07048).

## LLM Estimator Research (Gemini-verified 2026-03-04 + 2026-03-05)
- **Models**: gpt-5-mini (Brier 0.155, $0.25/$2.00) + Gemini 2.5 Flash (Brier 0.179, $0.30/$2.50)
- **AVOID**: GPT-4o-mini (Brier 0.239, worse than random on politics 0.296); extended reasoning modes (worsen calibration per KalshiBench)
- **Refresh**: 10-15 min political, 5 min sports, event-triggered overlay. WebSocket fast loop for A-S.
- **Cost**: ~$10-80/mo total with prompt caching (90% reduction). LLM cost is irrelevant to profitability.
- **No flat-rate API subs exist** for Gemini or OpenAI (Claude Max is unique). All pay-per-token.
- **Cerebras free tier**: 1M tokens/day — potential free 3rd ensemble member (Llama 4 Scout)
- **Key papers**: FutureSearch (arXiv:2601.22444), KalshiBench (arXiv:2512.16030), LinqAlpha/MIT (arXiv:2602.07048)

## Strategy Categories (Kalshi-only, ranked for small operator)
1. Domain specialization + LLM screening — "only place retail has structural alpha" (Gemini)
2. Hedged market making (10-25 markets) — spread capture + structural "optimism tax"
3. High-prob bonds (>95% outcomes) — 15-40% APY, capital parking between opportunities
4. AI/ML ensemble prediction — gpt-5-mini + Gemini Flash, 10-15 min refresh
5. ~~Cross-platform arb~~ — N/A (Kalshi-only)
6. ~~Speed/latency trading~~ — N/A (no 5/15-min crypto on Kalshi)

## Gemini Critical Review (2nd Round)
- Cross-platform arb is "mathematically illiterate" for micro-capital but viable at $200K+
- High-prob bonds are "financial suicide" due to oracle manipulation risk
- AI/ML is "academic science fair, not a trading strategy" — predicting ≠ profiting
- Domain specialization is the ONLY real edge for retail
- Behavioral alpha > algorithmic speed as markets get more irrational
- "Start small, harden, scale" approach is correct

## Capital
- Start: $25-50K to harden
- Scale: $500K-2M as patterns prove (user confirmed available)
- Scaling gate: 60+ consecutive days positive P&L before increasing capital

## Key Tech Stack
- py-clob-client v0.34.6 (Polymarket Python SDK)
- Kalshi API (REST + WebSocket, RSA-PSS auth)
- Reference: poly-maker, Polymarket/agents, pmxt, terauss Rust arb bot
- On-chain: Polygon, ERC-1155, CTF mergePositions (CRITICAL)
- Backtesting: NautilusTrader or Hummingbot (A-S implementation)
- LLM ensemble: gpt-5-mini (Brier 0.155) + Gemini 2.5 Flash (Brier 0.179) + Haiku 4.5 (later)

## CRITICAL Risks
1. **Adverse selection** — insiders pick off resting orders. 8 documented cases in 12mo.
2. **Capital asphyxiation** — without mergePositions, capital locks up
3. **Regulatory** — 20+ state lawsuits, CFTC enforcement advisory, SDNY prosecutions warned
4. **Oracle manipulation** — $7M UMA attack (Mar 2025), $215M Zelenskyy market (Jul 2025)
5. **Platform security** — Dec 2025 auth breach drained accounts
6. **Edge decay** — taker fees (Jan 2026), institutional MMs entering

## Implementation Status (as of 2026-03-03 session 8)
- **Core architecture COMPLETE + hardened**: 22 source files, 11 test files, **135 tests passing**
- **py_clob_client NOW INSTALLED** (v0.34.6, pre-built wheel — no Rust needed)
- **pytest-asyncio NOW INSTALLED** (v1.3.0) — 7 previously-skipped async test files now run
- **Gemini R5+R6+R7+R8+R9**: ALL findings resolved
- Session 8: R9 review + 6 fixes, committed 96533ae
- 24 commits on master (96533ae), pushed to `arm3n/polymarket-mm-bot` (private)

## Gemini Codebase Reviews
- **Review #3** (2026-03-02): 10 findings, 3 P1 critical — ALL FIXED
- **Review #4** (2026-03-03): 14 findings, 4 P1 critical — ALL P1 FIXED, ALL P2 FIXED
- **Review #7** (2026-03-03): 14 findings (3 P0, 4 P1, 4 P2, 3 P3) — **ALL FIXED** (session 6)
  - 12 real findings fixed in commit f33b161
  - 2 Gemini false positives caught: price scaling (correct) and sell handling (N/A)
- **Review #8** (2026-03-03): 7 findings (1 P0, 4 P1, 2 P2) — **6 FIXED, 1 false positive** (session 7)
  - P0-1: consume_merge now returns (usdc, realized_pnl); total_capital updated on merge
  - P1-1: Reconciliation respects interval even when WS disconnected
  - P1-3: Network failure in reconcile_gone_order returns early (retry next cycle)
  - P1-4: Paper order IDs use monotonic counter, not len(deque)
  - P2-1: Arb size floored to int for both legs
  - P2-2: stop() halts orders before cancel_all
  - FALSE POSITIVE: P1-2 dict iteration — break after await prevents RuntimeError
  - Used Gemini context cache (full codebase, 310KB, all src+tests) for comprehensive review
- **Review #9** (2026-03-03): 7 findings (1 P0, 4 P1, 1 P2, 1 P3) — **6 FIXED, 0 false positives** (session 8)
  - P0: Partial fill orders now included in open_yes/no_orders, locked capital, reconciliation, emergency cancel
  - P1: Unresolved WS fill tokens return early (prevents phantom NO position corruption)
  - P1: Pending merge timeout check added to exception handler (web3 version safety)
  - P1: Kalshi SPX strike extraction tries title first (T5800/100=58.0 was wrong)
  - P2: NegRisk market registration wired up in _rescan_markets
  - P2: Stale order cancellation moved before ladder building (locked capital double-counting)
  - P3: Unused DataRecorder methods — skipped, not a bug
  - Also fixed: missing `import asyncio` in market_selector.py (Gemini missed this!)
  - Cache: `polymarket-mm-bot-r9-review`, full codebase 312KB
- **Review protocol**: Cache ENTIRE codebase in Gemini 1M context, not sampling. System instruction demands every file, every function.
- py-clob-client is synchronous — thread pool chokes beyond ~10-20 markets

## IMPORTANT: R9 API changes
- `MarketQuotes.open_yes_orders`/`open_no_orders` now include `"partial"` status (not just `"open"`)
- `_push_locked_capital` counts `"partial"` orders' remaining size
- `_cancel_market_orders_unlocked` cancels `"partial"` orders too
- Reconciliation (`_reconciliation_loop`) checks `"partial"` orders for staleness
- `reconcile_gone_order` handles `"partial"` status orders
- `_on_fill` returns early if token_id cannot be resolved to market/side
- `_check_pending_tx` exception handler now has 600s timeout (same as None-receipt path)
- `NormalizedMarket` has new field `neg_risk: bool = False`
- Scanner: Kalshi strike extraction tries title BEFORE ticker (fixes SPX T-format division by 100)
- `_refresh_quotes_unlocked`: cancels stale orders BEFORE building ladder (not after)
- `market_selector.py` now imports `asyncio` (was missing but used for Semaphore/gather)

## IMPORTANT: R8 API changes
- `HedgedPosition.consume_merge()` now returns `tuple[Decimal, Decimal]` — `(usdc_recovered, realized_pnl)`, NOT just `Decimal`
- `MergeResult` has new field `realized_pnl: Decimal`
- `PolymarketClient._paper_order_seq: int` — monotonic counter for paper order IDs
- `KalshiClient._paper_order_seq: int` — same for Kalshi paper IDs
- `reconcile_gone_order()` returns `False` early if `get_order()` returns None (network failure)

## Beads (3 open, 51 closed, 54 total)
- Session 6 CLOSED: cxu, hnq, 7q0, k7q, d47, 44f (all R7 fixes)
- OPEN: 6e9 (P1 manual infra), 44s (P2 LLM ensemble, blocked by 6e9), lm0 (P4 $500K-2M)

## IMPORTANT: API changes
- `handle_fill` is now `async def` — must be `await`ed
- `MarketQuotes.yes_order`/`no_order` → `yes_orders`/`no_orders` (lists)
- `TICK` constant → `DEFAULT_TICK`
- Use `to_decimal()` from `src/utils/decimals.py` for all float→Decimal conversions
- `MarketScore` has `correlation_group` field (from event slug)
- Toxicity uses z-scores after 30-sample warmup; fixed thresholds remain as hard caps
- `_extract_strike()` returns 3-tuple `(text, value, boundary_type)` — NOT 2-tuple
- `PolymarketClient` has `halt_orders()`/`resume_orders()`/`is_halted` + `get_order()` for single-order REST query
- `PlatformOrder.status` can be: "paper", "halted", "failed", "submitted", "open", "partial", "filled", "cancelled", "reconciled_gone"
- `Dashboard` at `src/dashboard.py` — aiohttp on `config.dashboard_host:config.dashboard_port` (default 127.0.0.1:8080)
- `DataRecorder` at `src/data_recorder.py` — Parquet archiving to `config.data_dir` (default "data/")
- `RewardTracker.summary()` returns `dict[str, Any]` (not `dict[str, float]`) — includes `_calibration_ratio`, `_total_actual_rewards` keys
- `CapitalRecycler` has `matic_usd: float` param, `_pending_txs` dict, `_get_gas_params()` for EIP-1559
- `pyarrow>=15.0` added to dependencies
- `handle_fill` split into locked (`handle_fill`) and unlocked (`_handle_fill_unlocked`) variants
- `update_mid_price()` RENAMED to `update_book_prices(best_bid, best_ask)` — old name no longer exists
- `ArbExecutor` at `src/arb_executor.py` — uses `TYPE_CHECKING` imports to avoid py_clob_client chain
- `ArbConfig` in `src/config.py` — env prefix `ARB_`, 8 fields (min_profit_cents=3, max_positions=5, etc.)
- `ActiveArb` in `src/platforms/types.py` — tracks dual-platform order state
- `KalshiClient.get_order(order_id)` added for fill status checking
- `PolymarketClient` has `_executor: ThreadPoolExecutor(32)` — `close()` calls `shutdown(wait=False)`
- `OrderManager.prune_completed_orders()` — called every 60s, keeps only open/partial
- `RiskState._group_members: dict[str, set[str]]` — inverted index for O(1) group lookups
- `RiskState._fills` deque maxlen increased from 500 to 1500 for 15-market coverage
- `max_markets` default changed from 5 to 15
- All cancel ops in OrderManager now use `asyncio.gather` (batch parallel)
- Quote refresh in engine main loop now uses `asyncio.gather` (parallel across markets)
- Market scoring uses `asyncio.Semaphore(10)` for parallel orderbook fetches
- `RollingStats` uses O(1) incremental `_sum`/`_sum_sq` accumulators (not Welford's per se, but same O(1) goal)
- `CapitalRecycler.private_key` is now `SecretStr` (not `str`) — use `.get_secret_value()` at signing point
- `OrderManager._toxic_cooldown: dict[str, float]` — 30s cooldown after toxic cancellation
- `ArbExecutor._history` is now `deque(maxlen=500)` (not list)
- `ArbExecutor.status` can be `"single_leg_risk"` — retry cancel via `_retry_single_leg_cancel()`
- `_redact_sensitive` structlog processor scrubs 8 sensitive key names (private_key, api_key, etc.)
- `_on_fill` resolves `token_id` → `(market_id, outcome)` via `_order_manager._quotes` scan
- Gemini R5 review: `research/gemini-code-review-r5-2026-03-03.md`
- Gemini R6 review: `research/gemini-code-review-r6-2026-03-03.md`
- Gemini R7 review: `research/gemini-code-review-r7-2026-03-03.md`

## Statistics (358+ sources)
- 7.6% of wallets profitable, 0.51% earned >$1K
- 73% of arb profits go to sub-100ms bots
- 25% of volume is wash trading (Columbia University)
- $40M arb profits extracted Apr 2024 - Apr 2025
- Arb windows: 2.7 seconds avg (down from 12.3s in 2024)
- Platform total: $64B industry volume in 2025. Polymarket + Kalshi = 85-90%.
