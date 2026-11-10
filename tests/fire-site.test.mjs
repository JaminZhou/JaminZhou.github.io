import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { LOCALES, buildSite, pageOutputPath } from "../scripts/build-fire-site.mjs";

test("FIRE launch pages cover nine languages and the released iOS and Mac apps", async () => {
  const pages = await buildSite();
  assert.equal(pages.size, 27);
  assert.deepEqual(LOCALES.map(x => x.id), ["en", "zh-Hans", "zh-Hant", "ja", "de", "fr", "es", "ko", "pt-BR"]);
  for (const [route, html] of pages) {
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, route);
    for (const [, src] of html.matchAll(/src="(\/[^"?]+)[^"]*"/g)) {
      await access(new URL(`..${src}`, import.meta.url));
    }
    for (const [, href] of html.matchAll(/href="(\/fire\/[^"#?]*)"/g)) {
      await access(new URL(`..${href}${href.endsWith("/") ? "index.html" : ""}`, import.meta.url));
    }
  }
  const releasedMac = { en: "for iPhone, iPad, Mac and Apple Watch", "zh-Hans": "iPhone、iPad、Mac 和 Apple Watch 版现已", "zh-Hant": "iPhone、iPad、Mac 和 Apple Watch 版現已", ja: "iPhone・iPad・Mac・Apple Watch 版を App Store で公開", de: "für iPhone, iPad, Mac und Apple Watch", fr: "pour iPhone, iPad, Mac et Apple Watch", es: "para iPhone, iPad, Mac y Apple Watch", ko: "iPhone, iPad, Mac, Apple Watch용 FIRE", "pt-BR": "para iPhone, iPad, Mac e Apple Watch" };
  for (const locale of LOCALES) {
    const html = pages.get(pageOutputPath(locale.id, "landing"));
    assert.ok(html.includes('href="https://apps.apple.com/app/id6820084110"'), locale.id);
    assert.ok(html.includes(releasedMac[locale.id]), locale.id);
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(data.softwareVersion, "1.2.0");
    assert.equal(data.downloadUrl, "https://apps.apple.com/app/id6820084110");
    assert.match(data.operatingSystem, /macOS 15\.0 or later/);
  }
});

test("FIRE support is localized and privacy does not promise zero networking", async () => {
  const pages = await buildSite();
  const forms = { en: "vGQbr0", "zh-Hans": "KYqye8", "zh-Hant": "LZQyzv", ja: "pbl9dJ", de: "J1KWO7", fr: "gbjk9K", es: "yXZdJW", ko: "8NoRxo", "pt-BR": "zEX1YE" };
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
    en: ["Privacy on screen", "rather than at app launch"],
    "zh-Hans": ["屏幕上的隐私", "不在应用启动时发起"],
    "zh-Hant": ["畫面上的隱私", "不在 App 啟動時發起"],
    ja: ["画面上のプライバシー", "FIRE は起動時ではなく"],
    de: ["Privatsphäre auf dem Bildschirm", "nicht beim App-Start"],
    fr: ["Confidentialité à l’écran", "et non au démarrage de l’app"],
    es: ["Privacidad en pantalla", "no al iniciar la app"],
    ko: ["화면의 개인정보", "앱을 시작할 때가 아니라"],
    "pt-BR": ["Privacidade na tela", "e não ao iniciar o app"],
  };
  for (const locale of LOCALES) {
    const support = pages.get(pageOutputPath(locale.id, "support"));
    const privacy = pages.get(pageOutputPath(locale.id, "privacy"));
    assert.ok(new RegExp(`<h2[^>]*>${copy[locale.id][0]}</h2>`).test(support), locale.id);
    assert.ok(privacy.includes(copy[locale.id][1]), locale.id);
    assert.doesNotMatch(support, /<h2[^>]*>(Hide details|隐藏详情|隱藏詳細資訊|詳細を隠す)<\/h2>/);
  }
});

