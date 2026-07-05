import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React runtime from game logic for better caching
          'react-vendor': ['react', 'react-dom'],
          // Split PixiJS core (already lazy via React.lazy, but this ensures
          // shared Pixi modules are grouped rather than scattered)
          'pixi-core': ['pixi.js']
        }
      }
    }
  }
});
