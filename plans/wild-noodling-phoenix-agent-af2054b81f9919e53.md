# Research Plan: RTX 5090 + i9-13900K Gaming Optimization on Windows 11

## Objective
Gather 15-20+ unique sources covering hardware-specific optimization for an RTX 5090 + i9-13900K system on Windows 11. Cover NVIDIA Control Panel settings, BIOS tuning, driver issues, DLSS 4 / Multi Frame Generation, HAGS, CPU power management, and Z790 motherboard settings.

## Research Strategy

### Phase 1: Broad Discovery via Brave (7 sequential queries, 1/sec rate limit)
Brave queries must run **sequentially** due to rate limiting.

1. `RTX 5090 optimization Windows 11 NVIDIA Control Panel settings 2026`
2. `i9-13900K gaming optimization P-core E-core parking thread director`
3. `RTX 5090 driver issues 595.xx 2026`
4. `NVIDIA RTX 5090 HAGS hardware accelerated GPU scheduling Blackwell`
5. `i9-13900K power limits PL1 PL2 gaming performance BIOS`
6. `RTX 5090 DLSS 4 multi frame generation settings guide`
7. `Z790 BIOS gaming optimization XMP resizable BAR Above 4G C-states`

Each query: count=10, extra_snippets=true, freshness=py (last year)

### Phase 2: Semantic Deep-Dives via Exa (parallel, 4 queries)
Natural language queries for conceptually related content.

1. `"best NVIDIA Control Panel settings for RTX 5090 gaming performance in 2026"`
2. `"how to optimize Intel 13900K P-core E-core for gaming with thread director"`
3. `"DLSS 4 multi frame generation setup guide RTX 5090 Blackwell"`
4. `"Z790 BIOS settings for maximum gaming performance with 13th gen Intel"`

Each query: numResults=8

### Phase 3: Fact-Checking via Tavily (parallel, 4 queries)
Targeted verification with citations.

1. `RTX 5090 HAGS performance impact benchmark 2026` (search_depth=advanced)
2. `i9-13900K unlimited power limit gaming thermal throttle risk` (search_depth=advanced)
3. `RTX 5090 resizable BAR performance impact Blackwell` (search_depth=advanced)
4. `NVIDIA 595 driver known issues RTX 5090 2026` (search_depth=advanced)

Each query: max_results=10

### Phase 4: Synthesis and Gap-Filling
- Review all results from Phases 1-3
- Identify contradictions (especially around HAGS, power limits, E-core parking)
- If gaps remain (e.g., fewer than 15 unique sources), run additional targeted queries
- Use Tavily extract or Jina read_url on the highest-value URLs for full content

## Expected Source Count
- Brave: 7 queries x ~5-8 unique relevant results = ~35-50 candidate URLs (many will overlap)
- Exa: 4 queries x ~5-6 relevant results = ~20-24 candidate URLs
- Tavily: 4 queries x ~5-8 results = ~20-32 candidate URLs
- After deduplication: targeting 20-30 unique, relevant sources

## Output Format
Structured report with:
- Source table: URL, key finding, hardware relevance (5090-specific / 13900K-specific / both / general)
- Findings organized by topic area (7 categories matching the user's queries)
- Confidence level per finding (high/medium/low)
- Contradictions flagged explicitly
- Gaps identified for further research

## Execution Order
1. Run all 7 Brave queries sequentially (rate limit)
2. Run all 4 Exa queries in parallel
3. Run all 4 Tavily queries in parallel
4. Exa and Tavily can run in parallel with each other (after Brave completes or concurrently)
5. Deduplicate URLs across all engines
6. Extract full content from top 3-5 URLs if needed
7. Synthesize into final report, save to disk

## File Output
Final report saved to: `~/rtx5090-13900k-optimization-research-2026-02-26.md`

## Notes
- RTX 5090 launched January 2026 (Blackwell architecture) -- information is very fresh
- 595.xx driver branch is the current one for 50-series cards
- DLSS 4 with Multi Frame Generation is new to 50-series; may have limited optimization guides
- i9-13900K is from late 2022 (Raptor Lake) so optimization info is mature
- Key controversy areas: HAGS (historically mixed results), E-core parking (some games benefit, some don't), unlimited power limits (thermal vs performance tradeoff)
