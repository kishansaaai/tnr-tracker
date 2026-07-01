import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { VitePWA } from 'vite-plugin-pwa'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'TNR Tracker',
        short_name: 'TNRTracker',
        description: 'TNR Tracker: Community Cat Colony Management and Mapping Tool',
        theme_color: '#059669',
        icons: [
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐾</text></svg>',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
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

