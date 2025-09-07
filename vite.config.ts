import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.nextTick': 'setTimeout'
  },
  resolve: {
    alias: {
      'buffer': 'buffer',
      'stream': 'stream-browserify',
      'util': 'util'
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['buffer', 'stream-browserify', 'util']
  },
  build: {
    rollupOptions: {
      external: ['@prisma/client', '.prisma/client/index-browser']
    }
  },

  // ✅ Add these lines
  server: {
    port: 3000,          // For development (npm run dev)
    host: true           // Ensures Coolify/Docker can bind
  },
  preview: {
    port: 3000,          // For production preview mode
    host: true
  }
});
