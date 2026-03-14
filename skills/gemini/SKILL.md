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

When asked to "verify with Gemini," run THREE separate calls. **Actuary is listed first in the audit table** (conceptually prior — challenges the premise). In practice, calls execute sequentially for verification workloads (see Persistent Verification Roles below). Never combine convergent fact-checking with divergent critique — mixing them causes attention collapse where Gemini hyper-fixates on quotes and defaults to "looks good" on gaps.

**Call 1 — The Actuary (divergent critique)**: Listed first in audit table. Separate `gemini-search` call that sees Claude's synthesis. Purely divergent. Uses the locked adversarial prompt below (research OR engineering variant — pick whichever fits):

*Research variant:*
> "You are a hostile, lateral-thinking analyst. What secondary effects (economic, logistical, insurance, supply chain), minority actors (non-state groups, proxies, local factions), or alternative mechanisms are completely ignored by this analysis? What is the most obvious way this analysis is structurally blind?"

*Engineering variant (for plans, implementations, architecture decisions):*
> "You are a hostile engineering critic. You MUST answer all three: (1) Name the simplest alternative approach that achieves 80% of the benefit with 20% of the complexity. (2) Identify the #1 way this approach is over-engineered or adds unnecessary dependencies. (3) What happens when the most critical new dependency in this plan fails — does the system degrade gracefully or stop working? 'Looks good' is not a valid response."

This call must NOT also fact-check — its only job is to find what's wrong or missing.

**Call 2 — Independent verification (blind)**: Convert original claims into neutral questions (strip Claude's framing). Give to Gemini via `gemini-search`. Let it independently research and return findings with citations. Compare against Claude's conclusions. Divergences become high-priority flags.

**Blind input hygiene (engineering tasks):** Include files the user explicitly named, files from failing test stack traces (workspace-only), and imported schemas/interfaces. User-named files always included even if Claude also touched them. NEVER include files Claude independently chose to modify, Claude's diagnosis/approach/URLs, or files Claude created. See `/verify` SKILL.md § Engineering Context Pack for full rules.

**Call 3 — The Auditor (SAFE protocol)**: Give Gemini Claude's synthesis + the canonical claim list. Purely convergent:
- Verify each claim from the canonical list (no independent decomposition)
- Return structured output per claim: `{claim_id, verdict, evidence_kind, evidence_ref, quote, absence_based, reason}` — see `/verify` SKILL.md § Auditor prompt for full schema
- For every claim validated, provide a verbatim quote from a source — if no quote exists, mark UNVERIFIED
- Output: structured PASS/FAIL/UNVERIFIED per claim. Nothing else.
- **Tool selection**: If a Gemini context cache exists with the extracted source corpus, use `gemini-query-cache` to verify claims against *our actual sources* (not just the live web). If no cache exists, fall back to `gemini-search`.

**After Gemini calls:** For multi-provider verification (Gemini + Codex + CDP Pro), see `/verify` SKILL.md.
If running Gemini-only, output a 3-row audit table. If running full 4+1 verification, output the audit table defined in `/verify` SKILL.md § Step 5.

All three Gemini calls use `gemini-search` — it runs on **Gemini 3.1 Pro** (via `GEMINI_PRO_MODEL` env var) with Google Search grounding. Verified via API `modelVersion` field 2026-03-08.

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

### Multi-Provider Verification (canonical spec)

The full multi-provider verification protocol (Gemini + Codex + CDP Pro) is defined in `/verify` SKILL.md. This Gemini skill covers the Gemini-specific calls only. For cross-provider execution, audit tables, evidence provenance, and divergence analysis, see the `/verify` skill.

### Persistent Verification Roles (multi-round topics)

When verifying iterations of the same evolving analysis across multiple `/verify` rounds, roles can persist state to improve continuity. Verified via 6-round 3-way review (Claude + Codex + Gemini, 2026-03-12).

**Verified Rules:**

1. **Gemini calls: sequential by default.** Short queries succeeded in parallel (re-tested 2026-03-12), but multiple prior workloads with long multi-claim verification prompts failed (March 4-5, 2026 handovers). Long prompts cause TPM spikes, stdio buffer overflows, and timeouts in the single npx process. Use sequential for verification; parallel only for simple independent lookups.
2. **Codex calls: parallel** (separate OS processes). Both tracks launch concurrently.
3. **Blind: always fresh via `gemini-search` only.** Raw materials (original prompt, source docs, codebase) passed dynamically in the query — NOT via shared cache. The MCP has no tool that combines cached content with web search grounding in one call (`gemini-query-cache` and `gemini-search` are separate paths). The underlying Gemini API supports this combination, but the MCP wrapper does not expose it yet.
4. **Actuary/Auditor: persist** via short per-role state summary files on disk. Format:
   ```
   Round: N | Date: YYYY-MM-DD
   Open issues: [brief list]
   Resolved since last round: [brief list]
   New evidence since last round: [brief list]
   ```
   Never full transcripts — prevents anchoring and query bloat.
5. **1 shared neutral corpus cache.** Raw materials only. Role persona injected in query preamble per call.
6. **Cache creation:** Use `gemini-count-tokens` as sizing heuristic. Attempt creation; handle failure gracefully by falling back to dynamic context. Do not hardcode minimum token thresholds.
7. **Daily cache re-creation** (MCP TTL capped at 1440 min, no patch/update tool exposed).

**Defaults (tuning parameters, adjustable):**

8. Shared cache should have no `systemInstruction` (neutral) — design choice since roles share corpus.
9. Auditor recommended to split into 2 sequential sub-calls: (a) corpus audit via `gemini-query-cache`, (b) web audit via `gemini-search`. Prevents attention dilution from mixing cached + live sources.
10. Rolling window: max 5 open issues in state summaries to prevent unbounded growth.
11. TTL buffer: if cache expires within 30 min, re-create proactively before launching tracks.
12. Implicit caching not relied upon — not verified in our AI Studio setup.

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
