import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002';
const browser = await chromium.launch({ executablePath: existsSync(chrome) ? chrome : undefined, args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1 });
  page.on('pageerror', error => console.error(error.message));
  page.on('console', message => { if (message.type() === 'error') console.error(message.text()); });
  await page.goto(`${baseURL}/galeria`, { waitUntil: 'networkidle' });
  await page.locator('canvas').waitFor({ timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: '/tmp/bbf-gallery.png' });
  const hidden = await page.addStyleTag({ content: '.gallery-toolbar, .gallery-heading, .gallery-bottom, .gallery-hint, .gallery-notice { visibility: hidden !important; }' });
  await page.locator('canvas').screenshot({ path: 'public/images/museum.jpg', type: 'jpeg', quality: 92 });
  await hidden.evaluate(element => element.remove());
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/bbf-home.png', fullPage: true });
  await page.goto(`${baseURL}/exhibir`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/bbf-form.png', fullPage: true });
  console.log('Captured museum cover and desktop screenshots.');
} finally { await browser.close(); }
