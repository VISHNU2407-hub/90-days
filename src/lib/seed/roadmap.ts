import type {
  Category,
  ChecklistItem,
  DailyTask,
  Milestone,
  Priority,
  RoadmapTopic,
  RoadmapTopicKind,
} from '@/lib/types';

/* ==================================================================== *
 *  Source of truth: 90_Day_Career_Development_Plan_Improved.pdf
 *  Everything below is transcribed from the PDF — do not "improve" the
 *  curriculum here. Progress state is tracked separately per user.
 * ==================================================================== */

/* ------------------------------ phases ----------------------------- */

export interface Phase {
  id: 1 | 2 | 3;
  name: string;
  days: string;
  focus: string;
  exit: string;
}

export const PHASES: Phase[] = [
  {
    id: 1,
    name: 'Phase 1 — Foundation',
    days: 'Days 1–30',
    focus: 'Python, DSA basics, OOP, SQL/DBMS, AI/ML basics',
    exit: 'Can solve basic patterns and explain fundamentals',
  },
  {
    id: 2,
    name: 'Phase 2 — Skill Building',
    days: 'Days 31–60',
    focus: 'Intermediate DSA, OS, Networks, ML, GenAI, first agents',
    exit: 'Can build small AI/GenAI applications and solve medium DSA',
  },
  {
    id: 3,
    name: 'Phase 3 — Projects & Career',
    days: 'Days 61–90',
    focus: 'Advanced DSA, agents, major project, interview prep',
    exit: 'Portfolio + interview readiness + application system',
  },
];

/* -------------------------------- weeks ---------------------------- */

export interface SeedWeek {
  week_number: number;
  dsa: string;
  core_cs: string;
  ai: string;
  project_career: string;
  checkpoint: string;
}

/** Section 11 — Week-by-week execution plan (exact PDF content). */
export const SEED_WEEKS: SeedWeek[] = [
  {
    week_number: 1,
    dsa: 'Arrays + Strings + Time/Space Complexity',
    core_cs: 'OOP basics',
    ai: 'Python for AI',
    project_career: 'GitHub + tracker',
    checkpoint: '20-question basics test',
  },
  {
    week_number: 2,
    dsa: 'Hashing + Two Pointers + Sliding Window',
    core_cs: 'SQL basics',
    ai: 'NumPy/Pandas',
    project_career: 'Small coding exercises',
    checkpoint: 'Solve 5 mixed DSA timed',
  },
  {
    week_number: 3,
    dsa: 'Linked Lists + Stack + Queue',
    core_cs: 'DBMS basics',
    ai: 'Regression',
    project_career: 'ML project starts',
    checkpoint: 'ML train/test explained',
  },
  {
    week_number: 4,
    dsa: 'Binary Search + Recursion + Mixed Revision',
    core_cs: 'Joins/normalization/transactions',
    ai: 'Classification + evaluation',
    project_career: 'ML project finished',
    checkpoint: 'Day-30 review',
  },
  {
    week_number: 5,
    dsa: 'Trees + BST',
    core_cs: 'OS processes/threads',
    ai: 'Feature engineering',
    project_career: 'README + GitHub polish',
    checkpoint: 'Tree pattern test',
  },
  {
    week_number: 6,
    dsa: 'Heaps / Priority Queues + Backtracking',
    core_cs: 'OS scheduling/memory/deadlocks',
    ai: 'Overfitting + NN basics',
    project_career: 'Project explanation practice',
    checkpoint: 'Core CS quiz',
  },
  {
    week_number: 7,
    dsa: 'Graphs — BFS + DFS',
    core_cs: 'Networks basics',
    ai: 'LLMs + prompting',
    project_career: 'GenAI project starts',
    checkpoint: 'API + structured output',
  },
  {
    week_number: 8,
    dsa: 'Greedy + Graph Practice + Mixed DSA',
    core_cs: 'HTTP/DNS/TCP/UDP',
    ai: 'Embeddings + RAG',
    project_career: 'RAG project',
    checkpoint: 'RAG test set',
  },
  {
    week_number: 9,
    dsa: 'Dynamic Programming Basics',
    core_cs: 'Revision',
    ai: 'Tool calling',
    project_career: 'Agent A',
    checkpoint: '2 tools working',
  },
  {
    week_number: 10,
    dsa: 'Dynamic Programming Practice + Graph Practice + Binary Search Patterns',
    core_cs: 'Revision',
    ai: 'Memory/workflows/evaluation',
    project_career: 'Agent B',
    checkpoint: 'Agent evaluation',
  },
  {
    week_number: 11,
    dsa: 'Timed Mixed DSA + Weak Topics',
    core_cs: 'Interview revision',
    ai: 'Agent reliability/security',
    project_career: 'Major project',
    checkpoint: 'Mock interview 1',
  },
  {
    week_number: 12,
    dsa: 'Interview-focused DSA + Weak Topic Repair',
    core_cs: 'Full Core CS review',
    ai: 'Deployment/API basics',
    project_career: 'Major project + docs',
    checkpoint: 'Resume + mock 2',
  },
  {
    week_number: 13,
    dsa: 'Mock Contests + Final DSA Revision',
    core_cs: 'Final technical review',
    ai: 'Explain architecture',
    project_career: 'Applications + final report',
    checkpoint: '90-day assessment',
  },
];

