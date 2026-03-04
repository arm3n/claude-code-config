# Windows Environment

## OS
- Windows 11 25H2+
- WMIC removed in this version — breaks many tools that spawn detached processes
- PowerShell `Expand-Archive` module fails on this system

## Package Management
- Use `winget` for installing tools (PowerShell install scripts often fail)
- Bun 1.3.8 installed via `winget install Oven-sh.Bun`, binary at `~/.bun/bin/bun.exe`
- uv 0.9.30 installed via `winget install astral-sh.uv`, binary at `~/.local/bin/uv.exe`
- **UniGetUI** manages upgrades — pin `pydantic-core` to ignore (it breaks scrapling/MCP when upgraded independently)
  - `pydantic` pins an exact `pydantic-core` version; solo core upgrades always break the pairing
  - Safe to upgrade `pydantic` itself (pulls correct core); only block standalone `pydantic-core` upgrades

## SSH
- Synology NAS: `Host synology` in `~/.ssh/config` (local IP, key ~/.ssh/synology)
- `LogLevel ERROR` set to suppress OpenSSH post-quantum key exchange warnings (Synology's sshd is too old for PQ KEX)

## PATH Configuration (`~/.bash_profile`)
Git Bash drops Windows paths during MSYS2 conversion. Fixed in `~/.bash_profile`:
```bash
# Add Node.js to PATH
export PATH="/c/Program Files/nodejs:$PATH"

# Add Bun to PATH
export PATH="$HOME/.bun/bin:$PATH"
```

## MCP Server Setup
- All MCP servers are top-level in `~/.claude.json` (not project-scoped) — consolidated 2026-02-27
- MCP server configs use full path `C:\Program Files\nodejs\npx.cmd` with `env.PATH` as safety net
- NPX-based MCPs need full path; Paper-search uses `uvx` (Python-based)
- Firecrawl removed 2026-02-24 (free 500 credits exhausted, non-renewing)
- Tavily removed 2026-02-27 (redundant with Brave+Exa+Jina)
- 19 MCP servers configured:
  - Sequential-thinking (reasoning)
  - Exa (web search, semantic/deep mode)
  - Brave Search (web/news/local/video search) — ALWAYS call sequentially (1 req/sec)
  - Perplexity (perplexity-web-mcp-cli v0.7.1, `pwm-mcp.EXE`) — swapped 2026-02-27
    - Replaced @perplexity-ai/mcp-server (API-key based) and Tavily (redundant with Brave+Exa+Jina)
    - Auth: email login via `pwm login` — token at `~/.config/perplexity-web-mcp/token`
    - MCP tools (perplexity_ask/search/research/reason) blocked by Cloudflare subprocess detection
    - **CLI workaround works**: `pwm ask "query" --json` via Bash tool — bypasses Cloudflare
    - **Pro subscription ($20/mo)** active since 2026-02-27
    - Pro quotas: 300 Pro searches/day, 20 Deep Research/day, 25 Create Files, 2 Browser Agent
    - Free tier was only 5 Pro/day — too limiting for research workflows
  - Context7 (live library documentation, free, by Upstash) — added 2026-02-05
  - Gemini Gmail (Gmail search via Gemini @Gmail extension, cookie auth) — added 2026-02-06
    - Server: `C:/Users/armen/gemini-gmail-mcp/server.py`
    - Tools: search_gmail, gmail_summary, ask_gemini
    - Auth: auto-extracts __Secure-1PSID from Firefox via browser-cookie3
  - Gmail API — added 2026-02-06
  - Memory — knowledge graph MCP
  - YouTube Transcript
  - Wayback Machine
  - Playwright (browser automation)
  - Paper-search (arxiv, pubmed, biorxiv, medrxiv, Google Scholar) — uses `uvx`
  - **Gemini** (RLabs-Inc/gemini-mcp, 30+ tools) — added 2026-02-18
    - Package: `@rlabs-inc/gemini-mcp` via NPX
    - Tools: gemini-query, gemini-analyze-code, gemini-brainstorm, gemini-deep-research, gemini-create-cache, gemini-count-tokens, gemini-generate-image, gemini-generate-video, gemini-analyze-url, gemini-summarize-pdf, + 20 more
    - Default model: `gemini-3-pro-preview` (1M context, configurable via `GEMINI_PRO_MODEL` env var)
    - Override models: `GEMINI_PRO_MODEL`, `GEMINI_FLASH_MODEL`, `GEMINI_IMAGE_MODEL` env vars
    - Paid Tier 1 API key
    - Note: Gemini 3 Pro may have regressed on long-context vs 2.5 Pro; set `GEMINI_PRO_MODEL=gemini-2.5-pro` if quality issues appear
  - **Jina Reader** (official jina-ai/MCP, remote HTTP) — added 2026-02-24, replaces Firecrawl
    - URL: `https://mcp.jina.ai/v1?include_tools=read_url`
    - Transport: HTTP (no npx, no local process)
    - Tool: `read_url` (URL-to-Markdown extraction)
    - Free tier: 10M tokens, 500 RPM with key
  - **Crawl4AI** (sadiuysal/crawl4ai-mcp-server, local stdio) — added 2026-02-24
    - Venv: `~/crawl4ai-mcp-server/.venv/Scripts/python.exe -m crawler_agent.mcp_server`
    - Tools: `scrape`, `crawl`, `crawl_site`, `crawl_sitemap`
    - Fully local, no API keys, crawl4ai 0.7.x pinned
    - Uses Playwright Chromium (150-300MB RAM per tab)
  - **Scrapling** (D4Vinci/Scrapling, anti-bot web scraping) — added 2026-03-01
    - Binary: `C:\Users\armen\AppData\Local\Programs\Python\Python312\Scripts\scrapling.exe mcp`
    - Tools: get, bulk_get, fetch, stealthy_fetch, + content extraction
    - Uses Camoufox v135 stable for stealth (Cloudflare Turnstile bypass)
    - Also uses Playwright Chromium (same as Crawl4AI) — 150-300MB RAM per tab
    - Role: hostile/targeted extraction when Crawl4AI gets blocked
  - **QMD** (local hybrid search: BM25 + vector + LLM reranking) — added 2026-03-04
    - Package: `@tobilu/qmd` v1.0.7 (global npm)
    - MCP config: `node.exe` → `dist/qmd.js mcp` (`.cmd` wrapper breaks Claude Code MCP)
    - Env: `NODE_LLAMA_CPP_GPU=false` (CUDA crashes on RTX 5090 + CUDA 13.1 — use CPU)
    - Tools: search, vector_search, deep_search, get, multi_get, status
    - Models: EmbeddingGemma 300M + Qwen3-Reranker 0.6B + custom 1.7B query expander (~2.1GB GGUF)
    - Index: `~/.cache/qmd/index.sqlite`; collections: `qmd collection add`; reindex: `qmd update && qmd embed`
    - Collection: `handovers` (218 docs from `~/.claude/handovers/*.md`)
  - **Chrome DevTools** (browser debugging/automation)
  - **shadcn** (UI component library)
  - **Figma** (design file access)

## Plugins
- **frontend-design** — claude-plugins-official
- **agent-browser** — vercel-labs/agent-browser marketplace, v0.16.1
  - CLI: `agent-browser` (global npm), uses Playwright Chromium
  - Snapshot-and-ref system (`@e1`, `@e2`) for token-efficient browser automation
  - `--native` Rust mode BROKEN on Windows (Unix sockets #398, Defender #382)
- **skill-creator** — claude-plugins-official (from anthropics/skills marketplace)

## Build Tools
- **VS 2022 Build Tools** with MSVC 14.44 + Windows SDK 26100 — needed for native Node modules on Node v24
- **CUDA Toolkit 13.1** — at `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.1`
- **WinDbg** installed via winget (Microsoft.WinDbg 1.2601.12001.0) — kd.exe at `C:\Program Files\WindowsApps\Microsoft.WinDbg_1.2601.12001.0_x64__8wekyb3d8bbwe\amd64\kd.exe`
  - Minidumps require admin to read: use `Start-Process powershell -Verb RunAs` to copy to user dir first
  - MSBuild CUDA targets read `$(CUDA_PATH_V13_1)` (versioned), NOT `$(CUDA_PATH)` — both set at system level
  - After installing CUDA, must restart shell for env var propagation
