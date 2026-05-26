#!/usr/bin/env node
/**
 * Vought · End-to-end page check
 *
 * Visits every marketing + app route, captures screenshots, validates render,
 * and produces a structured pass/fail report.
 *
 * Run:
 *   cd ~/Downloads/vought
 *   npx playwright install chromium    # one-time
 *   node scripts/checks/check-all-pages.mjs
 *
 * Output:
 *   scripts/checks/screenshots/<route-slug>.png
 *   scripts/checks/report.json
 *   stdout: tabular summary
 */

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = resolve(__dirname, 'screenshots');
const REPORT_PATH = resolve(__dirname, 'report.json');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const WEB_BASE = process.env.WEB_BASE ?? 'http://localhost:3000';
const APP_BASE = process.env.APP_BASE ?? 'http://localhost:3001';

const ROUTES = [
  // Marketing site
  { app: 'web', path: '/',             expect: 'Intelligence for live conversations' },
  { app: 'web', path: '/copilot',      expect: 'The whisper that closes' },
  { app: 'web', path: '/receptionist', expect: 'Answer every call' },
  { app: 'web', path: '/platform',     expect: 'Echo Engine' },
  { app: 'web', path: '/pricing',      expect: 'Transparent pricing' },
  { app: 'web', path: '/customers',    expect: 'customers' },
  { app: 'web', path: '/security',     expect: "can't leak" },
  { app: 'web', path: '/about',        expect: 'about' },
  { app: 'web', path: '/contact',      expect: 'help' },
  { app: 'web', path: '/blog',         expect: 'blog' },
  // Product app
  { app: 'app', path: '/',             expect: '' },
  { app: 'app', path: '/live',         expect: '' },
  { app: 'app', path: '/live/test-session', expect: '' },
  { app: 'app', path: '/onboarding/voice', expect: 'voice' },
  { app: 'app', path: '/settings/voice',   expect: 'voice' },
];

const slug = (route) => `${route.app}_${route.path.replace(/\//g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'root'}`;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

const results = [];

console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
console.log('║  VOUGHT · END-TO-END PAGE CHECK                                        ║');
console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

console.log('Route                                Status  Title-OK  H1  Screenshot');
console.log('─────────────────────────────────────────────────────────────────────────');

for (const route of ROUTES) {
  const url = (route.app === 'web' ? WEB_BASE : APP_BASE) + route.path;
  const page = await ctx.newPage();
  const result = {
    url, app: route.app, path: route.path,
    status: null, title: null, h1: null, screenshot: null,
    consoleErrors: [], pageErrors: [], verdict: '✗',
  };

  page.on('console', (msg) => { if (msg.type() === 'error') result.consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => result.pageErrors.push(err.message));

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    result.status = response?.status() ?? 0;
    result.title = await page.title();
    result.h1 = await page.locator('h1').first().textContent({ timeout: 2000 }).catch(() => null);

    // wait a tick for any breath / bloom / reveal motions to render at least one frame
    await page.waitForTimeout(800);

    const screenshotPath = resolve(SCREENSHOTS_DIR, `${slug(route)}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshot = screenshotPath;

    const titleOk = result.title && result.title.length > 0;
    const h1Ok = !!result.h1;
    const statusOk = result.status >= 200 && result.status < 400;
    result.verdict = statusOk && titleOk && h1Ok ? '✓' : '✗';
  } catch (err) {
    result.error = err.message;
  } finally {
    await page.close();
  }

  results.push(result);

  const statusStr = String(result.status ?? '---').padEnd(7);
  const titleOk = result.title ? '✓' : '✗';
  const h1Ok = result.h1 ? '✓' : '✗';
  const screenshotOk = result.screenshot ? '✓' : '·';
  console.log(`${(route.app + route.path).padEnd(36)} ${statusStr} ${titleOk.padEnd(8)} ${h1Ok.padEnd(3)} ${screenshotOk}  ${result.verdict}`);
  if (result.error) console.log(`  ↳ ERROR: ${result.error}`);
  if (result.consoleErrors.length) console.log(`  ↳ ${result.consoleErrors.length} console error(s)`);
  if (result.pageErrors.length) console.log(`  ↳ ${result.pageErrors.length} page error(s)`);
}

await browser.close();
writeFileSync(REPORT_PATH, JSON.stringify({ ranAt: new Date().toISOString(), webBase: WEB_BASE, appBase: APP_BASE, results }, null, 2));

const pass = results.filter((r) => r.verdict === '✓').length;
const fail = results.length - pass;

console.log('\n─────────────────────────────────────────────────────────────────────────');
console.log(`  ${pass}/${results.length} routes pass · ${fail} failed`);
console.log(`  Screenshots: scripts/checks/screenshots/`);
console.log(`  Full report: scripts/checks/report.json`);
console.log('─────────────────────────────────────────────────────────────────────────\n');

if (fail > 0) {
  console.log('FAILED ROUTES (details):');
  results.filter((r) => r.verdict === '✗').forEach((r) => {
    console.log(`\n  ${r.url}`);
    console.log(`    status: ${r.status ?? 'no response'}`);
    if (r.error) console.log(`    error: ${r.error}`);
    if (r.consoleErrors.length) r.consoleErrors.forEach((e) => console.log(`    console: ${e}`));
    if (r.pageErrors.length) r.pageErrors.forEach((e) => console.log(`    pageerror: ${e}`));
  });
  process.exit(1);
}
