#!/usr/bin/env node
// Captures full-page screenshots of each app route against a local `vite preview`
// server, with realistic seed data injected into localStorage before any app JS
// runs. Run with `npm run screenshots` (which builds first) or directly with
// `node scripts/screenshot-pages.mjs` against an existing dist/.
//
// Browser: defaults to the chromium bundled by `npx playwright install`. To use
// a pre-existing chromium binary (e.g. on a sandboxed machine), set
// PLAYWRIGHT_CHROMIUM_PATH to its executable path.

import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(REPO_ROOT, "screenshots");

const HOST = "127.0.0.1";
const PORT = 4317;
const ORIGIN = `http://${HOST}:${PORT}`;

const VIEWPORT = { width: 1440, height: 900 };

const ROUTES = [
  { slug: "today", path: "/today" },
  { slug: "projects", path: "/projects" },
  { slug: "project-detail", path: "/projects/ml-model-trainer" },
  { slug: "learning", path: "/learning" },
  { slug: "insights", path: "/insights" },
];

function buildFocusSeed() {
  const now = Date.now();
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  const session = (
    daysAgo,
    minutes,
    {
      id,
      projectId,
      projectName,
      task,
      category,
      sessionType = "deep",
      naturallyCompleted = true,
      reflection = null,
    }
  ) => {
    const endedAt = now - daysAgo * DAY;
    const actualDurationSec = minutes * 60;
    const startedAt = endedAt - actualDurationSec * 1000;
    return {
      session: {
        id,
        projectId,
        projectName,
        task,
        startedAt,
        endedAt,
        plannedDurationSec: actualDurationSec,
        actualDurationSec,
        completedNaturally: naturallyCompleted,
        activityCategory: category,
        sessionType,
        tags: [],
      },
      reflection: reflection
        ? {
            sessionId: id,
            focusLevel: reflection.focus,
            energyLevel: reflection.energy,
            reflection: reflection.text,
            completedPlanned: true,
            createdAt: endedAt + 30_000,
          }
        : null,
    };
  };

  const sessionLog = [
    session(0, 75, {
      id: "seed-s-1",
      projectId: "ml-model-trainer",
      projectName: "ML Model Trainer",
      task: "Tune hyperparameters on baseline model",
      category: "coding",
      reflection: { focus: 4, energy: 4, text: "Solid block — picked up momentum after the first 20 min." },
    }),
    session(0, 45, {
      id: "seed-s-2",
      projectId: "data-science-handbook",
      projectName: "Data Science Handbook",
      task: "Read chapter 7 — cross-validation",
      category: "learning",
      sessionType: "learning",
    }),
    session(1, 60, {
      id: "seed-s-3",
      projectId: "cli-productivity-toolkit",
      projectName: "CLI Productivity Toolkit",
      task: "Refactor argv parser",
      category: "coding",
      reflection: { focus: 5, energy: 4, text: "Deep flow." },
    }),
    session(2, 50, {
      id: "seed-s-4",
      projectId: "portfolio-redesign",
      projectName: "Portfolio Redesign",
      task: "Hero section polish",
      category: "design",
      sessionType: "light",
    }),
    session(3, 90, {
      id: "seed-s-5",
      projectId: "ml-model-trainer",
      projectName: "ML Model Trainer",
      task: "Add experiment tracking",
      category: "coding",
      reflection: { focus: 4, energy: 3, text: "Heads-down session, fewer interruptions today." },
    }),
    session(4, 30, {
      id: "seed-s-6",
      projectId: "lofi-beats-collection",
      projectName: "Lo-fi Beats Collection",
      task: "Sketch drum loop variations",
      category: "music",
      sessionType: "light",
      naturallyCompleted: false,
    }),
    session(5, 65, {
      id: "seed-s-7",
      projectId: "ml-model-trainer",
      projectName: "ML Model Trainer",
      task: "Data cleaning pass",
      category: "coding",
      reflection: { focus: 4, energy: 4, text: "Cleaned 2k rows of malformed entries." },
    }),
  ];

  const dailyPlan = {
    projectId: "ml-model-trainer",
    projectName: "ML Model Trainer",
    primaryTask: "Tune hyperparameters on baseline model",
    secondaryTask: "Write up results in lab notebook",
    plannedDurationMin: 75,
    createdAt: now - 30 * MIN,
  };

  return {
    state: {
      projectId: "ml-model-trainer",
      task: "Tune hyperparameters on baseline model",
      durationSec: 35 * 60,
      flags: {
        focusMode: true,
        notificationsMuted: true,
        distractionsBlocked: true,
      },
      currentTierId: 3,
      xp: 420,
      dailyPlan,
      sessionLog,
    },
    version: 4,
  };
}

function waitForReady(url, { timeoutMs = 30_000, intervalMs = 250 } = {}) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolveReady, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) {
          resolveReady();
          return;
        }
      } catch {
        // server not up yet
      }
      if (Date.now() > deadline) {
        reject(new Error(`Server did not become ready at ${url} within ${timeoutMs}ms`));
        return;
      }
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}

function startPreviewServer() {
  // detached:true puts the child in its own process group so we can signal
  // the whole tree on cleanup (vite spawns sub-processes; signalling only
  // the immediate child can orphan them).
  const proc = spawn(
    process.execPath,
    [resolve(REPO_ROOT, "node_modules/vite/bin/vite.js"), "preview",
      "--host", HOST, "--port", String(PORT), "--strictPort"],
    {
      cwd: REPO_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NODE_ENV: "production" },
      detached: true,
    }
  );
  proc.stdout?.on("data", (chunk) => process.stdout.write(`[preview] ${chunk}`));
  proc.stderr?.on("data", (chunk) => process.stderr.write(`[preview] ${chunk}`));
  return proc;
}

async function stopProcess(proc) {
  if (!proc || proc.exitCode !== null || proc.pid == null) return;
  try {
    process.kill(-proc.pid, "SIGTERM");
  } catch {
    /* group may already be gone */
  }
  await new Promise((r) => setTimeout(r, 500));
  if (proc.exitCode === null) {
    try {
      process.kill(-proc.pid, "SIGKILL");
    } catch {
      /* group may already be gone */
    }
  }
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const focusSeed = buildFocusSeed();
  const initScript = `
    try {
      localStorage.setItem("focus-ladder.focus", ${JSON.stringify(JSON.stringify(focusSeed))});
    } catch (e) {
      console.error("seed failed", e);
    }
  `;

  console.log(`[screenshots] starting vite preview on ${ORIGIN} ...`);
  const server = startPreviewServer();
  let browser;

  try {
    await waitForReady(`${ORIGIN}/today`);
    console.log("[screenshots] preview ready, launching chromium ...");

    const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
    browser = await chromium.launch({ headless: true, executablePath });
    const context = await browser.newContext({ viewport: VIEWPORT });
    await context.addInitScript(initScript);

    for (const route of ROUTES) {
      const page = await context.newPage();
      const url = `${ORIGIN}${route.path}`;
      console.log(`[screenshots] capturing ${route.slug}  ${url}`);
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(400);
      const file = resolve(OUT_DIR, `${route.slug}.png`);
      await page.screenshot({ path: file, fullPage: true });
      await page.close();
      console.log(`[screenshots]   wrote ${file}`);
    }

    await context.close();
  } finally {
    if (browser) await browser.close().catch(() => {});
    await stopProcess(server);
  }

  console.log(`[screenshots] done -> ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
