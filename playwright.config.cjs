const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./tests/ui",
  testMatch: "*.spec.cjs",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  reporter: [
    ["list"],
    ["html", { outputFolder: "artifacts/ui/report", open: "never" }],
  ],
  outputDir: "artifacts/ui/results",
  use: {
    baseURL: "http://localhost:3100",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {},
  },
  webServer: [
    {
      command: "node tests/ui/fixture-server.cjs",
      url: "http://127.0.0.1:54329/__state",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "node tests/ui/start-app.cjs",
      url: "http://localhost:3100",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
