/* One-off DSA curriculum acceptance check. Run: npx vite-node scripts/verify-dsa.ts */
const mem = new Map<string, string>();
(globalThis as unknown as Record<string, unknown>).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, String(v)),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => void mem.clear(),
  key: (i: number) => [...mem.keys()][i] ?? null,
  get length() {
    return mem.size;
  },
};
(globalThis as unknown as Record<string, unknown>).window = globalThis;
(globalThis as unknown as Record<string, unknown>).document = {
  documentElement: { classList: { toggle: () => undefined }, style: {} },
  querySelector: () => null,
};
(globalThis as unknown as { matchMedia?: unknown }).matchMedia = () => ({
  matches: true,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
});

let failures = 0;
const check = (cond: unknown, label: string, extra?: unknown) => {
  if (cond) console.log(`  ok   ${label}`);
  else {
    failures += 1;
    console.error(`  FAIL ${label}`, extra ?? '');
  }
};

async function main() {
  const { SEED_WEEKS, tasksForDay } = await import('@/lib/seed/roadmap');
  const expected = [
    'Arrays + Strings + Time/Space Complexity',
    'Hashing + Two Pointers + Sliding Window',
    'Linked Lists + Stack + Queue',
    'Binary Search + Recursion + Mixed Revision',
    'Trees + BST',
    'Heaps / Priority Queues + Backtracking',
    'Graphs — BFS + DFS',
    'Greedy + Graph Practice + Mixed DSA',
    'Dynamic Programming Basics',
    'Dynamic Programming Practice + Graph Practice + Binary Search Patterns',
    'Timed Mixed DSA + Weak Topics',
    'Interview-focused DSA + Weak Topic Repair',
    'Mock Contests + Final DSA Revision',
  ];
  console.log('1. week labels');
  expected.forEach((t, i) =>
    check(SEED_WEEKS[i].dsa === t, `week ${i + 1}: ${SEED_WEEKS[i].dsa}`),
  );
  check(
    !SEED_WEEKS.some((w) => /^(time |space )?complexity( only)?$/i.test(w.dsa.trim())),
    'no complexity-only week',
  );

  console.log('\n2. day 1 + 90-day task structure');
  const all = [];
  for (let day = 1; day <= 90; day++) all.push(...tasksForDay(day, SEED_WEEKS[Math.ceil(day / 7) - 1]));
  check(all.length > 400, `total tasks across 90 days = ${all.length}`);
  const first = tasksForDay(1, SEED_WEEKS[0]);
  check(
    first[0].category === 'dsa' && first[0].title === 'DSA: Arrays + Strings + Time/Space Complexity',
    `day 1 first task = ${first[0].title}`,
  );
  check(
    /complexity/i.test(first[0].detail),
    'day 1 task detail teaches complexity basics with the topic',
  );

  console.log('\n3. one DSA task per day, no duplicates');
  let dsaPerDayOk = true;
  let dsaTotal = 0;
  let dupIds = 0;
  for (let day = 1; day <= 90; day++) {
    const tasks = tasksForDay(day, SEED_WEEKS[Math.ceil(day / 7) - 1]);
    const dsa = tasks.filter((t) => t.category === 'dsa');
    if (dsa.length !== 1) {
      dsaPerDayOk = false;
      console.error(`    day ${day} has ${dsa.length} DSA tasks`);
    }
    dsaTotal += dsa.length;
    const dayTitles = tasks.map((t) => t.title);
    if (new Set(dayTitles).size !== dayTitles.length) dupIds += 1;
  }
  check(dsaPerDayOk, 'exactly 1 DSA task on each of the 90 days');
  check(dsaTotal === 90, `DSA task total = ${dsaTotal} (regenerated set, no leftovers)`);
  check(dupIds === 0, `no same-day duplicate tasks (${dupIds} days with dups)`);

  console.log('\n4. weekly structure (4 learn + 1 mixed + 1 timed + 1 review)');
  const wk1 = SEED_WEEKS[0];
  const kinds = Array.from({ length: 7 }, (_, i) =>
    tasksForDay(i + 1, wk1).find((t) => t.category === 'dsa')!.title,
  );
  check(kinds.slice(0, 4).every((t) => t.startsWith('DSA: ')), 'days 1–4 learn tasks');
  check(kinds[4].startsWith('Mixed DSA practice'), `day 5 mixed (${kinds[4]})`);
  check(kinds[5].startsWith('Timed DSA set'), `day 6 timed (${kinds[5]})`);
  check(kinds[6].startsWith('Light revision'), `day 7 review (${kinds[6]})`);
  check(
    !kinds.some((t) => /complexity/i.test(t) && !/Arrays \+ Strings/.test(t)),
    'no standalone complexity full-day task',
  );

  console.log('\n5. later topics follow progression (spot checks)');
  check(SEED_WEEKS[4].dsa === 'Trees + BST', 'week 5');
  check(SEED_WEEKS[6].dsa === 'Graphs — BFS + DFS', 'week 7');
  check(SEED_WEEKS[8].dsa === 'Dynamic Programming Basics', 'week 9');
  check(SEED_WEEKS[12].dsa === 'Mock Contests + Final DSA Revision', 'week 13');

  console.log(failures === 0 ? '\nDSA ACCEPTANCE PASSED\n' : `\n${failures} FAILED\n`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
