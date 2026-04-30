import type { Plugin } from 'vite';

import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

/** Chrome DevTools probes `/.well-known/...`; answer before React Router to avoid noisy 404 stacks in dev. */
function stubWellKnownPlugin(): Plugin {
  return {
    name: 'stub-well-known',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? '';
        if (pathname.startsWith('/.well-known/')) {
          res.statusCode = 204;
          res.end();
          return;
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [stubWellKnownPlugin(), reactRouter(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
