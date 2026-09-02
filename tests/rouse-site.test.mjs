import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  LOCALES,
  SURFACES,
  buildSite,
  pageOutputPath,
  renderAlternateLinks,
  renderLocaleSwitcher,
  validateHtmlStructure,
  validateReleaseVersionConsistency,
} from "../scripts/build-rouse-site.mjs";

async function releaseVersionInputs() {
  const [manifest, pages, homepage] = await Promise.all([
    readFile(new URL("../_site-src/rouse/pages.json", import.meta.url), "utf8").then(JSON.parse),
    buildSite({ write: false }),
    readFile(new URL("../index.html", import.meta.url), "utf8"),
  ]);
  return { manifest, pages, homepage };
}

test("Rouse site model covers nine locales and five surfaces", () => {
  assert.equal(LOCALES.length, 9);
  assert.equal(SURFACES.length, 5);
  assert.equal(new Set(LOCALES.map((locale) => locale.id)).size, 9);
});

test("output paths preserve the existing GitHub Pages URLs", () => {
  assert.equal(pageOutputPath("en", "landing"), "rouse/index.html");
  assert.equal(pageOutputPath("de", "support"), "rouse/de/support/index.html");
  assert.equal(pageOutputPath("pt-BR", "landing"), "rouse/pt-br/index.html");
  assert.equal(
    pageOutputPath("zh-Hant", "clamshell"),
    "rouse/zh-hant/support/clamshell/index.html",
  );
});

test("alternate links include every locale and the English x-default", () => {
  const links = renderAlternateLinks("de", "support");

  for (const locale of LOCALES) {
    assert.match(links, new RegExp(`hreflang="${locale.hreflang}"`));
  }

  assert.match(
    links,
    /hreflang="x-default" href="https:\/\/jaminzhou\.com\/rouse\/support\/"/,
  );
});

test("language switcher keeps the current locale and surface", () => {
  const switcher = renderLocaleSwitcher("fr", "privacy");

  assert.match(switcher, /aria-label="Langue"/);
  assert.match(
    switcher,
    /href="\/rouse\/fr\/privacy\/"[^>]+aria-current="page"[^>]*>Français/,
  );
  assert.match(switcher, /href="\/rouse\/ja\/privacy\/"/);
});

test("masthead copy and actions preserve every selected Rouse locale", async () => {
  const pages = await buildSite({ write: false });

  for (const locale of LOCALES.filter((candidate) => candidate.id !== "en")) {
    const landing = pages.get(pageOutputPath(locale.id, "landing"));
    const support = pages.get(pageOutputPath(locale.id, "support"));
    const privacy = pages.get(pageOutputPath(locale.id, "privacy"));
    const changelog = pages.get(pageOutputPath(locale.id, "changelog"));
    const clamshell = pages.get(pageOutputPath(locale.id, "clamshell"));
    const landingRoute = `/${pageOutputPath(locale.id, "landing").replace(/index\.html$/, "")}`;
    const supportRoute = `/${pageOutputPath(locale.id, "support").replace(/index\.html$/, "")}`;

    assert.ok(landing.includes(`aria-label="${locale.ui.breadcrumbLabel}"`), locale.id);
    assert.ok(landing.includes(`href="/#products">${locale.ui.products}</a>`), locale.id);
    assert.ok(support.includes(`aria-label="${locale.ui.emailSupport}"`), locale.id);
    assert.ok(support.includes(`<span>Rouse · ${locale.ui.support}</span>`), locale.id);
    assert.ok(privacy.includes(`href="${landingRoute}"`), locale.id);
    assert.ok(privacy.includes(`aria-label="${locale.ui.backToProduct}"`), locale.id);
    assert.ok(privacy.includes(`<span aria-current="page">${locale.ui.privacy}</span>`), locale.id);

    for (const [page, label] of [
      [changelog, locale.ui.changelog],
      [clamshell, locale.ui.clamshell],
    ]) {
      assert.ok(page.includes(`href="${supportRoute}"`), locale.id);
      assert.ok(page.includes(`aria-label="${locale.ui.support}"`), locale.id);
      assert.ok(page.includes(`<span aria-current="page">${label}</span>`), locale.id);
    }
  }
});

test("generated pages match committed GitHub Pages output", async () => {
  const pages = await buildSite({ write: false });
  assert.equal(pages.size, LOCALES.length * SURFACES.length);

  for (const [relativePath, generated] of pages) {
    const committed = await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
    assert.equal(generated, committed, `${relativePath} is out of date`);
  }
});

test("generated pages keep structural HTML containers balanced", async () => {
  const pages = await buildSite({ write: false });

  for (const [relativePath, generated] of pages) {
    assert.deepEqual(validateHtmlStructure(generated), [], relativePath);
  }
});

test("new-window links explicitly isolate the opener", async () => {
  const pages = await buildSite({ write: false });

  for (const [relativePath, generated] of pages) {
    for (const match of generated.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
      assert.match(match[0], /rel="[^"]*\bnoopener\b[^"]*"/, relativePath);
    }
  }
});

test("root homepage and every localized landing page use the canonical Rouse version", async () => {
  const inputs = await releaseVersionInputs();
  assert.deepEqual(validateReleaseVersionConsistency(inputs), []);
});

test("Rouse release version validation rejects root and localized version drift", async () => {
  const inputs = await releaseVersionInputs();
  const expectedVersion = inputs.manifest.pages["en.landing"].structuredData.softwareVersion;
  const staleVersion = "0.0.0";
  const staleManifest = structuredClone(inputs.manifest);
  staleManifest.pages["de.landing"].structuredData.softwareVersion = staleVersion;

  const stalePages = new Map(inputs.pages);
  const frenchLandingPath = pageOutputPath("fr", "landing");
  stalePages.set(
    frenchLandingPath,
    stalePages.get(frenchLandingPath).replaceAll(expectedVersion, staleVersion),
  );

  const staleHomepage = inputs.homepage.replace(
    `data-rouse-version="${expectedVersion}"`,
    `data-rouse-version="${staleVersion}"`,
  );

  assert.deepEqual(
    validateReleaseVersionConsistency({
      manifest: staleManifest,
      pages: stalePages,
      homepage: staleHomepage,
    }),
    [
      `de.landing softwareVersion is "${staleVersion}"; expected "${expectedVersion}"`,
      `rouse/fr/index.html contains visible version "${staleVersion}"; expected "${expectedVersion}"`,
      `rouse/fr/index.html visible version metric does not include "${expectedVersion}"`,
      `index.html Rouse version is "${staleVersion}"; expected "${expectedVersion}"`,
    ],
  );
});

test("sitemap includes every generated Rouse route exactly once", async () => {
  const sitemap = await readFile(new URL("../sitemap.xml", import.meta.url), "utf8");

  for (const locale of LOCALES) {
    for (const surface of SURFACES) {
      const outputPath = pageOutputPath(locale.id, surface.id);
      const route = outputPath.replace(/index\.html$/, "");
      const url = `https://jaminzhou.com/${route}`;
      assert.equal(sitemap.split(`<loc>${url}</loc>`).length - 1, 1, url);
    }
  }
});

test("generated pages do not contain broken root-relative links or assets", async () => {
  const pages = await buildSite({ write: false });

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
});
