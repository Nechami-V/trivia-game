import { defineConfig } from 'vite'

export default defineConfig({
  root: './client',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: '../dist'
  }
})
