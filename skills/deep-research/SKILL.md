---
name: deep-research
description: >
  Conduct deep multi-source research with citation tracking and verification.
  Triggers on: "deep research", "comprehensive analysis", "research report",
  "investigate", "saturated search", "deep dive".
  Do NOT use for simple lookups or single-source questions.
---

## Deep Research Protocol

Minimum requirement: **100 unique sources** per research task. This is non-negotiable. Track source count throughout all phases and continue searching until the minimum is met. Sources must span all 4 domain lenses (diversity threshold, not just volume).

When invoked:

### Phase 1: Scope + Domain Matrix
- Clarify the research question with the user
- **Build a Domain Matrix** — break the topic into 4 mandatory lenses before any search:
  1. **Direct/Political** — the obvious actors, policies, military/diplomatic moves
  2. **Geoeconomic/Financial** — insurance, trade routes, sanctions, commodity markets, supply chains
  3. **Non-State Actors/Local** — proxies, ethnic groups, militias, NGOs, corporate actors
  4. **Historical Precedent** — analogous situations, how similar events played out before
- Identify 5-8 key subtopics across these lenses (not all within one lens)
- Run Perplexity early: "What are the most contested/debated aspects of [topic]?" — use this to inform query design
- Plan query distribution: aim for 15-20 unique sources per subtopic

### Phase 2: Parallel Discovery (Target: 60+ sources)
Launch 6+ parallel subagents, each searching a different angle:
- Agent 1: Brave web search (5+ keyword variations across lenses)
- Agent 2: Brave news search (recent coverage, different queries than Agent 1)
- Agent 3: Exa mechanism queries (natural language — "effects of X on Y", "companies impacted by Z" — NOT keywords)
- Agent 4: Exa semantic search (conceptually related content per subtopic)
- Agent 5: Perplexity research mode (comprehensive investigation per subtopic)
- **Agent 6: Blind Spot Hunter** — mandate: "Review the Domain Matrix from Phase 1. What adjacent actors, secondary effects, or alternative mechanisms are entirely missing from this scope? Search those specific missing vectors." Searches broadly, not anchored to the research question's framing.
- Additional agents as needed to reach source targets

Deduplicate URLs across agents. Each unique domain/article counts as one source. Sources must span all 4 domain lenses — if any lens has <10 sources, launch targeted searches for that lens.

### Phase 3: Full-Text Extraction (Target: 80+ sources)
**Extract BEFORE reasoning — never reason over snippets.**
- Use Jina read_url to extract full text from the top 15-20 most relevant HTML/text URLs across all 4 lenses
- **For PDFs**: route to `gemini-summarize-pdf` or Gemini context cache — Gemini processes PDFs natively with charts/tables intact, while Jina strips structural context via OCR
- Use Context7 for any library/API documentation claims
- Use paper-search for academic sources if the topic warrants it
- Use YouTube transcript for relevant video content
- Each extracted source counts toward the 100 minimum

### Phase 4: Orphan Check (ONE pass only — no recursion)
Before synthesis, scan all extracted text for:
- Proper nouns, actors, groups, or mechanisms mentioned only 1-2 times in passing
- Any "orphan" term that appears briefly but isn't the focus of any source
- Launch dedicated deep-dive searches (Brave + Exa) on each orphan to determine if it's actually a critical driver being underreported
- Extract new URLs via Jina and append to context
- **Do NOT re-run Orphan Check on backfilled data** — one pass only to prevent infinite loops
(Lesson: "Kurdish" appeared once in passing across 180+ sources in the Iran analysis. "Lloyd's JWC" was buried in paragraph 8. Both turned out to be headline-level findings.)

### Phase 5: Synthesis & Gap Analysis (Target: 100+ sources)
- Claude synthesizes over FULL extracted text (not snippets or search results)
- Use Perplexity for contradiction resolution between conflicting sources
- Identify contradictions, gaps, and areas needing deeper investigation
- Score source credibility (0-100) based on authority, recency, methodology
- Check domain lens coverage — if below 100 unique sources or any lens is underrepresented, launch additional rounds

### Phase 6: Verification
- Cross-reference every major claim against 2+ independent sources
- Flag unverifiable claims explicitly
- Note where sources disagree and assess which is more authoritative

### Phase 7: Gemini Verification (split-brain)
See `/gemini` skill for full protocol. Three separate calls:
1. **Blind verification** — original claims converted to neutral questions, Gemini researches independently
2. **Auditor** — atomic SAFE protocol on Claude's synthesis (verbatim quotes or UNVERIFIED)
3. **Actuary** — lateral critique: "What secondary effects, minority actors, or alternative mechanisms are completely ignored?"

### Phase 8: Report Generation
Produce structured report with:
- Executive summary (3-5 sentences)
- Total unique source count (MUST be >= 100) with breakdown by domain lens
- Detailed findings organized by subtopic
- Citations with URLs inline throughout the report
- Confidence scores per major claim (high/medium/low)
- Identified gaps and suggested follow-up research
- Any FRAME SHIFT findings prominently featured (not buried)
- Complete source list at the end with numbered URLs
- Save to reports/{topic}-{YYYY-MM-DD}.md

### Source Counting Rules
- Each unique URL = 1 source
- Multiple pages from the same domain count separately if they are distinct articles
- Search engine result pages do NOT count as sources
- Only pages whose content was actually read/analyzed count
- If final count < 100, go back to Phase 2 and search more
- **Diversity threshold**: sources must span all 4 domain lenses — 100 sources all from one lens is a failure
