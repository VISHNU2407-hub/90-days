import type {
  Category,
  DataBundle,
  LearningStatus,
  LearningTopic,
  Milestone,
  Track,
  UserSettings,
} from '@/lib/types';
import { CATEGORIES, CATEGORY_LABEL, LEARNING_STATUS_SCORE } from '@/lib/types';
import {
  phaseForDay,
  weekEndDay,
  weekForDay,
  weekStartDay,
  SEED_WEEKS,
} from '@/lib/seed/roadmap';
import {
  clamp,
  daysBetween,
  MS_DAY,
  parseDateKey,
  pct,
  round1,
  todayKey,
  toDateKey,
} from '@/lib/utils';

export const SOLVED_STATUSES = new Set(['solved', 'needs_revision', 'mastered']);
export const DSA_TARGET_TOTAL = 139;

export interface DayInfo {
  day: number;
  week: number;
  phase: 1 | 2 | 3;
  dow: number; // 0 = Monday
  dateKey: string;
  startDate: string;
  planFinished: boolean;
}

export function getDayInfo(settings: UserSettings | null): DayInfo {
  const start = settings?.start_date || todayKey();
  const diff = daysBetween(parseDateKey(start), new Date());
  const raw = diff + 1;
  const day = clamp(raw, 1, 90);
  return {
    day,
    week: weekForDay(day),
    phase: phaseForDay(day),
    dow: (day - 1) % 7,
    dateKey: todayKey(),
    startDate: start,
    planFinished: raw > 90,
  };
}

export function dateKeyOfIso(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/* ------------------------------ tasks ------------------------------ */

export const tasksOnDay = (data: DataBundle, day: number) =>
  data.tasks.filter((t) => t.day === day).sort((a, b) => a.sort - b.sort);

export function todayProgress(data: DataBundle, info: DayInfo) {
  const tasks = tasksOnDay(data, info.day);
  const done = tasks.filter((t) => t.completed).length;
  return { tasks, done, total: tasks.length, pct: pct(done, tasks.length) };
}

/** Tasks scheduled up to and including the current day. */
export function executionProgress(data: DataBundle, info: DayInfo) {
  const due = data.tasks.filter((t) => t.day <= info.day);
  const done = due.filter((t) => t.completed).length;
  return { done, total: due.length, pct: pct(done, due.length) };
}

export function focusedMinutes(data: DataBundle, info?: DayInfo) {
  const fromTasks = data.completions.reduce((s, c) => s + (c.minutes || 0), 0);
  const fromSessions = data.sessions.reduce((s, c) => s + (c.minutes || 0), 0);
  void info;
  return fromTasks + fromSessions;
}

export function activityDateKeys(data: DataBundle): Set<string> {
  const set = new Set<string>();
  data.completions.forEach((c) => c.date_key && set.add(c.date_key));
  data.tasks.forEach((t) => {
    const k = dateKeyOfIso(t.completed_at);
    if (k) set.add(k);
  });
  data.sessions.forEach((s) => s.date_key && set.add(s.date_key));
  data.problems.forEach((p) => {
    const k = dateKeyOfIso(p.solved_at);
    if (k) set.add(k);
  });
  return set;
}

export function currentStreak(data: DataBundle): number {
  const days = activityDateKeys(data);
  if (days.size === 0) return 0;
  const now = new Date();
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(toDateKey(cursor))) cursor = new Date(cursor.getTime() - MS_DAY);
  let streak = 0;
  while (days.has(toDateKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - MS_DAY);
  }
  return streak;
}

/* -------------------------------- DSA ------------------------------- */

