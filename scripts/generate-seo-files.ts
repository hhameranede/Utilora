import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { generateProductionSitemap } from '../src/seo/sitemap';

const publicDirectory = resolve(process.cwd(), 'public');
await mkdir(publicDirectory, { recursive: true });

const rawSiteUrl = process.env.SITE_URL?.trim();
let siteOrigin: string | undefined;

if (rawSiteUrl) {
  const parsedUrl = new URL(rawSiteUrl);
  if (!['http:', 'https:'].includes(parsedUrl.protocol) ||
      parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash ||
      parsedUrl.username || parsedUrl.password) {
    throw new Error('SITE_URL must be an HTTP(S) origin only, for example https://example.com.');
  }
  siteOrigin = parsedUrl.origin;
  const sitemap = generateProductionSitemap(siteOrigin);
  await writeFile(resolve(publicDirectory, 'sitemap.xml'), `${sitemap}\n`, 'utf8');
  console.log(`Generated sitemap.xml for ${siteOrigin}`);
} else {
  await rm(resolve(publicDirectory, 'sitemap.xml'), { force: true });
  console.warn('SITE_URL is not configured. Sitemap generation was skipped; set SITE_URL in the deployment environment.');
}

const robotsLines = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /dev/',
  ...(siteOrigin ? [`Sitemap: ${siteOrigin}/sitemap.xml`] : []),
];
await writeFile(resolve(publicDirectory, 'robots.txt'), `${robotsLines.join('\n')}\n`, 'utf8');
console.log('Generated robots.txt');
