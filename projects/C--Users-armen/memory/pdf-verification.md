# PDF Verification Protocol

> Created: 2026-02-26
> Trigger: Every time a PDF is generated or regenerated from HTML

## Why This Exists
The Kultura Capital brainstorm PDF shipped with 8+ blank pages and severe whitespace artifacts because verification was skipped. CSS `page-break-after: always` + `min-height: 100vh` caused blank interstitial pages on content overflow. This was only caught when the user opened the PDF manually.

## Mandatory Steps (After Every PDF Generation)

### Step 1: Read the PDF
Use the `Read` tool on the generated PDF file. Claude can read PDFs visually. For PDFs >10 pages, use the `pages` parameter to read in batches (max 20 pages per read).

```
Read: file.pdf (pages: "1-10")
Read: file.pdf (pages: "11-20")
```

### Step 2: Page-by-Page Audit
For each page, check:

| Issue | What to Look For | Severity |
|-------|-----------------|----------|
| **Blank page** | Page with no content at all (or only header/footer) | Critical |
| **Near-blank page** | Page with <25% content coverage (one line, one heading, etc.) | Critical |
| **Excessive whitespace** | >40% of page is empty below content | High |
| **Orphan content** | Single line or small element alone on a page | High |
| **Content truncation** | Text cut off, tables split awkwardly, overflowing containers | High |
| **Font issues** | Missing fonts, wrong font rendering, boxes/squares | Medium |
| **Layout breaks** | Columns misaligned, overlapping elements | Medium |
| **Image issues** | Missing images, wrong size, pixelation | Medium |

### Step 3: Report Findings
After inspection, report to the user:
- Total page count (expected vs actual)
- Per-page summary (1-line description of what's on each page)
- Any issues found with severity rating
- If clean: explicit confirmation "All N pages verified — no blank pages, orphans, or whitespace issues"

### Step 4: Fix If Issues Found
Common CSS pagination fixes (in priority order):

1. **Blank pages from `page-break-after`**: Switch to `page-break-before: always` with `.page:first-child { page-break-before: auto; }`
2. **Remove `min-height: 100vh`** from page containers in print context
3. **Orphan content**: Reduce margins/padding, compress text (abbreviations, smaller font), or move content to fill the page
4. **`break-inside: avoid` pushing elements**: Remove if element is large enough to cause >40% whitespace on previous page; let it flow naturally
5. **After any fix**: Regenerate PDF and re-run this entire verification protocol

## Regeneration Checklist (Kultura-Retreat Specific)
- Playwright: `NODE_PATH=/c/Users/armen/tesla-model-x-dashboard/node_modules`
- Must serve HTML via localhost (Playwright blocks `file://`)
- PDF uses Google Fonts via @import — requires internet
- Kill HTTP server after generation (use targeted `taskkill` via PID from netstat)

## Anti-Patterns
- NEVER skip verification because "the HTML looked fine" — print rendering differs significantly
- NEVER report PDF as done without reading it
- NEVER assume page count from HTML section count — content overflow creates additional pages
- NEVER use `page-break-after: always` for multi-page HTML→PDF — use `page-break-before: always` instead
