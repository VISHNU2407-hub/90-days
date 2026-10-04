/* Mobile viewport audit: every route at 360/390/414px via headless Chrome CDP. */
/* Run with: node scripts/mobile-audit.mjs */

import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9334;
const BASE = 'http://localhost:5173';
const PROFILE = 'C:/temp/careeros-mobile-audit-profile';
rmSync(PROFILE, { recursive: true, force: true });
mkdirSync(PROFILE, { recursive: true });

let failures = 0;
const check = (cond, label, extra) => {
  if (cond) console.log(`  ok   ${label}`);
  else {
    failures += 1;
    console.error(`  FAIL ${label}`, extra ?? '');
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ROUTES = [
  ['/', 'priorities'],
  ['/daily', 'plan'],
  ['/roadmap', 'Week-by-week'],
  ['/dsa', 'Pattern progress'],
  ['/core-cs', 'Core CS'],
  ['/ai-ml', 'AI / ML Foundation'],
  ['/genai', 'GenAI'],
  ['/projects', 'Projects'],
  ['/certifications', 'Certifications'],
  ['/reviews', 'Weekly Reviews'],
  ['/analytics', 'Analytics'],
  ['/settings', 'Settings'],
];

async function main() {
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--no-first-run',
      '--disable-extensions',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${PROFILE}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  let target = null;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(250);
    try {
      const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json());
      target = list.find((t) => t.type === 'page');
    } catch {
      /* retry */
    }
  }
  if (!target) {
    console.error('could not reach Chrome DevTools');
    chrome.kill();
    process.exit(1);
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let id = 0;
  const pending = new Map();
  const logs = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      logs.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      logs.push('EXCEPTION: ' + JSON.stringify(msg.params.exceptionDetails?.text));
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, { resolve, reject });
      ws.send(JSON.stringify({ id: mid, method, params }));
    });

  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result?.value;
  };

  const waitFor = async (expr, timeout = 10000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const v = await evaluate(expr).catch(() => undefined);
      if (v) return v;
      await sleep(250);
    }
    return undefined;
  };

  await send('Page.enable');
  await send('Runtime.enable');

  const widths = [360, 390, 414];

  for (const width of widths) {
    console.log(`\n— ${width}px —`);
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 800,
      deviceScaleFactor: 2,
      mobile: true,
    });
    for (const [route, needle] of ROUTES) {
      await send('Page.navigate', { url: `${BASE}${route}` });
      const ok = await waitFor(
        `document.body.innerText.toLowerCase().includes(${JSON.stringify(needle.toLowerCase())})`,
        12000,
      );
      const fits = await evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1');
      const clipped = await evaluate(`(() => {
        const bad = [];
        for (const el of document.querySelectorAll('button, a, h1, h2, h3, h4, p')) {
          const cls = typeof el.className === 'string' ? el.className : '';
          if (/truncate|line-clamp|overflow-hidden/.test(cls)) continue; // intentional clipping
          if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2) {
            bad.push((el.textContent || '').trim().slice(0, 40));
          }
          if (bad.length >= 3) break;
        }
        return bad;
      })()`);
      check(!!ok && fits && clipped.length === 0, `${route} @ ${width} — renders + fits + no clipped text`, JSON.stringify({ ok: !!ok, fits, clipped }));
    }
  }

  // interaction: bottom nav + drawer + modal fit at 360px
  console.log('\n— interactions @ 360px —');
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });

  await send('Page.navigate', { url: `${BASE}/dsa` });
  await waitFor("document.body.innerText.includes('Pattern progress')", 12000);
  await evaluate("Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add problem'))?.click()");
  const modalOpen = await waitFor("!!document.querySelector('[role=dialog]')", 5000);
  check(!!modalOpen, 'DSA add-problem modal opens on mobile');
  const modalFits = await evaluate(`(() => {
    const d = document.querySelector('[role=dialog]');
    if (!d) return false;
    const r = d.getBoundingClientRect();
    return r.width <= window.innerWidth + 1 && r.height <= window.innerHeight + 1;
  })()`);
  check(modalFits, 'modal fits the 360px viewport');
  // form fields usable: type into problem name
  await evaluate("document.querySelector('[role=dialog] input')?.focus()");
  const typed = await evaluate(`(() => {
    const el = document.querySelector('[role=dialog] input');
    if (!el) return false;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, 'Mobile audit problem');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return el.value === 'Mobile audit problem';
  })()`);
  check(!!typed, 'form input accepts typing');
  await evaluate("document.querySelector('[role=dialog] button[aria-label=Close]')?.click()");

  await send('Page.navigate', { url: `${BASE}/` });
  await waitFor("document.body.innerText.includes('TODAY')", 12000);
  await evaluate("document.querySelector('button[aria-label=\"Open menu\"]')?.click()");
  const drawerOpen = await waitFor(
    "Array.from(document.querySelectorAll('nav a')).filter(a => a.offsetParent !== null).length >= 10",
    5000,
  );
  check(!!drawerOpen, 'mobile drawer opens with full navigation');
  await evaluate("document.querySelector('button[aria-label=\"Close menu\"]')?.click()");

  await send('Page.navigate', { url: `${BASE}/daily` });
  await waitFor("document.body.innerText.toLowerCase().includes('plan')", 12000);
  const bottomNav = await evaluate(`(() => {
    const links = Array.from(document.querySelectorAll('nav a, nav button')).filter(el => el.getBoundingClientRect().bottom > window.innerHeight - 80 && el.getBoundingClientRect().top > 0);
    return links.length >= 5;
  })()`);
  check(!!bottomNav, 'bottom navigation visible with 5 items');

  const overflowErrors = logs.filter((l) => !l.includes('favicon'));
  check(overflowErrors.length === 0, `no console errors during audit (${overflowErrors.length})`, overflowErrors.slice(0, 3));

  chrome.kill();
  console.log(failures === 0 ? '\nMOBILE AUDIT PASSED\n' : `\n${failures} FAILED\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
