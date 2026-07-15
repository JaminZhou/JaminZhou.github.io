# JaminZhou.github.io

Static files for [jaminzhou.com](https://jaminzhou.com), published by GitHub
Pages from the repository root.

## Rouse localized pages

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
