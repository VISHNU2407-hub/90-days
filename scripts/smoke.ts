/* Smoke test: verifies seeding, store actions and the progress engines. */
/* Run with: npx vite-node scripts/smoke.ts */

const mem = new Map<string, string>();
const localStorageShim = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, String(v)),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => void mem.clear(),
  key: (i: number) => [...mem.keys()][i] ?? null,
  get length() {
    return mem.size;
  },
};

(globalThis as unknown as Record<string, unknown>).localStorage = localStorageShim;
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
function check(cond: unknown, label: string, extra?: unknown) {
  if (cond) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${label}`, extra ?? '');
  }
}

async function main() {
  const { useStore } = await import('@/store');
  const { repo, LOCAL_DATA_KEY } = await import('@/lib/repo');
  const compute = await import('@/lib/compute');
  const { nextBestActions } = await import('@/lib/priority');

  console.log('\n1. boot + seeding (no auth)');
  check(useStore.getState().status === 'loading', 'boots without a session');
  await useStore.getState().init();
  check(useStore.getState().status === 'ready', 'init reaches ready');
  check(
    !('signIn' in useStore.getState()) && !('signUp' in useStore.getState()) && !('signOut' in useStore.getState()),
    'no auth actions on the store',
  );
  const data = useStore.getState().data!;
  check(!!data, 'bundle loaded');
  check(data.weeks.length === 13, `13 weeks seeded (${data.weeks.length})`);
  check(data.tasks.length > 400 && data.tasks.length < 800, `daily tasks seeded (${data.tasks.length})`);
  check(data.patterns.length === 20, `20 DSA patterns (${data.patterns.length})`);
  check(data.learning.length === 44, `learning topics (${data.learning.length})`);
  check(data.projects.length === 4, `4 projects (${data.projects.length})`);
  check(data.projectTasks.length > 40, `project tasks (${data.projectTasks.length})`);
  check(data.milestones.length === 4, '4 milestones');
  check(data.checklist.length === 21, `success checklist (${data.checklist.length})`);
  check(data.certifications.length === 3, '3 planned certifications');
  check(data.reviews.length === 13, '13 weekly reviews');
  check(data.topics.length > 40, `roadmap reference topics (${data.topics.length})`);
  check(data.settings!.theme === 'light', `default theme is light (${data.settings!.theme})`);

  console.log('\n2. seeded curriculum content');
  check(
    data.weeks[0].dsa === 'Arrays + Strings + Time/Space Complexity',
    'week 1 DSA is Arrays + Strings + complexity basics',
  );
  check(
    !data.weeks.some((w: { dsa: string }) => /complexity only|standalone complexity|time complexity only/i.test(w.dsa)),
    'no week dedicated only to complexity',
  );
  check(data.weeks[6].ai === 'LLMs + prompting', 'week 7 AI from PDF');
  check(data.weeks[12].checkpoint === '90-day assessment', 'week 13 checkpoint from PDF');
  check(
    data.projects.some((p) => p.key === 'sats') && data.projects.length === 4,
    'SATS major project present',
  );
  check(
    data.learning.some((t) => t.group_name === 'L8') && data.learning.some((t) => t.group_name === 'RAG'),
    'agent levels + RAG topics present',
  );

  console.log('\n3. day/phase/week maths');
  const info = compute.getDayInfo(data.settings);
  check(info.day === 1 && info.week === 1 && info.phase === 1, 'today is Day 1', info);
  const pastSettings = { ...data.settings, start_date: '2000-01-01' };
  const pastInfo = compute.getDayInfo(pastSettings);
  check(pastInfo.day === 90 && pastInfo.phase === 3, 'start date far in the past → day 90', pastInfo);

  console.log('\n4. baseline progress is zero (no fake numbers)');
  const before = compute.overallProgress(data, info);
  check(before.overall === 0, `overall progress starts at 0 (${before.overall}%)`);
  check(compute.dsaStats(data).solved === 0, 'DSA solved starts at 0');
  check(compute.currentStreak(data) === 0, 'streak starts at 0');
  check(compute.trackStats(data, 'corecs').pct === 0, 'learning starts at 0');
  check(compute.projectSummaries(data).every((p) => p.pct === 0), 'projects start at 0');

  console.log('\n5. completing a task');
  const store = useStore.getState;
  const day1 = data.tasks.filter((t) => t.day === 1);
  check(day1.length >= 5, `day 1 has ${day1.length} tasks`);
  store().toggleTask(day1[0].id);
  let d = useStore.getState().data!;
  check(d.tasks.find((t) => t.id === day1[0].id)!.completed === true, 'task marked completed');
  check(d.completions.length === 1, 'completion event logged');
  check(compute.currentStreak(d) === 1, `streak is 1 (${compute.currentStreak(d)})`);
  check(compute.overallProgress(d, info).overall > 0, 'overall progress moves');
  const persisted = JSON.parse(localStorageShim.getItem(LOCAL_DATA_KEY)!);
  check(persisted.tasks.find((t: { id: string }) => t.id === day1[0].id).completed === true, 'completion persisted');

  // un-complete → everything returns to baseline
  store().toggleTask(day1[0].id);
  d = useStore.getState().data!;
  check(d.completions.length === 0, 'un-completing removes the completion event');
  check(compute.currentStreak(d) === 0, 'streak back to 0');

  console.log('\n6. DSA logging');
  store().addProblem({
    name: 'Two Sum',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/two-sum/',
    pattern: 'Arrays',
    difficulty: 'easy',
    status: 'solved',
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    time_minutes: 18,
    needed_hint: false,
    notes: 'hash map of index pairs',
    mistake: '',
    revision_date: '2000-01-05',
    solved_at: new Date().toISOString(),
  });
  d = useStore.getState().data!;
  const dsa = compute.dsaStats(d);
  check(dsa.solved === 1, `problem logged (${dsa.solved})`);
  check(dsa.patterns.find((p) => p.name === 'Arrays')!.solved === 1, 'pattern progress updated');
  check(compute.dueRevisions(d).length === 1, 'overdue revision detected');
  store().updateProblem(d.problems[0].id, { status: 'mastered', revision_date: null });
  d = useStore.getState().data!;
  check(compute.dueRevisions(d).length === 0, 'revision cleared after mastering');

  console.log('\n7. learning, projects, checklist, reviews');
  store().setLearning(d.learning[0].id, { status: 'mastered', confidence: 4 });
  d = useStore.getState().data!;
  check(compute.trackStats(d, 'corecs').pct > 0, `core cs progress (${compute.trackStats(d, 'corecs').pct}%)`);
  store().toggleProjectTask(d.projectTasks[0].id);
  store().toggleChecklist(d.checklist[0].id);
  store().saveReview(d.reviews[0].id, { completed: true, consistency: 4 });
  store().toggleMilestoneRequirement(d.milestones[0].id, 'm30_8');
  d = useStore.getState().data!;
  check(compute.projectSummaries(d)[0].pct > 0, 'project progress derived from tasks');
  check(compute.checklistDone(d) === 1, 'checklist toggle works');
  check(compute.reviewsDone(d) === 1, 'review marked complete');
  const ms = compute.milestoneStatus(d, d.milestones[0], info);
  check(ms.items.find((i) => i.id === 'm30_8')!.done === true, 'manual milestone requirement ticked');
  check(ms.pct > 0 && ms.pct < 100, `milestone progress (${ms.pct}%)`);

  console.log('\n8. priority engine');
  const recs = nextBestActions(d, info);
  check(recs.length >= 1 && recs.length <= 3, `1..3 recommendations (${recs.length})`);
  check(recs.every((r) => r.title && r.reason && r.to), 'recommendations are actionable');
  console.log('     →', recs.map((r) => r.title).join(' | '));

  console.log('\n9. day navigation + sections');
  const day30 = compute.tasksOnDay(d, 30);
  check(day30.length > 0, `day 30 has tasks (${day30.length})`);
  check(day30.some((t) => t.category === 'career'), 'day 30 has the resume-draft career action');
  const day7 = compute.tasksOnDay(d, 7);
  check(day7.some((t) => t.category === 'review'), 'every 7th day has the weekly review');
  check(compute.tasksOnDay(d, 90).some((t) => t.category === 'review'), 'day 90 checkpoint review exists');

  console.log('\n10. settings + reset');
  store().saveSettings({ start_date: '2026-01-01', theme: 'light', min_day_mode: true });
  d = useStore.getState().data!;
  check(d.settings!.start_date === '2026-01-01' && d.settings!.theme === 'light', 'settings persist');
  await store().resetProgress();
  d = useStore.getState().data!;
  check(compute.checklistDone(d) === 0 && d.problems.length === 0, 'reset clears progress');
  check(d.weeks.length === 13 && d.tasks.length > 400, 'reset re-seeds the roadmap');
  check(d.settings!.start_date === '2026-01-01', 'reset keeps user settings');

  console.log('\n11. persistence across reload (localStorage)');
  store().rename('Reload Tester');
  store().toggleTask(d.tasks[1].id);
  await new Promise((r) => setTimeout(r, 50));
  // simulate a full page reload: wipe in-memory state, re-run init
  useStore.setState({ status: 'loading', data: null, toast: null });
  await store().init();
  const reloaded = useStore.getState().data!;
  check(useStore.getState().status === 'ready', 'reload lands ready, no auth gate');
  check(reloaded.profile!.name === 'Reload Tester', 'profile survives reload');
  check(
    reloaded.tasks.find((t) => t.id === d.tasks[1].id)!.completed === true,
    'completion survives reload',
  );
  check(reloaded.settings!.start_date === '2026-01-01', 'settings survive reload');
  check(!localStorageShim.getItem('careeros:accounts:v1'), 'no accounts key in storage');
  check(!localStorageShim.getItem('careeros:session:v1'), 'no session key in storage');

  console.log('\n12. DSA curriculum migration (existing stored bundles)');
  localStorageShim.removeItem('careeros:migrated:dsa-curriculum:v2');
  const raw = JSON.parse(localStorageShim.getItem(LOCAL_DATA_KEY)!);
  raw.weeks[0].dsa = 'Complexity + arrays';
  const oldDsaTask = raw.tasks.find((t: { category: string }) => t.category === 'dsa');
  oldDsaTask.completed = true;
  oldDsaTask.completed_at = new Date().toISOString();
  const nonDsaBefore = raw.tasks.filter((t: { category: string }) => t.category !== 'dsa');
  localStorageShim.setItem(LOCAL_DATA_KEY, JSON.stringify(raw));
  useStore.setState({ status: 'loading', data: null, toast: null });
  await store().init();
  const mig = useStore.getState().data!;
  check(
    mig.weeks[0].dsa === 'Arrays + Strings + Time/Space Complexity',
    'stored week labels regenerated',
  );
  const migDsa = mig.tasks.filter((t) => t.category === 'dsa');
  check(migDsa.length === 90, `regenerated DSA tasks, 1/day (${migDsa.length})`);
  check(
    mig.tasks.find((t) => t.id === oldDsaTask.id)?.completed === true,
    'DSA completion carried over to the regenerated task',
  );
  const nonDsaAfter = mig.tasks.filter((t) => t.category !== 'dsa');
  check(
    nonDsaAfter.length === nonDsaBefore.length &&
      nonDsaAfter.every((t, i) =>
        t.id === nonDsaBefore[i].id &&
        t.title === nonDsaBefore[i].title &&
        t.completed === nonDsaBefore[i].completed,
      ),
    'non-DSA tasks untouched by the migration',
  );

  console.log('\n13. repo interface');
  check(repo.mode === 'local', `repo mode = ${repo.mode}`);

  console.log(
    failures === 0 ? '\nALL CHECKS PASSED\n' : `\n${failures} CHECK(S) FAILED\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
