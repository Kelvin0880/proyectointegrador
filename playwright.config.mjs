import { defineConfig, devices } from '@playwright/test';

// Pruebas de punta a punta: se ejecutan contra la versión compilada (npm run build)
// usando una base de datos aparte (database/e2e.db) que se reinicia en cada corrida.
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: BASE_URL,
    locale: 'es-DO',
    timezoneId: 'America/Santo_Domingo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: `node scripts/db-reset.mjs && npx next start -p ${PORT}`,
    url: `${BASE_URL}/auth/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_FILE: 'database/e2e.db',
      NEXTAUTH_URL: BASE_URL,
      NEXTAUTH_SECRET: 'e2e-test-secret',
    },
  },
});
