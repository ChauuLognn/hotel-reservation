import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_PROXY = {
  '/hotel_reservation_premium': {
    target: 'http://localhost:8081',
    changeOrigin: true,
    secure: false,
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: API_PROXY,
  },
  preview: {
    port: 5173,
    strictPort: true,
    proxy: API_PROXY,
  },
})
