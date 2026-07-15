# JaminZhou.github.io

Static files for [jaminzhou.com](https://jaminzhou.com), published by GitHub
Pages from the repository root.

## Generated product pages

Rouse, CalcBird, and Hushtrail keep their deployed pages as plain HTML so every
route remains directly publishable by GitHub Pages. Do not edit generated HTML
under `rouse/`, `calcbird/`, or `hushtrail/` directly.

Each product owns its template, page metadata, and content fragments under
`_site-src/<product>/`. CalcBird and Hushtrail share the reusable renderer in
`scripts/lib/static-product-site.mjs`; their visual templates remain separate.

Commands:

```sh
npm run build:site
npm test
npm run check:site
```

Tests verify the product page matrices, URLs, canonical alternates, language
switchers where applicable, balanced structural HTML, sitemap coverage,
root-relative links, and that committed output matches generated output.

## Rouse source layout

Rouse keeps its deployed pages as plain HTML so every locale has a stable URL,
canonical metadata, and reciprocal `hreflang` links. Do not edit the generated
HTML under `rouse/` directly.

Source files:

- `_site-src/rouse/template.html` — shared document shell and metadata layout
- `_site-src/rouse/pages.json` — localized page titles, descriptions, and
  structured data
- `_site-src/rouse/content/<locale>/<surface>.html` — localized page content
- `scripts/build-rouse-site.mjs` — dependency-free static page generator

Commands:

```sh
npm run build:rouse
npm test
npm run check:rouse
```

`build:rouse` regenerates all 40 committed pages. Tests verify the locale and
surface matrix, URLs, canonical alternates, language switcher, balanced
structural HTML, sitemap coverage, and that generated output is current.

## CalcBird and Hushtrail source layout

- `_site-src/calcbird/` — four locales across landing, support, and privacy
- `_site-src/hushtrail/` — the existing English landing, support, and privacy
- `scripts/build-calcbird-site.mjs` — CalcBird site definition and routes
- `scripts/build-hushtrail-site.mjs` — Hushtrail site definition and routes
- `scripts/lib/static-product-site.mjs` — shared build-time renderer
