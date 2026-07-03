import { defineConfig, devices } from '@playwright/test'

// The Playwright runner is a separate process from the dev server, so it does
// not get the .env that Astro/Vite loads. Pull it into process.env here so
// tests (e.g. login credentials in src/tests/helpers.ts) can read it.
try {
  process.loadEnvFile()
} catch {
  // .env may be absent in CI, where the vars are set in the environment.
}

export default defineConfig({
  testDir: './src/tests/e2e',
  /* Directory for test artifacts (screenshots, traces, videos). */
  outputDir: './.playwright/test-results',
  /* Maximum time one test can run for. */
  timeout: 15000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { outputFolder: './.playwright/report' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: process.env.SITE_URL ?? 'http://localhost:3030',
    // headless: false,
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    port: 3030,
    reuseExistingServer: !process.env.CI,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 }
  }
})
