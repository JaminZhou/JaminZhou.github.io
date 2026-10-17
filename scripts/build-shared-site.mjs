import profile from '../_site-src/shared/profile.json' with { type: 'json' };
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProducts, card, header, footer, productCss, escapeHtml as e, SITE_ORIGIN } from './lib/design-system.mjs';
import { fillTemplate, validateHtmlStructure, renderStructuredData, runStaticProductSiteCli } from './lib/static-product-site.mjs';
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
export async function buildSite({ write = false } = {}) {
  const [products, pages, template] = await Promise.all([
    loadProducts(root),
    readFile(path.join(root, '_site-src/shared/pages.json'), 'utf8').then(JSON.parse),
    readFile(path.join(root, '_site-src/shared/template.html'), 'utf8'),
  ]);
  const output = new Map();
  for (const [key, metadata] of Object.entries(pages)) {
    const [lang, surface] = key.split('.');
    const content = (await readFile(path.join(root, '_site-src/shared/content', lang, `${surface}.html`), 'utf8'))
      .replaceAll('{{PRODUCT_CARDS}}', products.map(p => card(p, lang, surface === 'support')).join('\n'))
      .replaceAll('{{PRODUCT_COUNT}}', `${products.length} ${lang === 'zh-Hans' ? '个应用' : 'apps'}`);
    const alternates = surface === 'home' ? Object.entries(pages).filter(([id]) => id.endsWith('.home')).map(([id, p]) => `<link rel="alternate" hreflang="${id.split('.')[0]}" href="${SITE_ORIGIN}${p.route}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/">\n` : '';
    const data = surface === 'home' ? { ...profile, makesOffer: products.filter(p => p.availability !== 'preparing').map(p => ({ '@type': 'Offer', itemOffered: { '@type': p.platforms.includes('iphone') ? 'MobileApplication' : 'SoftwareApplication', name: p.name, operatingSystem: p.operatingSystem, softwareVersion: p.version, url: `${SITE_ORIGIN}/${p.id}/` } })) } : null;
    let html = fillTemplate(template, {
      '{{LANG}}': lang, '{{TITLE}}': e(metadata.title), '{{DESCRIPTION}}': e(metadata.description), '{{CANONICAL}}': SITE_ORIGIN + metadata.route,
      '{{FEED_LINK}}': surface === 'home' ? '<link rel="alternate" type="application/rss+xml" title="JaminZhou Updates" href="https://jaminzhou.com/index.xml">\n' : '', '{{ALTERNATE_LINKS}}': alternates, '{{ICON}}': '/images/jamin-zhou-avatar.png', '{{SITE_NAME}}': 'JaminZhou',
      '{{OG_TITLE}}': e(metadata.title), '{{OG_DESCRIPTION}}': e(metadata.description), '{{OG_IMAGE_DIMENSIONS}}': '',
      '{{TWITTER_TITLE}}': e(metadata.title), '{{TWITTER_DESCRIPTION}}': e(metadata.description), '{{STRUCTURED_DATA}}': renderStructuredData(data),
      '{{BODY_CLASS}}': `${surface}-page`, '{{PRODUCT_ATTRIBUTE}}': '', '{{BODY_HEADER}}': header(lang, null, surface === 'home'), '{{CONTENT}}': content, '{{FOOTER}}': footer(lang),
    });
    if (surface === '404') html = html.replace('</head>', '  <meta name="robots" content="noindex">\n</head>');
    output.set(metadata.route === '/404.html' ? '404.html' : path.posix.join(metadata.route, 'index.html').slice(1), html);
  }
  output.set('assets/design/products.css', productCss(products));
  if (write) for (const [file, value] of output) { await mkdir(path.dirname(path.join(root, file)), { recursive: true }); await writeFile(path.join(root, file), value); }
  return output;
}
export async function checkSite() {
  for (const [file, value] of await buildSite()) {
    if (await readFile(path.join(root, file), 'utf8') !== value) throw new Error(`Generated file is stale: ${file}`);
    if (file.endsWith('.html')) { const errors = validateHtmlStructure(value); if (errors.length) throw new Error(`${file}: ${errors.join(', ')}`); }
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await runStaticProductSiteCli({ buildSite, checkSite }, process.argv[2]);
