import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  LOCALES as PRICEBIRD_LOCALES,
  SURFACES as PRICEBIRD_SURFACES,
  buildLegacySite as buildPriceBirdLegacySite,
  buildSite as buildPriceBirdSite,
  legacyPageOutputPath as priceBirdLegacyOutputPath,
  pageOutputPath as priceBirdOutputPath,
  renderAlternateLinks as renderPriceBirdAlternates,
  renderLegacyRedirectPage as renderPriceBirdLegacyRedirect,
  renderLocaleSwitcher as renderPriceBirdLocaleSwitcher,
} from "../scripts/build-pricebird-site.mjs";
import {
  LOCALES as HUSHTRAIL_LOCALES,
  SURFACES as HUSHTRAIL_SURFACES,
  buildSite as buildHushtrailSite,
  pageOutputPath as hushtrailOutputPath,
  renderAlternateLinks as renderHushtrailAlternates,
  renderLocaleSwitcher as renderHushtrailLocaleSwitcher,
} from "../scripts/build-hushtrail-site.mjs";
import {
  createStaticProductSite,
  validateHtmlStructure,
} from "../scripts/lib/static-product-site.mjs";

const PRODUCT_SITES = [
  {
    name: "PriceBird",
    locales: PRICEBIRD_LOCALES,
    surfaces: PRICEBIRD_SURFACES,
    buildSite: buildPriceBirdSite,
    pageOutputPath: priceBirdOutputPath,
  },
  {
    name: "Hushtrail",
    locales: HUSHTRAIL_LOCALES,
    surfaces: HUSHTRAIL_SURFACES,
    buildSite: buildHushtrailSite,
    pageOutputPath: hushtrailOutputPath,
  },
];

test("PriceBird covers four locales and three surfaces", () => {
  assert.equal(PRICEBIRD_LOCALES.length, 4);
  assert.equal(PRICEBIRD_SURFACES.length, 3);
  assert.equal(new Set(PRICEBIRD_LOCALES.map((locale) => locale.id)).size, 4);
  assert.equal(priceBirdOutputPath("en", "landing"), "pricebird/index.html");
  assert.equal(priceBirdOutputPath("ja", "support"), "pricebird/ja/support/index.html");
  assert.equal(
    priceBirdOutputPath("zh-Hant", "privacy"),
    "pricebird/zh-hant/privacy/index.html",
  );
});

test("PriceBird alternates and language switcher preserve the current surface", () => {
  const alternates = renderPriceBirdAlternates("support");
  for (const locale of PRICEBIRD_LOCALES) {
    assert.match(alternates, new RegExp(`hreflang="${locale.hreflang}"`));
  }
  assert.match(
    alternates,
    /hreflang="x-default" href="https:\/\/jaminzhou\.com\/pricebird\/support\/"/,
  );

  const switcher = renderPriceBirdLocaleSwitcher("zh-Hans", "privacy");
  assert.match(switcher, /aria-label="语言"/);
  assert.match(
    switcher,
    /href="\/pricebird\/zh-hans\/privacy\/"[^>]+aria-current="page"[^>]*>简体中文/,
  );
  assert.match(switcher, /href="\/pricebird\/ja\/privacy\/"/);
});

test("PriceBird masthead copy and actions preserve the selected locale", async () => {
  const pages = await buildPriceBirdSite({ write: false });

  for (const locale of PRICEBIRD_LOCALES.filter((candidate) => candidate.id !== "en")) {
    const landing = pages.get(priceBirdOutputPath(locale.id, "landing"));
    const support = pages.get(priceBirdOutputPath(locale.id, "support"));
    const privacy = pages.get(priceBirdOutputPath(locale.id, "privacy"));
    const landingRoute = `/${priceBirdOutputPath(locale.id, "landing").replace(/index\.html$/, "")}`;

    assert.ok(landing.includes(`aria-label="${locale.ui.breadcrumbLabel}"`), locale.id);
    assert.ok(landing.includes(`href="/#products">${locale.ui.products}</a>`), locale.id);
    assert.ok(support.includes(`aria-label="${locale.ui.emailSupport}"`), locale.id);
    assert.ok(support.includes(`<span>PriceBird · ${locale.ui.support}</span>`), locale.id);
    assert.ok(privacy.includes(`href="${landingRoute}"`), locale.id);
    assert.ok(privacy.includes(`aria-label="${locale.ui.backToProduct}"`), locale.id);
    assert.ok(privacy.includes(`<span aria-current="page">${locale.ui.privacy}</span>`), locale.id);
  }
});

