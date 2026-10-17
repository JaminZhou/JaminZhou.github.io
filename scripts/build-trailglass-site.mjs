import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStaticProductSite, runStaticProductSiteCli } from './lib/static-product-site.mjs';
export const LOCALES = [{ id: 'en', hreflang: 'en', segment: '', label: 'English', menuLabel: 'Language' }];
export const SURFACES = [{ id: 'landing', segment: '' }, { id: 'support', segment: 'support' }, { id: 'privacy', segment: 'privacy' }];
const site = createStaticProductSite({ repositoryRoot: path.resolve(fileURLToPath(new URL('..', import.meta.url))), sourceDirectory: 'trailglass', productSegment: 'trailglass', productName: 'Trailglass', defaultLocaleId: 'en', locales: LOCALES, surfaces: SURFACES });
export const { buildSite, checkSite, pageOutputPath } = site;
if (process.argv[1] === fileURLToPath(import.meta.url)) await runStaticProductSiteCli(site, process.argv[2]);
