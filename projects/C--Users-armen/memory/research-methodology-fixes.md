# Research Methodology Fixes (2026-03-03)

Post-mortem from Iran analysis rebuttal session. Three failure modes identified, then Gemini audited the full SOP and found 4 more structural flaws. All implemented.

## 1. Blind Spot Hunter (claude-config-sra, closed)

**Problem**: All 5 research agents anchored to the colleague's 9 claims. No agent searched for what was NOT mentioned. Missed: Trump calling Kurdish leaders (Barzani, Talabani, KDPI/Hijri) + CIA arming Kurdish forces — a major escalation vector.

**Fix**: Added mandatory "Blind Spot Hunter" section to `~/.claude/CLAUDE.md` Research Methodology. Any analysis review must include a dedicated agent searching broadly beyond stated claims, structured as "vectors the analysis ignores."

## 2. Frame-Shift Detection (claude-config-8b7, closed)

**Problem**: Agent 4 found Lloyd's/insurance data (45+ sources, including "SoH closed not by Iran but by shipping itself") but buried it as a bullet point. The finding reframed the entire SoH question from military closure to market closure, but no one flagged that.

**Fix**: Added "Frame-Shift Detection" section to `~/.claude/CLAUDE.md` between Research Methodology and Output Standards. Agents must flag findings that reframe premises as "FRAME SHIFT" at the top of summaries. Synthesis must evaluate frame shifts before claim-by-claim grading. Subagent rules also updated.

## 3. Gemini Verification Protocol (claude-config-01b, closed)

**Problem**: Used `gemini-analyze-text` for fact verification. That tool has NO web access — just analyzes text fed to it. Produced circular verification (Gemini graded our analysis against our analysis).

**Fix**: Added "Gemini Verification Protocol" section to `~/.claude/skills/gemini/SKILL.md` with tool selection table:
- Fact verification → `gemini-search` (live Google search + citations)
- Text structure/logic → `gemini-analyze-text`
- Anti-pattern: never feed Gemini derived conclusions; give it ORIGINAL claims and let it independently research

Also added step 7 "GEMINI VERIFY" to CLAUDE.md Research Workflow.

## Gemini SOP Audit (2026-03-03, second pass)

Gemini audited the full SOP via gemini-search and found 4 additional structural flaws. All implemented.

### 4. Extract before Reason (snippet surfing fix)
**Problem**: Steps 4-5 were backwards — synthesizing over search snippets, then extracting full text. Second-order mechanisms (insurance premiums) hidden in paragraph 8 never reach the reasoning engine.
**Fix**: Swapped EXTRACT to step 4, REASON to step 6 in both CLAUDE.md and deep-research SKILL.md.

### 5. Domain Matrix in SCOPE phase (cross-domain lensing)
**Problem**: Agents searched within the topic's natural vocabulary. No mandatory lateral lenses.
**Fix**: Added mandatory 4-lens Domain Matrix to SCOPE: (1) Direct/Political, (2) Geoeconomic/Financial, (3) Non-State Actors/Local, (4) Historical Precedent. One agent per lens minimum. Diversity threshold: sources must span all 4 lenses.

### 6. Orphan Check before synthesis
**Problem**: Terms mentioned 1-2 times in passing never got their own search thread.
**Fix**: Added Orphan Check step after extraction, before reasoning. Scan all extracted text for barely-mentioned proper nouns/mechanisms, deep-dive each.

### 7. Split Gemini into Auditor + Actuary (cognitive overload fix)
**Problem**: Gemini Stage 2 mixed rigid atomic fact-checking with open-ended "what's missing?" — opposite cognitive modes cause attention collapse.
**Fix**: Split into 3 separate calls: (1) Blind independent, (2) Auditor (SAFE atomic, verbatim quotes), (3) Actuary (lateral divergent critique only). Never combine convergent and divergent in one call.

### 8. Exa as mechanism hunter (tool role upgrade)
**Problem**: Exa relegated to "after Brave" with keyword-style queries. Its real strength is natural language mechanism discovery.
**Fix**: Exa now runs ALONGSIDE Brave in Discovery with mechanism queries ("companies halting due to risk premiums"), not keyword queries.

### 9. Perplexity dual-role (early + late)
**Problem**: Perplexity only used for late-stage synthesis. Misses its strength at surfacing contested theories early.
**Fix**: Added early-stage Perplexity call in SCOPE: "What are the most contested aspects of [topic]?" Still used late for contradiction resolution.

## Gemini SOP Audit (2026-03-03, third pass — edge cases)

Gemini re-audited the fully updated SOP. Found 4 edge cases, 2 misreads. 4 implemented:

### 10. Blind Spot Hunter prompt paradox
**Problem**: BSH said "what the analysis ignores" but fires during Discovery before any analysis exists.
**Fix**: Reworded to reference the Domain Matrix: "What adjacent actors, secondary effects, or alternative mechanisms are entirely missing from this scope?"

### 11. Orphan Check infinite loop
**Problem**: No termination condition — orphan deep-dives could trigger more orphans forever.
**Fix**: Explicit one-pass bound: "Do NOT re-run Orphan Check on backfilled data."

### 12. Auditor (Call 2) tool selection
**Problem**: Using gemini-search for Call 2 overlaps with Call 1 and ignores our extracted source corpus.
**Fix**: Call 2 now uses `gemini-query-cache` when a context cache exists (verifies against OUR sources), falls back to `gemini-search` if no cache.

### 13. PDF routing
**Problem**: Jina strips structural context from PDFs via OCR. Gemini processes PDFs natively with charts/tables.
**Fix**: Explicit routing: Jina for HTML/text, `gemini-summarize-pdf` or context cache for PDFs.

### Rejected (Gemini misreads):
- "100-source context paradox" — misunderstands subagent architecture (each has own context)
- "Context management math broken" — misread priority order (handoff > compact, not contradictory thresholds)

### Gemini's final verdict: "one of the most robust multi-agent research SOPs I have ever seen"

## Git Commits
- `b85ddec` — Overhaul: domain matrix, orphan check, split-brain Gemini, extract-before-reason
- `4b47453` — Fix 4 edge cases from Gemini's second SOP audit

## Files Modified
- `~/.claude/CLAUDE.md` — Full rewrite of Research Methodology, Search Tool Roles, and Research Workflow sections
- `~/.claude/skills/gemini/SKILL.md` — Split-brain 3-call protocol (blind + auditor + actuary) + cognitive overload anti-pattern + cache routing
- `~/.claude/skills/deep-research/SKILL.md` — Full rewrite: Domain Matrix, extract-before-reason, Orphan Check, Blind Spot Hunter in Discovery, diversity threshold, Gemini split-brain phase, PDF routing

## Iran Analysis Deliverable
- Final PDF: `~/Downloads/Iran_Analysis_Rebuttal_2026-03-03_v2.pdf` (15 pages, 166 KB, 120+ sources)
- Research outputs: `~/iran-hormuz-energy-market-research-2026-03-03.md`, `~/iran-war-contrarian-analysis-2026-03-03.md`, `~/trump-kurdish-iran-research-2026-03-03.md`
- Generator script: `~/iran-analysis-rebuttal-pdf.py` (Playwright HTML→PDF)
- Handover: `~/.claude/handovers/HANDOVER-2026-03-03-iran-analysis-rebuttal.md`
