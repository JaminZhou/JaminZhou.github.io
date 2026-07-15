import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  LOCALES as CALCBIRD_LOCALES,
  SURFACES as CALCBIRD_SURFACES,
  buildSite as buildCalcBirdSite,
  pageOutputPath as calcBirdOutputPath,
  renderAlternateLinks as renderCalcBirdAlternates,
  renderLocaleSwitcher as renderCalcBirdLocaleSwitcher,
} from "../scripts/build-calcbird-site.mjs";
import {
  LOCALES as HUSHTRAIL_LOCALES,
  SURFACES as HUSHTRAIL_SURFACES,
  buildSite as buildHushtrailSite,
  pageOutputPath as hushtrailOutputPath,
  renderAlternateLinks as renderHushtrailAlternates,
  renderLocaleSwitcher as renderHushtrailLocaleSwitcher,
} from "../scripts/build-hushtrail-site.mjs";
import { validateHtmlStructure } from "../scripts/lib/static-product-site.mjs";

const PRODUCT_SITES = [
  {
    name: "CalcBird",
    locales: CALCBIRD_LOCALES,
    surfaces: CALCBIRD_SURFACES,
    buildSite: buildCalcBirdSite,
    pageOutputPath: calcBirdOutputPath,
  },
  {
    name: "Hushtrail",
    locales: HUSHTRAIL_LOCALES,
    surfaces: HUSHTRAIL_SURFACES,
    buildSite: buildHushtrailSite,
    pageOutputPath: hushtrailOutputPath,
  },
];

test("CalcBird covers four locales and three surfaces", () => {
  assert.equal(CALCBIRD_LOCALES.length, 4);
  assert.equal(CALCBIRD_SURFACES.length, 3);
  assert.equal(new Set(CALCBIRD_LOCALES.map((locale) => locale.id)).size, 4);
  assert.equal(calcBirdOutputPath("en", "landing"), "calcbird/index.html");
  assert.equal(calcBirdOutputPath("ja", "support"), "calcbird/ja/support/index.html");
  assert.equal(
    calcBirdOutputPath("zh-Hant", "privacy"),
    "calcbird/zh-hant/privacy/index.html",
  );
});

test("CalcBird alternates and language switcher preserve the current surface", () => {
  const alternates = renderCalcBirdAlternates("support");
  for (const locale of CALCBIRD_LOCALES) {
    assert.match(alternates, new RegExp(`hreflang="${locale.hreflang}"`));
  }
  assert.match(
    alternates,
    /hreflang="x-default" href="https:\/\/jaminzhou\.com\/calcbird\/support\/"/,
  );

  const switcher = renderCalcBirdLocaleSwitcher("zh-Hans", "privacy");
  assert.match(switcher, /aria-label="语言"/);
  assert.match(
    switcher,
    /href="\/calcbird\/zh-hans\/privacy\/"[^>]+aria-current="page"[^>]*>简体中文<\/a>/,
  );
  assert.match(switcher, /href="\/calcbird\/ja\/privacy\/"/);
});

test("Hushtrail remains English-only without localization controls", () => {
  assert.equal(HUSHTRAIL_LOCALES.length, 1);
  assert.equal(HUSHTRAIL_SURFACES.length, 3);
  assert.equal(hushtrailOutputPath("en", "landing"), "hushtrail/index.html");
  assert.equal(hushtrailOutputPath("en", "support"), "hushtrail/support/index.html");
  assert.equal(renderHushtrailAlternates("privacy"), "");
  assert.equal(renderHushtrailLocaleSwitcher("en", "privacy"), "");
});

test("generated product pages match committed GitHub Pages output", async () => {
  for (const site of PRODUCT_SITES) {
    const pages = await site.buildSite({ write: false });
    assert.equal(pages.size, site.locales.length * site.surfaces.length, site.name);

    for (const [relativePath, generated] of pages) {
      const committed = await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
      assert.equal(generated, committed, `${relativePath} is out of date`);
    }
  }
});

test("generated product pages keep structural HTML containers balanced", async () => {
  for (const site of PRODUCT_SITES) {
    const pages = await site.buildSite({ write: false });
    for (const [relativePath, generated] of pages) {
      assert.deepEqual(validateHtmlStructure(generated), [], relativePath);
    }
  }
});

test("sitemap includes every generated product route exactly once", async () => {
  const sitemap = await readFile(new URL("../sitemap.xml", import.meta.url), "utf8");

  for (const site of PRODUCT_SITES) {
    for (const locale of site.locales) {
      for (const surface of site.surfaces) {
        const outputPath = site.pageOutputPath(locale.id, surface.id);
        const route = outputPath.replace(/index\.html$/, "");
        const url = `https://jaminzhou.com/${route}`;
        assert.equal(sitemap.split(`<loc>${url}</loc>`).length - 1, 1, url);
      }
    }
  }
});

test("generated product pages do not contain broken root-relative links or assets", async () => {
  for (const site of PRODUCT_SITES) {
    const pages = await site.buildSite({ write: false });
    for (const [relativePath, generated] of pages) {
      for (const match of generated.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
        const rawTarget = match[1];
        const pathname = rawTarget.split(/[?#]/, 1)[0];
        const target = pathname.endsWith("/")
          ? path.posix.join(pathname, "index.html")
          : pathname;
        await assert.doesNotReject(
          access(new URL(`..${target}`, import.meta.url)),
          `${relativePath} -> ${rawTarget}`,
        );
      }
    }
  }
});
