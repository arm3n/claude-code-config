# Research Plan: NVIDIA Control Panel RTX 5090 + Network/Gaming Optimization for Windows 11

## Scope
10 topic areas, target 15-20+ unique sources, structured output with URL/finding/relevance per source.

## Tool Allocation & Query Plan

### Phase 1: Brave Discovery (SEQUENTIAL -- 1 req/sec rate limit)

Brave handles broad keyword discovery. 10 queries, one per topic area:

1. `NVIDIA Control Panel best settings RTX 5090 2026 power management texture filtering`
2. `NVIDIA low latency mode RTX 5090 Reflex Ultra Low Latency`
3. `NVIDIA Reflex 2026 best settings global enable`
4. `RTX 5090 resizable BAR ReBAR performance benchmark`
5. `10GbE gaming optimization Windows 11 Intel X550-T2`
6. `DNS gaming latency 2026 Cloudflare Google Quad9`
7. `TCP optimization gaming Windows 11 2026 receive window auto-tuning RSS`
8. `DDR5-6000 gaming optimization i9-13900K gear 1 gear 2`
9. `Windows 11 gaming debloat 2026 services safe disable`
10. `NVMe SSD optimization gaming Windows 11 DirectStorage write caching`

Execution: Sequential with no artificial delays (Brave MCP handles its own rate limiting). Each query with `count: 10`, `freshness: "py"` (last year).

### Phase 2: Exa Semantic Deep-Dives (PARALLEL with Tavily)

Exa gets natural-language semantic queries on the most important sub-topics. 5 queries run in parallel:

1. `"Best NVIDIA Control Panel settings for RTX 5090 Blackwell architecture gaming performance 2025 2026"`
2. `"NVIDIA Reflex low latency mode explained how it works RTX 50 series"`
3. `"Resizable BAR performance impact RTX 5090 benchmarks"`
4. `"Windows 11 network optimization for gaming TCP tuning DNS latency"`
5. `"DDR5 memory tuning for gaming i9-13900K gear mode XMP optimization"`

Each with `numResults: 8`.

### Phase 3: Tavily Fact-Checking (PARALLEL with Exa)

Tavily handles factual verification with structured citations. 5 queries run in parallel:

1. `"RTX 5090 NVIDIA Control Panel optimal settings power management threaded optimization 2025 2026"` (advanced depth)
2. `"NVIDIA Reflex vs Ultra Low Latency mode RTX 5090 2025 2026"` (advanced depth)
3. `"10GbE gaming optimization Windows 11 Intel X550-T2 NIC tuning"` (basic depth)
4. `"Windows 11 gaming debloat 2026 safe services to disable performance"` (advanced depth)
5. `"NVMe DirectStorage gaming Windows 11 SSD optimization write caching"` (basic depth)

Each with `max_results: 10`, `time_range: "year"`.

### Phase 4: Deduplication & Gap Analysis

After Phases 1-3 complete:
- Deduplicate URLs across all three engines
- Count unique sources
- Identify any topic areas with fewer than 2 sources
- If below 15 unique sources, run supplemental Brave queries on underrepresented topics

### Phase 5: Report Assembly

Write structured report to `C:\Users\armen\nvidia-rtx5090-gaming-optimization-research.md` with:

1. **Source Table**: All unique sources with URL, key finding, relevance (high/medium/low)
2. **Synthesized Findings** by topic area:
   - NVIDIA Control Panel settings (power mgmt, texture filtering, threaded optimization)
   - Low latency / Reflex configuration
   - Resizable BAR on RTX 5090
   - 10GbE / Intel X550-T2 network tuning
   - DNS for gaming
   - TCP optimization on Windows 11
   - DDR5-6000 / i9-13900K memory tuning
   - Windows 11 debloat for gaming
   - NVMe / DirectStorage optimization
3. **Contradictions** between sources
4. **Confidence levels** per finding
5. **Gaps** for further research

## Execution Order

```
Step 1: Brave queries 1-10 (sequential, ~10 calls)
Step 2: Exa queries 1-5 + Tavily queries 1-5 (all 10 in parallel)
Step 3: Tally unique sources, identify gaps
Step 4: Supplemental searches if needed (Brave or Tavily on weak areas)
Step 5: Write final report file + return structured summary in chat
```

## Estimated Tool Calls
- Brave: 10 sequential calls
- Exa: 5 parallel calls
- Tavily: 5 parallel calls
- Supplemental (if needed): 2-4 additional calls
- Total: ~20-24 tool calls

## Notes
- Brave must be sequential per MEMORY.md (1 req/sec rate limit)
- Exa and Tavily can run fully in parallel with each other
- No Perplexity needed unless contradictions arise that require synthesis
- No Jina/WebFetch needed unless specific URLs need full-text extraction
