import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // Relative base so dist works on Vercel, GitHub Pages, and local preview.
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
