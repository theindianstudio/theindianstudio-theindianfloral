// Full-page screenshots of the running site for review.
// Usage: node tools/shoot.mjs http://localhost:5174/ out.png [width] [mobile]
import { createRequire } from 'module';
const require = createRequire('C:/Users/Shyam sundar/Desktop/Cowork/linkedin-agent/package.json');
const { chromium } = require('playwright-core');

const [, , url, out, w = '1440', mobile] = process.argv;
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: +w, height: mobile ? 844 : 900 }, deviceScaleFactor: 1, isMobile: !!mobile, hasTouch: !!mobile });
const errors = [];
p.on('pageerror', e => errors.push(e.message));
p.on('console', m => m.type() === 'error' && errors.push(m.text()));
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
// scroll through so lazy images load, then back to the top
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
await p.waitForTimeout(900);
await p.screenshot({ path: out, fullPage: true });
console.log(JSON.stringify({ errors, overflowX: await p.evaluate(() => document.documentElement.scrollWidth > innerWidth) }));
await b.close();
