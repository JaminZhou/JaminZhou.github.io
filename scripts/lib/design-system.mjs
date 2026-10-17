/** Build-time components. Product content remains static HTML without a client framework. */
import { readFile } from 'node:fs/promises';
import interfaceCopy from '../../_site-src/shared/interface.json' with { type: 'json' };

export const SITE_ORIGIN = 'https://jaminzhou.com';
export const PRODUCT_IDS = ['aperlo', 'rouse', 'pricebird', 'trailglass', 'hushtrail', 'fire'];
export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const e = escapeHtml;
export const ui = lang => interfaceCopy[lang] ?? interfaceCopy.en;
export const displayName = (product, lang) => product.names?.[lang] ?? product.name;
export const routeFor = (id = '', lang = 'en', surface = 'landing') => `/${id ? `${id}/` : ''}${lang === 'en' ? '' : `${lang.toLowerCase()}/`}${surface === 'landing' ? '' : surface === 'clamshell' ? 'support/clamshell/' : `${surface}/`}`;
const homeFor = lang => routeFor('', lang === 'zh-Hans' ? lang : 'en');
const homeLocales = [{ id: 'en', label: 'English', hreflang: 'en' }, { id: 'zh-Hans', label: '简体中文', hreflang: 'zh-Hans' }];
export const chevron = '<svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
const globe = '<svg class="language-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>';

export function icon(product, size = 48, alt = '') {
  return `<span class="app-icon" data-app-icon="${e(product.id)}" style="--icon-size:${Number(size)}px"><img class="app-icon-art" src="/${e(product.id)}/app-icon.png" alt="${e(alt)}" width="${Number(size)}" height="${Number(size)}" decoding="async"></span>`;
}

export function localeMenu({ locales, currentLocale, routeFor: localeRoute }) {
  if (locales.length < 2) return '';
  const label = ui(currentLocale.id).language;
  const links = locales.map(locale => `<li><a href="${e(localeRoute(locale.id))}" lang="${e(locale.id)}" hreflang="${e(locale.hreflang)}"${locale.id === currentLocale.id ? ' aria-current="page"' : ''}>${e(locale.label)}</a></li>`).join('');
  return `<details class="locale-menu"><summary aria-label="${e(label)}: ${e(currentLocale.label)}">${globe}<span>${e(currentLocale.label)}</span>${chevron}</summary><ul aria-label="${e(label)}">${links}</ul></details>`;
}

function siteLinks(lang) {
  const t = ui(lang), home = homeFor(lang), fallback = !['en', 'zh-Hans'].includes(lang) ? ' (English)' : '';
  return `<a href="${home}#apps">${t.apps}${fallback}</a><a href="${home}#about">${t.about}${fallback}</a><a href="/support/">${t.support}${lang !== 'en' ? ' (English)' : ''}</a>`;
}

export function header(lang, product = null, showLocale = false) {
  const t = ui(lang), links = siteLinks(lang);
  const language = showLocale && !product && homeLocales.some(l => l.id === lang) ? localeMenu({ locales: homeLocales, currentLocale: homeLocales.find(l => l.id === lang), routeFor: id => routeFor('', id) }) : '';
  return `<a class="skip-link" href="#main">${t.skip}</a>
<header class="site-header"><div class="container header-inner"><a class="brand" href="${homeFor(lang)}"><img src="/images/jamin-zhou-avatar.png" alt="" width="30" height="30">JaminZhou</a><nav class="header-nav" aria-label="${t.menu}">${links}</nav><div class="header-actions">${language}<a class="icon-button" href="mailto:me@jaminzhou.com" aria-label="${t.contact}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/></svg></a><details class="mobile-menu"><summary class="icon-button" aria-label="${t.menu}"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg></summary><nav aria-label="${t.menu}">${links}</nav></details></div></div></header>`;
}

export function productNav(product, locale, surface, locales) {
  const t = ui(locale.id);
  const links = ['landing', 'support', 'changelog', 'privacy'].filter(s => product.surfaces.includes(s)).map(s => `<a href="${routeFor(product.id, locale.id, s)}"${s === surface || (s === 'support' && surface === 'clamshell') ? ' aria-current="page"' : ''}>${s === 'landing' ? t.overview : t[s]}</a>`).join('');
  return `<div class="product-nav"><div class="container product-nav-inner"><a class="product-brand" href="${routeFor(product.id, locale.id)}">${icon(product, 36)}${e(displayName(product, locale.id))}</a><nav class="product-links" aria-label="${e(product.name)}">${links}</nav>${localeMenu({ locales, currentLocale: locale, routeFor: id => routeFor(product.id, id, surface) })}</div></div>`;
}

