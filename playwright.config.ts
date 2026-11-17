import { defineConfig } from "@playwright/test";

const testPort = 3100;
const testUrl = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: "list",
  use: {
    baseURL: testUrl,
    channel: "chrome",
    viewport: { width: 1280, height: 1000 },
    contextOptions: { reducedMotion: "reduce" },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port ${testPort}`,
    url: testUrl,
    reuseExistingServer: false,
    env: {
      EQUIPIADA_NEXT_DIST_DIR: ".next-test",
      EQUIPIADA_DATABASE_PATH: `data/test-feedback-${process.pid}.sqlite`,
    },
    timeout: 60_000,
  },
});
