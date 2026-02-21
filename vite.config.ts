import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite handles SPA routing automatically in dev mode
  // For production, vercel.json handles the routing
})
