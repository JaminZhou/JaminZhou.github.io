import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { LOCALES, buildSite, pageOutputPath } from "../scripts/build-fire-site.mjs";

test("FIRE launch pages cover four languages without claiming availability", async () => {
  const pages = await buildSite();
  assert.equal(pages.size, 12);
  assert.deepEqual(LOCALES.map(x => x.id), ["en", "zh-Hans", "zh-Hant", "ja"]);
  for (const [route, html] of pages) {
    assert.doesNotMatch(html, /apps\.apple\.com|downloadUrl|application\/ld\+json/, route);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, route);
    for (const [, src] of html.matchAll(/src="(\/[^"?]+)[^"]*"/g)) {
      await access(new URL(`..${src}`, import.meta.url));
    }
    for (const [, href] of html.matchAll(/href="(\/fire\/[^"#?]*)"/g)) {
      await access(new URL(`..${href}${href.endsWith("/") ? "index.html" : ""}`, import.meta.url));
    }
  }
});

test("FIRE support is localized and privacy does not promise zero networking", async () => {
  const pages = await buildSite();
  const forms = { en: "vGQbr0", "zh-Hans": "KYqye8", "zh-Hant": "LZQyzv", ja: "pbl9dJ" };
  for (const locale of LOCALES) {
    const support = pages.get(pageOutputPath(locale.id, "support"));
    const privacy = pages.get(pageOutputPath(locale.id, "privacy"));
    assert.ok(support.includes(`https://tally.so/r/${forms[locale.id]}`));
    assert.ok(privacy.includes("CloudKit"));
    assert.ok(privacy.includes("StoreKit"));
    assert.ok(privacy.includes("GitHub Pages"));
    assert.ok(privacy.includes("mailto:me@jaminzhou.com"));
    assert.ok(privacy.includes("https://tally.so/help/privacy-policy"));
  }
});

test("FIRE copy describes system privacy and user-initiated StoreKit", async () => {
  const pages = await buildSite();
  const copy = {
    en: ["Privacy on screen", "not at app startup"],
    "zh-Hans": ["屏幕上的隐私", "不在启动时发起这些操作"],
    "zh-Hant": ["畫面上的隱私", "不在啟動時執行這些操作"],
    ja: ["画面上のプライバシー", "アプリ起動時には行いません"],
  };
  for (const locale of LOCALES) {
    const support = pages.get(pageOutputPath(locale.id, "support"));
    const privacy = pages.get(pageOutputPath(locale.id, "privacy"));
    assert.ok(support.includes(`<h2>${copy[locale.id][0]}</h2>`), locale.id);
    assert.ok(privacy.includes(copy[locale.id][1]), locale.id);
    assert.doesNotMatch(support, /<h2>(Hide details|隐藏详情|隱藏詳細資訊|詳細を隠す)<\/h2>/);
  }
});
