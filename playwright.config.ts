import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  
  // Con headless: false, varias ventanas en paralelo causan timeouts
  workers: 1,
  
  use: {
    // Se conserva el baseURL de DemoBlaze: las Clases 1-4 lo necesitan
    baseURL: 'https://www.demoblaze.com',
    headless: false,
    screenshot: 'on',
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 }
    },
    trace: 'on',
    launchOptions: {
      slowMo: 500
    }
  },
  
  // Multi-browser: 3 motores + 2 móviles
  projects: [
    { name: 'chromium',      use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',       use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',        use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
  
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
});