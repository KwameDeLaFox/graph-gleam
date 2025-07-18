import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 4173,
    // Allow all hosts in production, specific hosts in development
    allowedHosts: process.env.NODE_ENV === 'production' ? true : [
      'graph-gleam.onrender.com',
      'localhost',
      '127.0.0.1',
      '0.0.0.0'
    ]
  }
})
