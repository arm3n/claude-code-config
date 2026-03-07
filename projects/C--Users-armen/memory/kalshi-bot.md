# Kalshi Weather Market Maker

## Project Location
- `~/kalshi-weather-mm/` — 16+ files, Python asyncio

## Kalshi API
- **Production URL**: `api.elections.kalshi.com` (serves ALL markets, not just elections)
- **Auth**: RSA-PSS signing, key "Claude" ID `53a9d6ee-a256-4fdd-9906-9814a463eebb`
- **Private key**: `~/polymarket-mm-bot/kalshi_private_key.pem`
- **API tier**: Advanced (30r/30w per sec, confirmed via burst test)
- **Balance**: $3,447 cash, $6,089 portfolio, $9,536 total (as of 2026-03-05 late)
- **Auth gotcha**: Query params MUST be stripped before signing (`path.split('?')[0]`). Balance works without params; positions/fills fail without stripping.
- Public endpoints (markets, events, series) need NO auth

## Weather Market Structure (CRITICAL)
- **Weather markets use status `active`, NOT `open`** — `status=open` filter returns zero results
- Must query via `series_ticker` parameter without status filter
- Use events endpoint with `with_nested_markets=true` to get all 6 brackets per event
- **6 brackets per event**: 2 thresholds (tails) + 4 two-degree brackets (middles)

### Ticker Format
- Event: `KXHIGHNY-26MAR06` (series-YYMMMDD)
- Market: `KXHIGHNY-26MAR06-B43.5` (bracket, 43-44°F) or `-T41` (threshold, ≤40°F)
- `B{x}`: bracket centered at x, covers floor(x) to ceil(x) → 2°F wide
- `T{x}` lower: market is "≤(x-1)°F" (lower tail)
- `T{x}` upper: market is "≥(x+1)°F" (upper tail)
- Lower/upper determined by sorting T values in the event

### Fair Value Math
- `B{x}`: P = Φ((x+1-μ)/σ) - Φ((x-1-μ)/σ) [continuity correction at center±1]
- Lower `T{x}`: P = Φ((x-0.5-μ)/σ)
- Upper `T{x}`: P = 1 - Φ((x+0.5-μ)/σ)
- Must sum to 100% across all 6 brackets (verified ✓)

## Active Series (as of 2026-03-05)
| Series | City | NWS Office | Grid | Station |
|--------|------|-----------|------|---------|
| KXHIGHNY | New York | OKX | 34,38 | Central Park |
| KXHIGHCHI | Chicago | LOT | 72,69 | Midway (MDW) |
| KXHIGHMIA | Miami | MFL | 106,51 | MIA Airport |
| KXHIGHAUS | Austin | EWX | 159,88 | Bergstrom (AUS) |
| KXHIGHDEN | Denver | BOU | 74,66 | DEN Airport |
| KXHIGHLAX | Los Angeles | LOX | 148,41 | LAX Airport |
| KXLOWNY | New York | OKX | 34,38 | Central Park |
| KXLOWCHI | Chicago | LOT | 72,69 | Midway (MDW) |
| KXLOWMIA | Miami | MFL | 106,51 | MIA Airport |
| KXLOWAUS | Austin | EWX | 159,88 | Bergstrom (AUS) |
| KXLOWDEN | Denver | BOU | 74,66 | DEN Airport |
| KXLOWLAX | Los Angeles | LOX | 148,41 | LAX Airport |

**INACTIVE**: KXHIGHHOU (Houston) — last event Jan 2025
**Austin ticker**: `KXHIGHAUS` (not `KXHIGHAU` — 404)
**Low temp series**: No active events as of Mar 2026 (possibly seasonal)

## NWS Settlement
- Settles on **NWS Daily Climate Report (CLI)**, NOT real-time METAR
- CLI releases next morning (varies by station)
- Settlement URLs per series in config.yaml

## Key API Gotchas
- `--dry-run` for RunInstances only checks IAM permissions, NOT account-level blocks
- Reddit user reported same API discovery issue (Apr 2025) — weather markets invisible with standard filters
- `series_ticker` param on `/events` and `/markets` works; plain search does not

