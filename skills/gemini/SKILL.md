---
name: gemini
description: >
  Delegate large-context analysis to Gemini via MCP, then continue implementation in Claude.
  Triggers on: "gemini", "analyze codebase", "large context", "spec first", "gemini review".
  Do NOT use for tasks where Claude's context window is sufficient (<100K tokens).
---

## Gemini Delegation Protocol

Core principle: **Gemini reads, Claude writes.** Use Gemini's 1M context for ingestion and analysis of large codebases/documents. Use Claude for reasoning, implementation, and debugging.

### When to Delegate to Gemini

- Analyzing a codebase or document set exceeding ~100K tokens
- Generating an architectural spec from a full project
- Cross-file dependency analysis or refactoring planning
- Reviewing all changes across a large PR or branch diff
- Processing large documents (PDFs, logs, transcripts) for extraction

### When to Keep in Claude

- Code implementation and debugging
- Precise reasoning on edge cases
- Tasks within Claude's context window (<100K tokens)
- Interactive development with the user

### Execution Steps

**Quick delegation** (single question about large context):
1. Use `mcp__gemini__gemini-query` with model `pro` for the analysis
2. Include the full context (file contents, codebase dump) in the prompt
3. Parse Gemini's response and continue working in Claude

**Spec-first workflow** (full codebase understanding):
1. Gather the relevant code using Read/Glob tools
2. Send the full content to `mcp__gemini__gemini-query` with a structured prompt asking for:
   - Architecture overview
   - Key patterns and conventions
   - File dependency graph
   - Entry points and data flow
3. Save Gemini's response as `spec.md` in the project root
4. Use the spec for Claude's implementation work

**Code review delegation**:
1. Gather the diff or changed files
2. Send to `mcp__gemini__gemini-analyze-code` with appropriate focus (quality, security, performance, bugs)
3. Synthesize Gemini's review with Claude's own analysis

**Context caching** (repeated queries on same codebase):
1. Use `mcp__gemini__gemini-create-cache` to cache the codebase content
2. Query the cache with `mcp__gemini__gemini-query-cache` for 90% input cost discount
3. Cache TTL defaults to 60 min; set longer for extended sessions

### Gemini Verification Protocol (split-brain, three calls)

When asked to "verify with Gemini," run THREE separate calls. **Actuary runs FIRST** — before Blind and Auditor. Never combine convergent fact-checking with divergent critique — mixing them causes attention collapse where Gemini hyper-fixates on quotes and defaults to "looks good" on gaps.

**Call 1 — The Actuary FIRST (divergent critique)**: Runs BEFORE other calls to challenge the premise before details get validated. Separate `gemini-search` call that sees Claude's synthesis. Purely divergent. Uses the locked adversarial prompt below (research OR engineering variant — pick whichever fits):

*Research variant:*
> "You are a hostile, lateral-thinking analyst. What secondary effects (economic, logistical, insurance, supply chain), minority actors (non-state groups, proxies, local factions), or alternative mechanisms are completely ignored by this analysis? What is the most obvious way this analysis is structurally blind?"

*Engineering variant (for plans, implementations, architecture decisions):*
> "You are a hostile engineering critic. You MUST answer all three: (1) Name the simplest alternative approach that achieves 80% of the benefit with 20% of the complexity. (2) Identify the #1 way this approach is over-engineered or adds unnecessary dependencies. (3) What happens when the most critical new dependency in this plan fails — does the system degrade gracefully or stop working? 'Looks good' is not a valid response."

This call must NOT also fact-check — its only job is to find what's wrong or missing.

