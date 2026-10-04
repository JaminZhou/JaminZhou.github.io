import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStaticProductSite, runStaticProductSiteCli } from "./lib/static-product-site.mjs";
const repositoryRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
export const LOCALES = Object.freeze([
  {
    "id": "en",
    "hreflang": "en",
    "segment": "",
    "label": "English",
    "menuLabel": "Language",
    "ui": {
      "products": "Products",
      "support": "Support",
      "privacy": "Privacy",
      "emailSupport": "Email support",
      "backToProduct": "Back to Aperlo",
      "breadcrumbLabel": "Breadcrumb"
    }
  },
  {
    "id": "zh-Hans",
    "hreflang": "zh-Hans",
    "segment": "zh-hans",
    "label": "简体中文",
    "menuLabel": "语言",
    "ui": {
      "products": "产品",
      "support": "支持",
      "privacy": "隐私",
      "emailSupport": "邮件支持",
      "backToProduct": "返回映窗",
      "breadcrumbLabel": "页面路径"
    }
  },
  {
    "id": "zh-Hant",
    "hreflang": "zh-Hant",
    "segment": "zh-hant",
    "label": "繁體中文",
    "menuLabel": "語言",
    "ui": {
      "products": "產品",
      "support": "支援",
      "privacy": "隱私",
      "emailSupport": "電子郵件支援",
      "backToProduct": "返回映窗",
      "breadcrumbLabel": "頁面路徑"
    }
  },
  {
    "id": "ja",
    "hreflang": "ja",
    "segment": "ja",
    "label": "日本語",
    "menuLabel": "言語",
    "ui": {
      "products": "製品",
      "support": "サポート",
      "privacy": "プライバシー",
      "emailSupport": "メールサポート",
      "backToProduct": "Aperlo に戻る",
      "breadcrumbLabel": "パンくずリスト"
    }
  }
]);
export const SURFACES = Object.freeze([{id:"landing",segment:""},{id:"support",segment:"support"},{id:"privacy",segment:"privacy"}]);
const site = createStaticProductSite({repositoryRoot, sourceDirectory:"aperlo", productSegment:"aperlo", productName:"Aperlo", defaultLocaleId:"en", locales:LOCALES, surfaces:SURFACES});
export const pageOutputPath = site.pageOutputPath;
export const buildSite = site.buildSite;
export const checkSite = site.checkSite;
if (process.argv[1] === fileURLToPath(import.meta.url)) await runStaticProductSiteCli(site, process.argv[2]);
