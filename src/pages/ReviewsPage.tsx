import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NotebookPen, CheckCircle2, Circle, Clock, Code2, FolderKanban, BrainCircuit } from 'lucide-react';
import { useStore } from '@/store';
import { getDayInfo, weeklyStats, projectSummaries } from '@/lib/compute';
import { REVIEW_QUESTIONS, SEED_WEEKS } from '@/lib/seed/roadmap';
import { parseDateKey, addDays, cn, formatShortDate } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  PageHeader,
  Progress,
  SectionTitle,
  Textarea,
} from '@/components/ui';

export default function ReviewsPage() {
  const data = useStore((s) => s.data);
  const saveReview = useStore((s) => s.saveReview);
  const showToast = useStore((s) => s.showToast);
  const [params, setParams] = useSearchParams();

  const info = useMemo(() => getDayInfo(data?.settings ?? null), [data?.settings]);
  const weekParam = Number(params.get('week'));
  const week = weekParam >= 1 && weekParam <= 13 ? weekParam : info.week;

  const weekStats = useMemo(() => (data ? weeklyStats(data, info) : []), [data, info]);
  const review = data?.reviews.find((r) => r.week === week);
  const seedWeek = SEED_WEEKS[week - 1];

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [consistency, setConsistency] = useState(0);
  const [loadedWeek, setLoadedWeek] = useState<number | null>(null);

  // Load the stored review whenever the selected week changes.
  if (review && loadedWeek !== week) {
    setLoadedWeek(week);
    setAnswers(review.answers ?? {});
    setConsistency(review.consistency ?? 0);
  }

  const snapshot = useMemo(() => {
    if (!data) return { completion: 0, hours: 0, dsa: 0, project: 0, learning: 0 };
    const ws = weekStats.find((w) => w.week === week);
    const start = addDays(parseDateKey(data.settings?.start_date ?? '2000-01-01'), (week - 1) * 7);
    const end = addDays(start, 6);
    const dsa = data.problems.filter((p) => {
      const iso = p.solved_at ?? p.created_at;
      if (!iso) return false;
      const d = new Date(iso);
      return d >= start && d < addDays(end, 1);
    }).length;
    const projects = projectSummaries(data);
    const learningPct = data.learning.length
      ? Math.round(
          data.learning.reduce(
            (s, t) =>
              s +
              (t.status === 'mastered' ? 100 : t.status === 'understood' ? 80 : t.status === 'needs_revision' ? 55 : t.status === 'learning' ? 35 : 0),
            0,
          ) / data.learning.length,
        )
      : 0;
    return {
      completion: ws?.pct ?? 0,
      hours: ws?.hours ?? 0,
      dsa,
      project: projects.length
        ? Math.round(projects.reduce((s, p) => s + p.pct, 0) / projects.length)
        : 0,
      learning: learningPct,
    };
  }, [data, week, weekStats]);

  if (!data || !review) return null;

  const answered = REVIEW_QUESTIONS.filter((q) => (answers[q.id] ?? '').trim().length > 0).length;
  const allStats = weeklyStats(data, info);
  const currentStats = allStats.find((w) => w.week === week);

  function persist(completed: boolean) {
    saveReview(review!.id, {
      answers,
      consistency,
      completion_pct: snapshot.completion,
      focused_hours: snapshot.hours,
      dsa_problems: snapshot.dsa,
      project_progress: snapshot.project,
      learning_progress: snapshot.learning,
      completed,
    });
    showToast(completed ? `Week ${week} review completed` : 'Draft saved');
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Weekly Reviews" />

      {/* week selector */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-5">
        {SEED_WEEKS.map((w) => {
          const done = data.reviews.find((r) => r.week === w.week_number)?.completed;
          return (
            <button
              key={w.week_number}
              onClick={() => setParams({ week: String(w.week_number) }, { replace: true })}
              className={cn(
                'shrink-0 h-9 px-3 rounded-lg text-[13px] font-medium border transition-colors inline-flex items-center gap-1.5',
                week === w.week_number
                  ? 'bg-[var(--accent)] border-transparent text-white'
                  : 'bg-[var(--surface-2)] border-border text-fg-muted hover:text-fg',
              )}
            >
              W{w.week_number}
              {done && <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* ------------------------- context ------------------------- */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[15px] font-semibold tracking-tight">Week {week} context</h3>
              {week === info.week && <Badge tone="accent">Current</Badge>}
            </div>
            <div className="space-y-2.5 text-[13px]">
              <Row label="Dates" value={`Day ${seedWeek ? (week - 1) * 7 + 1 : 1}–${Math.min(week * 7, 90)}`} />
              <Row label="DSA" value={seedWeek?.dsa ?? '—'} />
              <Row label="Core CS" value={seedWeek?.core_cs ?? '—'} />
              <Row label="AI" value={seedWeek?.ai ?? '—'} />
              <Row label="Project / Career" value={seedWeek?.project_career ?? '—'} />
              <div className="rounded-xl bg-warning-soft p-2.5">
                <div className="text-[11px] uppercase tracking-wider text-[var(--warning)]">
                  Checkpoint
                </div>
                <p className="text-[13px] mt-0.5">{seedWeek?.checkpoint}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle>Auto-captured metrics</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <Metric icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Completion" value={`${snapshot.completion}%`} />
              <Metric icon={<Clock className="h-3.5 w-3.5" />} label="Focused hours" value={`${snapshot.hours}h`} />
              <Metric icon={<Code2 className="h-3.5 w-3.5" />} label="DSA problems" value={String(snapshot.dsa)} />
              <Metric icon={<FolderKanban className="h-3.5 w-3.5" />} label="Project progress" value={`${snapshot.project}%`} />
              <Metric icon={<BrainCircuit className="h-3.5 w-3.5" />} label="Learning progress" value={`${snapshot.learning}%`} />
              <Metric icon={<NotebookPen className="h-3.5 w-3.5" />} label="Answered" value={`${answered}/${REVIEW_QUESTIONS.length}`} />
            </div>
            {currentStats && (
              <div className="mt-3">
                <Progress value={currentStats.pct} tone={currentStats.pct >= 70 ? 'success' : 'accent'} />
              </div>
            )}
          </Card>
        </div>

        {/* ------------------------- form ------------------------- */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight">
                  Week {week} review {review.completed && <Badge tone="success">completed</Badge>}
                </h3>
                <p className="text-[12.5px] text-fg-muted mt-0.5">
                  {formatShortDate(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`)}
                  {review.updated_at ? ` · saved ${new Date(review.updated_at).toLocaleDateString()}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => persist(false)}>
                  Save draft
                </Button>
                <Button
                  size="sm"
                  variant={review.completed ? 'secondary' : 'primary'}
                  onClick={() => persist(true)}
                >
                  {review.completed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Completed
                    </>
                  ) : (
                    'Complete review'
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {REVIEW_QUESTIONS.map((q, i) => (
                <div key={q.id}>
                  <div className="flex items-start gap-2.5 mb-1.5">
                    <span className="text-fg-faint tabular text-[13px] mt-1.5">{i + 1}.</span>
                    <label className="text-[13.5px] font-medium grow">{q.text}</label>
                  </div>
                  <Textarea
                    className="min-h-[64px] ml-0 sm:ml-6"
                    placeholder="Honest, specific answer…"
                    value={answers[q.id] ?? ''}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  />
                </div>
              ))}

              <div className="pt-2 border-t border-border">
                <p className="text-[13.5px] font-medium mb-2">How consistent was I this week? (1–5)</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setConsistency(n)}
                      className={cn(
                        'h-10 w-10 rounded-lg border text-[14px] font-semibold transition-colors',
                        consistency >= n
                          ? 'bg-[var(--accent)] border-transparent text-white'
                          : 'bg-[var(--surface-2)] border-border text-fg-muted hover:border-border-strong',
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ------------------------- history ------------------------- */}
      <div className="mt-6">
        <SectionTitle>Review history</SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.reviews.map((r) => (
            <Card key={r.id} className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] font-semibold">Week {r.week}</span>
                {r.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                ) : (
                  <Circle className="h-4 w-4 text-fg-faint" />
                )}
              </div>
              <div className="text-[12px] text-fg-faint mt-1 space-y-0.5 tabular">
                <div>{r.completion_pct}% completion</div>
                <div>{r.focused_hours}h focused</div>
                <div>{r.dsa_problems} DSA solved</div>
                <div>consistency {r.consistency ? `${r.consistency}/5` : '—'}</div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setParams({ week: String(r.week) }, { replace: true })}
              >
                Open
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-24 shrink-0 text-fg-faint">{label}</span>
      <span className="grow text-fg-muted">{value}</span>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--surface-2)] border border-border p-2.5">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-fg-faint">
        {icon}
        {label}
      </div>
      <div className="text-[16px] font-semibold tabular mt-0.5">{value}</div>
    </div>
  );
}