export function dsaStats(data: DataBundle) {
  const problems = data.problems;
  const solvedList = problems.filter((p) => SOLVED_STATUSES.has(p.status));
  const byDifficulty = {
    easy: solvedList.filter((p) => p.difficulty === 'easy').length,
    medium: solvedList.filter((p) => p.difficulty === 'medium').length,
    hard: solvedList.filter((p) => p.difficulty === 'hard').length,
  };
  const timed = problems.filter((p) => p.time_minutes > 0);
  const avgTime = timed.length
    ? timed.reduce((s, p) => s + p.time_minutes, 0) / timed.length
    : 0;

  const streakDays = new Set<string>();
  data.completions
    .filter((c) => c.category === 'dsa')
    .forEach((c) => streakDays.add(c.date_key));
  solvedList.forEach((p) => {
    const k = dateKeyOfIso(p.solved_at);
    if (k) streakDays.add(k);
  });

  let dsaStreak = 0;
  if (streakDays.size) {
    let cursor = new Date();
    if (!streakDays.has(toDateKey(cursor))) cursor = new Date(cursor.getTime() - MS_DAY);
    while (streakDays.has(toDateKey(cursor))) {
      dsaStreak += 1;
      cursor = new Date(cursor.getTime() - MS_DAY);
    }
  }

  const patterns = data.patterns.map((p) => {
    const rows = problems.filter((x) => x.pattern === p.name);
    const solved = rows.filter((x) => SOLVED_STATUSES.has(x.status)).length;
    return {
      ...p,
      solved,
      total: rows.length,
      pct: pct(solved, p.target),
      onTrack: solved >= p.target,
      mastered: rows.filter((x) => x.status === 'mastered').length,
      revision: rows.filter((x) => x.status === 'needs_revision').length,
    };
  });

  return {
    solved: solvedList.length,
    attempted: problems.filter((p) => p.status === 'attempted').length,
    totalLogged: problems.length,
    target: DSA_TARGET_TOTAL,
    pct: pct(solvedList.length, DSA_TARGET_TOTAL),
    easy: byDifficulty.easy,
    medium: byDifficulty.medium,
    hard: byDifficulty.hard,
    needsRevision: problems.filter((p) => p.status === 'needs_revision').length,
    withHints: solvedList.filter((p) => p.needed_hint).length,
    withoutHints: solvedList.filter((p) => !p.needed_hint).length,
    avgTime: round1(avgTime),
    streak: dsaStreak,
    patterns,
    patternsOnTrack: patterns.filter((p) => p.onTrack).length,
  };
}

export function dueRevisions(data: DataBundle) {
  const today = todayKey();
  return data.problems.filter(
    (p) =>
      p.revision_date &&
      p.revision_date <= today &&
      (p.status === 'solved' || p.status === 'needs_revision'),
  );
}

/* ----------------------------- learning ---------------------------- */

export function topicsInTrack(data: DataBundle, track: Track): LearningTopic[] {
  return data.learning
    .filter((t) => t.track === track)
    .sort((a, b) => a.sort - b.sort);
}

export function trackStats(data: DataBundle, track: Track) {
  const topics = topicsInTrack(data, track);
  const score = topics.length
    ? topics.reduce((s, t) => s + LEARNING_STATUS_SCORE[t.status], 0) / topics.length
    : 0;
  const counts: Record<LearningStatus, number> = {
    not_started: 0,
    learning: 0,
    understood: 0,
    needs_revision: 0,
    mastered: 0,
  };
  topics.forEach((t) => (counts[t.status] += 1));
  const confident = topics.filter((t) => t.confidence > 0);
  return {
    topics,
    pct: Math.round(score),
    counts,
    practiced: topics.filter((t) => t.practice_done).length,
    avgConfidence: confident.length
      ? round1(confident.reduce((s, t) => s + t.confidence, 0) / confident.length)
      : 0,
    needsRevision: counts.needs_revision,
  };
}

/* ----------------------------- projects ---------------------------- */

export function projectProgress(data: DataBundle, projectId: string) {
  const tasks = data.projectTasks.filter((t) => t.project_id === projectId);
  const done = tasks.filter((t) => t.done).length;
  return { done, total: tasks.length, pct: pct(done, tasks.length) };
}

export function projectSummaries(data: DataBundle) {
  return data.projects
    .slice()
    .sort((a, b) => a.sort - b.sort)
    .map((p) => {
      const prog = projectProgress(data, p.id);
      const milestones = data.projectTasks
        .filter((t) => t.project_id === p.id && t.group_name === 'milestone')
        .sort((a, b) => a.sort - b.sort);
      return {
        ...p,
        pct: prog.pct,
        done: prog.done,
        total: prog.total,
        milestonesDone: milestones.filter((m) => m.done).length,
        milestonesTotal: milestones.length,
      };
    });
}

/* ---------------------------- category stats ------------------------ */

export interface CategoryStat {
  category: Category;
  label: string;
  planned: number;
  done: number;
  pct: number;
  minutes: number;
}

export function categoryStats(data: DataBundle, info: DayInfo): CategoryStat[] {
  return CATEGORIES.map((category) => {
    const plannedRows = data.tasks.filter((t) => t.day <= info.day && t.category === category);
    const done = plannedRows.filter((t) => t.completed);
    return {
      category,
      label: CATEGORY_LABEL[category],
      planned: plannedRows.length,
      done: done.length,
      pct: pct(done.length, plannedRows.length),
      minutes: done.reduce((s, t) => s + t.est_minutes, 0),
    };
  });
}