test("CalcBird routes redirect to the canonical PriceBird pages", async () => {
  const pages = await buildPriceBirdLegacySite({ write: false });

  assert.equal(pages.size, PRICEBIRD_LOCALES.length * PRICEBIRD_SURFACES.length);
  assert.equal(priceBirdLegacyOutputPath("en", "landing"), "calcbird/index.html");
  assert.equal(
    priceBirdLegacyOutputPath("zh-Hant", "privacy"),
    "calcbird/zh-hant/privacy/index.html",
  );

  const redirect = renderPriceBirdLegacyRedirect("ja", "support");
  assert.match(redirect, /<meta name="robots" content="noindex">/);
  assert.match(
    redirect,
    /<link rel="canonical" href="https:\/\/jaminzhou\.com\/pricebird\/ja\/support\/">/,
  );
  assert.match(redirect, /http-equiv="refresh" content="0;url=\/pricebird\/ja\/support\/"/);
  assert.equal(redirect, pages.get("calcbird/ja/support/index.html"));
});

test("Hushtrail remains English-only without localization controls", () => {
  assert.equal(HUSHTRAIL_LOCALES.length, 1);
  assert.equal(HUSHTRAIL_SURFACES.length, 3);
  assert.equal(hushtrailOutputPath("en", "landing"), "hushtrail/index.html");
  assert.equal(hushtrailOutputPath("en", "support"), "hushtrail/support/index.html");
  assert.equal(renderHushtrailAlternates("privacy"), "");
  assert.equal(renderHushtrailLocaleSwitcher("en", "privacy"), "");
});

