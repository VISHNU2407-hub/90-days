import { Link } from 'react-router-dom';
import {
  Flame,
  Clock,
  Code2,
  Bot,
  FolderKanban,
  ArrowRight,
  Target as TargetIcon,
  TrendingUp,
  TrendingDown,
  CalendarDays,
} from 'lucide-react';
import { useStore } from '@/store';
import {
  getDayInfo,
  overallProgress,
  todayProgress,
  focusedMinutes,
  currentStreak,
  nextMilestone,
  strongestAndWeakest,
  trackStats,
  dsaStats,
  projectSummaries,
} from '@/lib/compute';
import { nextBestActions } from '@/lib/priority';
import { PHASES } from '@/lib/seed/roadmap';
import { LEARNING_STATUS_SCORE } from '@/lib/types';
import { formatDuration, round1 } from '@/lib/utils';
import {
  Button,
  Card,
  CardHeader,
  PageHeader,
  Progress,
  ProgressRing,
  SectionTitle,
  Badge,
} from '@/components/ui';
import { InsightCard, StatCard, TaskCard } from '@/components/shared';

export default function DashboardPage() {
  const data = useStore((s) => s.data);
  const toggleTask = useStore((s) => s.toggleTask);
  const setTaskNotes = useStore((s) => s.setTaskNotes);
  const showToast = useStore((s) => s.showToast);

  if (!data) return null;

  const info = getDayInfo(data.settings);
  const overall = overallProgress(data, info);
  const today = todayProgress(data, info);
  const streak = currentStreak(data);
  const dsa = dsaStats(data);
  const projects = projectSummaries(data);
  const insights = strongestAndWeakest(data, info);
  const recs = nextBestActions(data, info);
  const { milestone, status: msStatus } = nextMilestone(data, info);
  const phase = PHASES[info.phase - 1];

  const aiTopics = data.learning.filter((t) => t.track !== 'corecs');
  const aiPct = aiTopics.length
    ? Math.round(aiTopics.reduce((s, t) => s + LEARNING_STATUS_SCORE[t.status], 0) / aiTopics.length)
    : 0;
  const projectPct = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.pct, 0) / projects.length)
    : 0;
  const certDone = data.certifications.filter((c) => c.status === 'completed').length;
  const reviewPending = data.reviews.find((r) => r.week === info.week && !r.completed);
  const hours = round1(focusedMinutes(data, info) / 60);

  const remaining = today.tasks.filter((t) => !t.completed);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={`Day ${info.day} of 90`}
        subtitle={`${phase.name} · Week ${info.week} · ${new Date().toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })}`}
        action={
          <Link to="/daily">
            <Button variant="primary">
              Open today’s plan <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      {/* ------------------------- hero + stats ------------------------- */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <ProgressRing
              value={overall.overall}
              size={124}
              stroke={10}
              label={
                <span className="text-[26px] font-semibold tabular leading-none">
                  {overall.overall}%
                </span>
              }
              sub={<span className="text-[11px] text-fg-faint mt-1">overall</span>}
            />

            <div className="grow w-full">
              <div className="flex items-baseline gap-2">
                <span className="text-[40px] leading-none font-semibold tracking-tight tabular">
                  {info.day}
                </span>
                <span className="text-fg-faint text-lg">/ 90</span>
                <span className="ml-auto text-[12px] text-fg-faint uppercase tracking-[0.08em]">
                  Week {info.week} · Phase {info.phase}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[13px] mb-1.5">
                  <span className="text-fg-muted">Today’s progress</span>
                  <span className="font-medium tabular">
                    {today.done} / {today.total} tasks
                  </span>
                </div>
                <Progress value={today.pct} tone={today.pct >= 80 ? 'success' : 'accent'} height={10} />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="rounded-xl bg-[var(--surface-2)] border border-border px-3 py-2.5">
                  <div className="text-[11px] text-fg-faint uppercase tracking-wider">Streak</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Flame className="h-4 w-4 text-[var(--warning)]" />
                    <span className="font-semibold tabular">{streak} days</span>
                  </div>
                </div>
                <div className="rounded-xl bg-[var(--surface-2)] border border-border px-3 py-2.5">
                  <div className="text-[11px] text-fg-faint uppercase tracking-wider">Focused</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-4 w-4 text-[var(--accent)]" />
                    <span className="font-semibold tabular">{hours}h</span>
                  </div>
                </div>
                <div className="rounded-xl bg-[var(--surface-2)] border border-border px-3 py-2.5">
                  <div className="text-[11px] text-fg-faint uppercase tracking-wider">Plan</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CalendarDays className="h-4 w-4 text-[var(--success)]" />
                    <span className="font-semibold tabular">{overall.execution}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="DSA"
            value={`${dsa.solved} / ${dsa.target}`}
            sub={`${dsa.pct}% of target`}
            icon={<Code2 className="h-4 w-4" />}
            tone={dsa.pct >= 40 ? 'success' : 'accent'}
          />
          <StatCard
            label="AI learning"
            value={`${aiPct}%`}
            sub={`${aiTopics.filter((t) => t.status === 'mastered').length} mastered`}
            icon={<Bot className="h-4 w-4" />}
            tone="accent"
          />
          <StatCard
            label="Projects"
            value={`${projectPct}%`}
            sub={`${projects.filter((p) => p.pct === 100).length}/${projects.length} complete`}
            icon={<FolderKanban className="h-4 w-4" />}
          />
          <StatCard
            label="Certs"
            value={`${certDone} / ${data.certifications.length}`}
            sub="certifications"
            tone={certDone > 0 ? 'success' : 'warning'}
          />
        </div>
      </div>

      {/* ------------------------- today's priorities ------------------------- */}
      <SectionTitle
        action={
          <Link to="/daily" className="text-[12.5px] text-[var(--accent)] hover:underline inline-flex items-center gap-1">
            Full day view <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        Today’s priorities
      </SectionTitle>

      <div className="space-y-2.5 mb-6">
        {today.tasks.length === 0 && (
          <Card className="p-5 text-sm text-fg-muted">No tasks scheduled for this day.</Card>
        )}
        {(remaining.length ? remaining : today.tasks).map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            onToggle={() => {
              toggleTask(t.id);
              if (!t.completed) showToast('Task completed');
            }}
            onNotes={(notes) => setTaskNotes(t.id, notes)}
          />
        ))}
        {remaining.length > 0 && today.done > 0 && (
          <p className="text-[12.5px] text-fg-faint pl-1">
            {today.done} done · {remaining.length} remaining
          </p>
        )}
      </div>

      {/* ------------------------- next best action ------------------------- */}
      <SectionTitle
        action={
          <Link to="/analytics" className="text-[12.5px] text-[var(--accent)] hover:underline">
            How this is calculated
          </Link>
        }
      >
        Next best action
      </SectionTitle>

      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {recs.map((r, i) => (
          <Card key={r.id} className="p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <Badge tone={i === 0 ? 'accent' : 'neutral'}>#{i + 1} priority</Badge>
              <span className="text-[11px] text-fg-faint">score {r.score}</span>
            </div>
            <p className="text-[14.5px] font-medium leading-snug">{r.title}</p>
            <p className="text-[13px] text-fg-muted mt-1.5 grow leading-relaxed">{r.detail}</p>
            <p className="text-[12px] text-fg-faint mt-2">{r.reason}</p>
            <Link to={r.to} className="mt-3">
              <Button variant="secondary" size="sm" className="w-full">
                {r.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      {/* ------------------------- milestone + areas ------------------------- */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <CardHeader
            className="px-0 pt-0 pb-3"
            title="Next milestone"
            subtitle={`Day ${milestone.day} · ${milestone.phase}`}
            action={
              <Link to="/roadmap?tab=milestones">
                <Button variant="ghost" size="sm">
                  All milestones <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            }
          />
          <div className="flex items-center gap-4">
            <ProgressRing
              value={msStatus.pct}
              size={72}
              stroke={7}
              tone={msStatus.pct >= 75 ? 'var(--success)' : 'var(--accent)'}
            />
            <div className="min-w-0">
              <p className="font-semibold tracking-tight">{milestone.title}</p>
              <p className="text-[13px] text-fg-muted mt-0.5">{milestone.criteria}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {msStatus.items.map((it) => (
              <li key={it.id} className="flex items-start gap-2.5 text-[13px]">
                <span
                  className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                    it.done ? 'bg-[var(--success)]' : 'bg-[var(--surface-3)] border border-border-strong'
                  }`}
                />
                <span className={it.done ? 'text-fg-muted line-through' : ''}>{it.label}</span>
                {it.source === 'auto' && (
                  <span className="ml-auto text-[10.5px] text-fg-faint shrink-0">auto</span>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-3">
          <InsightCard
            title="Strongest area"
            tone="success"
            body={
              insights.strongest
                ? `${insights.strongest.label} — ${insights.strongest.pct}% done`
                : 'Complete a few tasks to reveal your strongest area.'
            }
          />
          <InsightCard
            title="Weakest area"
            tone="warning"
            body={
              insights.weakest
                ? `${insights.weakest.label} — ${insights.weakest.pct}% done`
                : 'Complete a few tasks to reveal your weakest area.'
            }
          />
          {reviewPending && (
            <Card className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium">Week {reviewPending.week} review pending</p>
              </div>
              <Link to={`/reviews?week=${reviewPending.week}`}>
                <Button size="sm" variant="primary">
                  Write
                </Button>
              </Link>
            </Card>
          )}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] font-medium">
                {insights.strongest && insights.weakest && insights.strongest.pct > insights.weakest.pct ? (
                  <TrendingUp className="h-4 w-4 text-[var(--success)]" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-[var(--warning)]" />
                )}
                Weekly score
              </div>
              <span className="text-[13px] tabular text-fg-muted">
                {overall.execution}% execution
              </span>
            </div>
            <Progress value={overall.execution} className="mt-2.5" tone="success" />
            <p className="text-[12px] text-fg-faint mt-2">
              <TargetIcon className="h-3 w-3 inline -mt-0.5 mr-1" />
              {data.settings?.daily_target} required tasks/day target ·{' '}
              {data.settings?.preferred_hours}h preferred study load
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
