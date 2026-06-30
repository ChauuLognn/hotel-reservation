import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

const API_PROXY = {
  '/hotel_reservation_premium': {
    target: 'http://localhost:8081',
    changeOrigin: true,
    secure: false,
    rewrite: (url) => url.replace(/^\/hotel_reservation_premium/, ''),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@pages':      path.resolve(import.meta.dirname, 'src/pages'),
      '@components': path.resolve(import.meta.dirname, 'src/components'),
      '@layouts':    path.resolve(import.meta.dirname, 'src/layouts'),
      '@services':   path.resolve(import.meta.dirname, 'src/services'),
      '@hooks':      path.resolve(import.meta.dirname, 'src/hooks'),
      '@contexts':   path.resolve(import.meta.dirname, 'src/contexts'),
      '@utils':      path.resolve(import.meta.dirname, 'src/utils'),
      '@constants':  path.resolve(import.meta.dirname, 'src/constants'),
      '@assets':     path.resolve(import.meta.dirname, 'src/assets'),
      '@styles':     path.resolve(import.meta.dirname, 'src/styles'),
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
