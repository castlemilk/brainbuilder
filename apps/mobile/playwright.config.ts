import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 35_000,
  expect: {
    timeout: 8_000
  },
  use: {
    baseURL: "http://127.0.0.1:5183",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm run export:web && python3 -m http.server 5183 --directory dist/web --bind 127.0.0.1",
    url: "http://127.0.0.1:5183",
    reuseExistingServer: !process.env.CI,
    timeout: 45_000
  },
  projects: [
    {
      name: "expo-phone",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } }
    },
    {
      name: "expo-tablet",
      use: { ...devices["Desktop Chrome"], hasTouch: true, viewport: { width: 820, height: 1180 } }
    }
  ]
});
