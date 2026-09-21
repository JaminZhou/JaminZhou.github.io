import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';

test('Trailglass support and privacy are public English documents with valid local links', async () => {
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  for (const route of ['', 'support/', 'privacy/']) {
    const html = await readFile(new URL(`../trailglass/${route}index.html`, import.meta.url), 'utf8');
    const canonical = `https://jaminzhou.com/trailglass/${route}`;
    assert.ok(html.includes('<html lang="en">'));
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`));
    assert.ok(sitemap.includes(`<loc>${canonical}</loc>`));
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    for (const [, href] of html.matchAll(/href="(\/[^"#]*)"/g)) {
      const clean = href.split('?')[0];
      await access(new URL(`..${clean}${clean.endsWith('/') ? 'index.html' : ''}`, import.meta.url));
    }
  }
  const support = await readFile(new URL('../trailglass/support/index.html', import.meta.url), 'utf8');
  assert.ok(support.includes('https://tally.so/r/Bzvlye'));
  assert.ok(support.includes('email optional'));
  const privacy = await readFile(new URL('../trailglass/privacy/index.html', import.meta.url), 'utf8');
  for (const word of ['StoreKit', 'Tally', 'LiteLLM', 'TestFlight', 'me@jaminzhou.com']) assert.ok(privacy.includes(word));
  assert.ok(privacy.includes('does not bundle a separate offline copy'));
  assert.ok(!privacy.includes('without a network connection'));
});
