import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'emailjs': ['@emailjs/browser'],
          'utils': ['papaparse', 'date-fns', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
