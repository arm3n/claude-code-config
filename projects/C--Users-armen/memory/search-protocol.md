# Deep Search Protocol

## When to Activate
User says "deep search" or "saturated search".

## Engine Configuration

### Exa
- `type: "deep"`, `numResults: 100`
- Use `deep_search_exa` if available
- Can be called in parallel with Tavily

### Tavily
- `search_depth: "advanced"`
- Also use `tavily_research` tool for AI-synthesized multi-source summaries
- Can be called in parallel with Exa

### Brave Search
- `extra_snippets: true`, `count: 20`
- Paginate with `offset` (0-9) for up to 200 results
- **ALWAYS call sequentially** (free tier: 1 req/sec rate limit)

### Jina
- Primary tool for URL content extraction (`read_url`) — preferred over Tavily extract
- PDF extraction: figures, tables, equations from PDF URLs
- Academic paper search: arXiv, SSRN, Google Scholar via dedicated tools
- Image search for visual content queries
- Use in EXTRACT phase (step 5) to fetch full content from top URLs found by other engines

### Scrapling
- Anti-bot bypass: Cloudflare Turnstile, TLS fingerprinting via Camoufox
- Self-healing "Automatch" selectors: zero-token, SQLite-based fingerprinting
- Tools: `get` (fast HTTP), `bulk_get` (async multi-URL), `fetch` (headless), `stealthy_fetch` (full stealth)
- Use when Crawl4AI gets blocked or for targeted data extraction from protected sites
- Complements Crawl4AI — Crawl4AI for deep Markdown crawling, Scrapling for hostile/targeted extraction

## URL Extraction Escalation Ladder
When extracting content from a URL, try in order — stop at the first that succeeds:
1. **Jina `read_url`** — fastest, cheapest, API-based. Try first.
2. **Crawl4AI** — Playwright-based, good Markdown output, handles JS-rendered pages.
3. **Scrapling `get`** — HTTP-only with Chrome TLS fingerprinting, no browser overhead.
4. **Scrapling `stealthy_fetch`** — full stealth browser (Camoufox/patchright), Cloudflare bypass. Last resort.

## Process
1. Run multiple varied queries per engine to maximize unique source coverage
2. Deduplicate across all engines
3. Report total unique source count
4. Target: 60-100+ unique sources per deep search