## Strategy
- **Per-city stddev (Day-1)**: NYC=2.8, CHI=3.1, MIA=1.9, AUS=2.8, DEN=3.8, LAX=2.2
- **Day-2 adder**: +0.6°F stddev automatically
- **OLD seasonal values were WRONG**: winter=6.5, spring=4.9 etc. — 1.5-2x too high, caused negative edge on tails
- Default half-spread: **5 cents** (widened from 3c on 2026-03-06), min edge: 2 cents, order size: 10 contracts
- 85% ask-crossing at 3c spread confirmed — 5c is standard for bots without HRRR/nowcasting
- **Gaussian is a known approximation**: NIG (Normal Inverse Gaussian) is gold standard for temp errors (heavy tails + skew)
- Strategy report: `~/reports/kalshi-sub-ms-pivot-analysis-2026-03-05.md`

## HRRR Nowcasting (added 2026-03-06)
- **Source**: Open-Meteo API `models=gfs_hrrr` — MUST use this exact param (`hrrr` and `hrrr_conus` both fail)
- **Module**: `hrrr/forecast.py` — zero new deps, uses existing aiohttp
- **Day-1 only**: HRRR ~18hr horizon, day-2 returns null (expected). NWS remains primary for day-2+
- **Stddev reduction**: `hrrr_stddev_factor()` — 0.6x at 0hr lead → 1.0x at 14hr lead (linear ramp)
- **Staleness**: Data >2hr old is ignored, falls back to NWS (`MAX_STALENESS_SECONDS = 7200`)
- **Poll interval**: 15min (config `hrrr.poll_interval: 900`)
- **Station coords**: Verified against official ASOS metadata via Gemini (Miami/LAX/Austin were 1.5-2.5km off, fixed)
- **Pricing impact**: NYC example — HRRR 41°F vs NWS 43°F → T41 threshold jumps 20.6% → 42.2% fair value

## Latency & Server Location (verified 2026-03-06)
- **Kalshi matching engine**: GCP us-east4 (Ashburn, VA) — NOT Chicago despite VPS vendor claims
- **EC2 us-east-1 → Kalshi**: 36ms first byte (includes TLS + processing). Effectively colocated.
- **Chicago VPS would ADD 15-20ms** — CDN edge gives false ~1ms pings but orders route to Virginia
- **Weather markets**: Edge is forecast quality, not execution speed. Only latency-sensitive moment is METAR drops (~:51-:55 past hour)
- **Sports markets** (76% of Kalshi volume): Need Sportradar/Genius Sports feed ($500+/mo) + Chicago VPS for real edge

## Runtime Bugs Fixed (2026-03-05)
- **post-only cross**: `create_order` now catches this gracefully (normal for tight markets)
- **batch cancel field**: Kalshi v2 uses `"ids"` not `"order_ids"` — code has fallback to individual cancels
- **WebSocket KeyError**: snapshot message fields accessed via `.get()` with defaults
- **Error isolation**: Per-market try/except prevents one bracket failure from killing entire event
- **Windows process kill**: Must use `taskkill //IM python.exe //F` then cancel-loop until 0 resting orders

## AWS
- Account BLOCKED (support case 177274543700877) — RunInstances fails, other APIs work
- AZ hunt script at `~/.aws/az-hunt-userdata.sh` (updated to use api.elections.kalshi.com)
- Subnets: 2a=subnet-025c814731e56ffd7, 2b=subnet-09e5321669e67e789, 2c=subnet-00749923d00be21f6

## User's Active Bets (as of 2026-03-05)
| Contract | Contracts | Avg Cost | Thesis |
|----------|-----------|----------|--------|
| KXWTIMAX-26DEC31-T85 | 700 | 87.9c | WTI yearly max >$85 (knockout) |
| KXWTIMAX-26DEC31-T90 | 550 | 78.1c | WTI yearly max >$90 (knockout) |
| KXWTIMAX-26DEC31-T95 | 2,200 | 80.9c | WTI yearly max >$95 (knockout) |
| KXWTIMAX-26DEC31-T100 | 1,167 | 58.4c | WTI yearly max >$100 (knockout) |
| KXINXMINY-01JAN2027-6000.01 | 3,760 | 52.3c | S&P yearly low <=6000 (knockout) |
| KXINXMINY-01JAN2027-5900.01 | 2,033 | 48.3c | S&P yearly low <=5900 (knockout) |
Total invested: $6,455.78 | Fees: $99.13

