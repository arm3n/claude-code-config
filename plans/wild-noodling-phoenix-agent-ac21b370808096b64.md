# Windows 11 Gaming Optimizations Research Plan (Build 26200+, 2025-2026)

## Status: READY TO EXECUTE (blocked by plan mode)

## Phase 1: Brave Discovery (SEQUENTIAL - 1 req/sec rate limit)
All 8 queries loaded, will fire one at a time:

1. `"Windows 11 VBS memory integrity gaming performance benchmark 2025 2026"`
2. `"Windows 11 Hyper-V gaming performance penalty overhead 2025"`
3. `"Windows 11 fullscreen optimization vs exclusive fullscreen 2026"`
4. `"Windows 11 game mode does it help 2025 2026"`
5. `"Windows 11 timer resolution gaming 2025"`
6. `"Nagle algorithm gaming 2025 2026 still relevant"`
7. `"MMCSS gaming priority Windows 11 registry tweak"`
8. `"Windows 11 standby memory list gaming clear"`

## Phase 2: Exa + Tavily (PARALLEL - no rate limits)
Fire simultaneously after Brave completes:

### Exa semantic queries (3):
- "comprehensive guide to Windows 11 gaming performance optimizations 2025 2026"
- "VBS memory integrity Hyper-V gaming benchmarks Windows 11 performance impact"
- "Windows 11 registry tweaks timer resolution MMCSS fullscreen gaming latency"

### Tavily search queries (3):
- "Windows 11 VBS memory integrity gaming performance 2025 2026" (advanced depth)
- "Windows 11 fullscreen optimization game mode timer resolution tweaks 2025" (advanced depth)
- "Windows 11 standby memory MMCSS Nagle algorithm gaming registry 2025" (advanced depth)

## Phase 3: Deep extraction
- Use Tavily extract or Jina read_url on top 5-10 URLs from phases 1-2
- Target: full content from benchmark articles, detailed guides, and technical analyses

## Phase 4: Synthesis
- Deduplicate sources across all 3 engines
- Score each optimization by: measured FPS impact, confidence level, effort to implement
- Flag contradictions (e.g., "Game Mode helps" vs "Game Mode hurts")
- Identify gaps for further research

## Target Topics
1. VBS / Memory Integrity / HVCI - performance cost
2. Hyper-V / virtualization overhead
3. Fullscreen Optimizations vs Exclusive Fullscreen
4. Game Mode - does it actually help?
5. Timer Resolution (1ms vs default)
6. Nagle Algorithm (TCP_NODELAY)
7. MMCSS (Multimedia Class Scheduler Service)
8. Standby Memory List clearing
9. Any additional optimizations discovered during search

## Output Format
Structured report with:
- Key findings (bullet points with source URLs)
- Confidence level per finding (high/medium/low)
- Measured performance impact where available
- Contradictions between sources
- Gaps identified for further research
- Save to: `~/.local/bin/reports/windows-11-gaming-optimizations-2026-02-26.md`
