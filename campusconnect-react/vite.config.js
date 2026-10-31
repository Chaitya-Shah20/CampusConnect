import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Point this at your backend (the /backend server on port 3000)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
