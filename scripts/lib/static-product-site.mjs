import webImages from '../../_site-src/shared/images.json' with { type: 'json' };
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { escapeHtml, localeMenu, header, productNav, footer, resolveProduct, landing, documentContent } from './design-system.mjs';
export { escapeHtml } from './design-system.mjs';
export const renderDesignLocaleSwitcher = localeMenu;
const SITE_ORIGIN = 'https://jaminzhou.com';

export function validateHtmlStructure(html) {
  const trackedTags = new Set([
    "html",
    "head",
    "body",
    "main",
    "nav",
    "details",
    "summary",
    "div",
    "section",
    "article",
    "footer",
    "ul",
    "ol",
    "dl",
    "pre",
    "code",
  ]);
  const stack = [];
  const errors = [];

  for (const match of html.matchAll(/<(\/)?([a-z][a-z0-9-]*)\b[^>]*>/gi)) {
    const [, closing, rawTag] = match;
    const tag = rawTag.toLowerCase();
    if (!trackedTags.has(tag)) continue;

    if (!closing) {
      stack.push(tag);
      continue;
    }

    const openTag = stack.pop();
    if (openTag !== tag) {
      errors.push(`Expected </${openTag ?? "none"}> before </${tag}>`);
    }
  }

  for (const tag of stack.reverse()) {
    errors.push(`Missing </${tag}>`);
  }
  return errors;
}

export function renderStructuredData(structuredData) {
  if (!structuredData) return "";

  const json = JSON.stringify(structuredData, null, 2)
    .replaceAll("<", "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029")
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");
  return `  <script type="application/ld+json">\n${json}\n  </script>\n`;
}

export function renderImageDimensions(metadata) {
  if (!metadata.ogImageWidth || !metadata.ogImageHeight) return "";
  return `  <meta property="og:image:width" content="${escapeHtml(metadata.ogImageWidth)}">\n  <meta property="og:image:height" content="${escapeHtml(metadata.ogImageHeight)}">\n`;
}

