import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const configuredSiteUrl = process.env.SITE_URL?.trim();
  let configuredSiteOrigin = '';

  if (configuredSiteUrl) {
    const parsedUrl = new URL(configuredSiteUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol) ||
        parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash ||
        parsedUrl.username || parsedUrl.password) {
      throw new Error('SITE_URL must be an HTTP(S) origin only, for example https://example.com.');
    }
    configuredSiteOrigin = parsedUrl.origin;
  }

  const siteOriginMetadata = {
    name: 'utilora-site-origin-metadata',
    transformIndexHtml(html: string) {
      if (!configuredSiteOrigin) {
        return html.replace(
          /\s*<meta (?:property="og:image(?::(?:width|height))?"|name="twitter:image")[^>]*\/>\s*/g,
          '',
        );
      }

      return html.replaceAll('__UTILORA_SITE_ORIGIN__', configuredSiteOrigin);
    },
  };

  return {
    // Keep runtime canonical, hreflang, Open Graph, and JSON-LD URLs aligned
    // with the same verified origin used by sitemap generation and prerendering.
    define: {
      __UTILORA_SITE_ORIGIN__: JSON.stringify(configuredSiteOrigin),
    },
    plugins: [react(), tailwindcss(), siteOriginMetadata],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
