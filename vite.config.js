import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react'
            }
            if (id.includes('leaflet')) {
              return 'vendor-leaflet'
            }
            if (id.includes('@supabase') || id.includes('websocket')) {
              return 'vendor-supabase'
            }
            if (id.includes('d3')) {
              return 'vendor-d3'
            }
            if (id.includes('recharts') || id.includes('victory') || id.includes('react-resize-detector')) {
              return 'vendor-recharts'
            }
            return 'vendor-others'
          }
        }
      }
    }
  }
})