export function createStaticProductSite({
  repositoryRoot,
  sourceDirectory,
  productSegment,
  productName,
  defaultLocaleId,
  locales,
  surfaces,
}) {
  const sourceRoot = path.join(repositoryRoot, "_site-src", sourceDirectory);
  const localeIds = new Set(locales.map((locale) => locale.id));
  const surfaceIds = new Set(surfaces.map((surface) => surface.id));

  if (localeIds.size !== locales.length) throw new Error(`${productName}: duplicate locale ids`);
  if (surfaceIds.size !== surfaces.length) throw new Error(`${productName}: duplicate surface ids`);
  if (!localeIds.has(defaultLocaleId)) {
    throw new Error(`${productName}: unknown default locale ${defaultLocaleId}`);
  }

  function localeFor(id) {
    const locale = locales.find((candidate) => candidate.id === id);
    if (!locale) throw new Error(`${productName}: unknown locale ${id}`);
    return locale;
  }

  function surfaceFor(id) {
    const surface = surfaces.find((candidate) => candidate.id === id);
    if (!surface) throw new Error(`${productName}: unknown surface ${id}`);
    return surface;
  }

  function routePath(localeId, surfaceId) {
    const locale = localeFor(localeId);
    const surface = surfaceFor(surfaceId);
    const segments = [productSegment, locale.segment, surface.segment].filter(Boolean);
    return `/${segments.join("/")}/`;
  }

  function pageOutputPath(localeId, surfaceId) {
    return path.posix.join(routePath(localeId, surfaceId), "index.html").slice(1);
  }

  function renderAlternateLinks(surfaceId) {
    if (locales.length === 1) return "";

    const lines = locales.map(
      (locale) =>
        `  <link rel="alternate" hreflang="${escapeHtml(locale.hreflang)}" href="${SITE_ORIGIN}${routePath(locale.id, surfaceId)}">`,
    );
    lines.push(
      `  <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${routePath(defaultLocaleId, surfaceId)}">`,
    );
    return `${lines.join("\n")}\n`;
  }

  function renderLocaleSwitcher(localeId, surfaceId) {
    return renderDesignLocaleSwitcher({
      locales,
      currentLocale: localeFor(localeId),
      routeFor: (targetLocaleId) => routePath(targetLocaleId, surfaceId),
    });
  }

  function renderPage({ localeId, surfaceId, metadata, content, template, product }) {
    const locale = localeFor(localeId);
    const values = {
      "{{LANG}}": escapeHtml(locale.id),
      "{{TITLE}}": escapeHtml(metadata.title),
      "{{DESCRIPTION}}": escapeHtml(metadata.description),
      "{{CANONICAL}}": `${SITE_ORIGIN}${routePath(localeId, surfaceId)}`,
      "{{ALTERNATE_LINKS}}": renderAlternateLinks(surfaceId),
      "{{FEED_LINK}}": "",
      "{{OG_TITLE}}": escapeHtml(metadata.ogTitle),
      "{{OG_DESCRIPTION}}": escapeHtml(metadata.ogDescription),
      "{{OG_IMAGE_DIMENSIONS}}": renderImageDimensions(metadata),
      "{{TWITTER_TITLE}}": escapeHtml(metadata.twitterTitle ?? metadata.ogTitle),
      "{{TWITTER_DESCRIPTION}}": escapeHtml(metadata.twitterDescription ?? metadata.ogDescription),
      "{{STRUCTURED_DATA}}": renderStructuredData(metadata.structuredData),
      "{{ICON}}": `/${productSegment}/app-icon.png`,
      "{{SITE_NAME}}": escapeHtml(productName),
      "{{PRODUCT_ATTRIBUTE}}": product ? ` data-product="${escapeHtml(product.id)}"` : '',
      "{{BODY_HEADER}}": product ? header(localeId, product) + productNav(product, locale, surfaceId, locales) : '',
      "{{BODY_CLASS}}": surfaceId === 'landing' ? 'product-page' : 'document-page',
      "{{CONTENT}}": product ? (surfaceId === 'landing' ? landing(product, metadata, content, localeId) : documentContent(product, content, localeId, surfaceId)) : content,
      "{{FOOTER}}": footer(localeId),
    };
    return fillTemplate(template, values);
  }

  async function loadManifest() {
    return JSON.parse(await readFile(path.join(sourceRoot, "pages.json"), "utf8"));
  }

  async function loadPage(manifest, localeId, surfaceId) {
    const key = `${localeId}.${surfaceId}`;
    const metadata = manifest.pages[key];
    if (!metadata) throw new Error(`${productName}: missing page metadata ${key}`);

    const contentPath = path.join(sourceRoot, "content", localeId, `${surfaceId}.html`);
    const content = await readFile(contentPath, "utf8");
    return { localeId, surfaceId, metadata, content };
  }

  async function buildSite({ write = false } = {}) {
    const manifest = await loadManifest();
    const product = manifest.product ? resolveProduct(manifest) : null;
    const template = await readFile(product ? path.join(repositoryRoot, '_site-src/shared/template.html') : path.join(sourceRoot, 'template.html'), 'utf8');
    const pages = new Map();

    for (const locale of locales) {
      for (const surface of surfaces) {
        const page = await loadPage(manifest, locale.id, surface.id);
        const relativePath = pageOutputPath(locale.id, surface.id);
        const rendered = renderPage({ ...page, template, product });
        pages.set(relativePath, rendered);

        if (write) {
          const outputPath = path.join(repositoryRoot, relativePath);
          await mkdir(path.dirname(outputPath), { recursive: true });
          await writeFile(outputPath, rendered);
        }
      }
    }

    return pages;
  }

  async function checkSite() {
    const pages = await buildSite({ write: false });
    const stale = [];

    for (const [relativePath, rendered] of pages) {
      const current = await readFile(path.join(repositoryRoot, relativePath), "utf8");
      if (current !== rendered) stale.push(relativePath);

      const structureErrors = validateHtmlStructure(rendered);
      if (structureErrors.length > 0) {
        throw new Error(`${relativePath}:\n${structureErrors.join("\n")}`);
      }
    }

    if (stale.length > 0) {
      throw new Error(
        `Generated ${productName} pages are stale:\n${stale.map((item) => `- ${item}`).join("\n")}`,
      );
    }
  }

  return Object.freeze({
    locales,
    surfaces,
    routePath,
    pageOutputPath,
    renderAlternateLinks,
    renderLocaleSwitcher,
    buildSite,
    checkSite,
  });
}

export async function runStaticProductSiteCli(site, command = "--check") {
  if (command === "--write") {
    await site.buildSite({ write: true });
  } else if (command === "--check") {
    await site.checkSite();
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
}

export function fillTemplate(template, values) {
  let rendered = template;
  for (const [token, value] of Object.entries(values)) rendered = rendered.replaceAll(token, value);
  const unresolved = rendered.match(/\{\{[A-Z_]+\}\}/g);
  if (unresolved) throw new Error(`Unresolved template tokens: ${unresolved.join(', ')}`);
  return rendered.replace(/<img\b[^>]*>/g, tag => tag.replace(/\bsrc="([^"]+)"/, (match, src) => webImages[src] ? `src="${webImages[src].src}"` : match));
}
