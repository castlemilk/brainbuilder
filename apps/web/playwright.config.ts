import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 8_000
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry"
  },
  webServer: [
    {
      command: "cd ../../backend && PATH=/opt/homebrew/bin:/usr/local/go/bin:$PATH BRAINBUILDER_ADDR=127.0.0.1:8091 go run ./cmd/server",
      url: "http://127.0.0.1:8091/healthz",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000
    },
    {
      command: "VITE_API_URL=http://127.0.0.1:8091 npm run dev -- --port 5173",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000
    }
  ],
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 960 } }
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"] }
    }
  ]
});
