import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createStaticProductSite,
  validateHtmlStructure,
} from "./lib/static-product-site.mjs";

const REPOSITORY_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

export const LOCALES = Object.freeze([
  { id: "en", hreflang: "en", segment: "", label: "English", menuLabel: "Language" },
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
      emailSupport: "メールサポート",
      backToProduct: "PriceBird に戻る",
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
      emailSupport: "邮件支持",
      backToProduct: "返回 PriceBird",
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
      emailSupport: "電子郵件支援",
      backToProduct: "返回 PriceBird",
    },
  },
]);

export const SURFACES = Object.freeze([
  { id: "landing", segment: "" },
  { id: "support", segment: "support" },
  { id: "privacy", segment: "privacy" },
]);

const site = createStaticProductSite({
  repositoryRoot: REPOSITORY_ROOT,
  sourceDirectory: "pricebird",
  productSegment: "pricebird",
  productName: "PriceBird",
  defaultLocaleId: "en",
  locales: LOCALES,
  surfaces: SURFACES,
  storeUrl: "https://apps.apple.com/app/id6762044720",
  storeLabel: "App Store",
});

export const pageOutputPath = site.pageOutputPath;
export const renderAlternateLinks = site.renderAlternateLinks;
export const renderLocaleSwitcher = site.renderLocaleSwitcher;
export const buildSite = site.buildSite;

const LEGACY_PRODUCT_SEGMENT = "calcbird";

function localeFor(localeId) {
  const locale = LOCALES.find((candidate) => candidate.id === localeId);
  if (!locale) throw new Error(`PriceBird: unknown locale ${localeId}`);
  return locale;
}

function surfaceFor(surfaceId) {
  const surface = SURFACES.find((candidate) => candidate.id === surfaceId);
  if (!surface) throw new Error(`PriceBird: unknown surface ${surfaceId}`);
  return surface;
}

function legacyRoutePath(localeId, surfaceId) {
  const locale = localeFor(localeId);
  const surface = surfaceFor(surfaceId);
  const segments = [LEGACY_PRODUCT_SEGMENT, locale.segment, surface.segment].filter(Boolean);
  return `/${segments.join("/")}/`;
}

export function legacyPageOutputPath(localeId, surfaceId) {
  return path.posix.join(legacyRoutePath(localeId, surfaceId), "index.html").slice(1);
}

export function renderLegacyRedirectPage(localeId, surfaceId) {
  const targetPath = `/${pageOutputPath(localeId, surfaceId).replace(/index\.html$/, "")}`;
  const targetUrl = `https://jaminzhou.com${targetPath}`;
  const locale = localeFor(localeId);

  return [
    "<!doctype html>",
    `<html lang="${locale.id}">`,
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    '  <meta name="robots" content="noindex">',
    `  <link rel="canonical" href="${targetUrl}">`,
    `  <meta http-equiv="refresh" content="0;url=${targetPath}">`,
    "  <title>PriceBird</title>",
    "</head>",
    "<body>",
    `  <p>This PriceBird page has moved to <a href="${targetPath}">${targetUrl}</a>.</p>`,
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

export async function buildLegacySite({ write = false } = {}) {
  const pages = new Map();

  for (const locale of LOCALES) {
    for (const surface of SURFACES) {
      const relativePath = legacyPageOutputPath(locale.id, surface.id);
      const rendered = renderLegacyRedirectPage(locale.id, surface.id);
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

export async function checkSite() {
  await site.checkSite();
  const legacyPages = await buildLegacySite();
  const stale = [];

  for (const [relativePath, rendered] of legacyPages) {
    const current = await readFile(path.join(REPOSITORY_ROOT, relativePath), "utf8");
    if (current !== rendered) stale.push(relativePath);

    const structureErrors = validateHtmlStructure(rendered);
    if (structureErrors.length > 0) {
      throw new Error(`${relativePath}:\n${structureErrors.join("\n")}`);
    }
  }

  if (stale.length > 0) {
    throw new Error(
      `Generated PriceBird legacy redirects are stale:\n${stale.map((item) => `- ${item}`).join("\n")}`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] ?? "--check";
  if (command === "--write") {
    await buildSite({ write: true });
    await buildLegacySite({ write: true });
  } else if (command === "--check") {
    await checkSite();
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
}