## Key Contract Discovery
- **KXLCPIMAXYOY-27**: CPI yearly max knockout (`can_close_early: True`). If CPI YoY hits threshold at any point in 2026, instant win. Immune to Treasury futures manipulation (resolves on BLS data). P3 at 66c, P3.5 at 33c, P4 at 20c.
- **KXWTIMAX resolves on ICE WTI front-month SETTLE price** (futures, not physical spot). Treasury shorting futures DIRECTLY affects this.
- **KXAAAGASM/KXAAAGASW**: Gas prices resolve on AAA national average (physical pump price). Immune to futures manipulation.
- **KXCPI monthly**: MoM CPI resolves on BLS data. March CPI (released Apr 10) captures full oil shock.
- **Knockout identification**: `can_close_early: True` + rules say "by" not "on"

## Live Trading Results

### Day 1 (2026-03-06, first live session)
- Deposited $10K, bot ran ~17 hours across 6 cities (6 HIGH series)
- **137 fills, 1,009 contracts** traded (497 bought YES, 512 sold NO)
- **5 bot restarts** (PIDs 25519→26425→46166→46793→49783) — each lost state
- **Tracked PnL across sessions: +$450** (unreliable — positions abandoned on each restart)
- **API realized PnL: -$4.31** (sum of all position `realized_pnl` fields)
- **19,369 "post only cross" errors** — orders crossing spread, all day
- **Session 2 peak: +$1,115** then crashed to -$315 in 30min (adverse selection)
- **Worst position**: DEN B40.5 SHORT 74x ($43 exposure) — accumulated across restarts
- **Estimated Mar 6 settlement**: ~-$40 to -$50 net (big losses on DEN/CHI/AUS shorts, partial wins on LAX/NY)
- **Actual highs (Gemini-verified)**: NYC 43-44F, CHI 69-70F*, MIA 83-84F, AUS 84F, DEN 33-34F*, LAX 75-77F
  - *CHI and DEN Gemini highs conflict with market prices (99c) and METAR data — markets likely correct
- **Kalshi fees**: Maker fills = $0.00. Taker fills = ~$0.15-0.17 per 10 contracts.
- **Portfolio value = API `balance` + `portfolio_value`** (cash + mark-to-market)
- **Scrapling MCP** works for Kalshi pages: `mcp__scrapling__fetch` with `network_idle=true, wait=3000`
- **Jina fails on NWS API** (422 on JSON endpoints) — use curl/Bash instead

## Position Review & Fixes (2026-03-06)
- **Denver CATASTROPHE**: SHORT 74x B40.5 at 99c. Overnight pre-frontal high (~40F at midnight) not modeled.
- **PnL FORMULA WAS BROKEN** (fixed session 3): `record_fill()` mixed YES/NO price scales. Old: `(avg_price - price_cents) * qty` → wrong by 7-14x. New: `(100 - avg_price - price_cents) * qty / 100` → correct binary option math, output in dollars. Gemini-verified.
- **P1 fixes deployed (session 3)**: (1) `max_position: 25` in config. (2) Quadratic skew above 15 contracts (`compute_skew()` in quoter.py). (3) METAR observation integration (new `metar/` module, all 12 stations). (4) Anomaly threshold 1.5σ/0.4 (was 2.0σ/0.3).
- **Remaining gaps**: No unrealized PnL tracking, no order cancel on risk shutdown, no daily PnL reset, no position bootstrap on restart.
- **API endpoint**: Already fixed to `api.elections.kalshi.com` in config.yaml.
- **WTI T85/T90**: Should settle YES Mon Mar 9 (ICE settle >$90 on Fri, early close next 10AM ET)

