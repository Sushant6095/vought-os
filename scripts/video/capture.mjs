/**
 * capture.mjs — Playwright capture orchestrator for the Vought demo video.
 *
 * Records one WebM per page session into output/shots/raw, then renames to a
 * deterministic <slug>.webm. compose.sh converts WebM -> normalized MP4.
 *
 * Ports (verified): web = :3000, app = :3002.
 *
 * The live screen is seeded via ?demo=1 (a dev-only, gated branch in the live
 * page that drives the real Zustand store). Real components, real animations,
 * synthetic input event only — never a mocked screenshot.
 *
 * Usage: node scripts/video/capture.mjs
 */

import { chromium } from 'playwright';
import { mkdirSync, renameSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOTS = resolve(__dirname, 'output/shots');
const RAW = resolve(SHOTS, 'raw');
mkdirSync(RAW, { recursive: true });

const WEB = process.env.WEB_BASE ?? 'http://localhost:3000';
const APP = process.env.APP_BASE ?? 'http://localhost:3002';

const VIEWPORT = { width: 1920, height: 1080 };

/** Breath cycle (2000ms) — let ambient motion settle before holding. */
const BREATH = 2000;

/**
 * Shot definitions. `record` is the number of ms of usable footage to hold
 * AFTER the scene is staged. compose.sh trims each to the aligned VO length.
 */
const SCENES = [
  {
    slug: 'live-bloom',
    url: `${APP}/live/test-session?demo=1`,
    record: 24000,
    stage: async (page) => {
      // Wait for the seeded suggestion bloom to appear.
      await page
        .waitForSelector('article[aria-label="Suggested response"]', { timeout: 12000 })
        .catch(() => {});
      await page.waitForTimeout(BREATH);
    },
  },
  {
    slug: 'live-teams',
    url: `${APP}/live/test-session?demo=1&variant=teams`,
    record: 13000,
    stage: async (page) => {
      await page
        .waitForSelector('article[aria-label="Suggested response"]', { timeout: 12000 })
        .catch(() => {});
      await page.waitForTimeout(BREATH);
    },
  },
  {
    slug: 'onboarding-voice',
    url: `${APP}/onboarding/voice`,
    record: 17000,
    stage: async (page) => {
      // Accept consent to arm the record button (genuine ready state).
      const consent = page
        .locator('input[type="checkbox"], [role="checkbox"]')
        .first();
      await consent.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(BREATH);
    },
  },
  {
    slug: 'customers-hero',
    url: `${WEB}/customers`,
    record: 7000,
    stage: async (page) => {
      await page.waitForTimeout(BREATH);
    },
  },
  {
    slug: 'customers-story',
    url: `${WEB}/customers`,
    record: 8000,
    stage: async (page) => {
      // Scroll to the TripleByte CustomerStory section (the featured block).
      await page.evaluate(() => {
        const candidates = Array.from(document.querySelectorAll('section, article, blockquote'));
        const target = candidates.find((el) =>
          /tripleByte|1\.4M|tripled|acceptance/i.test(el.textContent ?? ''),
        );
        (target ?? document.body).scrollIntoView({ block: 'center' });
      });
      await page.waitForTimeout(1200);
      await page.waitForTimeout(BREATH);
    },
  },
];

async function captureScene(browser, scene) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
    recordVideo: { dir: RAW, size: VIEWPORT },
  });
  const page = await context.newPage();
  // Silence noisy console; surface only hard failures.
  page.on('pageerror', (err) => console.warn(`  [pageerror ${scene.slug}]`, err.message));

  let ok = true;
  try {
    const resp = await page.goto(scene.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (resp && resp.status() >= 400) {
      console.warn(`  ! ${scene.slug} returned HTTP ${resp.status()}`);
      ok = false;
    }
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await scene.stage(page);
    await page.waitForTimeout(scene.record);
  } catch (err) {
    console.warn(`  ! ${scene.slug} staging error: ${err.message}`);
    ok = false;
  }

  const video = page.video();
  await page.close();
  await context.close(); // flush video to disk

  if (video) {
    const dest = resolve(SHOTS, `${scene.slug}.webm`);
    if (existsSync(dest)) rmSync(dest);
    try {
      const src = await video.path();
      renameSync(src, dest);
      console.log(`  ✓ ${scene.slug} -> ${dest}`);
    } catch (err) {
      console.warn(`  ! ${scene.slug} could not save video: ${err.message}`);
      ok = false;
    }
  } else {
    ok = false;
  }
  return ok;
}

const browser = await chromium.launch({
  headless: true,
  args: ['--disable-blink-features=AutomationControlled', '--autoplay-policy=no-user-gesture-required'],
});

const results = {};
for (const scene of SCENES) {
  console.log(`Capturing ${scene.slug} …`);
  results[scene.slug] = await captureScene(browser, scene);
}

await browser.close();
try {
  rmSync(RAW, { recursive: true, force: true });
} catch {
  /* ignore */
}

console.log('\nCapture summary:');
for (const [slug, ok] of Object.entries(results)) {
  console.log(`  ${ok ? '✓' : '✗'} ${slug}`);
}
const failed = Object.entries(results).filter(([, ok]) => !ok).map(([s]) => s);
if (failed.length) {
  console.log(`\nFailed shots: ${failed.join(', ')}`);
  process.exitCode = 0; // compose.sh substitutes a canvas card for any missing shot
}
console.log('\nDone. Shots in', SHOTS);