export function recentCategoryActivity(data: DataBundle, days = 14) {
  const cutoff = new Date(Date.now() - days * MS_DAY);
  const cutoffKey = `${cutoff.getFullYear()}-${`${cutoff.getMonth() + 1}`.padStart(2, '0')}-${`${cutoff.getDate()}`.padStart(2, '0')}`;
  const counts: Record<Category, number> = {
    dsa: 0,
    corecs: 0,
    ai: 0,
    project: 0,
    career: 0,
    communication: 0,
    certification: 0,
    review: 0,
  };
  data.completions.forEach((c) => {
    if (c.date_key >= cutoffKey) counts[c.category] += 1;
  });
  return counts;
}

/* ------------------------------- weekly ----------------------------- */

export interface WeekStat {
  week: number;
  label: string;
  planned: number;
  done: number;
  pct: number;
  hours: number;
  startDay: number;
  endDay: number;
  current?: boolean;
}

export function weeklyStats(data: DataBundle, info: DayInfo): WeekStat[] {
  return SEED_WEEKS.map((w) => {
    const rows = data.tasks.filter((t) => t.week === w.week_number);
    const done = rows.filter((t) => t.completed);
    return {
      week: w.week_number,
      label: `Week ${w.week_number}`,
      planned: rows.length,
      done: done.length,
      pct: pct(done.length, rows.length),
      hours: round1(done.reduce((s, t) => s + t.est_minutes, 0) / 60),
      startDay: weekStartDay(w.week_number),
      endDay: weekEndDay(w.week_number),
    };
  }).map((s) => ({ ...s, current: s.week === info.week }));
}

export function completionCurve(data: DataBundle, info: DayInfo) {
  // Cumulative completion % per day up to the current day.
  const points: { day: number; label: string; pct: number; ideal: number }[] = [];
  let done = 0;
  let due = 0;
  const byDay = new Map<number, number>();
  data.tasks.forEach((t) => {
    if (t.completed) byDay.set(t.day, (byDay.get(t.day) ?? 0) + 1);
  });
  for (let d = 1; d <= info.day; d++) {
    due += data.tasks.filter((t) => t.day === d).length;
    done += byDay.get(d) ?? 0;
    if (d % 3 === 0 || d === info.day) {
      points.push({
        day: d,
        label: `D${d}`,
        pct: pct(done, due),
        ideal: Math.round((d / 90) * 100),
      });
    }
  }
  return points;
}

export function activityHeatmap(data: DataBundle, info: DayInfo) {
  const map = new Map<string, { count: number; minutes: number }>();
  data.completions.forEach((c) => {
    const cur = map.get(c.date_key) ?? { count: 0, minutes: 0 };
    cur.count += 1;
    cur.minutes += c.minutes || 0;
    map.set(c.date_key, cur);
  });
  const start = parseDateKey(info.startDate);
  const cells: { dateKey: string; count: number; minutes: number; day: number }[] = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date(start.getTime() + i * MS_DAY);
    const key = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
    const v = map.get(key) ?? { count: 0, minutes: 0 };
    cells.push({ dateKey: key, count: v.count, minutes: v.minutes, day: i + 1 });
  }
  return cells;
}

/* --------------------------- area insights -------------------------- */

export interface AreaInsight {
  category: Category;
  label: string;
  pct: number;
  planned: number;
}

export function strongestAndWeakest(data: DataBundle, info: DayInfo) {
  const stats = categoryStats(data, info)
    .filter((s) => s.planned >= 3)
    .sort((a, b) => b.pct - a.pct);

  const strongest = stats[0] ?? null;
  const weakest = stats.length ? stats[stats.length - 1] : null;

  // Most consistent: smallest spread between weekly completion rates.
  const weeks = weeklyStats(data, info);
  let mostConsistent: CategoryStat | null = null;
  let bestVariance = Infinity;
  for (const s of stats) {
    const rates: number[] = [];
    for (let w = 1; w <= info.week; w++) {
      const rows = data.tasks.filter((t) => t.week === w && t.category === s.category);
      if (!rows.length) continue;
      rates.push(pct(rows.filter((t) => t.completed).length, rows.length));
    }
    if (rates.length < 2) continue;
    const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
    const variance = rates.reduce((a, b) => a + (b - mean) ** 2, 0) / rates.length;
    if (variance < bestVariance && mean > 0) {
      bestVariance = variance;
      mostConsistent = s;
    }
  }

  // Most neglected: least activity in the last 14 days relative to plan.
  const recent = recentCategoryActivity(data, 14);
  const neglected = stats
    .filter((s) => s.category !== 'review')
    .map((s) => ({ ...s, recent: recent[s.category] }))
    .sort((a, b) => a.recent - b.recent || a.pct - b.pct)[0];

  return {
    strongest: strongest ? toInsight(strongest) : null,
    weakest: weakest ? toInsight(weakest) : null,
    mostConsistent: mostConsistent ? toInsight(mostConsistent) : null,
    mostNeglected: neglected
      ? {
          category: neglected.category,
          label: neglected.label,
          pct: neglected.pct,
          planned: neglected.planned,
        }
      : null,
    stats,
  };

  function toInsight(s: CategoryStat): AreaInsight {
    return { category: s.category, label: s.label, pct: s.pct, planned: s.planned };
  }
}