**Call 2 — Independent verification (blind)**: Convert original claims into neutral questions (strip Claude's framing). Give to Gemini via `gemini-search`. Let it independently research and return findings with citations. Compare against Claude's conclusions. Divergences become high-priority flags.

**Call 3 — The Auditor (SAFE protocol)**: Give Gemini Claude's synthesis. Purely convergent:
- Decompose into atomic claims and verify each against sources
- For every claim validated, provide a verbatim quote from a source — if no quote exists, mark UNVERIFIED
- Output: structured PASS/FAIL/UNVERIFIED per claim. Nothing else.
- **Tool selection**: If a Gemini context cache exists with the extracted source corpus, use `gemini-query-cache` to verify claims against *our actual sources* (not just the live web). If no cache exists, fall back to `gemini-search`.

**After all 3 calls — Verification Audit Table (mandatory):**
Claude must output this table so the user can verify calls weren't relabeled:

```
| # | Role | Actual query sent (first 80 chars) | Key finding |
|---|------|-------------------------------------|-------------|
| 1 | Actuary | "You are a hostile engineering critic..." | [finding] |
| 2 | Blind | "What are the best approaches to..." | [finding] |
| 3 | Auditor | "Verify these claims: (1)..." | [finding] |
```

All three calls require `gemini-search` — never `gemini-analyze-text`.

| Call | Mode | Correct Tool | Wrong Tool |
|------|------|-------------|------------|
| 1: Actuary (lateral critique) | Divergent | `gemini-search` | ~~gemini-analyze-text~~ |
| 2: Blind independent research | Divergent | `gemini-search` | ~~gemini-analyze-text~~ |
| 3: Auditor (atomic SAFE) | Convergent | `gemini-query-cache` (if cache exists) or `gemini-search` (fallback) | ~~gemini-analyze-text~~ |
| Writing/structure quality only | N/A | `gemini-analyze-text` | — |

**`gemini-analyze-text` has NO web access.** Only use for pure writing/structural critique where facts aren't in play.

**Anti-pattern — circular verification:** Feeding Gemini conclusions via `gemini-analyze-text` and asking "is this right?" produces Gemini grading the analysis against itself. Both the Kurdish and Lloyd's/insurance gaps in the Iran analysis (2026-03-03) survived this pattern.

**Anti-pattern — cognitive overload:** Asking Gemini to do rigid atomic fact-checking AND open-ended "what's missing?" in one call. The structural task dominates attention and the divergent critique gets a generic pass. Always split.

**Anti-pattern — Auditor relabeling (ADK incident 2026-03-07):** Running 3 convergent feasibility checks and labeling them Blind+Auditor+Actuary. The Actuary-first ordering + mandatory audit table prevents this. If the audit table shows 3 queries that all ask "can X do Y?" — none of them was an Actuary.

### Available Gemini MCP Tools

| Tool | Use For |
|------|---------|
| `gemini-search` | **Fact verification with live web search and citations** |
| `gemini-query` | General queries (pro or flash model) |
| `gemini-analyze-code` | Code review with focus area (quality/security/performance/bugs) |
| `gemini-analyze-text` | Text/structural analysis ONLY — **no web access, never for fact-checking** |
| `gemini-analyze-url` | Analyze web pages (up to 20 URLs) |
| `gemini-brainstorm` | Multi-round brainstorming with Claude's initial thoughts |
| `gemini-deep-research` | Async deep research (returns research ID, poll with check-research) |
| `gemini-create-cache` | Cache files for repeated queries at 90% discount |
| `gemini-count-tokens` | Check token count before sending large content |
| `gemini-summarize-pdf` | PDF summarization |
| `gemini-extract-tables` | Table extraction from documents |

### Prompt Template for Codebase Analysis

When sending a codebase to Gemini, structure the prompt as:

```
You are analyzing a codebase. Provide a structured analysis covering:

1. **Architecture**: High-level structure, patterns used, key abstractions
2. **Dependencies**: File dependency graph, external dependencies
3. **Data Flow**: How data moves through the system
4. **Entry Points**: Main entry points and their purposes
5. **Conventions**: Coding patterns, naming conventions, error handling approach
6. **Issues**: Potential bugs, security concerns, performance bottlenecks

Codebase:
[paste files here]
```

### Cost Awareness

- Gemini 3 Pro: $2/$12 per MTok (input/output) for <=200K, $4/$18 for >200K
- Context caching: $0.20/MTok (90% discount on input)
- Use `gemini-count-tokens` before large sends to estimate cost
- For simple tasks, use `flash` model instead of `pro` ($0.15/$0.60 per MTok)
