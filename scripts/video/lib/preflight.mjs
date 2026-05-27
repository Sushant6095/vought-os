/**
 * preflight.mjs — verify tooling + that the dev servers render the pages we
 * need to capture. Uses Playwright (no curl). Exits non-zero on hard failure.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const WEB = process.env.WEB_BASE ?? 'http://localhost:3000';
const APP = process.env.APP_BASE ?? 'http://localhost:3002';
const FFMPEG = process.env.FFMPEG || '/opt/homebrew/bin/ffmpeg';

const checks = [];
const fonts = ['/System/Library/Fonts/Helvetica.ttc', '/System/Library/Fonts/Menlo.ttc'];
for (const f of fonts) checks.push([`font ${f}`, existsSync(f)]);

try {
  execFileSync(FFMPEG, ['-version'], { stdio: 'ignore' });
  checks.push(['ffmpeg', true]);
} catch {
  checks.push(['ffmpeg', false]);
}

let exec = '';
try {
  exec = chromium.executablePath();
  checks.push([`chromium (${exec.split('/').slice(-2).join('/')})`, existsSync(exec)]);
} catch (e) {
  checks.push(['chromium', false]);
}

const urls = [
  `${WEB}/`,
  `${WEB}/customers`,
  `${APP}/live/test-session?demo=1`,
  `${APP}/onboarding/voice`,
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
for (const url of urls) {
  const page = await ctx.newPage();
  try {
    const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    checks.push([`GET ${url}`, !!r && r.status() < 400, r ? r.status() : 'no-response']);
  } catch (e) {
    checks.push([`GET ${url}`, false, e.message.split('\n')[0]]);
  }
  await page.close();
}
await browser.close();

let allOk = true;
console.log('Preflight:');
for (const [name, ok, note] of checks) {
  if (!ok) allOk = false;
  console.log(`  ${ok ? '✓' : '✗'} ${name}${note !== undefined ? `  [${note}]` : ''}`);
}
process.exit(allOk ? 0 : 1);
