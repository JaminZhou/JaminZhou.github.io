import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const SOURCE_ROOT = path.join(REPOSITORY_ROOT, "_site-src", "rouse");
const SITE_ORIGIN = "https://jaminzhou.com";

export const LOCALES = Object.freeze([
  { id: "en", hreflang: "en", segment: "", label: "English", menuLabel: "Language" },
  { id: "de", hreflang: "de", segment: "de", label: "Deutsch", menuLabel: "Sprache" },
  { id: "fr", hreflang: "fr", segment: "fr", label: "Français", menuLabel: "Langue" },
  { id: "es", hreflang: "es", segment: "es", label: "Español", menuLabel: "Idioma" },
  {
    id: "pt-BR",
    hreflang: "pt-BR",
    segment: "pt-br",
    label: "Português (Brasil)",
    menuLabel: "Idioma",
  },
  { id: "ko", hreflang: "ko", segment: "ko", label: "한국어", menuLabel: "언어" },
  { id: "ja", hreflang: "ja", segment: "ja", label: "日本語", menuLabel: "言語" },
  {
    id: "zh-Hans",
    hreflang: "zh-Hans",
    segment: "zh-hans",
    label: "简体中文",
    menuLabel: "语言",
  },
  {
    id: "zh-Hant",
    hreflang: "zh-Hant",
    segment: "zh-hant",
    label: "繁體中文",
    menuLabel: "語言",
  },
]);

export const SURFACES = Object.freeze([
  { id: "landing", segment: "" },
  { id: "changelog", segment: "changelog" },
  { id: "support", segment: "support" },
  { id: "privacy", segment: "privacy" },
  { id: "clamshell", segment: "support/clamshell" },
]);

function localeFor(id) {
  const locale = LOCALES.find((candidate) => candidate.id === id);
  if (!locale) throw new Error(`Unknown locale: ${id}`);
  return locale;
}

function surfaceFor(id) {
  const surface = SURFACES.find((candidate) => candidate.id === id);
  if (!surface) throw new Error(`Unknown surface: ${id}`);
  return surface;
}

function routePath(localeId, surfaceId) {
  const locale = localeFor(localeId);
  const surface = surfaceFor(surfaceId);
  const segments = ["rouse", locale.segment, surface.segment].filter(Boolean);
  return `/${segments.join("/")}/`;
}

export function pageOutputPath(localeId, surfaceId) {
  return path.posix.join(routePath(localeId, surfaceId), "index.html").slice(1);
}

export function renderAlternateLinks(_localeId, surfaceId) {
  const lines = LOCALES.map(
    (locale) =>
      `  <link rel="alternate" hreflang="${locale.hreflang}" href="${SITE_ORIGIN}${routePath(locale.id, surfaceId)}">`,
  );
  lines.push(
    `  <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${routePath("en", surfaceId)}">`,
  );
  return lines.join("\n");
}

