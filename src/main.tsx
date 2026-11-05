import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import posthog from 'posthog-js';
import App from './App';
import './index.css';
import './design-v3.css';

// Analytics is optional and privacy-conscious: no autocapture, no session replay,
// and no user-entered text or file metadata is sent as custom event properties.
const posthogProjectToken = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST;

if (posthogProjectToken && posthogHost) {
  posthog.init(posthogProjectToken, {
    api_host: posthogHost,
    defaults: '2026-08-30',
    autocapture: false,
    capture_pageview: 'history_change',
    capture_pageleave: false,
    person_profiles: 'identified_only',
  });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('UTILORA root element #root was not found.');
}

const app = <App />;

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}

// Offline and install support is enabled only for production builds.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error: unknown) => {
      console.warn('UTILORA offline support could not be activated.', error);
    });
  }, { once: true });
}