## Multi-Model Ensemble Research (2026-03-06)
- **Full report**: `~/kalshi-weather-mm/research/tweet-analysis-6model-bot-2026-03-05.md` (70+ sources, Gemini verified)
- **NBM (National Blend of Models)**: NOAA's pre-built 30+ model ensemble, available on Open-Meteo `models=nbm_conus` via `/v1/gfs` endpoint. 2.5km, hourly, 11-day horizon. Replaces DIY multi-model blending.
- **ECMWF IFS**: Now fully open data (Oct 2025, CC-BY 4.0). Available via Open-Meteo `ecmwf_forecast` endpoint. Independently developed from NCEP models — highest value add.
- **All 6 models on Open-Meteo**: GFS, HRRR, NAM (`nam_conus`), ECMWF (`ecmwf_ifs025`), UKMO (`ukmo_global_deterministic_10km`), GEM (`gem_seamless`). NBM (`nbm_conus`) is the shortcut.
- **Ensemble literature**: 3-4 independent models capture 50-70% of max benefit. BMA (Raftery & Gneiting 2005) is gold standard.
- **Priority order**: NBM > ECMWF > METAR ingestion > settlement mechanics > inter-model spread sizing
- **Open-Meteo commercial license**: EUR 15/mo required for trading use (free tier is non-commercial only)

## Settlement Mechanics (2026-03-06)
- **Settles on NWS CLI** (confirmed Kalshi help center + Gemini)
- **Stations**: NYC=KNYC (Central Park), CHI=KMDW (Midway), MIA=KMIA, AUS=KAUS (Bergstrom), DEN=KDEN, LAX=KLAX
- **DST recording window**: 1:00 AM - 12:59 AM local time (NOT midnight-midnight). Edge case for bracket outcomes.
- **ASOS rounding pipeline**: 5-min data undergoes lossy F→C→F conversion (up to 1°F error). CLI high uses 1-min averages WITHOUT this conversion — can exceed any public 5-minute value. Structural edge.
- **DSM (Daily Summary Messages)**: Issued during the day with running high temp — preview of CLI. Know issuance times per city.
- **Kalshi fees**: 1% trading + **10% settlement on profits** + 2% withdrawal. The 10% settlement fee is critical for margin calculations.

## Weather Market Competitors (2026-03-06)
- **Hans323** (Polymarket): $1.11M on single London weather bet. Taleb barbell strategy — cheap OTM brackets.
- **neobrother** (Polymarket): 2,373+ predictions, $20K+ profits. Temperature laddering.
- **cpratim** (GitHub): Jump Trading competition submission — `cpratim/Kalshi-Weather-Trading`
- **Wethr.net**: Paid tools for weather traders (ASOS converters, OMO inference bot, similar-days tool)
- **ClimateSight.app**: Station-specific forecasts for Kalshi market cities
- **Alpha window narrowing**: Multiple published tutorials, growing bot ecosystem

## Beads (Consolidated 2026-03-06)

### P0 — Critical (blocking PnL or causing losses NOW)
| ID | Status | Title | Notes |
|----|--------|-------|-------|
| post-only-cross | **DONE** | Fix 19K/day post-only-cross errors | `_adjust_for_orderbook()` in main.py checks WS orderbook before placing. Adjusts price to avoid cross or skips. Deployed 2026-03-06 23:14 UTC. 0 errors since. |
| restart-state-loss | **DONE** | Persist position/PnL state across restarts | `risk_state.json` saves daily_pnl + realized_pnl after every fill. `load_state()` restores on startup (same-day only). |
| ws-reconnect | **DONE** | WS re-subscribe after disconnect | `_resubscribe()` in ws.py — stores channels/tickers and re-sends subscribe on reconnect. Was likely root cause of 5 restarts (bot went deaf). |
| den-position | **RESOLVED** | DEN B40.5 SHORT 74x | Mar 06 contract — settling today. Future accumulation prevented by state persistence across restarts. |