export function renderLocaleSwitcher(localeId, surfaceId) {
  const current = localeFor(localeId);
  const links = LOCALES.map((locale) => {
    const currentAttribute = locale.id === localeId ? ' aria-current="page"' : "";
    return `          <a class="locale-link" href="${routePath(locale.id, surfaceId)}" hreflang="${locale.hreflang}" lang="${locale.id}"${currentAttribute}>${locale.label}</a>`;
  }).join("\n");

  return `    <nav class="locale-switch" aria-label="${current.menuLabel}">
      <details class="language-menu">
        <summary>
          <span class="language-label">${current.menuLabel}</span>
          <span class="language-current" lang="${current.id}">${current.label}</span>
        </summary>
        <div class="language-options">
${links}
        </div>
      </details>
    </nav>`;
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

export function validateReleaseVersionConsistency({ manifest, pages, homepage }) {
  const errors = [];
  const expectedVersion = manifest.pages?.["en.landing"]?.structuredData?.softwareVersion;

  if (typeof expectedVersion !== "string" || !/^\d+\.\d+\.\d+$/.test(expectedVersion)) {
    return ["en.landing must define a semantic structuredData.softwareVersion"];
  }

  for (const locale of LOCALES) {
    const pageKey = `${locale.id}.landing`;
    const structuredVersion = manifest.pages?.[pageKey]?.structuredData?.softwareVersion;
    if (structuredVersion !== expectedVersion) {
      errors.push(
        `${pageKey} softwareVersion is ${JSON.stringify(structuredVersion)}; expected ${JSON.stringify(expectedVersion)}`,
      );
    }

    const relativePath = pageOutputPath(locale.id, "landing");
    const html = pages.get(relativePath);
    if (typeof html !== "string") {
      errors.push(`${relativePath} is missing from generated Rouse pages`);
      continue;
    }

    const visibleHtml = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
    const mismatchedVisibleVersions = [
      ...new Set(
        [...visibleHtml.matchAll(/\b\d+\.\d+\.\d+\b/g)]
          .map((match) => match[0])
          .filter((version) => version !== expectedVersion),
      ),
    ];
    if (mismatchedVisibleVersions.length > 0) {
      errors.push(
        `${relativePath} contains visible version ${mismatchedVisibleVersions.map((version) => JSON.stringify(version)).join(", ")}; expected ${JSON.stringify(expectedVersion)}`,
      );
    }

    const visibleVersions = [...html.matchAll(/<dd>\s*([^<]+?)\s*<\/dd>/g)].map(
      (match) => match[1],
    );
    if (!visibleVersions.includes(expectedVersion)) {
      errors.push(
        `${relativePath} visible version metric does not include ${JSON.stringify(expectedVersion)}`,
      );
    }
  }

  const homepageMetric = homepage.match(
    /<div class="metric">\s*<strong>\s*([^<]+?)\s*<\/strong>\s*<span>\s*Rouse for macOS\s*<\/span>\s*<\/div>/,
  );
  if (!homepageMetric) {
    errors.push("index.html is missing the Rouse for macOS version metric");
  } else if (homepageMetric[1] !== expectedVersion) {
    errors.push(
      `index.html Rouse metric version is ${JSON.stringify(homepageMetric[1])}; expected ${JSON.stringify(expectedVersion)}`,
    );
  }

  return errors;
}

function renderStructuredData(structuredData) {
  if (!structuredData) return "";

  const json = JSON.stringify(structuredData, null, 2)
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");
  return `\n  <script type="application/ld+json">\n${json}\n  </script>`;
}

function renderPage({ localeId, surfaceId, metadata, content, template }) {
  const locale = localeFor(localeId);
  const canonical = `${SITE_ORIGIN}${routePath(localeId, surfaceId)}`;
  const homeLink =
    surfaceId === "landing" ? '    <a class="toplink" href="/">JaminZhou home</a>\n' : "";
  const values = {
    "{{LANG}}": locale.id,
    "{{TITLE}}": metadata.title,
    "{{DESCRIPTION}}": metadata.description,
    "{{CANONICAL}}": canonical,
    "{{ALTERNATE_LINKS}}": renderAlternateLinks(localeId, surfaceId),
    "{{OG_TITLE}}": metadata.ogTitle,
    "{{OG_DESCRIPTION}}": metadata.ogDescription,
    "{{TWITTER_TITLE}}": metadata.twitterTitle,
    "{{TWITTER_DESCRIPTION}}": metadata.twitterDescription,
    "{{STRUCTURED_DATA}}": renderStructuredData(metadata.structuredData),
    "{{HOME_LINK}}": homeLink,
    "{{LOCALE_SWITCHER}}": renderLocaleSwitcher(localeId, surfaceId),
    "{{CONTENT}}": content.trimEnd(),
  };
  let rendered = template;
  for (const [token, value] of Object.entries(values)) {
    rendered = rendered.replaceAll(token, value);
  }
  const unresolvedTokens = rendered.match(/\{\{[A-Z_]+\}\}/g);
  if (unresolvedTokens) {
    throw new Error(`Unresolved template tokens: ${unresolvedTokens.join(", ")}`);
  }
  return rendered;
}

async function loadManifest() {
  return JSON.parse(await readFile(path.join(SOURCE_ROOT, "pages.json"), "utf8"));
}

async function loadPage(manifest, localeId, surfaceId) {
  const key = `${localeId}.${surfaceId}`;
  const metadata = manifest.pages[key];
  if (!metadata) throw new Error(`Missing page metadata: ${key}`);

  const contentPath = path.join(SOURCE_ROOT, "content", localeId, `${surfaceId}.html`);
  const content = await readFile(contentPath, "utf8");
  return { localeId, surfaceId, metadata, content };
}

export async function buildSite({ write = false } = {}) {
  const manifest = await loadManifest();
  const template = await readFile(path.join(SOURCE_ROOT, "template.html"), "utf8");
  const pages = new Map();

  for (const locale of LOCALES) {
    for (const surface of SURFACES) {
      const page = await loadPage(manifest, locale.id, surface.id);
      const relativePath = pageOutputPath(locale.id, surface.id);
      const rendered = renderPage({ ...page, template });
      pages.set(relativePath, rendered);

      if (write) {
        const outputPath = path.join(REPOSITORY_ROOT, relativePath);
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
    const current = await readFile(path.join(REPOSITORY_ROOT, relativePath), "utf8");
    if (current !== rendered) stale.push(relativePath);
    const structureErrors = validateHtmlStructure(rendered);
    if (structureErrors.length > 0) {
      throw new Error(`${relativePath}:\n${structureErrors.join("\n")}`);
    }
  }

  const manifest = await loadManifest();
  const homepage = await readFile(path.join(REPOSITORY_ROOT, "index.html"), "utf8");
  const versionErrors = validateReleaseVersionConsistency({ manifest, pages, homepage });
  if (versionErrors.length > 0) {
    throw new Error(`Rouse release versions are inconsistent:\n${versionErrors.join("\n")}`);
  }

  if (stale.length > 0) {
    throw new Error(`Generated Rouse pages are stale:\n${stale.map((item) => `- ${item}`).join("\n")}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] ?? "--check";
  if (command === "--write") {
    await buildSite({ write: true });
  } else if (command === "--check") {
    await checkSite();
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
}