/* ------------------------------ milestones --------------------------- */

export function evaluateMetric(
  metric: string,
  data: DataBundle,
  info: DayInfo,
): boolean {
  const [left, valueRaw] = metric.split('>=');
  const value = Number(valueRaw);
  const parts = left.split(':');
  const head = parts[0];

  switch (head) {
    case 'dsa_solved':
      return data.problems.filter((p) => SOLVED_STATUSES.has(p.status)).length >= value;
    case 'patterns':
      return dsaStats(data).patternsOnTrack >= value;
    case 'learning': {
      const track = parts[1] as Track;
      return trackStats(data, track).pct >= value;
    }
    case 'project': {
      const key = parts[1];
      const proj = data.projects.find((p) => p.key === key);
      if (!proj) return false;
      return projectProgress(data, proj.id).pct >= value;
    }
    case 'tasks_pct': {
      const day = Number(parts[1]);
      const rows = data.tasks.filter((t) => t.day <= day);
      if (!rows.length) return false;
      return pct(rows.filter((t) => t.completed).length, rows.length) >= value;
    }
    case 'reviews':
      return data.reviews.filter((r) => r.completed).length >= value;
    case 'checklist':
      return data.checklist.filter((c) => c.done).length >= value;
    case 'certs':
      return data.certifications.filter((c) => c.status === 'completed').length >= value;
    default:
      void info;
      return false;
  }
}

export function milestoneStatus(data: DataBundle, ms: Milestone, info: DayInfo) {
  const manual = new Set(ms.manual_done);
  const items = ms.requirements.map((r) => ({
    ...r,
    done: r.source === 'auto' ? evaluateMetric(r.metric ?? '', data, info) : manual.has(r.id),
  }));
  const done = items.filter((i) => i.done).length;
  return {
    items,
    done,
    total: items.length,
    pct: pct(done, items.length),
    completed: done === items.length || ms.completed,
    reachedDay: info.day >= ms.day,
  };
}

export function nextMilestone(data: DataBundle, info: DayInfo) {
  const upcoming = data.milestones
    .filter((m) => m.day >= info.day)
    .sort((a, b) => a.day - b.day);
  const target = upcoming[0] ?? data.milestones[data.milestones.length - 1];
  return { milestone: target, status: milestoneStatus(data, target, info) };
}

/* ------------------------------ headline ---------------------------- */

export function overallProgress(data: DataBundle, info: DayInfo) {
  const execution = executionProgress(data, info).pct;
  const learningPct = data.learning.length
    ? Math.round(
        data.learning.reduce((s, t) => s + LEARNING_STATUS_SCORE[t.status], 0) /
          data.learning.length,
      )
    : 0;
  const dsa = dsaStats(data).pct;
  const projects = data.projects.length
    ? Math.round(
        data.projects.reduce((s, p) => s + projectProgress(data, p.id).pct, 0) /
          data.projects.length,
      )
    : 0;
  const checklist = pct(data.checklist.filter((c) => c.done).length, data.checklist.length);

  const parts = [
    { key: 'Daily execution', value: execution, weight: 0.35 },
    { key: 'Learning tracks', value: learningPct, weight: 0.2 },
    { key: 'DSA', value: dsa, weight: 0.15 },
    { key: 'Projects', value: projects, weight: 0.2 },
    { key: 'Success checklist', value: checklist, weight: 0.1 },
  ];
  const overall = Math.round(parts.reduce((s, p) => s + p.value * p.weight, 0));
  return { overall: clamp(overall), parts, execution, learningPct, dsa, projects, checklist };
}

export function reviewsDone(data: DataBundle) {
  return data.reviews.filter((r) => r.completed).length;
}

export function checklistDone(data: DataBundle) {
  return data.checklist.filter((c) => c.done).length;
}