export const weekStartDay = (w: number) => (w - 1) * 7 + 1;
export const weekEndDay = (w: number) => Math.min(w * 7, 90);
export const weekForDay = (day: number) => Math.min(13, Math.ceil(day / 7));
export const phaseForDay = (day: number): 1 | 2 | 3 =>
  day <= 30 ? 1 : day <= 60 ? 2 : 3;
export const phaseForWeek = (week: number): 1 | 2 | 3 =>
  phaseForDay(Math.round((weekStartDay(week) + weekEndDay(week)) / 2));

/* --------------------------- DSA master plan ----------------------- */

export interface DsaPlanSegment {
  weeks: string;
  topics: string;
  target: string;
}

export const DSA_PLAN: DsaPlanSegment[] = [
  { weeks: 'Weeks 1–2', topics: 'Arrays, strings, hashing, two pointers, sliding window (time/space complexity taught alongside every topic)', target: '18–22 problems' },
  { weeks: 'Weeks 3–4', topics: 'Linked lists, stack, queue, binary search, recursion, mixed revision', target: '18–22 problems' },
  { weeks: 'Weeks 5–6', topics: 'Trees, BST, heap/priority queue, backtracking', target: '18–22 problems' },
  { weeks: 'Weeks 7–8', topics: 'Graphs (BFS/DFS), greedy, graph practice, mixed patterns', target: '18–22 problems' },
  { weeks: 'Weeks 9–10', topics: 'DP basics, DP practice, graph practice, binary-search patterns, mixed medium', target: '18–22 problems' },
  { weeks: 'Weeks 11–12', topics: 'Timed sets, weak topics, interview-focused practice', target: '15–20 problems' },
  { weeks: 'Week 13', topics: 'Mock contests + final revision', target: '8–12 problems' },
];

/**
 * Complexity rule: time/space complexity is NEVER a standalone week or a
 * standalone full-day task — it is taught and logged with every topic/problem.
 */
export const COMPLEXITY_RULE =
  'Time and space complexity are analyzed with every DSA topic and every problem — never as a standalone week or full-day task. For each problem log: pattern, difficulty, time complexity, space complexity, attempt time, hint used, mistake and revision status.';

/** Daily DSA time box (normal day) — approximate splits, ~3–5 quality problems. */
export const DSA_DAILY_TARGET = [
  { part: 'Concept / pattern learning', time: '20–30 min' },
  { part: 'Problem solving (3–5 quality problems)', time: '50–70 min' },
  { part: 'Solution analysis + complexity', time: '10–15 min' },
  { part: 'Mistake / revision logging', time: '5–10 min' },
];

/** Weekly DSA rhythm — 4 learn days + 1 mixed + 1 timed + 1 review. */
export const DSA_WEEK_STRUCTURE = [
  { day: 'Days 1–4', focus: 'New learning + problems' },
  { day: 'Day 5', focus: 'Mixed practice' },
  { day: 'Day 6', focus: 'Timed practice' },
  { day: 'Day 7', focus: 'Revision / weekly review' },
];

export const DSA_LOOP = [
  { step: '1. Learn', action: 'Understand the pattern and write the idea without copying code.' },
  { step: '2. Implement', action: 'Code from scratch in Python.' },
  { step: '3. Solve', action: 'Attempt before looking at the solution; use a time limit.' },
  { step: '4. Explain', action: 'State approach, invariant/logic, complexity and edge cases.' },
  { step: '5. Log', action: 'Record the pattern, mistake and why the solution works.' },
  { step: '6. Revisit', action: 'Retry after 3–7 days and again before the phase checkpoint.' },
];

export const DSA_CHECKPOINT =
  'By Day 30, comfortably solve basic array/string/hash/two-pointer/sliding-window/binary-search questions (stating time/space complexity for each); by Day 60, handle common trees/graphs/greedy patterns; by Day 90, perform timed mixed sets.';

