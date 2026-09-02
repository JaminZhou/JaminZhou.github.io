import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createStaticProductSite,
  runStaticProductSiteCli,
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
      backToProduct: "CalcBird に戻る",
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
      backToProduct: "返回 CalcBird",
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
      backToProduct: "返回 CalcBird",
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
  sourceDirectory: "calcbird",
  productSegment: "calcbird",
  productName: "CalcBird",
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
export const checkSite = site.checkSite;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runStaticProductSiteCli(site, process.argv[2]);
}
