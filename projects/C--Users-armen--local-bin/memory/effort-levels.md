# Opus 4.6 Effort Levels (researched 2026-02-09)

## Quick Reference

| Effort | Terminal-Bench 2.0 | Token Savings vs Max | Best For |
|--------|-------------------|---------------------|----------|
| **max** | 65.4% | — | Hardest problems (API only) |
| **high** (default) | ~63% | baseline | Complex reasoning, debugging, architecture |
| **medium** | 61.1% | 23% fewer output tokens | Routine agentic work, daily coding |
| **low** | 55.1% | 40% fewer output tokens | Subagents, simple tasks, classification |

## What Effort Controls
- Effort is a **behavioral signal**, not a strict token budget
- Affects ALL response tokens: thinking, text, tool calls (not just thinking)
- At medium: model may skip thinking for simpler problems, makes fewer tool calls, terser output
- At high/max: model almost always thinks deeply
- Does NOT require thinking to be enabled — affects output behavior regardless

## The ~4pp Tradeoff (medium vs max)
- Terminal-Bench 2.0: 61.1% vs 65.4% — **4.3 pp loss on hard agentic coding**
- ARC-AGI (pure reasoning): nearly identical across all levels
- MCP-Atlas (tool use): high (62.7%) actually BEAT max (59.5%) — overthinking hurts

## What Medium Loses
- Thinks less deeply, may skip thinking on "simple" problems
- Fewer tool calls (consolidates operations, skips verification steps)
- Less thorough exploration of alternatives
- Terser explanations, fewer code comments
- Reduced thoroughness on security reviews, architecture decisions

## What Medium Keeps
- Core reasoning quality (ARC-AGI scores nearly identical)
- Tool-use effectiveness (can be better than max)
- Standard code changes, bug fixes, formatting
- Routine agentic workflows

## The 76% Claim — Verified with Context
- Source: Anthropic's own Opus 4.5 launch data, reported by DeepLearning.AI
- Opus 4.5 at medium matched Sonnet 4.5 on SWE-bench Verified with 76% fewer output tokens
- At high effort, Opus 4.5 exceeded Sonnet 4.5 by 4.3pp with 48% fewer tokens
- Claim is for Opus 4.5, not 4.6 — same effort system but exact numbers may differ

## Practical Guidance
- **medium**: Daily coding, simple tasks, subagent work, routine refactors
- **high** (default): Complex debugging, architecture, security, multi-file refactors
- **max** (API only): Hardest problems requiring maximum thoroughness
- Don't blindly default to medium — the 4pp drop matters on hard tasks
- ~60-70% of daily work won't be affected by medium

## Claude Code Settings
- Three levels exposed: low, medium, high (max is API-only)
- Set via: `/model` effort slider, `CLAUDE_CODE_EFFORT_LEVEL=medium`, or settings file
- Effort and fast mode are independent — can combine for max speed on simple tasks

## Key Sources
- Anthropic Effort Docs: https://platform.claude.com/docs/en/build-with-claude/effort
- Anthropic Adaptive Thinking: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking
- System Card (PDF): https://www-cdn.anthropic.com/0dd865075ad3132672ee0ab40b05a53f14cf5288.pdf
- DeepLearning.AI (76% verification): https://www.deeplearning.ai/the-batch/claude-opus-4-5-retakes-the-coding-crown-at-one-third-the-price-of-its-predecessor/
- Artificial Analysis: https://artificialanalysis.ai/articles/opus-4.6-everything-you-need-to-know
