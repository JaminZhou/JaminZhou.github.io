import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createStaticProductSite,
  runStaticProductSiteCli,
} from "./lib/static-product-site.mjs";

const REPOSITORY_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

export const LOCALES = Object.freeze([
  { id: "en", hreflang: "en", segment: "", label: "English", menuLabel: "Language" },
]);

export const SURFACES = Object.freeze([
  { id: "landing", segment: "" },
  { id: "support", segment: "support" },
  { id: "privacy", segment: "privacy" },
]);

const site = createStaticProductSite({
  repositoryRoot: REPOSITORY_ROOT,
  sourceDirectory: "hushtrail",
  productSegment: "hushtrail",
  productName: "Hushtrail",
  defaultLocaleId: "en",
  locales: LOCALES,
  surfaces: SURFACES,
});

export const pageOutputPath = site.pageOutputPath;
export const renderAlternateLinks = site.renderAlternateLinks;
export const renderLocaleSwitcher = site.renderLocaleSwitcher;
export const buildSite = site.buildSite;
export const checkSite = site.checkSite;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runStaticProductSiteCli(site, process.argv[2]);
}
