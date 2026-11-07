import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        landing: resolve(__dirname, 'landing_page.html'),
        login: resolve(__dirname, 'login.html'),
        signup: resolve(__dirname, 'sign_up.html'),
        studio: resolve(__dirname, 'AI_creative_studio.html'),
        legacyStudio: resolve(__dirname, 'AI_studio.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'assets')
    }
  },
  test: {
    setupFiles: ['./tests/setup.js'],
    globals: true
  }
});
