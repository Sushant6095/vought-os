#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const SCREENSHOTS = resolve(OUT, 'screenshots');
mkdirSync(SCREENSHOTS, { recursive: true });

const TARGETS = [
  { name: 'web', base: process.env.WEB_BASE || 'http://localhost:3000' },
  { name: 'app', base: process.env.APP_BASE || 'http://localhost:3001' },
];

const CTA_VERBS = [
  /\b(book|schedule|reserve)\b.*\b(demo|call|meeting)\b/i,
  /\bget\s+(started|a demo|the docs|the app)\b/i,
  /\bstart\s+(trial|free|now)\b/i,
  /\btry\s+(free|it|vought)\b/i,
  /\bsign\s*up\b/i,
  /\bopen\s+(the\s+)?(demo|live|tour)\b/i,
  /\bwatch\s+(the\s+)?(tour|demo|video)\b/i,
  /\btalk\s+to\s+(sales|us|support)\b/i,
  /\b(read|explore)\s+(the\s+)?(docs|story|case study|copilot|receptionist|insights)\b/i,
  /\bsee\s+(pricing|plans|customers)\b/i,
  /\bview\s+all\b/i,
];

const slug = (url) => url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80);

async function crawlBase(target) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  const visited = new Set();
  const queue = [`${target.base}/`];
  const pages = [];
  const externalLinks = new Set();
  const errors = [];

  while (queue.length > 0) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    if (!url.startsWith(target.base)) continue;
    visited.add(url);

    const page = await ctx.newPage();
    const pageErrors = [];
    const consoleErrors = [];
    const failedRequests = [];

    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('requestfailed', (req) => failedRequests.push({ url: req.url(), reason: req.failure()?.errorText }));
    page.on('response', (resp) => { if (resp.status() >= 400) failedRequests.push({ url: resp.url(), status: resp.status() }); });

    let status = 0, title = '', h1 = '', bodyTextLength = 0;
    const internalLinks = [];
    const externalLinkObjs = [];
    const ctas = [];
    const forms = [];

    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      status = response?.status() ?? 0;
      title = await page.title();
      h1 = await page.locator('h1').first().textContent({ timeout: 2000 }).catch(() => '');
      bodyTextLength = (await page.locator('body').textContent().catch(() => '')).length;

      const links = await page.locator('a[href]').elementHandles();
      for (const l of links) {
        const href = await l.getAttribute('href');
        const text = ((await l.textContent()) || '').trim().slice(0, 60);
        const target_attr = await l.getAttribute('target');
        const rel = await l.getAttribute('rel');

        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;

        let absUrl;
        try { absUrl = new URL(href, url).href; } catch { continue; }

        if (absUrl.startsWith(target.base)) {
          internalLinks.push({ href: absUrl, text });
          if (!visited.has(absUrl)) queue.push(absUrl);
        } else if (absUrl.startsWith('http')) {
          externalLinkObjs.push({ href: absUrl, text, target: target_attr, rel });
          externalLinks.add(absUrl);
        }
      }

      const buttons = await page.locator('button, [role="button"]').elementHandles();
      for (const b of buttons) {
        const text = ((await b.textContent()) || '').trim();
        if (!text) continue;
        if (CTA_VERBS.some((re) => re.test(text))) {
          ctas.push({ text: text.slice(0, 60), hasOnClick: !!(await b.evaluate(el => el.onclick || el.closest('a'))) });
        }
      }

      const formEls = await page.locator('form').elementHandles();
      for (const f of formEls) {
        forms.push({ action: await f.getAttribute('action'), method: await f.getAttribute('method') });
      }

      if (status >= 400 || pageErrors.length || consoleErrors.length) {
        await page.screenshot({ path: resolve(SCREENSHOTS, `${slug(url)}.png`), fullPage: true });
      }
    } catch (err) {
      errors.push({ url, type: 'crawl-crash', message: err.message });
      try { await page.screenshot({ path: resolve(SCREENSHOTS, `${slug(url)}_CRASH.png`) }); } catch {}
    } finally {
      await page.close();
    }

    pages.push({
      url, status, title, h1, bodyTextLength,
      internalLinkCount: internalLinks.length,
      externalLinkCount: externalLinkObjs.length,
      ctaCount: ctas.length,
      formCount: forms.length,
      internalLinks, externalLinks: externalLinkObjs, ctas, forms,
      pageErrors, consoleErrors, failedRequests,
    });
  }

  // External link validation (HEAD requests)
  const extResults = [];
  for (const ext of externalLinks) {
    try {
      const r = await fetch(ext, { method: 'HEAD', signal: AbortSignal.timeout(10000), redirect: 'follow' });
      extResults.push({ url: ext, status: r.status, ok: r.ok });
    } catch (e) {
      extResults.push({ url: ext, status: 0, ok: false, error: e.message });
    }
  }

  await ctx.close();
  await browser.close();
  return { target: target.name, base: target.base, pages, externalLinks: extResults, errors };
}

