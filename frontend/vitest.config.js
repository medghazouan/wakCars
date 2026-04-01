import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  define: {
    'import.meta.env.VITE_WHATSAPP_BUSINESS_PHONE': JSON.stringify('+212600000000'),
  },
  test: {
    environment: 'node',
    globals: false,
  },
  resolve: {
    alias: {
      '@admin': path.resolve(__dirname, './src/admin'),
      '@site': path.resolve(__dirname, './src/site'),
    },
  },
})
