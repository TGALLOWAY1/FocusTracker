#!/usr/bin/env node
// Renders screenshot-comparison.html in headless chromium and screenshots each
// per-route `<section>` to its own combined before/after PNG.

import { mkdir, rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const HTML = resolve(REPO_ROOT, "screenshot-comparison.html");
const OUT_DIR = resolve(REPO_ROOT, "screenshots-comparison");

const ROUTES = ["today", "projects", "project-detail", "learning", "insights"];

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    const context = await browser.newContext({ viewport: { width: 1800, height: 1200 } });
    const page = await context.newPage();
    await page.goto(pathToFileURL(HTML).href, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(400);

    for (const slug of ROUTES) {
      const handle = await page.$(`section#${slug}`);
      if (!handle) {
        console.error(`section#${slug} not found`);
        continue;
      }
      const file = resolve(OUT_DIR, `${slug}.png`);
      await handle.screenshot({ path: file });
      console.log(`wrote ${file}`);
    }
    await context.close();
  } finally {
    await browser.close().catch(() => {});
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
