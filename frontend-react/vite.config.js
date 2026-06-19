import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

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
  resolve: {
    alias: {
      '@shared':     path.resolve(import.meta.dirname, 'src/shared'),
      '@api':        path.resolve(import.meta.dirname, 'src/api'),
      '@components': path.resolve(import.meta.dirname, 'src/components'),
      '@features':   path.resolve(import.meta.dirname, 'src/features'),
      '@context':    path.resolve(import.meta.dirname, 'src/context'),
    }
  },
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
