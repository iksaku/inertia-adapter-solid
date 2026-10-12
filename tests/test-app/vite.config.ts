import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import inertia from '@inertiajs/vite'
import solid from 'vite-plugin-solid'
import { defineConfig } from 'vite'
import inertiaSolidFramework from 'inertia-adapter-solid/vite'

const root = fileURLToPath(new URL('.', import.meta.url))
const ssr = process.argv.includes('--ssr')

export default defineConfig({
  root,
  plugins: [solid({ ssr: true }), inertia({ frameworks: inertiaSolidFramework, ssr: { port: 13722 } })],
  resolve: { alias: { '@': root } },
  build: {
    target: 'es2022',
    minify: false,
    emptyOutDir: !ssr,
    rollupOptions: ssr ? undefined : {
      input: {
        main: resolve(root, 'index.html'),
        unified: resolve(root, 'index-unified.html'),
        auto: resolve(root, 'index-auto.html'),
      },
    },
  },
})
