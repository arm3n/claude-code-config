# Polymarket Multi-Strategy Trading Operation

## Project
- Location: `~/polymarket-mm-bot/`
- Beads: prefix `polymarket-mm`, SQLite, stealth mode
- Plan: `~/.claude/plans/precious-swinging-lampson.md` (STALE — needs rewrite for multi-strategy)
- Master research: `~/polymarket-mm-bot/research/beyond-mm-comprehensive-research-2026-03-02.md` (358+ sources)
- Gemini review: `~/polymarket-mm-bot/research/gemini-critical-review-beyond-mm-2026-03-02.md`
- Handover: `~/.claude/handovers/HANDOVER-2026-03-03-gemini-r5-fixes.md`
- GitHub: `arm3n/polymarket-mm-bot` (private), master branch, 5 commits

## Origin
- Viral tweet @xmayeth Mar 2 2026 (567K views) — "leaked" paper from top-20 quant team
- Paper is AI-generated marketing fluff. But underlying strategy (hedged LP) is real.
- Expanded from pure MM to multi-strategy after 358+ source deep research + Gemini review

## Revised Strategy (Multi-Strategy, Staged Scaling)
- **Stage 1** ($25-50K, 2-3mo): Harden systems, paper trade, prove P&L for 60+ days
- **Stage 2** ($100-250K, 3-6mo): Validated scaling, activate cross-platform arb + directional
- **Stage 3** ($500K-2M, 6-12mo): Full multi-strategy operation
- Allocation at scale: 40% hedged MM + 25% cross-platform arb + 20% domain directional + 15% cash

## 8 Strategy Categories (Ranked)
1. Cross-platform arb (Polymarket↔Kalshi) — $40M extracted/yr, validated by IMDEA academic study
2. High-prob bonds (>95% outcomes) — 15-40% APY, asymmetric tail risk
3. Domain specialization — "only place retail has structural alpha" (Gemini)
4. AI/ML ensemble prediction — ManticAI 4th on Metaculus, LLM parity ~Jun 2026
5. Speed/latency trading (crypto 5/15-min) — 0x8dxd: $313→$438K
6. Hedged market making — 15-30% APY realistic, rewards declining
7. Information arbitrage — Theo $85M, not replicable at retail
8. Copy trading — unverified, NOT recommended

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
- LLM ensemble: multi-model (GPT-4.5/o3 + Claude + Foresight-32B)

## CRITICAL Risks
1. **Adverse selection** — insiders pick off resting orders. 8 documented cases in 12mo.
2. **Capital asphyxiation** — without mergePositions, capital locks up
3. **Regulatory** — 20+ state lawsuits, CFTC enforcement advisory, SDNY prosecutions warned
4. **Oracle manipulation** — $7M UMA attack (Mar 2025), $215M Zelenskyy market (Jul 2025)
5. **Platform security** — Dec 2025 auth breach drained accounts
6. **Edge decay** — taker fees (Jan 2026), institutional MMs entering

## Implementation Status (as of 2026-03-03 session 7)
- **Core architecture COMPLETE + hardened**: 20 source files, 10 test files, **135 tests passing**
- **py_clob_client NOW INSTALLED** (v0.34.6, pre-built wheel — no Rust needed)
- **pytest-asyncio NOW INSTALLED** (v1.3.0) — 7 previously-skipped async test files now run
- **Gemini R5+R6+R7+R8**: ALL findings resolved
- Session 7: py_clob_client install, R8 review + 6 fixes, committed 6213d11
- 23 commits on master (6213d11), pushed to `arm3n/polymarket-mm-bot` (private)

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
- **Review protocol**: Cache ENTIRE codebase in Gemini 1M context, not sampling. System instruction demands every file, every function.
- py-clob-client is synchronous — thread pool chokes beyond ~10-20 markets

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
