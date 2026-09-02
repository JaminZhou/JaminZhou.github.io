import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_ORIGIN = "https://jaminzhou.com";

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const ICONS = Object.freeze({
  globe:
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3.6 9h16.8"></path><path d="M3.6 15h16.8"></path><path d="M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.6-3.6-9s1.2-6.4 3.6-9z"></path></svg>',
  caret:
    '<svg class="language-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>',
  check:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"></path></svg>',
  back:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>',
  mail:
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>',
  support:
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="3.6"></circle><path d="m14.6 9.4 3.3-3.3"></path><path d="m6.1 17.9 3.3-3.3"></path><path d="m14.6 14.6 3.3 3.3"></path><path d="m6.1 6.1 3.3 3.3"></path></svg>',
});

const DEFAULT_UI = Object.freeze({
  breadcrumbLabel: "Breadcrumb",
  products: "Products",
  support: "Support",
  privacy: "Privacy",
  changelog: "Changelog",
  clamshell: "Closed-lid",
  emailSupport: "Email support",
});

function interfaceCopy(locale, productName) {
  return {
    ...DEFAULT_UI,
    backToProduct: `Back to ${productName}`,
    ...locale.ui,
  };
}

function surfaceLabel(ui, surfaceId) {
  return surfaceId === "landing" ? null : (ui[surfaceId] ?? surfaceId);
}

function localeAbbreviation(localeId) {
  return (
    {
      "pt-BR": "PT-BR",
      "zh-Hans": "ZH-CN",
      "zh-Hant": "ZH-TW",
    }[localeId] ?? localeId.toUpperCase()
  );
}

export function renderDesignLocaleSwitcher({ locales, currentLocale, routeFor }) {
  if (locales.length < 2) return "";

  const links = locales
    .map((locale) => {
      const isCurrent = locale.id === currentLocale.id;
      return `          <li><a class="locale-link" href="${escapeHtml(routeFor(locale.id))}" hreflang="${escapeHtml(locale.hreflang)}" lang="${escapeHtml(locale.id)}"${isCurrent ? ' aria-current="page"' : ""}>${escapeHtml(locale.label)}${isCurrent ? ICONS.check : ""}</a></li>`;
    })
    .join("\n");

  return `    <details class="language-menu">
      <summary aria-label="${escapeHtml(currentLocale.menuLabel)} — ${escapeHtml(currentLocale.label)}">
        ${ICONS.globe}
        <span class="language-full">${escapeHtml(currentLocale.label)}</span>
        <span class="language-abbr" style="display:none">${escapeHtml(localeAbbreviation(currentLocale.id))}</span>
        ${ICONS.caret}
      </summary>
      <div class="language-options">
        <span class="language-options-label">${escapeHtml(currentLocale.menuLabel)}</span>
        <ul class="language-options-list" aria-label="${escapeHtml(currentLocale.menuLabel)}">
${links}
        </ul>
      </div>
    </details>`;
}

function renderHeaderAction({
  productName,
  surfaceId,
  storeUrl,
  storeLabel,
  routeForSurface,
  ui,
}) {
  if (surfaceId === "landing" && storeUrl) {
    return `    <a class="header-action" href="${escapeHtml(storeUrl)}"><span class="header-action-label">${escapeHtml(storeLabel ?? "App Store")}</span></a>`;
  }
  if (surfaceId === "landing") {
    const supportRoute = routeForSurface("support");
    return supportRoute
      ? `    <a class="header-action" href="${escapeHtml(supportRoute)}">${ICONS.support}<span class="header-action-label">${escapeHtml(ui.support)}</span></a>`
      : "";
  }
  if (surfaceId === "support") {
    return `    <a class="header-action" href="mailto:me@jaminzhou.com?subject=${encodeURIComponent(`${productName} ${ui.support}`)}" aria-label="${escapeHtml(ui.emailSupport)}">${ICONS.mail}<span class="header-action-label">${escapeHtml(ui.emailSupport)}</span></a>`;
  }
  if (surfaceId === "privacy") {
    return `    <a class="header-action" href="${escapeHtml(routeForSurface("landing"))}" aria-label="${escapeHtml(ui.backToProduct)}">${ICONS.back}<span class="header-action-label">${escapeHtml(ui.backToProduct)}</span></a>`;
  }
  const supportRoute = routeForSurface("support");
  return supportRoute
    ? `    <a class="header-action" href="${escapeHtml(supportRoute)}" aria-label="${escapeHtml(ui.support)}">${ICONS.support}<span class="header-action-label">${escapeHtml(ui.support)}</span></a>`
    : "";
}