export function footer(lang) {
  const t = ui(lang);
  const taglines = { 'zh-Hans': '用心制作，独立开发。', 'zh-Hant': '用心製作，獨立開發。', ja: '丁寧につくる、個人開発。', de: 'Unabhängig entwickelt. Mit Sorgfalt gestaltet.', fr: 'Créé indépendamment, avec soin.', es: 'Desarrollo independiente, con cuidado.', ko: '세심하게 만드는 독립 개발.', 'pt-BR': 'Criação independente, feita com cuidado.' };
  return `<footer class="site-footer"><div class="container">
<div class="footer-row"><a href="${homeFor(lang)}" class="brand">JaminZhou</a><nav class="footer-links" aria-label="${t.menu} · JaminZhou">${siteLinks(lang)}<a href="https://github.com/JaminZhou">GitHub ↗</a><a href="mailto:me@jaminzhou.com">Email ↗</a></nav></div>
<div class="footer-meta"><span>© 2026 Jamin Zhou · ${taglines[lang] ?? 'Independently made. Thoughtfully built.'}</span><label class="theme-control">${t.theme} <span class="select-control"><select class="theme-select" data-theme-select aria-label="${t.theme}"><option value="system">${t.system}</option><option value="light">${t.light}</option><option value="dark">${t.dark}</option></select>${chevron}</span></label></div>
</div></footer>`;
}

// Version and download URL have one canonical source: the existing English release metadata.
export function resolveProduct(manifest) {
  const release = manifest.pages['en.landing']?.structuredData;
  return { ...manifest.product, locales: [...new Set(Object.keys(manifest.pages).map(key => key.split('.')[0]))], surfaces: [...new Set(Object.keys(manifest.pages).map(key => key.split('.')[1]))], version: release?.softwareVersion ?? manifest.product.release?.version, store: release?.downloadUrl, operatingSystem: release?.operatingSystem };
}

export async function loadProducts(repositoryRoot) {
  return Promise.all(PRODUCT_IDS.map(async id => resolveProduct(JSON.parse(await readFile(`${repositoryRoot}/_site-src/${id}/pages.json`, 'utf8')))));
}

export function card(product, lang = 'en', support = false) {
  const targetLang = product.locales.includes(lang) ? lang : 'en';
  const status = `${product.availability === 'preparing' ? `<span class="badge soon">${ui(lang).soon}</span>` : ''}${targetLang !== lang ? '<span class="badge" lang="en">English</span>' : ''}`;
  const heading = support ? 'h2' : 'h3';
  const version = product.id === 'rouse' ? ` data-rouse-version="${e(product.version)}"` : '';
  return `<a class="product-card" href="${routeFor(product.id, targetLang, support ? 'support' : 'landing')}" data-platforms="${e(product.platforms.join(' '))}"${version}>${icon(product, 72)}<div><${heading}>${e(displayName(product, lang))}</${heading}><p>${e(lang === 'zh-Hans' ? product.catalogSummaryZh : product.catalogSummary)}</p><span class="platforms">${e(product.platformLabel)}</span>${status}</div><span class="arrow" aria-hidden="true">→</span></a>`;
}

export function heroMedia(product, lang) {
  if (product.media === 'icon') return '';
  const captions = { 'zh-Hans': '真实应用截图，使用示例内容。', 'zh-Hant': '真實應用程式截圖，使用範例內容。', ja: '実際のアプリ画面。サンプルを使用。' };
  if (product.media === 'widgets') {
    const caption = { 'zh-Hans': '真实 FIRE 小组件，使用示例数据。', 'zh-Hant': '真實 FIRE 小工具，使用範例資料。', ja: '実際の FIRE ウィジェット。サンプルデータを使用。' }[lang] ?? 'Actual FIRE widgets, shown with example data.';
    const images = product.widgetImages.map(src => src.replaceAll('{id}', product.id).replaceAll('{locale}', lang));
    return `<figure class="hero-media"><img src="${images[0]}" width="1720" height="820" alt="${caption}" fetchpriority="high"><div class="widget-pair"><img src="${images[1]}" width="820" height="820" alt="${e(product.name)} · Trail"><img src="${images[2]}" width="820" height="820" alt="${e(product.name)} · Signal"></div><figcaption>${caption}</figcaption></figure>`;
  }
  const src = product.screenshot.replace('/en-US/', `/${lang === 'en' ? 'en-US' : lang}/`);
  const caption = captions[lang] ?? 'Actual app screenshot, shown with example content.';
  return `<figure class="hero-media"><a href="${src}" aria-label="${caption}"><img src="${src}" width="${product.mediaWidth}" height="${product.mediaHeight}" alt="${caption}" fetchpriority="high" decoding="async"></a><figcaption>${caption}</figcaption></figure>`;
}

