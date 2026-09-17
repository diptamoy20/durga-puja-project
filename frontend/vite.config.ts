import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },

    server: {
      port: Number(env.WEB_PORT ?? 5173),
      strictPort: true,
      open: false,
    },

    preview: { port: Number(env.WEB_PORT ?? 5173) },

    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      // Split the big, rarely-changing dependencies out of the app bundle so a
      // code change does not invalidate the whole vendor chunk in browser caches.
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            redux: ['@reduxjs/toolkit', 'react-redux'],
          },
        },
      },
    },
  };
});
