import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3002";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: "list",
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure", launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (existsSync(chrome) ? chrome : undefined), args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] } },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } }, { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } }],
  webServer: { command: "npm run dev -- --port 3002", url: baseURL, reuseExistingServer: !process.env.CI, timeout: 120000 },
});