export function renderProductMasthead({
  locales,
  currentLocale,
  routeFor,
  productName,
  surfaceId,
  storeUrl,
  storeLabel,
  routeForSurface,
}) {
  const ui = interfaceCopy(currentLocale, productName);
  const currentSurfaceLabel = surfaceLabel(ui, surfaceId);
  const crumb = currentSurfaceLabel
    ? `      <span aria-hidden="true" class="hide-small">/</span>\n      <a class="hide-small" href="${escapeHtml(routeForSurface("landing"))}">${escapeHtml(productName)}</a>\n      <span aria-hidden="true">/</span>\n      <span aria-current="page">${escapeHtml(currentSurfaceLabel)}</span>`
    : `      <span aria-hidden="true" class="hide-small">/</span>\n      <a class="hide-small" href="/#products">${escapeHtml(ui.products)}</a>\n      <span aria-hidden="true">/</span>\n      <span aria-current="page">${escapeHtml(productName)}</span>`;
  const switcher = renderDesignLocaleSwitcher({ locales, currentLocale, routeFor });
  const action = renderHeaderAction({
    productName,
    surfaceId,
    storeUrl,
    storeLabel,
    routeForSurface,
    ui,
  });

  return `<header class="site-masthead">
  <div class="masthead-inner">
    <a class="brand-link" href="/">
      <img src="/images/jamin-zhou-avatar.png" alt="" width="26" height="26">
      <span>JaminZhou</span>
    </a>
    <nav class="breadcrumbs" aria-label="${escapeHtml(ui.breadcrumbLabel)}">
${crumb}
    </nav>
${switcher ? `${switcher}\n` : ""}${action}
  </div>
</header>`;
}

export function decorateProductContent({
  content,
  productName,
  productSegment,
  surfaceId,
  currentLocale,
}) {
  if (surfaceId === "landing" || /data-r="(?:ph1|dh1|sh1|ch1)"/.test(content)) {
    return content;
  }

  const currentSurfaceLabel = surfaceLabel(interfaceCopy(currentLocale, productName), surfaceId);
  return `<div class="product-identity">
    <img src="/${escapeHtml(productSegment)}/app-icon.png" alt="" width="52" height="52">
    <span>${escapeHtml(productName)} · ${escapeHtml(currentSurfaceLabel)}</span>
  </div>
${content}`;
}

export function productBodyClass({ productSegment, surfaceId }) {
  const surfaceClass =
    surfaceId === "privacy"
      ? "surface-document"
      : surfaceId === "landing"
        ? "surface-product"
        : `surface-${surfaceId}`;
  return `theme-${productSegment} ${surfaceClass}`;
}

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

function renderStructuredData(structuredData) {
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

function renderImageDimensions(metadata) {
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
  storeUrl,
  storeLabel,
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

  function renderPage({ localeId, surfaceId, metadata, content, template }) {
    const locale = localeFor(localeId);
    const canonical = `${SITE_ORIGIN}${routePath(localeId, surfaceId)}`;
    const bodyHeader = renderProductMasthead({
      locales,
      currentLocale: locale,
      routeFor: (targetLocaleId) => routePath(targetLocaleId, surfaceId),
      productName,
      surfaceId,
      storeUrl,
      storeLabel,
      routeForSurface: (targetSurfaceId) =>
        surfaceIds.has(targetSurfaceId) ? routePath(localeId, targetSurfaceId) : null,
    });
    const values = {
      "{{LANG}}": locale.id,
      "{{TITLE}}": escapeHtml(metadata.title),
      "{{DESCRIPTION}}": escapeHtml(metadata.description),
      "{{CANONICAL}}": canonical,
      "{{ALTERNATE_LINKS}}": renderAlternateLinks(surfaceId),
      "{{OG_TITLE}}": escapeHtml(metadata.ogTitle),
      "{{OG_DESCRIPTION}}": escapeHtml(metadata.ogDescription),
      "{{OG_IMAGE_DIMENSIONS}}": renderImageDimensions(metadata),
      "{{TWITTER_TITLE}}": escapeHtml(metadata.twitterTitle ?? metadata.ogTitle),
      "{{TWITTER_DESCRIPTION}}": escapeHtml(
        metadata.twitterDescription ?? metadata.ogDescription,
      ),
      "{{STRUCTURED_DATA}}": renderStructuredData(metadata.structuredData),
      "{{BODY_HEADER}}": bodyHeader ? `${bodyHeader}\n` : "",
      "{{BODY_CLASS}}": productBodyClass({ productSegment, surfaceId }),
      "{{CONTENT}}": decorateProductContent({
        content: content.trimEnd(),
        productName,
        productSegment,
        surfaceId,
        currentLocale: locale,
      }),
    };

    let rendered = template;
    for (const [token, value] of Object.entries(values)) {
      rendered = rendered.replaceAll(token, value);
    }

    const unresolvedTokens = rendered.match(/\{\{[A-Z_]+\}\}/g);
    if (unresolvedTokens) {
      throw new Error(`${productName}: unresolved tokens ${unresolvedTokens.join(", ")}`);
    }
    return rendered;
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
    const template = await readFile(path.join(sourceRoot, "template.html"), "utf8");
    const pages = new Map();

    for (const locale of locales) {
      for (const surface of surfaces) {
        const page = await loadPage(manifest, locale.id, surface.id);
        const relativePath = pageOutputPath(locale.id, surface.id);
        const rendered = renderPage({ ...page, template });
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
