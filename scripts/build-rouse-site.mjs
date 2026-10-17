import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStaticProductSite, validateHtmlStructure, runStaticProductSiteCli } from './lib/static-product-site.mjs';
export { validateHtmlStructure } from './lib/static-product-site.mjs';
const REPOSITORY_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
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


const site = createStaticProductSite({ repositoryRoot: REPOSITORY_ROOT, sourceDirectory: 'rouse', productSegment: 'rouse', productName: 'Rouse', defaultLocaleId: 'en', locales: LOCALES, surfaces: SURFACES });
export const { buildSite, pageOutputPath, renderLocaleSwitcher } = site;
export const renderAlternateLinks = (_locale, surface) => site.renderAlternateLinks(surface);
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


export async function checkSite() {
  await site.checkSite();
  const [manifest, homepage, pages] = await Promise.all([
    readFile(path.join(REPOSITORY_ROOT, '_site-src/rouse/pages.json'), 'utf8').then(JSON.parse),
    readFile(path.join(REPOSITORY_ROOT, 'index.html'), 'utf8'),
    buildSite(),
  ]);
  const errors = validateReleaseVersionConsistency({ manifest, pages, homepage });
  if (errors.length) throw new Error(errors.join('\n'));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await runStaticProductSiteCli({ buildSite, checkSite }, process.argv[2]);
