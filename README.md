# JaminZhou.github.io

Static files for [jaminzhou.com](https://jaminzhou.com), published by GitHub Pages
from the repository root. Node builds ordinary HTML; there is no client framework,
web-font request, analytics service or runtime content API.

## Build and verify

```sh
npm ci
npm run build:site
npm test
npm run check:site
```

The build generates 87 existing product/document routes, English and Simplified
Chinese homepages, the existing `/support/` directory, and a 404 page. The 12 CalcBird redirects
remain unchanged. iCube's two independent privacy pages are excluded from the redesign.
Do not edit generated HTML directly.

For local review:

```sh
npm run build:preview
python3 _design/serve.py --port 8080
```

Open `http://127.0.0.1:8080/`. `/design/` and `/design/responsive/` are local review
boards, absent from the production footer. The preview listens on loopback and adds
noindex protection; production canonical/hreflang metadata remains separate.

## Source and reuse

- `_site-src/<product>/pages.json`: localized SEO and release metadata, hero copy,
  product names, platforms, availability, colors, icon optical sizing and media mode.
- `_site-src/<product>/content/<locale>/<surface>.html`: localized content fragments.
  Document h2 elements have stable ids; optional `data-toc-label` supplies concise
  release-version labels. Shared TOCs are derived from these headings.
- `_site-src/shared/template.html`: the one document shell for all modern pages.
- `_site-src/shared/content/`: homepage, support-directory and error-page copy.
- `_site-src/shared/interface.json`: common interface labels in nine languages.
- `scripts/lib/design-system.mjs`: header, product navigation, footer, app icons,
  directory cards, product heroes, document layouts and generated product colors.
- `scripts/lib/static-product-site.mjs`: shared routing, metadata escaping, static
  rendering and stale-output checks. Product build scripts define locale/surface matrices.
- `assets/design/`: semantic tokens, components and progressive interactions.

Version and download URL come from each product's existing `en.landing.structuredData`
fields. The shared directory and hero read those fields; do not introduce a second
release list. Unreleased FIRE has an explicit presentation version and no download CTA.
Release paragraphs can use `{{RELEASE_VERSION}}` instead of repeating a version number.
Rouse retains its additional version-consistency validation.

All six products use the same components. Homepage entries appear once; Mac and
iPhone/iPad filters enhance the static directory. Global navigation contains Apps,
About and a Support disclosure linking directly to each app's help page. Mobile
navigation groups the same links under Support. Both use product manifests to
choose the current locale or explicitly label an English fallback. The existing
`/support/` directory remains available for incoming links. The avatar appears only
in About. The footer contains copyright, GitHub, the email address and the theme
control; the homepage has one mail link and no separate support or contact block.
Light/dark defaults to the system;
a manual preference persists locally. The footer keeps copyright left and appearance
right on desktop, then stacks on narrow screens. Fine-pointer selectors are 32px tall;
coarse-pointer selectors retain a 44px touch target.

To add a product, provide its manifest, localized fragments and genuine assets, define
its routes with `createStaticProductSite`, then register its id and build/check command.
Choose the compact, screenshot or widget hero mode. No layout or navigation CSS needs
copying. Keep the sitemap and locale/surface tests synchronized.

## Images

Original screenshots remain in each product's `screenshots/` or `images/` directory.
Display assets in `assets/media/` are WebP copies, with source/output hashes recorded
in `_site-src/shared/images.json`. The renderer substitutes image sources; original
screenshot links and SEO icon URLs remain available. The homepage makes no font request.

After changing a source image, regenerate display files with `cwebp` installed:

```sh
python3 scripts/optimize-site-images.py
npm run build:site
```

Normal builds and CI use committed assets and do not require the image encoder.
FIRE's PNG icon was technically re-encoded to restore local browser decoding; it was
not redrawn. App screenshots and widgets use example content, not private user data.

## Verification boundaries

Tests cover all modern routes, release metadata, locale-preserving links, generated
output, SEO, anchors, asset hashes/budgets, catalog uniqueness and unchanged iCube pages.
The initial migration also compared 2,785 original content blocks and 155 external
service/release links against commit `c5e96f3`. Browser evidence and limitations are
recorded in `_design/VALIDATION.md`.

The old Classical asset files remain for compatibility but are not loaded by the new
pages. `/codex-ui-kit/` is an independent project site and retains its sitemap entry;
the paused project's homepage promotion has been removed. Deployment is separate from
local implementation and preview verification.
