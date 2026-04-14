import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@admin': path.resolve(__dirname, './src/admin'),
      '@site': path.resolve(__dirname, './src/site'),
    },
  },
  server: {
    // Keep 5173 so Express can use PORT=3000 (see backend/.env.example) without clashing.
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/node_modules[\\/](react|react-dom|react-router-dom)[\\/]/.test(id)) {
            return 'vendor'
          }
          if (id.includes('gsap') || id.includes('framer-motion')) {
            return 'animations'
          }
          if (id.includes('@tanstack/react-query') || id.includes('/axios/')) {
            return 'query'
          }
        },
      },
    },
  },
})