/** Pattern → target problem count (sums to 139, inside the 100–150 target). */
export const DSA_PATTERNS: { name: string; target: number; week_from: number; week_to: number }[] = [
  { name: 'Arrays', target: 12, week_from: 1, week_to: 2 },
  { name: 'Strings', target: 8, week_from: 1, week_to: 2 },
  { name: 'Hashing', target: 6, week_from: 2, week_to: 4 },
  { name: 'Two Pointers', target: 6, week_from: 2, week_to: 4 },
  { name: 'Sliding Window', target: 6, week_from: 2, week_to: 4 },
  { name: 'Linked Lists', target: 8, week_from: 3, week_to: 5 },
  { name: 'Stack', target: 5, week_from: 3, week_to: 5 },
  { name: 'Queue', target: 4, week_from: 3, week_to: 5 },
  { name: 'Binary Search', target: 8, week_from: 4, week_to: 7 },
  { name: 'Recursion', target: 5, week_from: 4, week_to: 6 },
  { name: 'Trees', target: 10, week_from: 5, week_to: 7 },
  { name: 'BST', target: 5, week_from: 5, week_to: 7 },
  { name: 'Heap / Priority Queue', target: 5, week_from: 6, week_to: 8 },
  { name: 'Backtracking', target: 6, week_from: 6, week_to: 8 },
  { name: 'Graphs', target: 8, week_from: 7, week_to: 10 },
  { name: 'BFS', target: 5, week_from: 7, week_to: 9 },
  { name: 'DFS', target: 5, week_from: 7, week_to: 9 },
  { name: 'Greedy', target: 5, week_from: 8, week_to: 10 },
  { name: 'Dynamic Programming', target: 12, week_from: 9, week_to: 12 },
  { name: 'Mixed / Interview Practice', target: 10, week_from: 10, week_to: 13 },
];

export const PYTHON_FUNDAMENTALS = [
  'Variables, conditions, loops, functions and recursion',
  'Lists, tuples, sets, dictionaries, strings and slicing',
  'Sorting, custom keys, lambda, enumerate, zip',
  'Stack/queue patterns, heapq, collections.deque',
  'Input/output, debugging and basic time/space complexity',
];

/* --------------------------- daily template ------------------------ */

export interface DailyBlock {
  block: string;
  work: string;
  normal: string;
  minimum: string;
}

/** Section 12 — default focused day. */
export const DAILY_BLOCKS: DailyBlock[] = [
  {
    block: 'Block 1 — DSA',
    work: 'Learn pattern → solve 3–5 problems → analyze complexity → log mistakes',
    normal: '85–125 min',
    minimum: '60 min',
  },
  { block: 'Block 2 — Core CS', work: 'Concept + interview questions', normal: '45–60 min', minimum: '30 min' },
  { block: 'Block 3 — AI', work: 'Learn + implement', normal: '60–90 min', minimum: '45 min' },
  { block: 'Block 4 — Project', work: 'Build / document / test', normal: '60 min', minimum: '30 min' },
  { block: 'Block 5 — Career', work: 'Aptitude / communication / certification', normal: '20–30 min (selected days)', minimum: '10–20 min' },
];

/** Section 3 — weekly rhythm. */
export const WEEKLY_RHYTHM = [
  { activity: 'DSA', normal: '85–125 min', minimum: '60 min', frequency: '7 days/week (4 learn + 1 mixed + 1 timed + 1 review)' },
  { activity: 'Core CS', normal: '45–60 min', minimum: '30 min', frequency: '5 days/week' },
  { activity: 'AI/ML/GenAI/Agents', normal: '60–90 min', minimum: '45 min', frequency: '6 days/week' },
  { activity: 'Project', normal: '60 min', minimum: '30 min', frequency: '4–5 days/week' },
  { activity: 'Aptitude', normal: '30 min', minimum: '20 min', frequency: '3 days/week' },
  { activity: 'Communication', normal: '20 min', minimum: '10 min', frequency: '5–6 days/week' },
  { activity: 'Certification', normal: '30–45 min', minimum: '—', frequency: '3 days/week when active' },
  { activity: 'Weekly review', normal: '45–60 min', minimum: '30 min', frequency: '1 day/week' },
];

export const WORKLOAD_NOTE =
  'Target workload: approximately 4.5–6 hours on a normal focused day, not 7+ hours every day. The minimum-day version prevents a bad week from becoming a lost week.';

/* ---------------------------- design principles --------------------- */

export const PRINCIPLES: { title: string; detail: string }[] = [
  { title: 'Foundation before hype', detail: 'Python + DSA + Core CS come before advanced agent frameworks.' },
  { title: 'Learn → Build → Explain', detail: 'Every important concept must be practiced and explained in your own words.' },
  { title: 'One source at a time', detail: 'Avoid playlist/course hopping. Use one primary resource and one backup.' },
  { title: 'Projects prove skill', detail: 'A project is only complete when it runs, is documented, and can be explained.' },
  { title: 'Revision is scheduled', detail: 'Old DSA and CS topics return every week; no one-pass learning.' },
  { title: 'Measure outcomes', detail: 'Track problems solved, concepts passed, commits, project milestones and mock scores.' },
  { title: 'Depth over certificates', detail: '2–3 relevant certifications are enough; projects must accompany them.' },
];

