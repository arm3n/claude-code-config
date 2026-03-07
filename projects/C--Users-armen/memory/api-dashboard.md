# API Dashboard

## Location & Stack
- `~/api-dashboard` — Node.js/Express on `127.0.0.1:3456`
- Launch: `launch.vbs` (starts server minimized + opens browser)
- Theme: GitHub dark (`#0d1117`)
- Beads: prefix `api-dashboard`, stealth mode (created 2026-03-01)

## Architecture
- **Real-time**: SSE at `/api/events`, heartbeat every 15s
- **Polling**: local files 10s, Anthropic+Perplexity APIs 60s, Brave API 5min
- **Frontend**: Vanilla JS + Chart.js (doughnut for cost, bar for tokens)
- **No external deps** beyond `express` and `dotenv`

## Services Tracked

### Claude Code (Anthropic Plan Usage)
- 1-token Haiku probe to `api.anthropic.com/v1/messages` — reads undocumented `anthropic-ratelimit-unified-*` headers
- Same technique as statusline (independent caches; dashboard is in-memory, statusline writes `plan-usage-cache.json`)
- OAuth token from `~/.claude/.credentials.json`
- Tracks: 5h/7d/overage utilization, reset epochs, session cost, tokens by model

### Perplexity
- **`pwm.EXE usage`** (`perplexity-web-mcp-cli` v0.7.1) — scrapes `perplexity.ai/rest/rate-limit/all` and `/rest/user/settings`
- Session token at `~/.config/perplexity-web-mcp/token` (NextAuth cookie)
- Auth: armen@armen.am, Pro ($20/mo)
- **Pro Search limit is 200 (not 300)** — confirmed 2026-03-01 by direct API test
- Pro Search resets weekly; Deep Research resets monthly
- `query_count` / `query_count_copilot` from `/rest/user/settings` track cumulative queries on account
- All models use `mode: "copilot"` (Pro search), including Sonar
- MCP tool calls in JSONL ≠ successful Perplexity searches (many fail silently)
- Old `perplexity_*` prefix tools (196 calls) were from a different MCP server (likely Sonar API); new `pplx_*` tools are from `perplexity-web-mcp-cli`

### Brave Search
- Minimal search (`q=ping&count=1`) every 5min to read `X-RateLimit-Remaining` headers
- Free tier: 2,000/month
- API key in `.env`

### Exa / Gemini / Jina
- Counted by parsing `.jsonl` session files under `~/.claude/projects/C--Users-armen/`
- Matches `tool_use` blocks with MCP prefixes (`mcp__exa__`, `mcp__gemini__`, `mcp__jina__`)
- All-time + monthly (Exa, Jina) or daily (Gemini) breakdowns

## Conversation History (`/history.html`)
- Lists all Claude Code sessions across all projects
- Full-text search with snippets
- Individual conversation viewer
- Export all as JSON backup

## REST API
| Endpoint | Purpose |
|----------|---------|
| `GET /api/events` | SSE stream |
| `GET /api/state` | JSON snapshot |
| `GET /api/conversations` | List sessions |
| `GET /api/conversations/:id` | Full conversation |
| `GET /api/search?q=...&max=...` | Search conversations |
| `GET /api/backup` | Download all as JSON |

## Key Files
- `server.js` — main server (~750 lines)
- `public/app.js` — SSE client + Chart.js rendering
- `public/index.html` — dashboard page
- `public/history.{html,js,css}` — conversation browser
- `.env` — `PORT=3456`, `BRAVE_API_KEY`, `EXA_API_KEY`

## Known Issues & Notes
- JSONL tool call counts overstate actual successful searches (records intent, not completion)
- `pwm.EXE doctor` crashes on Windows (cp1252 can't encode Unicode checkmarks)
- Server PID: check with `netstat -ano | grep :3456 | grep LISTEN`
- Restart: kill PID, then `node server.js > server.log 2>&1 &`