const allResults = [];
for (const target of TARGETS) {
  console.log(`Crawling ${target.base}...`);
  const result = await crawlBase(target);
  console.log(`  ${result.pages.length} pages, ${result.externalLinks.length} external links`);
  allResults.push(result);
}

writeFileSync(resolve(OUT, 'report.json'), JSON.stringify({
  ranAt: new Date().toISOString(),
  results: allResults,
}, null, 2));

// Cross-page integrity
const totals = { broken: 0, deadEnds: 0, empty: 0, ctaMismatch: 0, unsafeExternal: 0, jsErrors: 0 };
const critical = [];
const high = [];

for (const r of allResults) {
  for (const p of r.pages) {
    if (p.status >= 400) { totals.broken++; critical.push(`BROKEN: ${p.url} returned ${p.status}`); }
    if (p.bodyTextLength < 500) { totals.empty++; high.push(`EMPTY: ${p.url} has only ${p.bodyTextLength} chars of body text`); }
    if (p.internalLinkCount === 0 && p.url !== r.base + '/' && !p.url.includes('/live/')) {
      totals.deadEnds++; high.push(`DEAD END: ${p.url} has no outbound internal links`);
    }
    if (p.pageErrors.length || p.consoleErrors.length) {
      totals.jsErrors++;
      critical.push(`JS ERROR: ${p.url} — ${(p.pageErrors[0] || p.consoleErrors[0] || '').slice(0, 120)}`);
    }
    for (const ext of p.externalLinks) {
      if (ext.target === '_blank' && !(ext.rel || '').includes('noopener')) {
        totals.unsafeExternal++;
        high.push(`UNSAFE: ${p.url} has external link to ${ext.href} with target=_blank but no rel=noopener`);
      }
    }
    for (const cta of p.ctas) {
      if (!cta.hasOnClick) {
        totals.ctaMismatch++;
        critical.push(`DEAD CTA: ${p.url} has button "${cta.text}" with no onClick or anchor wrapper`);
      }
    }
  }
  for (const ext of r.externalLinks) {
    if (!ext.ok) { totals.broken++; critical.push(`EXTERNAL BROKEN: ${ext.url} → ${ext.status || ext.error}`); }
  }
}

const verdict = critical.length > 0 ? 'RED' : (high.length > 0 ? 'YELLOW' : 'GREEN');

const md = `# Link Integrity Report

**Verdict:** ${verdict}

## Summary

- Targets crawled: ${allResults.length}
- Pages visited: ${allResults.reduce((a, r) => a + r.pages.length, 0)}
- External links checked: ${allResults.reduce((a, r) => a + r.externalLinks.length, 0)}
- Broken (HTTP 4xx/5xx): ${totals.broken}
- Dead ends: ${totals.deadEnds}
- Empty pages: ${totals.empty}
- Dead CTAs (no click handler): ${totals.ctaMismatch}
- JS errors: ${totals.jsErrors}
- Unsafe external links: ${totals.unsafeExternal}

## Critical (must fix before submission)

${critical.length ? critical.map(c => `- ${c}`).join('\n') : '_none_'}

## High (fix if time)

${high.length ? high.map(h => `- ${h}`).join('\n') : '_none_'}

## Sitemap

${allResults.map(r => `### ${r.target} (${r.base})

${r.pages.map(p => `- [${p.url.replace(r.base, '') || '/'}](${p.url}) — status ${p.status}, ${p.internalLinkCount} internal links, ${p.ctaCount} CTAs${p.pageErrors.length ? ' ⚠ JS errors' : ''}`).join('\n')}`).join('\n\n')}

## Screenshots

Failures captured to \`scripts/checks/link-integrity/screenshots/\`. One PNG per failing route.
`;

writeFileSync(resolve(OUT, 'issues.md'), md);

console.log('\n══ DONE ══');
console.log(`Verdict: ${verdict}`);
console.log(`Critical: ${critical.length}`);
console.log(`High: ${high.length}`);
console.log(`Full report: scripts/checks/link-integrity/issues.md`);
process.exit(verdict === 'RED' ? 1 : 0);