/* ------------------------------ core CS ---------------------------- */

export interface CoreCsRow {
  topic: string;
  learn: string;
  output: string;
}

export const CORE_CS_ROWS: CoreCsRow[] = [
  {
    topic: 'OOP',
    learn: 'Classes, objects, inheritance, polymorphism, abstraction, composition vs inheritance',
    output: 'Explain with a small Python example; compare composition vs inheritance',
  },
  {
    topic: 'SQL',
    learn: 'SELECT, filtering, joins, grouping, subqueries, constraints, indexes',
    output: 'Write queries from a schema without notes',
  },
  {
    topic: 'DBMS',
    learn: 'Keys, normalization, transactions, ACID, isolation, indexing',
    output: 'Explain why indexes and transactions matter',
  },
  {
    topic: 'OS',
    learn: 'Processes, threads, scheduling, memory, synchronization, deadlock',
    output: 'Explain process vs thread and common scheduling/deadlock concepts',
  },
  {
    topic: 'Networks',
    learn: 'OSI/TCP-IP, HTTP, DNS, TCP/UDP, basic APIs',
    output: 'Trace what happens when a browser requests a website',
  },
];

export const CORE_CS_METHOD = [
  'Day 1–2: learn concepts and make a one-page note.',
  'Day 3: solve 5–10 interview-style questions.',
  'Day 4: explain the topic aloud without notes.',
  'Day 5: connect the topic to a real project or system.',
  'Weekly review: answer a 10-question closed-book quiz.',
];

export const HIGH_VALUE_QUESTIONS = [
  'Why is a hash table average O(1)? When does it degrade?',
  'Process vs thread; context switching; synchronization.',
  'Why do databases need indexes? What trade-off do they create?',
  'ACID and transaction isolation in practical terms.',
  'TCP vs UDP; HTTP request lifecycle; DNS resolution.',
  'OOP principles and when composition is preferable.',
];

/* ------------------------- career preparation ----------------------- */

export const CAREER_ACTIONS: { when: string; action: string }[] = [
  { when: 'Day 1', action: 'Create/clean GitHub profile and learning tracker' },
  { when: 'Weekly', action: 'Push meaningful commits and update project notes' },
  { when: 'Day 30', action: 'Create first resume draft' },
  { when: 'Day 45–60', action: 'Begin project-focused resume bullets with measurable results' },
  { when: 'Day 75', action: 'Mock technical interview + resume review' },
  { when: 'Day 85', action: 'Finalize resume, LinkedIn and project links' },
  { when: 'Day 90', action: 'Start/continue internship and hackathon applications' },
];

/* ----------------------------- checkpoints -------------------------- */

export const PHASE_CHECKPOINTS = [
  { day: 30, label: 'Day 30 — Foundation', criteria: 'Foundation DSA patterns + SQL/OOP + ML basics demonstrated; Project 1 complete or near-complete' },
  { day: 60, label: 'Day 60 — Skill Building', criteria: 'Intermediate DSA + OS/Networks + GenAI/RAG + first agent demonstrated' },
  { day: 75, label: 'Day 75 — Major project architecture', criteria: 'Major project architecture and agent workflow working' },
  { day: 90, label: 'Day 90 — Career launch', criteria: 'Portfolio polished, mock interviews completed, resume/LinkedIn ready, application process started' },
];

export const RECOVERY_RULE =
  'If you miss a day, do not double the workload the next day. Resume from the current priority and use the weekly review to recover. Consistency beats heroic catch-up.';

export const SUCCESS_DEFINITION =
  'At the end of 90 days, success means you can solve unfamiliar coding problems with a repeatable process, explain the major Core CS concepts, build and debug AI/GenAI/agent systems, show credible projects on GitHub, and communicate your work clearly in an interview.';

export const ONE_SENTENCE =
  'Learn deeply · solve deliberately · build publicly · revise repeatedly · explain clearly · apply consistently.';

/* --------------------------- review questions ----------------------- */

export const REVIEW_QUESTIONS: { id: string; text: string }[] = [
  { id: 'q1', text: 'What did I learn this week?' },
  { id: 'q2', text: 'What did I actually build or solve this week?' },
  { id: 'q3', text: 'Which DSA patterns can I now solve without hints?' },
  { id: 'q4', text: 'What did I struggle with?' },
  { id: 'q5', text: 'What mistakes did I make?' },
  { id: 'q6', text: 'What should I revise?' },
  { id: 'q7', text: 'What should I change or remove from next week’s plan to protect priorities?' },
  { id: 'q8', text: 'How consistent was I?' },
  { id: 'q9', text: 'Which Core CS topic can I explain without notes?' },
  { id: 'q10', text: 'What AI concept can I demonstrate in code?' },
  { id: 'q11', text: 'What failed in my project and what did I change?' },
];