### P1 — High (deploy blockers or significant edge improvements)
| ID | Status | Title | Notes |
|----|--------|-------|-------|
| kalshi-pos-cap | DONE | Per-bracket position cap + escalating skew | Deployed. But NOT enforced across restarts (see restart-state-loss). |
| kalshi-metar | DONE | METAR observation-aware high temp | Deployed. Working on 4 cities (NY, CHI, MIA, AUS). |
| kalshi-pnl-fix | DONE | PnL formula fix (binary option math) | Deployed. |
| kalshi-risk-harden | DONE | Pending tracking + shutdown cancel + bootstrap + timeout + centralized shutdown | Deployed. |
| deploy-exclude-env | DONE | Add --exclude=.env to tar deploy | Fixed in deploy script. |
| daily-pnl-reset | DONE | Daily PnL reset at UTC midnight | `24b4c18` — detects date change in quote loop. |
| unrealized-pnl | DONE | Mark-to-market unrealized PnL in risk check | `10a901e` — orderbook mid-price, total_daily_pnl in shutdown check. |
| settlement-cleanup | DONE | Settlement detection + position cleanup | `a30346a` — polls every 5 min, removes settled positions. |
| shutdown-hang | DONE | Fix asyncio shutdown hang | `60bf342` — cancel tasks + TimeoutStopSec=15. |

### Gemini Audit P0s (2026-03-07) — fix immediately
| ID | Status | Title | Notes |
|----|--------|-------|-------|
| ga-zombie-orders | **OPEN** | Cancel existing resting orders on startup | Bot layers new quotes on top of stale ones after restart. |
| ga-cancel-guard | **OPEN** | Skip quoting if cancel fails | Cancel exception → proceeds to place new orders → double exposure. |
| ga-zombie-tasks | **OPEN** | Detect crashed asyncio tasks | `return_exceptions=True` swallows task crashes silently. |
| ga-utc-rollover | **OPEN** | Fix Day-1 logic dying at 8PM ET | `datetime.now(utc)` rolls forecast_day=2 at midnight UTC. Use ET. |
| ga-prob-normalize | **OPEN** | Normalize 6-bracket probabilities to 1.0 | Raw CDFs don't sum to 100%, systematic arb leak. |
| ga-fill-reconcile | **OPEN** | Reconcile PnL from REST fills | Missed WS fills → daily loss limit blind spot. |

### Gemini Audit P1s (2026-03-07)
| ID | Status | Title | Notes |
|----|--------|-------|-------|
| ga-t-variance | **OPEN** | Verify Student's t variance scaling | t(df=5) variance=5/3, may be 29% wider than intended. |
| ga-pending-leak | **OPEN** | Clear pending on order timeout | TimeoutError path never clears _pending, slowly freezes bot. |
| ga-event-limits | **OPEN** | Add per-event position limits | Per-ticker cap=25 but can get 75 contracts directional on one city. |
| ga-illiquid-unreal | **OPEN** | Fallback for illiquid unrealized PnL | No orderbook mid → unrealized=$0 even if position worthless. |
| ga-ws-reconnect-die | **OPEN** | Harden WS reconnect exception handling | connect() in except handler can kill WS task. |
| ga-market-discovery | **OPEN** | Periodic market discovery refresh | Only runs at startup — new events never found. |

### P2 — Medium (model improvements, edge cases)
| ID | Status | Title | Notes |
|----|--------|-------|-------|
| kalshi-climo | DONE | Dynamic climatology + 1.5σ/0.4 anomaly threshold | Deployed. |
| april-climo-update | **OPEN** | Update 12 market configs for April climo values | Due before Apr 1 (26 days). All cities in config.yaml. |
| adverse-selection | **OPEN** | Reduce adverse selection on center brackets | 15 fills at 55c+ caused $555 PnL drop in 8min. Bot getting picked off by informed traders on ATM brackets. Consider wider spread or skip near-ATM. |
| spread-widen | **OPEN** | Widen spread on model disagreement | When HRRR vs NWS differ >3F, spread should auto-widen. |
| ws-sequence | **OPEN** | WS orderbook sequence tracking | Gemini finding N2 — detect missed deltas. |
| settlement-handling | DONE | Handle contract settlement events | `a30346a` — _settlement_loop() polls unsettled API. |
| rate-limiting | **OPEN** | API rate limiting | Gemini N6 — no throttling on REST calls. |

