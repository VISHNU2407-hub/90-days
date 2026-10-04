import type { Category, DataBundle } from '@/lib/types';
import { CATEGORY_LABEL } from '@/lib/types';
import {
  currentStreak,
  dueRevisions,
  getDayInfo,
  milestoneStatus,
  nextMilestone,
  projectSummaries,
  tasksOnDay,
  trackStats,
  type DayInfo,
} from '@/lib/compute';
import { LEARNING_TRACKS } from '@/lib/seed/tracks';

/* ==================================================================== *
 *  Smart priority system — at most 3 recommendations, never more.
 *  Signals: incomplete required tasks, upcoming milestone, weak areas,
 *  overdue revisions, project schedule drift, current phase.
 * ==================================================================== */

export interface Recommendation {
  id: string;
  title: string;
  detail: string;
  reason: string;
  category: Category;
  score: number;
  to: string;
  cta: string;
}

export function nextBestActions(data: DataBundle, info: DayInfo): Recommendation[] {
  const recs: Recommendation[] = [];
  const todayTasks = tasksOnDay(data, info.day);
  const openRequired = todayTasks.filter((t) => t.required && !t.completed);

  /* 1 — Overdue DSA revisions (revision is scheduled, not optional) */
  const revisions = dueRevisions(data);
  if (revisions.length > 0) {
    recs.push({
      id: 'revisions',
      title: `Revise ${revisions.length} DSA ${revisions.length === 1 ? 'problem' : 'problems'}`,
      detail: `${revisions.slice(0, 3).map((r) => r.name).join(', ')}${revisions.length > 3 ? '…' : ''} — revision dates have passed.`,
      reason: 'Scheduled revision is overdue — one-pass learning is how patterns evaporate.',
      category: 'dsa',
      score: revisions.length >= 3 ? 100 : 92,
      to: '/dsa',
      cta: 'Open revision queue',
    });
  }

  /* 2 — Weakest area with incomplete required work today */
  if (openRequired.length > 0) {
    const byCat = new Map<Category, typeof openRequired>();
    openRequired.forEach((t) => {
      byCat.set(t.category, [...(byCat.get(t.category) ?? []), t]);
    });
    const weakest = weakestCategory(data, info);
    const entries = [...byCat.entries()].sort((a, b) => {
      const aw = a[0] === weakest ? 1 : 0;
      const bw = b[0] === weakest ? 1 : 0;
      if (aw !== bw) return bw - aw;
      return b[1].length - a[1].length;
    });
    entries.slice(0, 2).forEach(([category, tasks]) => {
      recs.push({
        id: `tasks_${category}`,
        title: tasks.length === 1 ? tasks[0].title : `${tasks.length} required ${CATEGORY_LABEL[category]} tasks left today`,
        detail:
          tasks.length === 1
            ? tasks[0].detail
            : tasks.map((t) => t.title).slice(0, 3).join(' · '),
        reason:
          category === weakest
            ? `${CATEGORY_LABEL[category]} is your weakest area right now — protect it first.`
            : 'Required work in today’s plan is still open.',
        category,
        score: category === weakest ? 88 : 76 - tasks.length,
        to: '/daily',
        cta: 'Open today’s plan',
      });
    });
  }

  /* 3 — Upcoming milestone with concrete gaps */
  const { milestone, status } = nextMilestone(data, info);
  const daysLeft = milestone.day - info.day;
  const missing = status.items.filter((i) => !i.done);
  if (missing.length > 0 && daysLeft >= 0) {
    recs.push({
      id: 'milestone',
      title: `Day ${milestone.day}: ${missing.length} ${missing.length === 1 ? 'requirement' : 'requirements'} still open`,
      detail: missing[0].label,
      reason:
        daysLeft <= 10
          ? `Only ${daysLeft} day${daysLeft === 1 ? '' : 's'} to the checkpoint.`
          : `Next checkpoint: ${milestone.title} (${daysLeft} days).`,
      category: 'career',
      score: daysLeft <= 10 ? 84 : 58,
      to: '/roadmap?tab=milestones',
      cta: 'View milestone',
    });
  }

  /* 4 — Weekly review not written yet */
  const review = data.reviews.find((r) => r.week === info.week);
  const passedReviewDay = info.dow >= 6;
  if (review && !review.completed && passedReviewDay && info.day > 6) {
    recs.push({
      id: 'review',
      title: `Write your Week ${info.week} review`,
      detail: '8 questions, 5 minutes — this is how a missed week gets recovered.',
      reason: 'The weekly review is the recovery mechanism of the plan.',
      category: 'review',
      score: 74,
      to: `/reviews?week=${info.week}`,
      cta: 'Start review',
    });
  }

  /* 5 — Project drifting behind the 90-day schedule */
  const expected = Math.round((info.day / 90) * 100);
  const behind = projectSummaries(data)
    .filter((p) => p.status !== 'completed')
    .map((p) => ({ p, gap: expected - p.pct }))
    .filter((x) => x.gap >= 15)
    .sort((a, b) => b.gap - a.gap)[0];
  if (behind) {
    recs.push({
      id: 'project',
      title: `Push ${behind.p.name}`,
      detail: `At day ${info.day} the plan expects ~${expected}% progress; this project is at ${behind.p.pct}%.`,
      reason: 'Project progress compounds — a small gap becomes a portfolio gap.',
      category: 'project',
      score: 66,
      to: '/projects',
      cta: 'Open projects',
    });
  }

  /* 6 — Weakest learning track */
  const weakestTrack = LEARNING_TRACKS.map((t) => ({ t, pct: trackStats(data, t.key).pct })).sort(
    (a, b) => a.pct - b.pct,
  )[0];
  if (weakestTrack && weakestTrack.pct < 50) {
    const topics = trackStats(data, weakestTrack.t.key).topics;
    const next = topics.find((x) => x.status === 'not_started') ?? topics[0];
    recs.push({
      id: 'track',
      title: `Advance ${weakestTrack.t.label}: ${next?.title ?? 'next topic'}`,
      detail: `This track is at ${weakestTrack.pct}% while the plan expects steady weekly progress.`,
      reason: 'Weakest learning area detected from tracked topic status.',
      category: weakestTrack.t.route === '/core-cs' ? 'corecs' : 'ai',
      score: 62,
      to: weakestTrack.t.route,
      cta: 'Open track',
    });
  }

  /* 7 — Streak protection */
  const streak = currentStreak(data);
  if (streak >= 3 && openRequired.length > 0) {
    recs.push({
      id: 'streak',
      title: `Protect your ${streak}-day streak`,
      detail: 'Complete one required task now — consistency beats heroic catch-up.',
      reason: 'Momentum is real: streaks are the strongest predictor of finishing day 90.',
      category: 'communication',
      score: 50 + Math.min(streak, 10),
      to: '/daily',
      cta: 'Do one task',
    });
  }

  // De-duplicate by category (keep the highest score), then cap at 3.
  const best = new Map<Category, Recommendation>();
  recs.forEach((r) => {
    const existing = best.get(r.category);
    if (!existing || existing.score < r.score) best.set(r.category, r);
  });

  const result = [...best.values()].sort((a, b) => b.score - a.score).slice(0, 3);

  if (result.length === 0) {
    result.push({
      id: 'all_clear',
      title: 'Everything due today is done',
      detail: `Day ${info.day} is complete. Use spare time for a DSA revision set or a project commit.`,
      reason: 'No incomplete required tasks, no overdue revisions.',
      category: 'career',
      score: 0,
      to: '/analytics',
      cta: 'Review analytics',
    });
  }

  return result;
}

function weakestCategory(data: DataBundle, info: DayInfo): Category {
  const counts: Record<string, { done: number; planned: number }> = {};
  data.tasks
    .filter((t) => t.day <= info.day)
    .forEach((t) => {
      const c = (counts[t.category] ??= { done: 0, planned: 0 });
      c.planned += 1;
      if (t.completed) c.done += 1;
    });
  const eligible = Object.entries(counts).filter(([, v]) => v.planned >= 3);
  if (!eligible.length) return 'dsa';
  const sorted = eligible.sort(
    (a, b) => a[1].done / a[1].planned - b[1].done / b[1].planned,
  );
  return sorted[0][0] as Category;
}

/* --------------------------- milestone gap help --------------------- */

export function milestoneGaps(data: DataBundle, info: DayInfo) {
  return data.milestones.map((ms) => {
    const status = milestoneStatus(data, ms, info);
    return { ms, status, daysLeft: ms.day - info.day };
  });
}

export { getDayInfo };