/* ------------------------------ milestones -------------------------- */

const M = (
  day: 30 | 60 | 75 | 90,
  title: string,
  phase: string,
  criteria: string,
  requirements: Milestone['requirements'],
): Milestone => ({
  id: `ms_${day}`,
  day,
  title,
  phase,
  criteria,
  requirements,
  manual_done: [],
  completed: false,
});

export const SEED_MILESTONES: Milestone[] = [
  M(30, 'Foundation Checkpoint', 'Phase 1 — Foundation', PHASE_CHECKPOINTS[0].criteria, [
    { id: 'm30_1', label: '35+ DSA problems solved across foundation patterns', source: 'auto', metric: 'dsa_solved>=35' },
    { id: 'm30_2', label: '8+ patterns at 60% or better', source: 'auto', metric: 'patterns>=8' },
    { id: 'm30_3', label: 'OOP + SQL/DBMS demonstrated (understood or mastered)', source: 'auto', metric: 'learning:corecs>=60' },
    { id: 'm30_4', label: 'ML basics demonstrated: train/test, metrics, overfitting', source: 'auto', metric: 'learning:aiml>=55' },
    { id: 'm30_5', label: 'Project 1 (ML/AI) complete or near-complete', source: 'auto', metric: 'project:p1>=80' },
    { id: 'm30_6', label: 'Daily plan executed through Day 30 (55%+)', source: 'auto', metric: 'tasks_pct:30>=55' },
    { id: 'm30_7', label: 'Weeks 1–4 reviewed', source: 'auto', metric: 'reviews>=4' },
    { id: 'm30_8', label: 'First resume draft created', source: 'manual' },
  ]),
  M(60, 'Skill Building Checkpoint', 'Phase 2 — Skill Building', PHASE_CHECKPOINTS[1].criteria, [
    { id: 'm60_1', label: '75+ DSA problems solved (trees, graphs, greedy included)', source: 'auto', metric: 'dsa_solved>=75' },
    { id: 'm60_2', label: '13+ patterns at 60% or better', source: 'auto', metric: 'patterns>=13' },
    { id: 'm60_3', label: 'OS + Networks explained without notes', source: 'auto', metric: 'learning:corecs>=80' },
    { id: 'm60_4', label: 'GenAI/RAG pipeline demonstrated', source: 'auto', metric: 'learning:genai>=65' },
    { id: 'm60_5', label: 'First agent (Agent A) demonstrated with 2+ tools', source: 'auto', metric: 'learning:agent>=40' },
    { id: 'm60_6', label: 'Project 2 (GenAI/RAG) working with a test set', source: 'auto', metric: 'project:p2>=70' },
    { id: 'm60_7', label: 'Daily plan executed through Day 60 (60%+)', source: 'auto', metric: 'tasks_pct:60>=60' },
    { id: 'm60_8', label: 'Weeks 5–8 reviewed', source: 'auto', metric: 'reviews>=8' },
    { id: 'm60_9', label: 'Project-focused resume bullets with measurable results', source: 'manual' },
  ]),
  M(75, 'Major Project Architecture Checkpoint', 'Phase 3 — Projects & Career', PHASE_CHECKPOINTS[2].criteria, [
    { id: 'm75_1', label: 'Major (SATS) architecture defined and documented', source: 'auto', metric: 'project:sats>=45' },
    { id: 'm75_2', label: 'Project 3 (AI Agent) working with error handling', source: 'auto', metric: 'project:p3>=70' },
    { id: 'm75_3', label: '100+ DSA problems solved', source: 'auto', metric: 'dsa_solved>=100' },
    { id: 'm75_4', label: 'Agent workflow running (tools, state, retries)', source: 'auto', metric: 'learning:agent>=60' },
    { id: 'm75_5', label: 'Daily plan executed through Day 75 (60%+)', source: 'auto', metric: 'tasks_pct:75>=60' },
    { id: 'm75_6', label: 'Mock technical interview + resume review completed', source: 'manual' },
  ]),
  M(90, 'Career Launch Checkpoint', 'Phase 3 — Projects & Career', PHASE_CHECKPOINTS[3].criteria, [
    { id: 'm90_1', label: '120+ DSA problems solved and revised', source: 'auto', metric: 'dsa_solved>=120' },
    { id: 'm90_2', label: '15+ items on the 90-day success checklist', source: 'auto', metric: 'checklist>=15' },
    { id: 'm90_3', label: 'Major (SATS) project polished (80%+)', source: 'auto', metric: 'project:sats>=80' },
    { id: 'm90_4', label: '12+ weekly reviews completed', source: 'auto', metric: 'reviews>=12' },
    { id: 'm90_5', label: 'At least 1 certification completed', source: 'auto', metric: 'certs>=1' },
    { id: 'm90_6', label: 'Resume + LinkedIn finalized with project links', source: 'manual' },
    { id: 'm90_7', label: 'At least 2 mock interviews / timed sessions completed', source: 'manual' },
    { id: 'm90_8', label: 'Internship / hackathon applications started', source: 'manual' },
    { id: 'm90_9', label: 'Final 90-day report written', source: 'manual' },
  ]),
];

