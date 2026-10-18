/** Local review only. Reuses production output and adds isolated design boards. */
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCT_IDS, loadProducts, header, footer } from './lib/design-system.mjs';
import { buildSite as buildShared } from './build-shared-site.mjs';
import { buildLegacySite } from './build-pricebird-site.mjs';
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const out = path.join(root, '_design/preview');
await mkdir(out, { recursive: true });
const pages = new Map(await buildShared());
const products = await loadProducts(root);
for (const id of PRODUCT_IDS) {
  const builder = await import(`./build-${id}-site.mjs`);
  for (const entry of await builder.buildSite()) pages.set(...entry);
  // Only public product assets are copied, never source configuration.
  for (const dir of ['screenshots', 'images']) {
    try { await cp(path.join(root, id, dir), path.join(out, id, dir), { recursive: true }); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  await mkdir(path.join(out, id), { recursive: true });
  await cp(path.join(root, id, 'app-icon.png'), path.join(out, id, 'app-icon.png'));
}
for (const entry of await buildLegacySite()) pages.set(...entry);
for (const [name, route] of [['index', 'design/index.html'], ['system', 'design/system/index.html'], ['responsive', 'design/responsive/index.html']]) {
  const board = await readFile(path.join(root, '_design/pages', `${name}.html`), 'utf8');
  pages.set(route, board.replace(/<a class="skip-link"[\s\S]*?<\/header>/, header('zh-Hans', { products }))
    .replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, footer('zh-Hans'))
    .replace('/system/components.css', '/assets/design/components.css?v=20261018')
    .replace('/system/interactions.js', '/assets/design/interactions.js?v=20261018'));
}
for (const [route, source] of pages) {
  const target = path.join(out, route); await mkdir(path.dirname(target), { recursive: true });
  const value = route.endsWith('.html') ? source.replace(/<meta name="robots"[^>]*>/g, '').replace('</head>', '<meta name="robots" content="noindex,nofollow"></head>') : source;
  await writeFile(target, value);
}
for (const dir of ['assets/design', 'assets/media', 'images', 'privacy_policy']) await cp(path.join(root, dir), path.join(out, dir), { recursive: true });
await cp(path.join(root, '_design/system'), path.join(out, 'system'), { recursive: true });
await cp(path.join(root, 'assets/design/products.css'), path.join(out, 'system/products.css'));
await writeFile(path.join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log(`Local preview refreshed: ${pages.size - 1} HTML pages plus unchanged iCube privacy pages. Production pages come from the shared Node builders.`);
