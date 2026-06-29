import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // 禁用 Fast Refresh，防止与 react-leaflet 冲突
      fastRefresh: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      overlay: true
    },
    headers: {
      'Cache-Control': 'no-store'
    }
  },
  build: {
    target: 'esnext',
  },
});
