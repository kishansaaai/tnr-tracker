import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
            return 'vendor-others'
          }
        }
      }
    }
  }
})

