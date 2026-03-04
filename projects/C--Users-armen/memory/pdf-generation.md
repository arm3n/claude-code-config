# PDF Generation Tools & Best Practices

## Installed Tools (2026-03-03)
- **Typst** v0.10.0: `npm install -g typst` → `npx typst compile input.typ output.pdf`
  - Best visual quality of tested tools (LaTeX-quality typography, justified text, proper kerning)
  - Smallest output files (~174 KB vs 694 KB Paged.js vs 912 KB Playwright)
  - Light theme recommended for print
  - npm version (0.10.0) is much older than latest (0.14+) — missing PDF/UA, character-level justification
  - Uses own `.typ` markup, NOT HTML/CSS
- **pagedjs-cli** v0.4.3: `npm install -g pagedjs-cli` → `npx pagedjs-cli input.html -o output.pdf`
  - Polyfills CSS Paged Media in browsers: `@page` margin boxes, running headers/footers, `counter(page)`, named pages, `string-set`
  - Uses Puppeteer internally (requires Chrome)
  - Known stability issues — dropped from print-css.rocks in 2023
- **WeasyPrint** v68.1: `pip install weasyprint` → `weasyprint input.html output.pdf`
  - Python-based, supports `@page` rules
  - **NO Flexbox or Grid** — only CSS 2.1 floats. Unsuitable for modern layouts.
  - Windows: needs MSYS2 for Pango (already installed)

## Tool Quality Ranking
1. **PrinceXML** — gold standard ($495+ license, not installed)
2. **Typst** — best free option, LaTeX-quality
3. **Paged.js CLI** — best free HTML→PDF with paged media
4. **Playwright/Puppeteer** — screen-quality, no paged media features
5. **WeasyPrint** — decent but no modern CSS layout

## Critical CSS for Dark-Themed PDFs
```css
/* MANDATORY — without this, browsers strip backgrounds in print */
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

/* Never use pure black/white on dark themes */
--bg: #1a1e2e;      /* dark blue-gray, NOT #000000 */
--text: #E0E0E0;    /* off-white, NOT #FFFFFF (halation) */
--text-secondary: #94A3B8;  /* warm gray */
```

## Design Rules (from 90+ expert sources)
- **Typography**: Max 2-3 fonts. Serif headings (Merriweather) + Sans body (Inter). Body 10-12pt, line-height 1.4-1.6x.
- **Dark mode**: Increase font weight by 1 step (400→450/500). Increase letter-spacing 0.01em. Desaturate accent colors ~15%.
- **Tables**: Horizontal lines only (not full grid). Right-align numeric columns. `font-variant-numeric: tabular-nums`. Min 32px between columns.
- **Page breaks**: `break-inside: avoid` on cards/tables/figures. `break-after: avoid` on headings. Remove forced `.page-break` divs.
- **Color contrast**: Min 4.5:1 body text (WCAG AA), 7:1 for print (Scope guidelines). Test with WebAIM checker.
- **Bars/charts**: Gradient fills > flat colors. Numeric labels at end of bars. Consistent height/spacing.

## Paged Media CSS (Paged.js polyfills these)
```css
@page {
  size: A4;
  margin: 25mm 22mm;
  @top-right { content: string(section-title); }
  @bottom-center { content: counter(page); }
}
@page cover { @top-right { content: none; } @bottom-center { content: none; } }
h2 { string-set: section-title content(text); }
```

## Playwright PDF Workaround
Playwright blocks `file://` URLs. Must serve HTML via HTTP:
```bash
python -m http.server 8766  # background, in the reports dir
# Then navigate Playwright to http://localhost:8766/file.html
# Then page.pdf({ format: 'A4', printBackground: true, margin: { top: '15mm', ... } })
```

## Research Sources
90+ sources analyzed (2026-03-03). Key references:
- print-css.rocks — renderer comparison (Prince, WeasyPrint, Paged.js, etc.)
- Smashing Magazine — CSS for print design (Rachel Andrew)
- Datawrapper — color palettes for data visualization
- DesignShack — dark mode typography rules
- Typst blog — automated PDF generation pipelines
