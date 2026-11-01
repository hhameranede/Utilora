# UTILORA Progressive Web App

UTILORA can be installed from a supported browser's install menu. The project uses the standard Web App Manifest and a small first-party service worker; it does not require a third-party PWA runtime.

## Install metadata

- Manifest: `public/manifest.webmanifest`
- App icon: `public/pwa-icon.svg`
- Display mode: `standalone`
- Start route: `/en`
- Theme and launch background: `#fafaf9`, matching the existing white / gray / orange UI direction.
- Service worker: `public/sw.js`, registered only in production builds.

The browser controls the installation UI. UTILORA does not display a fabricated install button or promise that every browser/device offers the same prompt.

## Offline and cache behavior

- **Navigation:** Network first. A successful HTML page is saved for a later offline visit. The page cache is bounded to the 36 most recently visited routes.
- **Versioned build assets:** Cache first. Vite's content-hashed `/assets/` files can be reused offline without mixing old and new bundles.
- **First launch:** The root document, manifest, app icon, and offline fallback are precached during service-worker installation.
- **Unvisited pages:** When the network is unavailable and a requested route has not been cached, a simple offline page is shown.
- **Updates:** A new service-worker cache version removes older UTILORA-managed caches when the new worker activates.

## Privacy boundaries

The service worker only handles same-origin GET requests. It does not cache cross-origin requests, `/api/` routes, non-GET requests, or responses marked `private` / `no-store`. User-selected files, generated blobs, clipboard contents, and form inputs are not written to persistent browser caches. The existing file tools continue to process files in memory in the active tab.

Offline support is not a claim that live DNS/RDAP/website lookups work without an internet connection. A visited tool page may open offline, but network-backed lookups still require connectivity.
