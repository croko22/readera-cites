import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: '/'
  }, 
  build: {
    outDir: 'C:/Users/KEVIN/Desktop/Programacion/0 Portfolio/readera-cites/build'
  }
})
