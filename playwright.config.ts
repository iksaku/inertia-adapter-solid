import { defineConfig, devices } from '@playwright/test'

process.env.PACKAGE = 'solid'
const ssr = process.env.SSR === 'true'
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const suite = ssr ? 'ssr' : process.env.VITE_HTTP_CLIENT === 'axios' ? 'browser-axios' : 'browser-fetch'

export default defineConfig({
  testDir: './tests/upstream',
  ...(ssr ? { testMatch: 'ssr.spec.ts' } : { testIgnore: ['ssr.spec.ts', 'svelte.spec.ts', 'plugin.spec.ts'] }),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 4,
  timeout: 10_000,
  outputDir: `test-results/${suite}`,
  reporter: [
    ['list'],
    ['json', { outputFile: `test-results/${suite}/results.json` }],
    ['html', { outputFolder: `playwright-report/${suite}`, open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:13721',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], ...(executablePath ? { launchOptions: { executablePath } } : {}) },
    },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, timeout: 15_000 },
  ],
  webServer: [
    {
      command: 'pnpm build && pnpm test:app:build && node tests/app/server.js',
      url: 'http://localhost:13721',
      timeout: 120_000,
      reuseExistingServer: process.env.TEST_REUSE_SERVER === 'true',
    },
    ...(ssr
      ? [
          {
            command: 'pnpm test:app:ssr && node tests/test-app/dist/ssr.js',
            url: 'http://localhost:13714/health',
            timeout: 120_000,
          },
          {
            command: 'pnpm test:app:ssr:auto && node tests/test-app/dist/ssr-auto.js',
            url: 'http://localhost:13722/health',
            timeout: 120_000,
          },
        ]
      : []),
  ],
})
