import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  decorateProductContent,
  escapeHtml,
  productBodyClass,
  renderDesignLocaleSwitcher,
  renderProductMasthead,
  validateHtmlStructure as validateSharedHtmlStructure,
} from "./lib/static-product-site.mjs";

const REPOSITORY_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const SOURCE_ROOT = path.join(REPOSITORY_ROOT, "_site-src", "rouse");
const SITE_ORIGIN = "https://jaminzhou.com";

export const LOCALES = Object.freeze([
  { id: "en", hreflang: "en", segment: "", label: "English", menuLabel: "Language" },
  {
    id: "de",
    hreflang: "de",
    segment: "de",
    label: "Deutsch",
    menuLabel: "Sprache",
    ui: {
      breadcrumbLabel: "Brotkrümelnavigation",
      products: "Produkte",
      support: "Support",
      privacy: "Datenschutz",
      changelog: "Versionsverlauf",
      clamshell: "Geschlossener Deckel",
      emailSupport: "Support per E-Mail",
      backToProduct: "Zurück zu Rouse",
    },
  },
  {
    id: "fr",
    hreflang: "fr",
    segment: "fr",
    label: "Français",
    menuLabel: "Langue",
    ui: {
      breadcrumbLabel: "Fil d’Ariane",
      products: "Produits",
      support: "Assistance",
      privacy: "Confidentialité",
      changelog: "Notes de version",
      clamshell: "Écran fermé",
      emailSupport: "Assistance par e-mail",
      backToProduct: "Retour à Rouse",
    },
  },
  {
    id: "es",
    hreflang: "es",
    segment: "es",
    label: "Español",
    menuLabel: "Idioma",
    ui: {
      breadcrumbLabel: "Ruta de navegación",
      products: "Productos",
      support: "Soporte",
      privacy: "Privacidad",
      changelog: "Registro de cambios",
      clamshell: "Tapa cerrada",
      emailSupport: "Soporte por correo",
      backToProduct: "Volver a Rouse",
    },
  },
  {
    id: "pt-BR",
    hreflang: "pt-BR",
    segment: "pt-br",
    label: "Português (Brasil)",
    menuLabel: "Idioma",
    ui: {
      breadcrumbLabel: "Navegação estrutural",
      products: "Produtos",
      support: "Suporte",
      privacy: "Privacidade",
      changelog: "Notas de versão",
      clamshell: "Tampa fechada",
      emailSupport: "Suporte por e-mail",
      backToProduct: "Voltar ao Rouse",
    },
  },
  {
    id: "ko",
    hreflang: "ko",
    segment: "ko",
    label: "한국어",
    menuLabel: "언어",
    ui: {
      breadcrumbLabel: "이동 경로",
      products: "제품",
      support: "지원",
      privacy: "개인정보",
      changelog: "변경 내역",
      clamshell: "덮개 닫힘",
      emailSupport: "이메일 지원",
      backToProduct: "Rouse로 돌아가기",
    },
  },
  {
    id: "ja",
    hreflang: "ja",
    segment: "ja",
    label: "日本語",
    menuLabel: "言語",
    ui: {
      breadcrumbLabel: "パンくずリスト",
      products: "製品",
      support: "サポート",
      privacy: "プライバシー",
      changelog: "更新履歴",
      clamshell: "合蓋",
      emailSupport: "メールサポート",
      backToProduct: "Rouse に戻る",
    },
  },
  {
    id: "zh-Hans",
    hreflang: "zh-Hans",
    segment: "zh-hans",
    label: "简体中文",
    menuLabel: "语言",
    ui: {
      breadcrumbLabel: "面包屑导航",
      products: "产品",
      support: "支持",
      privacy: "隐私",
      changelog: "更新日志",
      clamshell: "合盖",
      emailSupport: "邮件支持",
      backToProduct: "返回 Rouse",
    },
  },
  {
    id: "zh-Hant",
    hreflang: "zh-Hant",
    segment: "zh-hant",
    label: "繁體中文",
    menuLabel: "語言",
    ui: {
      breadcrumbLabel: "麵包屑導覽",
      products: "產品",
      support: "支援",
      privacy: "隱私",
      changelog: "更新日誌",
      clamshell: "闔蓋",
      emailSupport: "電子郵件支援",
      backToProduct: "返回 Rouse",
    },
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
  return renderDesignLocaleSwitcher({
    locales: LOCALES,
    currentLocale: current,
    routeFor: (targetLocaleId) => routePath(targetLocaleId, surfaceId),
  });
}

export const validateHtmlStructure = validateSharedHtmlStructure;

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

  const homepageVersion =
    homepage.match(/data-rouse-version="([^"]+)"/)?.[1] ??
    homepage.match(
      /<div class="metric">\s*<strong>\s*([^<]+?)\s*<\/strong>\s*<span>\s*Rouse for macOS\s*<\/span>\s*<\/div>/,
    )?.[1];
  if (!homepageVersion) {
    errors.push("index.html is missing the canonical Rouse version");
  } else if (homepageVersion !== expectedVersion) {
    errors.push(
      `index.html Rouse version is ${JSON.stringify(homepageVersion)}; expected ${JSON.stringify(expectedVersion)}`,
    );
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
  return `\n  <script type="application/ld+json">\n${json}\n  </script>`;
}

function renderPage({ localeId, surfaceId, metadata, content, template }) {
  const locale = localeFor(localeId);
  const canonical = `${SITE_ORIGIN}${routePath(localeId, surfaceId)}`;
  const bodyHeader = renderProductMasthead({
    locales: LOCALES,
    currentLocale: locale,
    routeFor: (targetLocaleId) => routePath(targetLocaleId, surfaceId),
    productName: "Rouse",
    surfaceId,
    storeUrl: "https://apps.apple.com/us/app/rouse-stay-awake/id6760773101?mt=12",
    storeLabel: "Mac App Store",
    routeForSurface: (targetSurfaceId) => routePath(localeId, targetSurfaceId),
  });
  const values = {
    "{{LANG}}": locale.id,
    "{{TITLE}}": escapeHtml(metadata.title),
    "{{DESCRIPTION}}": escapeHtml(metadata.description),
    "{{CANONICAL}}": escapeHtml(canonical),
    "{{ALTERNATE_LINKS}}": renderAlternateLinks(localeId, surfaceId),
    "{{OG_TITLE}}": escapeHtml(metadata.ogTitle),
    "{{OG_DESCRIPTION}}": escapeHtml(metadata.ogDescription),
    "{{TWITTER_TITLE}}": escapeHtml(metadata.twitterTitle ?? metadata.ogTitle),
    "{{TWITTER_DESCRIPTION}}": escapeHtml(
      metadata.twitterDescription ?? metadata.ogDescription,
    ),
    "{{STRUCTURED_DATA}}": renderStructuredData(metadata.structuredData),
    "{{BODY_CLASS}}": productBodyClass({ productSegment: "rouse", surfaceId }),
    "{{BODY_HEADER}}": `${bodyHeader}\n`,
    "{{CONTENT}}": decorateProductContent({
      content: content.trimEnd(),
      productName: "Rouse",
      productSegment: "rouse",
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
