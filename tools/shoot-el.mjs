// Screenshot one element of the running site. Usage: node tools/shoot-el.mjs url selector out.png [width]
import { createRequire } from 'module';
const require = createRequire('C:/Users/Shyam sundar/Desktop/Cowork/linkedin-agent/package.json');
const { chromium } = require('playwright-core');
const [, , url, sel, out, w = '1600'] = process.argv;
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: +w, height: 1000 } });
await p.goto(url, { waitUntil: 'networkidle' });
const el = p.locator(sel).first();
await el.scrollIntoViewIfNeeded();
await p.evaluate(() => Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
await p.waitForTimeout(500);
await el.screenshot({ path: out });
await b.close();
