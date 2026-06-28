import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  optimizeDeps: {
    include: ['three'],
    exclude: ['three/webgpu'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: ['three/webgpu'],
    },
  },
});
