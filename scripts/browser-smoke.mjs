/* Headless-browser smoke test: boots the real app in Chrome via CDP. */
/* Run with: node scripts/browser-smoke.mjs */

import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';

const CHROME =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;
const BASE = 'http://localhost:5173';
const PROFILE = 'C:/temp/careeros-chrome-profile';
rmSync(PROFILE, { recursive: true, force: true }); // fresh browser profile every run
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
    const r = await send('Runtime.evaluate', {
      expression: expr,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result?.value;
  };

  const waitFor = async (expr, timeout = 8000) => {
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

  const setValue = (selector, value) => `
    (() => {
      const el = document.querySelector('${selector}');
      if (!el) return false;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, ${JSON.stringify(value)});
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`;

  console.log('\n1. app opens straight on the dashboard (no auth)');
  await send('Page.navigate', { url: `${BASE}/` });
  // Wait for a *stable* dashboard snapshot (handles first-paint / dep-optimizer reloads).
  let dashText = '';
  {
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      dashText = await evaluate('document.body.innerText').catch(() => '');
      if (
        dashText.includes('TODAY’S PRIORITIES') &&
        dashText.includes('Day 1 of 90') &&
        dashText.includes('Career OS')
      ) {
        break;
      }
      await sleep(250);
    }
  }
  check(
    dashText.includes('TODAY’S PRIORITIES'),
    'landed on the dashboard with no sign-in step',
    dashText.slice(0, 200),
  );
  check(
    (await evaluate('location.pathname')) === '/',
    'stays on / (no auth redirect)',
    await evaluate('location.pathname'),
  );
  check(
    (await evaluate("!!document.querySelector('input[type=password]')")) === false,
    'no password field anywhere',
  );
  check(
    !dashText.includes('Create account') && !dashText.includes('Sign in'),
    'no sign-up / sign-in copy',
  );
  check(dashText.includes('Career OS'), 'brand visible', dashText.slice(0, 200));
  const startsDark = await evaluate("document.documentElement.classList.contains('dark')");
  check(startsDark === false, 'light theme is the default (no .dark class)', startsDark);

  console.log('\n2. dashboard content');
  check(dashText.includes('Day 1 of 90'), 'shows DAY 1 / 90');
  check(/TODAY.?S PRIORITIES/i.test(dashText), "shows TODAY'S PRIORITIES");
  check(/NEXT BEST ACTION/i.test(dashText), 'shows next best action');
  check(/NEXT MILESTONE/i.test(dashText), 'shows next milestone');
  check(/Day 30|Foundation/i.test(dashText), 'shows the Day 30 milestone');

  console.log('\n3. completing a task updates the UI');
  const checkboxReady = await waitFor("!!document.querySelector('[role=checkbox]')", 8000);
  check(!!checkboxReady, 'today\u2019s task checkboxes rendered');
  const before = await evaluate(
    "document.body.innerText.match(/\\d+ \\/ \\d+ tasks/)?.[0] ?? ''",
  );
  await evaluate(
    "document.querySelector('[role=checkbox]')?.click()",
  );
  // wait until the counter actually changes (or timeout)
  {
    const start = Date.now();
    let now = before;
    while (Date.now() - start < 8000) {
      now = await evaluate("document.body.innerText.match(/\\d+ \\/ \\d+ tasks/)?.[0] ?? ''").catch(() => '');
      if (now && now !== before) break;
      await sleep(250);
    }
  }
  await sleep(300);
  const after = await evaluate("document.body.innerText.match(/\\d+ \\/ \\d+ tasks/)?.[0] ?? ''");
  check(before !== after, `task completion changes the counter (${before} → ${after})`);
  const persisted = await evaluate(
    "JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.startsWith('careeros:data:v1')))).tasks.filter(t => t.completed).length",
  );
  check(persisted === 1, `completion persisted to storage (${persisted} completed)`);

  console.log('\n4. every route renders');
  const routes = [
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
  for (const [route, needle] of routes) {
    await send('Page.navigate', { url: `${BASE}${route}` });
    const ok = await waitFor(
      `document.body.innerText.toLowerCase().includes(${JSON.stringify(needle.toLowerCase())})`,
      12000,
    );
    check(!!ok, `${route} renders ("${needle}")`);
  }

  console.log('\n5. mobile viewport (390px) — every route');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: `${BASE}/daily` });
  const mobileOk = await waitFor("!!document.querySelector('nav.md\\\\:hidden')", 10000);
  check(!!mobileOk, 'bottom navigation present on mobile');
  const overflow = await evaluate(
    'document.documentElement.scrollWidth <= window.innerWidth + 1',
  );
  check(overflow, 'no horizontal overflow at 390px', await evaluate('document.documentElement.scrollWidth'));
  for (const [route, needle] of routes.concat([['/', 'priorities']])) {
    await send('Page.navigate', { url: `${BASE}${route}` });
    const ok = await waitFor(
      `document.body.innerText.toLowerCase().includes(${JSON.stringify(needle.toLowerCase())})`,
      12000,
    );
    check(!!ok, `${route} renders on mobile`);
    const fits = await evaluate(
      'document.documentElement.scrollWidth <= window.innerWidth + 1',
    );
    check(fits, `${route} fits 390px (no h-overflow)`, await evaluate('document.documentElement.scrollWidth'));
  }

  console.log('\n6. theme toggle');
  await send('Emulation.clearDeviceMetricsOverride');
  await send('Page.navigate', { url: `${BASE}/` });
  await waitFor('!!document.querySelector("[data-theme-toggle]")', 10000);
  const wasDark = await evaluate("document.documentElement.classList.contains('dark')");
  await evaluate('document.querySelector("[data-theme-toggle]").click()');
  await sleep(400);
  const isDark = await evaluate("document.documentElement.classList.contains('dark')");
  check(wasDark !== isDark, `theme switches (${wasDark} → ${isDark})`);
  await evaluate('document.querySelector("[data-theme-toggle]").click()');
  await sleep(300);

  console.log('\n7. DSA problem logging through the UI');
  await send('Page.navigate', { url: `${BASE}/dsa` });
  await waitFor('document.body.innerText.includes("Pattern progress")', 12000);
  await evaluate(
    "Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add problem'))?.click()",
  );
  const modalOpen = await waitFor(
    "!!document.querySelector('input[placeholder=\"e.g. Two Sum\"]')",
    8000,
  );
  check(!!modalOpen, 'Add problem modal opens');
  await evaluate(setValue('input[placeholder="e.g. Two Sum"]', 'Valid Parentheses'));
  await evaluate(
    "Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Log problem')?.click()",
  );
  await sleep(700);
  const dsaText = await evaluate('document.body.innerText');
  check(dsaText.includes('1 / 139'), 'solved counter updated to 1 / 139');
  await evaluate(
    "Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Problems'))?.click()",
  );
  await sleep(400);
  check(
    (await evaluate('document.body.innerText')).includes('Valid Parentheses'),
    'problem appears in the list',
  );
  const storedProblems = await evaluate(
    "JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.startsWith('careeros:data:v1')))).problems.length",
  );
  check(storedProblems === 1, `problem persisted (${storedProblems})`);

  console.log('\n8. PWA installability');
  check(
    (await evaluate("!!document.querySelector('link[rel=manifest]')")) === true,
    'manifest link present',
  );
  const manifest = await evaluate(
    "fetch(document.querySelector('link[rel=manifest]').href).then(r => r.json())",
  ).catch(() => null);
  check(!!manifest, 'manifest fetches and parses', manifest);
  if (manifest) {
    check(manifest.display === 'standalone', `display: ${manifest.display}`);
    check(!!manifest.start_url, `start_url: ${manifest.start_url}`);
    const sizes = (manifest.icons || []).map((i) => i.sizes);
    check(sizes.includes('192x192'), 'manifest has a 192px icon', sizes);
    check(sizes.includes('512x512'), 'manifest has a 512px icon', sizes);
    check(
      (manifest.icons || []).some((i) => (i.purpose || 'any').includes('maskable')),
      'manifest has a maskable icon',
    );
    for (const icon of manifest.icons || []) {
      const ok = await evaluate(
        `fetch(${JSON.stringify(icon.src)}).then(r => r.ok && r.status === 200)`,
      ).catch(() => false);
      check(ok === true, `icon loads: ${icon.src}`);
    }
  }
  const swReady = await waitFor(
    "navigator.serviceWorker.getRegistration().then(r => !!(r && r.active))",
    10000,
  );
  check(!!swReady, 'service worker registered and active');
  check(
    (await evaluate("!!document.querySelector('meta[name=theme-color]')")) === true,
    'theme-color meta present',
  );

  console.log('\n9. console errors');
  check(logs.length === 0, `no console errors (${logs.length})`, logs.slice(0, 5));

  console.log(failures === 0 ? '\nBROWSER CHECKS PASSED\n' : `\n${failures} CHECK(S) FAILED\n`);
  ws.close();
  chrome.kill();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
