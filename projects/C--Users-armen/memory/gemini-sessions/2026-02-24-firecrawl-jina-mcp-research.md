# Gemini Session: Firecrawl Removal & Web Research MCP Setup

- **Cache Name**: `firecrawl-jina-mcp-research-2026-02-24`
- **Cache ID**: `cachedContents/24c5sh8xfl5np5lipkoxbwvk4k3sd9ugveola1wh`
- **Source File**: `~/.claude/gemini-sessions/firecrawl-jina-mcp-research-2026-02-24.md`
- **Created**: 2026-02-24
- **Expires**: 2026-02-25T22:53:40Z
- **Model**: gemini-3.1-pro-preview

## Contents
- Firecrawl credit system breakdown (per-operation costs, modifiers, stacking rules)
- API verification: -3 remaining credits (503/500 used on free one-time plan)
- 7 web research MCPs evaluated: Jina Reader, Crawl4AI, Linkup, Markdownify, Kindly, SearXNG, Bright Data
- Jina Reader official MCP setup (remote HTTP, read_url, 10M free tokens)
- Crawl4AI local setup (sadiuysal/crawl4ai-mcp-server, crawl4ai 0.7.8, 4 tools)
- Community consensus from Reddit r/ClaudeAI, r/mcp, r/LocalLLaMA

## Key Findings
1. Firecrawl free plan is 500 credits ONE-TIME, non-renewing (no billing period)
2. Average cost was ~5 credits/page due to extract operations and JSON modifiers
3. Official jina-ai/MCP is the clear replacement: remote HTTP server, 19 tools, 10M free tokens
4. wong2/mcp-jina-reader is NOT on npm (private); spences10/mcp-jinaai-reader is deprecated
5. Crawl4AI via sadiuysal/crawl4ai-mcp-server: best local option, 4 tools, crawl4ai 0.7.8
6. Markdownify is broken on Windows

## Related Beads
- `claude-config-z91` (closed): Remove Firecrawl MCP
- `claude-config-k7l` (closed): Add Jina Reader MCP
- `claude-config-3cl` (closed): Add Crawl4AI MCP

## Rehydration
```
gemini-create-cache filePath="C:\Users\armen\.claude\gemini-sessions\firecrawl-jina-mcp-research-2026-02-24.md" displayName="firecrawl-jina-mcp-research-2026-02-24" ttlMinutes=1440 systemInstruction="MCP server research assistant. Firecrawl credit analysis, Jina Reader and Crawl4AI setup details, and web research MCP evaluation with community recommendations. 7 tools compared, 2 installed."
```