test("product metadata is escaped before insertion into HTML", async (t) => {
  const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), "product-site-"));
  t.after(() => rm(repositoryRoot, { recursive: true, force: true }));

  const sourceRoot = path.join(repositoryRoot, "_site-src", "example");
  await mkdir(path.join(sourceRoot, "content", "en"), { recursive: true });
  await writeFile(
    path.join(sourceRoot, "template.html"),
    "<title>{{TITLE}}</title><meta name=\"description\" content=\"{{DESCRIPTION}}\"><meta property=\"og:title\" content=\"{{OG_TITLE}}\"><meta property=\"og:description\" content=\"{{OG_DESCRIPTION}}\"><meta name=\"twitter:title\" content=\"{{TWITTER_TITLE}}\"><meta name=\"twitter:description\" content=\"{{TWITTER_DESCRIPTION}}\">{{LANG}}{{CANONICAL}}{{ALTERNATE_LINKS}}{{OG_IMAGE_DIMENSIONS}}{{STRUCTURED_DATA}}{{BODY_HEADER}}{{CONTENT}}",
  );
  await writeFile(path.join(sourceRoot, "content", "en", "landing.html"), "<p>Body</p>");
  await writeFile(
    path.join(sourceRoot, "pages.json"),
    JSON.stringify({
      pages: {
        "en.landing": {
          title: 'Title "A" & <B>',
          description: 'Description "A" & <B>',
          ogTitle: 'Open Graph "A" & <B>',
          ogDescription: 'Open Graph description "A" & <B>',
          twitterTitle: 'Twitter "A" & <B>',
          twitterDescription: 'Twitter description "A" & <B>',
          structuredData: {
            "@context": "https://schema.org",
            name: "</script><script>alert(1)</script>",
          },
        },
      },
    }),
  );

  const site = createStaticProductSite({
    repositoryRoot,
    sourceDirectory: "example",
    productSegment: "example",
    productName: "Example",
    defaultLocaleId: "en",
    locales: [{ id: "en", segment: "", hreflang: "en", label: "English", menuLabel: "Language" }],
    surfaces: [{ id: "landing", segment: "" }],
  });
  const rendered = (await site.buildSite()).get("example/index.html");

  assert.match(rendered, /<title>Title &quot;A&quot; &amp; &lt;B&gt;<\/title>/);
  assert.match(rendered, /content=\"Description &quot;A&quot; &amp; &lt;B&gt;\"/);
  assert.match(rendered, /content=\"Open Graph &quot;A&quot; &amp; &lt;B&gt;\"/);
  assert.match(rendered, /content=\"Twitter description &quot;A&quot; &amp; &lt;B&gt;\"/);
  assert.doesNotMatch(rendered, /<\/script><script>alert\(1\)<\/script>/);
  assert.match(rendered, /\\u003c\/script>\\u003cscript>alert\(1\)\\u003c\/script>/);
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

test("homepage and sitemap expose the Codex UI Kit showcase", async () => {
  const [homepage, sitemap] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../sitemap.xml", import.meta.url), "utf8"),
  ]);

  assert.equal(homepage.split('href="/codex-ui-kit/"').length - 1, 1);
  assert.equal(
    sitemap.split("<loc>https://jaminzhou.com/codex-ui-kit/</loc>").length - 1,
    1,
  );
});

test("production pages use the vendored Classical system without the design preview runtime", async () => {
  const [homepage, siteCss, cormorantLicense, loraLicense] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../assets/site.css", import.meta.url), "utf8"),
    readFile(
      new URL("../assets/classical/fonts/OFL-CormorantGaramond.txt", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../assets/classical/fonts/OFL-Lora.txt", import.meta.url), "utf8"),
  ]);

  assert.match(homepage, /href="\/assets\/classical\/styles\.css\?v=20260902"/);
  assert.match(homepage, /href="\/assets\/site\.css\?v=20260902"/);
  assert.doesNotMatch(homepage, /support\.js|<x-dc\b|data-dc-script/);
  assert.match(siteCss, /\.language-menu > summary,\s*\.locale-link \{\s*min-height: 44px;/);
  assert.match(siteCss, /max-height: min\(calc\(100vh - 88px\), 468px\);/);
  assert.match(siteCss, /\.header-action \{[\s\S]*?min-height: 36px;/);
  assert.match(
    siteCss,
    /@media \(max-width: 340px\) \{[\s\S]*?\.breadcrumbs \{\s*display: none;/,
  );
  assert.match(cormorantLicense, /Copyright 2015 the Cormorant Project Authors/);
  assert.match(loraLicense, /Copyright 2011 The Lora Project Authors/);
  assert.match(cormorantLicense, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(loraLicense, /SIL OPEN FONT LICENSE Version 1\.1/);
});

test("legacy iCube privacy pages keep complete static document metadata", async () => {
  for (const product of ["iCube_Lite", "iCube_Pro"]) {
    const html = await readFile(
      new URL(`../privacy_policy/${product}/index.html`, import.meta.url),
      "utf8",
    );

    assert.match(html, /<html lang="en">/);
    assert.match(html, /<meta name="description" content="[^"]+">/);
    assert.match(
      html,
      new RegExp(`<link rel="canonical" href="https://jaminzhou\\.com/privacy_policy/${product}/">`),
    );
    assert.match(html, /<link rel="icon"[^>]+href="\/images\/jamin-zhou-avatar\.png">/);
    assert.equal(html.split("<main>").length - 1, 1);
    assert.equal(html.split("<h1>").length - 1, 1);
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