test("FIRE 1.1 documentation keeps current and legacy Watch defaults explicit", async () => {
  const pages = await buildSite();
  const boundaries = {
    en: {support:["automatically receives", "queued update is not confirmation of delivery", "automatic Apple Watch updates are off by default"], privacy:["enabled by default", "already queued updates may still arrive", "Keychain"]},
    "zh-Hans": {support:["自动向已配对", "入队不等于送达", "FIRE 1.0 的 Apple Watch 自动更新默认关闭"], privacy:["默认开启自动更新", "已入队的更新仍可能到达", "Keychain"]},
    "zh-Hant": {support:["自動將已儲存目標", "排入佇列不等於送達", "FIRE 1.0 的 Apple Watch 自動更新預設關閉"], privacy:["預設開啟自動更新", "已排入佇列的更新仍可能送達", "Keychain"]},
    ja: {support:["自動送信されます", "送信待ちは到着済みを意味しません", "FIRE 1.0 では Apple Watch の自動更新は初期状態でオフ"], privacy:["自動更新が初期状態で有効", "待機中の更新が届く場合", "Keychain"]},
    de: {support:["automatisch gespeicherte Zielaktualisierungen", "keine Zustellbestätigung", "In FIRE 1.0"], privacy:["standardmäßig eingeschaltet", "bereits eingereihte Updates können noch ankommen", "Keychain"]},
    fr: {support:["reçoit automatiquement", "ne confirme pas la livraison", "Dans FIRE 1.0"], privacy:["activées par défaut", "déjà en attente peuvent encore arriver", "Keychain"]},
    es: {support:["recibe automáticamente", "no confirma su entrega", "En FIRE 1.0"], privacy:["activadas por defecto", "ya en cola pueden llegar", "Keychain"]},
    ko: {support:["자동 전송됩니다", "전달 완료를 뜻하지", "FIRE 1.0에서는"], privacy:["기본적으로 켜지며", "이미 대기 중인 업데이트는 도착", "Keychain"]},
    "pt-BR": {support:["recebe automaticamente", "não confirma a entrega", "No FIRE 1.0"], privacy:["vêm ativadas", "já na fila ainda podem chegar", "Keychain"]},
  };
  for (const locale of LOCALES) {
    for (const surface of ["support", "privacy"]) {
      const html = pages.get(pageOutputPath(locale.id, surface));
      for (const term of boundaries[locale.id][surface]) assert.ok(html.includes(term), `${locale.id}/${surface}: ${term}`);
      assert.ok(html.includes("FIRE 1.1") && html.includes("FIRE 1.0"), locale.id);
    }
    const landing = pages.get(pageOutputPath(locale.id, "landing"));
    assert.match(landing, /iOS \/ iPadOS 18/);
    assert.match(landing, /macOS 15/);
    assert.match(landing, /watchOS 10/);
    assert.ok(pages.get(pageOutputPath(locale.id, "privacy")).includes("WatchConnectivity"));
  }
});


test("FIRE language switching and SEO preserve the current page across all nine locales", async () => {
  const pages = await buildSite();
  for (const locale of LOCALES) {
    for (const surface of ["landing", "support", "privacy"]) {
      const html = pages.get(pageOutputPath(locale.id, surface));
      const route = "/" + pageOutputPath(locale.id, surface).replace(/index\.html$/, "");
      assert.ok(html.includes(`<html lang="${locale.id}"`));
      assert.ok(html.includes(`<link rel="canonical" href="https://jaminzhou.com${route}">`));
      for (const target of LOCALES) {
        const targetRoute = "/" + pageOutputPath(target.id, surface).replace(/index\.html$/, "");
        assert.ok(html.includes(`hreflang="${target.hreflang}" href="https://jaminzhou.com${targetRoute}"`));
        assert.ok(html.includes(`href="${targetRoute}" lang="${target.id}" hreflang="${target.hreflang}"`));
      }
    }
  }
});