### P3 — Low (future improvements)
| ID | Status | Title | Notes |
|----|--------|-------|-------|
| kalshi-ensemble | **OPEN** | Blend NBM + ECMWF ensemble models | NBM = pre-built 30-model blend on Open-Meteo. Highest value add after current fixes. |
| kalshi-low-temp | **OPEN** | Investigate KXLOW inactive series | All 6 LOW series show 0 active events. Possibly seasonal. |
| kim-replicate | **OPEN** | Replicate Kim et al. lead-lag pipeline | Blocked by verification of post-2025 performance. |
| kim-verify | **OPEN** | Verify Kim et al. post-2025 performance | arXiv:2602.07048, zero txn cost modeling. |
| strategy-synthesis | **OPEN** | Synthesize audit into final strategy table | 3 sessions (360+ sources) complete, no final synthesis yet. |
| tax-consultation | **OPEN** | Tax consultation (Section 1256 treatment) | Prediction market tax status uncertain. |

### Completed (archive)
| ID | Done | Title |
|----|------|-------|
| kalshi-pos-cap | 2026-03-06 | Position cap + quadratic skew |
| kalshi-metar | 2026-03-06 | METAR integration |
| kalshi-pnl-fix | 2026-03-06 | PnL formula fix |
| kalshi-risk-harden | 2026-03-06 | Risk hardening (5 fixes) |
| kalshi-climo | 2026-03-06 | Climatology + anomaly threshold |
| kalshi-hrrr | 2026-03-06 | HRRR nowcasting integration |
| audit-1-3 | 2026-03-05 | Strategy audit sessions 1-3 |

## Handovers
- `~/.claude/handovers/HANDOVER-2026-03-07-gemini-audit-fixes.md` — **LATEST** (Gemini 3-call audit, 18 findings, daily reset, unrealized PnL, settlement, shutdown fix)
- `~/.claude/handovers/HANDOVER-2026-03-06-p0-fixes-deploy.md` — Superseded
- `~/.claude/handovers/HANDOVER-2026-03-06-deploy-risk-hardening.md` — Deploy + .env fix
- `~/.claude/handovers/HANDOVER-2026-03-06-risk-hardening.md` — Risk hardening (pending tracking, shutdown, bootstrap, timeout, async rules)
- `~/.claude/handovers/HANDOVER-2026-03-06-pnl-fix-p1-deploy.md` — PnL fix + pos-cap + METAR + quadratic skew
- `~/.claude/handovers/HANDOVER-2026-03-06-weather-bot-position-review.md` — position review (superseded by above)
- `~/.claude/handovers/HANDOVER-2026-03-06-tweet-analysis-weather-ensemble.md` — multi-model ensemble research
- `~/.claude/handovers/HANDOVER-2026-03-06-hrrr-integration.md` — HRRR nowcasting + latency analysis
- `~/.claude/handovers/HANDOVER-2026-03-06-weather-mm-deploy.md` — deploy + model improvements
- `~/.claude/handovers/HANDOVER-2026-03-06-weather-mm-triage.md` — live triage + Gemini audits
- `~/.claude/handovers/HANDOVER-2026-03-05-weather-mm-pricing.md` — superseded
- `~/.claude/handovers/HANDOVER-2026-03-05-weather-mm-fixes.md` — superseded
- `~/.claude/handovers/HANDOVER-2026-03-05-weather-mm-scaffold.md` — superseded
- `~/.claude/handovers/HANDOVER-2026-03-05-kalshi-oil-energy-contracts.md` — oil contract discovery
- `~/.claude/handovers/HANDOVER-2026-03-05-kalshi-synergistic-knockouts.md` — S&P/BTC knockout analysis
- `~/.claude/handovers/HANDOVER-2026-03-06-treasury-oil-futures-kalshi.md` — Treasury intervention analysis + CPI knockout discovery
