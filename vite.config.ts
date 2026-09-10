import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * No facsimile middleware, and the absence is the point.
 *
 * The parent project relays Montpellier's PDFs through its own origin because
 * that server forbids framing and serves an expired certificate. Gallica does
 * neither: its IIIF manifests and images answer any origin with
 * `Access-Control-Allow-Origin: *` over a valid certificate, so the browser
 * reads them from the BnF directly and this origin never sees a byte of a
 * manuscript — in development or in production. Nothing to proxy, nothing to
 * store, nothing to configure on a host.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Published on the custom domain germain.commutator.io, so the root is
  // correct; a project site under /<repo>/ would fill BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  build: {
    rollupOptions: {
      // One HTML entry per tab. Hosting is static: /fermat/ is served from its
      // own index.html, with no client-side router. A URL opened on one batch
      // still works in six months.
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        elasticite: resolve(import.meta.dirname, 'elasticite/index.html'),
        fermat: resolve(import.meta.dirname, 'fermat/index.html'),
        nombres: resolve(import.meta.dirname, 'nombres/index.html'),
        correspondance: resolve(import.meta.dirname, 'correspondance/index.html'),
        archive: resolve(import.meta.dirname, 'archive/index.html'),
        sources: resolve(import.meta.dirname, 'sources/index.html'),
        method: resolve(import.meta.dirname, 'method/index.html'),
        contribute: resolve(import.meta.dirname, 'contribute/index.html'),
        findings: resolve(import.meta.dirname, 'findings/index.html'),
      },
    },
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5174,
  },
});