/* -------------------------- success checklist ----------------------- */

const C = (label: string, category: string): { label: string; category: string } => ({
  label,
  category,
});

const CHECKLIST_SOURCE = [
  C('100–150 quality DSA problems solved and revised', 'DSA'),
  C('Python fundamentals strong enough for DSA and AI work', 'Python'),
  C('OOP interview-ready — explain the principles with a Python example', 'Core CS'),
  C('SQL/DBMS interview-ready — write queries from a schema without notes', 'Core CS'),
  C('OS interview-ready — processes, threads, scheduling, memory, deadlock', 'Core CS'),
  C('Networks interview-ready — OSI/TCP-IP, HTTP, DNS, TCP/UDP', 'Core CS'),
  C('AI/ML fundamentals understood and demonstrated', 'AI/ML'),
  C('LLMs, structured outputs and embeddings understood', 'GenAI'),
  C('RAG understood, with retrieval quality and failure handling', 'GenAI'),
  C('At least 2 small AI agents built', 'Agents'),
  C('One major agent-based system documented', 'Agents'),
  C('2–3 meaningful AI/GenAI projects completed', 'Projects'),
  C('2–3 relevant certifications completed or intentionally selected', 'Certifications'),
  C('GitHub repositories polished with README + architecture + demo', 'Portfolio'),
  C('Resume updated with measurable project evidence', 'Career'),
  C('LinkedIn updated with measurable project evidence', 'Career'),
  C('Aptitude practice completed', 'Practice'),
  C('Communication practice completed', 'Practice'),
  C('At least 2 mock interviews / timed technical sessions completed', 'Practice'),
  C('Internship/hackathon applications started', 'Applications'),
  C('Final 90-day report completed', 'Report'),
];

export const SEED_CHECKLIST: ChecklistItem[] = CHECKLIST_SOURCE.map((c, i) => ({
  id: `chk_${i + 1}`,
  label: c.label,
  category: c.category,
  done: false,
  sort: i + 1,
}));

/* ------------------------- seed roadmap topics ---------------------- */

interface TopicSeed {
  kind: RoadmapTopicKind;
  title: string;
  detail: string;
  target?: string;
}

function buildTopicSeeds(): TopicSeed[] {
  const seeds: TopicSeed[] = [];

  PHASES.forEach((p) =>
    seeds.push({
      kind: 'phase',
      title: p.name,
      detail: p.focus,
      target: `${p.days} · Exit: ${p.exit}`,
    }),
  );

  DSA_PLAN.forEach((s) =>
    seeds.push({ kind: 'dsa_plan', title: `${s.weeks}: ${s.topics}`, detail: s.target, target: s.target }),
  );

  DSA_LOOP.forEach((s) =>
    seeds.push({ kind: 'dsa_loop', title: s.step, detail: s.action }),
  );

  PYTHON_FUNDAMENTALS.forEach((t, i) =>
    seeds.push({ kind: 'python_fundamental', title: t, detail: `Python fundamentals required for DSA — ${i + 1}/5` }),
  );

  DAILY_BLOCKS.forEach((b) =>
    seeds.push({ kind: 'daily_block', title: b.block, detail: b.work, target: `${b.normal} (min: ${b.minimum})` }),
  );

  WEEKLY_RHYTHM.forEach((r) =>
    seeds.push({ kind: 'rhythm', title: r.activity, detail: r.frequency, target: `${r.normal} (min: ${r.minimum})` }),
  );

  PRINCIPLES.forEach((p) => seeds.push({ kind: 'principle', title: p.title, detail: p.detail }));

  CORE_CS_METHOD.forEach((m, i) =>
    seeds.push({ kind: 'core_method', title: `Step ${i + 1}`, detail: m }),
  );

  HIGH_VALUE_QUESTIONS.forEach((q) =>
    seeds.push({ kind: 'interview_question', title: q, detail: 'High-value interview question to master' }),
  );

  CAREER_ACTIONS.forEach((a) =>
    seeds.push({ kind: 'career_action', title: a.when, detail: a.action, target: a.when }),
  );

  return seeds;
}

export const TOPIC_SEEDS = buildTopicSeeds();

export function seedRoadmapTopics(): RoadmapTopic[] {
  return TOPIC_SEEDS.map((s, i) => ({
    id: `tp_${i + 1}`,
    kind: s.kind,
    title: s.title,
    detail: s.detail,
    target: s.target ?? '',
    sort: i + 1,
    status: 'open' as const,
    meta: '',
  }));
}

