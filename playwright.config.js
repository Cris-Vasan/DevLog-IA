import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.js',
  use: {
    baseURL: 'http://localhost:5174',
    headless: true,
  },
  webServer: [
    {
      command: 'node server/start-test.js',
      port: 3002,
      reuseExistingServer: false,
      timeout: 15000,
    },
    {
      command: 'npm run dev:client:e2e',
      port: 5174,
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
  workers: 1,
});
