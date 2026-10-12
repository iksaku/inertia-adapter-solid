import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [solid()],
        resolve: { conditions: ['browser'], dedupe: ['solid-js'] },
        test: {
          name: 'browser-primitives',
          environment: 'jsdom',
          include: ['tests/unit/**/*.browser.test.tsx'],
          server: {
            deps: {
              inline: [
                'inertia-adapter-solid',
                'solid-js',
                '@solidjs/meta',
                '@solidjs/testing-library',
                /@solid-primitives\//,
              ],
            },
          },
        },
      },
      {
        plugins: [solid({ ssr: true })],
        resolve: { conditions: ['node'] },
        test: {
          name: 'server-rendering',
          environment: 'node',
          include: ['tests/unit/**/*.server.test.tsx'],
        },
      },
    ],
  },
})