/* ---------------------------- daily planner ------------------------- */

export interface TaskPlanItem {
  category: Category;
  title: string;
  detail: string;
  est_minutes: number;
  priority: Priority;
  required: boolean;
}

export interface SeedTask extends TaskPlanItem {
  day: number;
  week: number;
  sort: number;
}

const MIN_MINUTES: Record<string, number> = {
  dsa: 60,
  corecs: 30,
  ai: 45,
  project: 30,
  career: 20,
  communication: 10,
  certification: 0,
  review: 30,
};

export const normalMinutes = (category: Category): number => {
  switch (category) {
    case 'dsa':
      return 100;
    case 'corecs':
      return 50;
    case 'ai':
      return 75;
    case 'project':
      return 60;
    case 'career':
      return 30;
    case 'communication':
      return 20;
    case 'certification':
      return 40;
    case 'review':
      return 50;
  }
};

export const minimumMinutes = (category: Category): number =>
  MIN_MINUTES[category] ?? normalMinutes(category);

/**
 * Builds the exact task list for one day of the plan.
 * Schedule (dow 0 = Monday … 6 = Sunday):
 *   DSA 6 days/wk · Core CS 5 days/wk · AI 6 days/wk · Project 4 days/wk
 *   Communication 5 days/wk · Aptitude 3 days/wk · Certification 3 days/wk
 *   Sunday = lighter review day (weekly review + revision)
 */