export function landing(product, metadata, content, lang) {
  const t = ui(lang), title = e(metadata.hero.title).replaceAll('\n', '<br>');
  const identity = `<p class="eyebrow">${e(displayName(product, lang))} · ${e(product.platformLabel)}</p>`;
  const heading = product.media === 'icon' ? `<div class="hero-app-identity">${icon(product, 72)}<div>${identity}<h1>${title}</h1></div></div>` : `${identity}<h1>${title}</h1>`;
  let actions = product.availability === 'preparing' ? `<span class="badge soon">${t.soon}</span><a class="text-link" href="${routeFor(product.id, lang, 'support')}">${t.support} →</a>` : `<a class="button" href="${e(product.store)}">${product.availability === 'direct' ? t.download : t.store}<span aria-hidden="true">↗</span></a><a class="text-link" href="${routeFor(product.id, lang, 'support')}">${t.support}</a>`;
  if (product.releaseUrl) actions += `<a class="text-link" href="${e(product.releaseUrl.replace('{version}', product.version))}">${t.releaseNotes} ↗</a>`;
  const status = product.availability === 'preparing' ? t.soon : product.availability === 'direct' ? 'GitHub Releases' : 'App Store';
  return `<section class="product-hero ${e(product.media)}"><div>${heading}<p class="lead">${e(metadata.hero.introduction)}</p><div class="actions">${actions}</div></div>${heroMedia(product, lang)}</section><dl class="spec-strip"><div><dt>${t.platform}</dt><dd>${e(product.platformLabel)}</dd></div><div><dt>${t.version}</dt><dd>${e(product.version)}</dd></div><div><dt>${t.availability}</dt><dd>${status}</dd></div></dl><div class="product-body">${content.replaceAll('{{RELEASE_VERSION}}', e(product.version))}</div>`;
}

export function documentContent(product, content, lang, surface) {
  const t = ui(lang);
  // Headings are trusted, authored HTML with stable ids. TOCs are always derived,
  // so edits cannot leave a separately maintained navigation list behind.
  const toc = [...content.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/g)].map(([, attrs, body]) => {
    const id = attrs.match(/\bid="([^"]+)"/)?.[1];
    if (!id) throw new Error(`${product.id}/${lang}/${surface}: h2 needs a stable id`);
    const label = attrs.match(/\bdata-toc-label="([^"]+)"/)?.[1] ?? body.replace(/<[^>]*>/g, '');
    return `<a href="#${id}">${label}</a>`;
  }).join('');
  return `<div class="doc-layout"><aside class="doc-sidebar" aria-label="${t.toc}"><p class="eyebrow">${t[surface]}</p><nav>${toc}</nav><a href="${routeFor(product.id, lang)}">← ${e(displayName(product, lang))}</a></aside><div class="document"><details class="doc-mobile-toc"><summary>${t.toc}</summary><nav>${toc}</nav></details>${content}</div></div>`;
}

export function productCss(products) {
  return '/* Generated from product presentation metadata in _site-src. */\n' + products.map(p => {
    const selector = `[data-product="${p.id}"]`, light = `--accent:${p.accent};--accent-soft:${p.tint}`, dark = `--accent:${p.darkAccent};--accent-soft:${p.darkTint}`;
    return `${selector}{${light}}\n[data-app-icon="${p.id}"]{--icon-scale:${p.iconScale};--icon-radius:${p.iconRadius}}\n:root[data-theme="dark"] ${selector}{${dark}}\n@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) ${selector}{${dark}}}`;
  }).join('\n') + '\n';
}
