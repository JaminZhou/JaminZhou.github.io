import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { PRODUCT_IDS, resolveProduct, loadProducts } from '../scripts/lib/design-system.mjs';
import { buildSite as buildShared } from '../scripts/build-shared-site.mjs';
const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');

async function allPages() {
  const pages = new Map([...await buildShared()].filter(([file]) => file.endsWith('.html')));
  for (const id of PRODUCT_IDS) {
    const builder = await import(`../scripts/build-${id}-site.mjs`);
    for (const entry of await builder.buildSite()) pages.set(...entry);
  }
  return pages;
}

test('all 91 modern pages retain discoverable content, metadata and working local targets', async () => {
  const pages = await allPages();
  assert.equal(pages.size, 91);
  for (const [file, html] of pages) {
    assert.equal((html.match(/<main\b/g) ?? []).length, 1, file);
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, file);
    assert.match(html, /class="skip-link" href="#main"/, file);
    assert.match(html, /<html lang="[^"]+">/, file);
    assert.match(html, /<link rel="canonical" href="https:\/\/jaminzhou\.com\//, file);
    assert.doesNotMatch(html, /Design preview|data-preview-|\/system\/|classical\//, file);
    if (file !== '404.html') assert.doesNotMatch(html, /noindex/, file);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(ids.length, new Set(ids).size, `${file}: duplicate ids`);
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (!value.startsWith('/') && !value.startsWith('#')) continue;
      const url = new URL(value, `https://jaminzhou.com/${file}`);
      const target = url.pathname.endsWith('/') ? `${url.pathname}index.html` : url.pathname;
      await access(new URL(`.${target}`, root));
      if (url.hash && target.endsWith('.html')) {
        const destination = pages.get(target.slice(1)) ?? await read(target.slice(1));
        assert.ok(destination.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${file} -> ${value}`);
      }
    }
  }
});

test('home catalog has one destination per app and platform data supports progressive filtering', async () => {
  const pages = await buildShared();
  for (const file of ['index.html', 'zh-hans/index.html']) {
    const html = pages.get(file);
    const cards = [...html.matchAll(/<a class="product-card"([^>]+)>/g)].map(m => m[1]);
    assert.equal(cards.length, PRODUCT_IDS.length);
    assert.equal(new Set(cards.map(c => c.match(/href="([^"]+)"/)[1])).size, PRODUCT_IDS.length);
    assert.equal(cards.filter(c => /data-platforms="[^"]*\bmac\b/.test(c)).length, 5);
    assert.equal(cards.filter(c => /data-platforms="[^"]*\biphone\b/.test(c)).length, 2);
    assert.match(html, /data-filter-controls hidden/); // All links remain available without JS.
    assert.match(html, /id="products"/); // Existing incoming fragment remains valid.
    assert.match(html, /Apple WWDC 2014 Student Scholarship Winner/);
    assert.doesNotMatch(html, /class="featured|class="app-shelf|codex-ui-kit/);
  }
  assert.match(pages.get('zh-hans/index.html'), /href="\/trailglass\/"[^>]*>[\s\S]*?lang="en">English/);
});

test('release metadata is the single version and download source for shared components', async () => {
  for (const id of PRODUCT_IDS) {
    const manifest = JSON.parse(await read(`_site-src/${id}/pages.json`));
    const product = resolveProduct(manifest);
    const builder = await import(`../scripts/build-${id}-site.mjs`);
    assert.deepEqual(new Set(product.locales), new Set(builder.LOCALES.map(l => l.id)), id);
    assert.deepEqual(new Set(product.surfaces), new Set(builder.SURFACES.map(s => s.id)), id);
    assert.equal(manifest.product.version, undefined, id);
    assert.equal(manifest.product.store, undefined, id);
    const changed = structuredClone(manifest);
    changed.pages['en.landing'].structuredData.softwareVersion = '9.8.7';
    changed.pages['en.landing'].structuredData.downloadUrl = 'https://example.com/new-release';
    assert.equal(resolveProduct(changed).version, '9.8.7');
    assert.equal(resolveProduct(changed).store, 'https://example.com/new-release');
    const landing = (await builder.buildSite()).get(`${id}/index.html`);
    assert.ok(landing.includes(`<dd>${product.version}</dd>`));
    assert.ok(landing.includes(`href="${product.store.replaceAll('&', '&amp;')}"`));
  }
});

test('optimized assets match their sources and fit the first-screen image budget', async () => {
  const images = JSON.parse(await read('_site-src/shared/images.json'));
  for (const [src, meta] of Object.entries(images)) {
    const source = await readFile(new URL(`.${src}`, root));
    const image = await readFile(new URL(`.${meta.src}`, root));
    assert.equal(createHash('sha256').update(source).digest('hex'), meta.sourceSha256, `${src}: regenerate web image`);
    assert.equal(createHash('sha256').update(image).digest('hex'), meta.sha256, meta.src);
    assert.equal(image.byteLength, meta.bytes);
    assert.equal(image.toString('ascii', 8, 12), 'WEBP', meta.src);
  }
  const bytes = src => images[src].bytes;
  const homeBytes = bytes('/images/jamin-zhou-avatar.png') + PRODUCT_IDS.reduce((sum, id) => sum + bytes(`/${id}/app-icon.png`), 0);
  assert.ok(homeBytes < 400_000, `${homeBytes} home image bytes`);
  for (const p of await loadProducts(fileURLToPath(root))) {
    const media = p.media === 'screenshot' ? [p.screenshot] : p.media === 'widgets' ? p.widgetImages.map(src => src.replace('{id}', p.id).replace('{locale}', 'en')) : [];
    assert.ok(media.reduce((sum, src) => sum + bytes(src), homeBytes) < 400_000, p.id);
  }
  const css = (await Promise.all(['tokens.css', 'components.css', 'products.css'].map(f => read(`assets/design/${f}`)))).join('\n');
  assert.ok(gzipSync(css).byteLength < 30_000);
  assert.ok(gzipSync(await read('assets/design/interactions.js')).byteLength < 8_000);
});

test('excluded iCube documents stay byte-identical', async () => {
  const hashes = { iCube_Lite: '229b1e717fc3ba408c95a5ac12794504a842cf9690f47a4a40310a9e727fcfac', iCube_Pro: '7e52c0b55b31e7573d458697caac4430caf574545419bbda17ab064a154df2ce' };
  for (const [name, sha] of Object.entries(hashes)) assert.equal(createHash('sha256').update(await readFile(new URL(`privacy_policy/${name}/index.html`, root))).digest('hex'), sha);
});