export function tasksForDay(day: number, weekData: SeedWeek): TaskPlanItem[] {
  const dow = (day - 1) % 7;
  const isReviewDay = dow === 6;
  const w = weekData;
  const items: TaskPlanItem[] = [];

  /* -------- DSA: 4 learn days + 1 mixed + 1 timed + 1 review -------- */
  const DSA_LEARN_DETAIL =
    'Daily DSA target: 20–30 min concept/pattern learning → 50–70 min problem solving (3–5 quality problems) → 10–15 min solution analysis + time/space complexity → 5–10 min mistake/revision logging. Complexity is analyzed with every problem — never a standalone topic.';
  const DSA_MIXED_DETAIL =
    'Mixed practice across this week’s and earlier patterns (3–5 quality problems). State time/space complexity for each; log mistakes and schedule revisions.';
  const DSA_TIMED_DETAIL =
    'Timed practice: solve this week’s patterns under a time limit (3–5 quality problems). After each, state time/space complexity and log the mistake.';

  if (!isReviewDay) {
    if (dow <= 3) {
      items.push({
        category: 'dsa',
        title: `DSA: ${w.dsa}`,
        detail: DSA_LEARN_DETAIL,
        est_minutes: normalMinutes('dsa'),
        priority: 'high',
        required: true,
      });
    } else if (dow === 4) {
      items.push({
        category: 'dsa',
        title: `Mixed DSA practice — ${w.dsa}`,
        detail: DSA_MIXED_DETAIL,
        est_minutes: normalMinutes('dsa'),
        priority: 'high',
        required: true,
      });
    } else {
      items.push({
        category: 'dsa',
        title: `Timed DSA set — ${w.dsa}`,
        detail: DSA_TIMED_DETAIL,
        est_minutes: normalMinutes('dsa'),
        priority: 'high',
        required: true,
      });
    }
  } else {
    items.push({
      category: 'dsa',
      title: 'Light revision: re-solve one problem from this week',
      detail:
        'Review day. Retry a logged mistake without looking at the solution, and restate its time/space complexity.',
      est_minutes: minimumMinutes('dsa'),
      priority: 'medium',
      required: false,
    });
  }

  const corePlan: Record<number, string> = {
    0: `Learn ${w.core_cs} — concepts + one-page notes`,
    1: `Continue ${w.core_cs} — finish one-page notes and recall`,
    2: `Interview questions on ${w.core_cs} (5–10)`,
    3: `Explain ${w.core_cs} aloud without notes`,
    4: `Connect ${w.core_cs} to a real project or system`,
  };
  if (corePlan[dow]) {
    items.push({
      category: 'corecs',
      title: corePlan[dow],
      detail: `Core CS weekly method · Week ${w.week_number} focus: ${w.core_cs}`,
      est_minutes: normalMinutes('corecs'),
      priority: 'high',
      required: true,
    });
  }
  if (isReviewDay) {
    items.push({
      category: 'corecs',
      title: `Closed-book quiz: ${w.core_cs} (10 questions)`,
      detail: 'Weekly review quiz — answer 10 questions without notes.',
      est_minutes: minimumMinutes('corecs'),
      priority: 'medium',
      required: false,
    });
  }

  if (!isReviewDay) {
    items.push({
      category: 'ai',
      title: dow === 5 ? `Build & prove: ${w.ai}` : `AI: ${w.ai}`,
      detail:
        dow === 5
          ? 'Produce the practical output for this week’s AI topic and note it in your learning tracker.'
          : 'Learn + implement in code. One source at a time — finish the required outcome first.',
      est_minutes: normalMinutes('ai'),
      priority: 'high',
      required: true,
    });
  }

  if (dow === 0 || dow === 1 || dow === 3 || dow === 4) {
    items.push({
      category: 'project',
      title: `Project: ${w.project_career}`,
      detail: 'Build / document / test. A project is only complete when it runs, is documented and can be explained.',
      est_minutes: normalMinutes('project'),
      priority: 'medium',
      required: false,
    });
  }

  if (dow <= 4) {
    items.push({
      category: 'communication',
      title: 'Communication practice (20 min)',
      detail: 'Explain one concept aloud, or do a 2-minute mock answer on camera.',
      est_minutes: normalMinutes('communication'),
      priority: 'low',
      required: false,
    });
  }

  if (dow === 1 || dow === 3 || dow === 5) {
    items.push({
      category: 'career',
      title: 'Aptitude practice (30 min)',
      detail: 'Quantitative/aptitude drills — 3 days per week.',
      est_minutes: normalMinutes('career'),
      priority: 'medium',
      required: false,
    });
  }

  if (dow === 5) {
    items.push({
      category: 'career',
      title: 'Push meaningful commits + update project notes',
      detail: 'Weekly career habit: real commits, updated README/notes.',
      est_minutes: 30,
      priority: 'medium',
      required: false,
    });
  }

  if ((dow === 2 || dow === 4) && weekData.week_number >= 4) {
    items.push({
      category: 'certification',
      title: 'Certification block (30–45 min)',
      detail: 'Work on one of your 2–3 selected certifications and build something from it.',
      est_minutes: normalMinutes('certification'),
      priority: 'low',
      required: false,
    });
  }

  if (isReviewDay) {
    items.push({
      category: 'review',
      title: `Week ${w.week_number} review — answer the review questions`,
      detail: `Checkpoint: ${w.checkpoint}. Log completion %, focused hours, DSA problems and what to change next week.`,
      est_minutes: normalMinutes('review'),
      priority: 'high',
      required: true,
    });
  }

  /* -------- career milestones that land on a fixed day -------- */
  const careerDayTasks: Record<number, { title: string; detail: string; category: Category }> = {
    1: {
      title: 'Create/clean GitHub profile and learning tracker',
      detail: 'Day 1 career action: pin repos, write a clear profile README, start the tracker.',
      category: 'career',
    },
    30: {
      title: 'Create first resume draft',
      detail: 'Day 30 career action: education, skills, projects — first full draft.',
      category: 'career',
    },
    45: {
      title: 'Begin project-focused resume bullets with measurable results',
      detail: 'Day 45–60 career action: replace duty bullets with impact bullets (metrics, results).',
      category: 'career',
    },
    75: {
      title: 'Mock technical interview + resume review',
      detail: 'Day 75 career action: 45–60 min mock technical interview, then revise the resume.',
      category: 'career',
    },
    85: {
      title: 'Finalize resume, LinkedIn and project links',
      detail: 'Day 85 career action: everything consistent and live — resume, LinkedIn, GitHub, demos.',
      category: 'career',
    },
    90: {
      title: 'Start/continue internship and hackathon applications',
      detail: 'Day 90 career action: applications running + final 90-day report.',
      category: 'career',
    },
  };
  const special = careerDayTasks[day];
  if (special) {
    items.push({
      category: special.category,
      title: special.title,
      detail: special.detail,
      est_minutes: 45,
      priority: 'high',
      required: true,
    });
  }

  if (day === 30 || day === 60 || day === 75 || day === 90) {
    items.push({
      category: 'review',
      title: `Day-${day} checkpoint review`,
      detail: 'Open the Milestones tab, tick what is genuinely done, and note what must be repaired.',
      est_minutes: 40,
      priority: 'high',
      required: true,
    });
  }

  return items;
}

export function seedDailyTasks(): { tasks: DailyTask[]; seed: SeedTask[] } {
  const tasks: DailyTask[] = [];
  const seed: SeedTask[] = [];
  for (let day = 1; day <= 90; day++) {
    const week = weekForDay(day);
    const weekData = SEED_WEEKS[week - 1];
    const plan = tasksForDay(day, weekData);
    plan.forEach((item, idx) => {
      const id = `task_${day}_${idx + 1}`;
      tasks.push({
        id,
        day,
        week,
        category: item.category,
        title: item.title,
        detail: item.detail,
        est_minutes: item.est_minutes,
        priority: item.priority,
        required: item.required,
        completed: false,
        completed_at: null,
        notes: '',
        sort: idx + 1,
      });
      seed.push({ ...item, day, week, sort: idx + 1 });
    });
  }
  return { tasks, seed };
}
