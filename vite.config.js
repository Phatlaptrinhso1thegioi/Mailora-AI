import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'GEMINI_']);
  const geminiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';

  return {
    define: {
      '__VERCEL_GEMINI_KEY__': JSON.stringify(geminiKey)
    },
    envPrefix: ['VITE_', 'GEMINI_'],
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
  };
});
