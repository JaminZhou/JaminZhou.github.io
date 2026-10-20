import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { LOCALES, buildSite, pageOutputPath } from "../scripts/build-fire-site.mjs";

test("FIRE launch pages cover four languages and distinguish iOS release from Mac review", async () => {
  const pages = await buildSite();
  assert.equal(pages.size, 12);
  assert.deepEqual(LOCALES.map(x => x.id), ["en", "zh-Hans", "zh-Hant", "ja"]);
  for (const [route, html] of pages) {
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, route);
    for (const [, src] of html.matchAll(/src="(\/[^"?]+)[^"]*"/g)) {
      await access(new URL(`..${src}`, import.meta.url));
    }
    for (const [, href] of html.matchAll(/href="(\/fire\/[^"#?]*)"/g)) {
      await access(new URL(`..${href}${href.endsWith("/") ? "index.html" : ""}`, import.meta.url));
    }
  }
  const pendingMac = { en: "Mac is awaiting review", "zh-Hans": "Mac 版仍在等待审核", "zh-Hant": "Mac 版仍在等待審核", ja: "Mac 版は審査待ち" };
  for (const locale of LOCALES) {
    const html = pages.get(pageOutputPath(locale.id, "landing"));
    assert.ok(html.includes('href="https://apps.apple.com/app/id6820084110"'), locale.id);
    assert.ok(html.includes(pendingMac[locale.id]), locale.id);
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(data.softwareVersion, "1.0.0");
    assert.equal(data.downloadUrl, "https://apps.apple.com/app/id6820084110");
    assert.doesNotMatch(data.operatingSystem, /macOS/i);
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
    assert.ok(new RegExp(`<h2[^>]*>${copy[locale.id][0]}</h2>`).test(support), locale.id);
    assert.ok(privacy.includes(copy[locale.id][1]), locale.id);
    assert.doesNotMatch(support, /<h2[^>]*>(Hide details|隐藏详情|隱藏詳細資訊|詳細を隠す)<\/h2>/);
  }
});

test("FIRE Watch updates require opt-in and do not promise immediate delivery", async () => {
  const pages = await buildSite();
  const terms = {
    en: ["queued snapshot may still arrive"],
    "zh-Hans": ["已入队的快照仍可能到达"],
    "zh-Hant": ["已排入佇列的快照仍可能到達"],
    ja: ["送信待ちのデータは届く"],
  };
  const optIn = {
    en: { support: "enable automatic updates (off by default)", privacy: "opt in to automatic updates on iPhone (off by default)" },
    "zh-Hans": { support: "开启默认关闭的自动更新", privacy: "主动开启默认关闭的自动更新" },
    "zh-Hant": { support: "開啟預設關閉的自動更新", privacy: "主動開啟預設關閉的自動更新" },
    ja: { support: "自動更新（初期状態はオフ）を有効にできます", privacy: "自動更新（初期状態はオフ）を有効にできます" },
  };
  const delivery = {
    en: { support: "Delivery may be delayed", privacy: "not a direct Watch iCloud connection or a real-time delivery promise" },
    "zh-Hans": { support: "送达可能延迟", privacy: "不承诺实时送达" },
    "zh-Hant": { support: "送達可能延遲", privacy: "不承諾即時送達" },
    ja: { support: "到着には時間がかかる場合", privacy: "即時の到着も保証されません" },
  };
  for (const locale of LOCALES) {
    for (const surface of ["support", "privacy"]) {
      const html = pages.get(pageOutputPath(locale.id, surface));
      for (const term of terms[locale.id]) assert.ok(html.includes(term), `${locale.id}/${surface}: ${term}`);
      assert.ok(html.includes(optIn[locale.id][surface]), `${locale.id}/${surface}: Watch opt-in`);
      assert.ok(html.includes(delivery[locale.id][surface]), `${locale.id}/${surface}: delivery disclaimer`);
    }
    assert.ok(pages.get(pageOutputPath(locale.id, "privacy")).includes("WatchConnectivity"));
  }
});
