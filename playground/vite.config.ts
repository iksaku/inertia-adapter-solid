import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  build: {
    minify: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
})
