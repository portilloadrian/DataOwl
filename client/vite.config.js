import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// The static pages live at the repo root, so Vite's root is the repo root.
const root = resolve(import.meta.dirname, '..');

export default defineConfig({
  root,
  plugins: [react()],
  build: {
    outDir: resolve(root, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(root, 'index.html'),
        profile: resolve(root, 'pages/profile.html'),
        post: resolve(root, 'pages/post.html'),
      },
    },
  },
  test: {
    include: ['client/tests/**/*.test.{js,jsx}'],
  },
});
