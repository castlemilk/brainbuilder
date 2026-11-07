import { defineConfig, devices } from "@playwright/test";

const localChromium = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

// The learning prototype is local-first and does not require the API server.
export default defineConfig({
  testDir: "./tests",
  testMatch: "scrolling-learning.spec.ts",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  outputDir: "./test-results/scrolling-learning",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report-scroll", open: "never" }]
  ],
  use: {
    baseURL: "http://127.0.0.1:5174",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: localChromium ? { executablePath: localChromium, args: ["--disable-gpu"] } : undefined
  },
  webServer: {
    command: "npm run dev -- --port 5174 --strictPort",
    url: "http://127.0.0.1:5174",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  },
  projects: [
    {
      name: "scroll-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 960 } }
    },
    {
      name: "scroll-mobile",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } }
    }
  ]
});
