import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  CheckCircle2,
  Circle,
  Flag,
  ArrowRight,
  ListChecks,
  Map,
} from 'lucide-react';
import { useStore } from '@/store';
import { getDayInfo, milestoneStatus, checklistDone } from '@/lib/compute';
import {
  PHASES,
  DSA_PLAN,
  DSA_LOOP,
  DAILY_BLOCKS,
  WEEKLY_RHYTHM,
  WORKLOAD_NOTE,
  PRINCIPLES,
  CAREER_ACTIONS,
} from '@/lib/seed/roadmap';
import { cn, pct } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Checkbox,
  PageHeader,
  Progress,
  ProgressRing,
  SectionTitle,
  Tabs,
} from '@/components/ui';

export default function RoadmapPage() {
  const data = useStore((s) => s.data);
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'roadmap';

  if (!data) return null;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="90-Day Roadmap"
        subtitle="Three phases · Thirteen weeks · Measurable checkpoints"
      />

      <Tabs
        className="mb-6"
        value={tab}
        onChange={(id) => setParams({ tab: id }, { replace: true })}
        tabs={[
          { id: 'roadmap', label: 'Roadmap', icon: <Map className="h-3.5 w-3.5" /> },
          { id: 'milestones', label: 'Milestones', icon: <Flag className="h-3.5 w-3.5" /> },
          { id: 'checklist', label: '90-Day Checklist', icon: <ListChecks className="h-3.5 w-3.5" /> },
        ]}
      />

      {tab === 'roadmap' && <RoadmapView />}
      {tab === 'milestones' && <MilestonesView />}
      {tab === 'checklist' && <ChecklistView />}
    </div>
  );
}

/* ==================================================================== *
 *  Roadmap
 * ==================================================================== */

function RoadmapView() {
  const data = useStore((s) => s.data);
  const toggleWeek = useStore((s) => s.toggleWeek);
  const [open, setOpen] = useState<string | null>(null);
  const info = getDayInfo(data?.settings ?? null);

  const phaseProgress = useMemo(() => {
    if (!data) return {};
    const ranges: Record<number, [number, number]> = { 1: [1, 30], 2: [31, 60], 3: [61, 90] };
    const out: Record<number, number> = {};
    for (const [phase, [from, to]] of Object.entries(ranges)) {
      const rows = data.tasks.filter((t) => t.day >= from && t.day <= to);
      out[Number(phase)] = pct(rows.filter((t) => t.completed).length, rows.length);
    }
    return out;
  }, [data]);

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* phase cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {PHASES.map((p) => (
          <Card key={p.id} className="p-4 min-w-0">
            <div className="flex items-center justify-between">
              <Badge tone={p.id === 1 ? 'accent' : p.id === 2 ? 'violet' : 'success'}>{p.days}</Badge>
              <span className="text-[12.5px] tabular text-fg-muted">{phaseProgress[p.id] ?? 0}%</span>
            </div>
            <h3 className="font-semibold tracking-tight mt-2.5">{p.name}</h3>
            <p className="text-[13px] text-fg-muted mt-1 leading-relaxed">{p.focus}</p>
            <Progress value={phaseProgress[p.id] ?? 0} className="mt-3" tone={p.id === 3 ? 'success' : 'accent'} />
            <p className="text-[12px] text-fg-faint mt-2">Exit condition: {p.exit}</p>
          </Card>
        ))}
      </div>

      {/* week timeline */}
      <div>
        <SectionTitle>Week-by-week execution plan</SectionTitle>
        <div className="space-y-5">
          {PHASES.map((phase) => {
            const weeks = data.weeks.filter((w) => w.phase === phase.id);
            if (!weeks.length) return null;
            return (
              <div key={phase.id}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[13px] font-semibold">{phase.name}</span>
                  <span className="text-[12px] text-fg-faint">{phase.days}</span>
                  <div className="h-px grow bg-border" />
                </div>

                <div className="relative pl-5">
                  <div className="absolute left-[7px] top-3 bottom-3 w-px bg-border" aria-hidden />
                  <div className="space-y-2">
                    {weeks.map((w) => {
                      const isOpen = open === w.id;
                      const isCurrent = w.week_number === info.week;
                      const inPast = w.end_day < info.day;
                      return (
                        <div key={w.id} className="relative">
                          <span
                            className={cn(
                              'absolute -left-5 top-4 h-[15px] w-[15px] rounded-full border-2 bg-bg',
                              w.completed
                                ? 'border-[var(--success)] bg-[var(--success)]'
                                : isCurrent
                                  ? 'border-[var(--accent)]'
                                  : inPast
                                    ? 'border-border-strong'
                                    : 'border-border',
                            )}
                          />
                          <Card className={cn(isCurrent && 'border-[var(--accent)]')}>
                            <button
                              className="w-full text-left px-4 py-3 flex items-center gap-3"
                              onClick={() => setOpen(isOpen ? null : w.id)}
                              aria-expanded={isOpen}
                            >
                              <div className="min-w-0 grow">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[13.5px] font-semibold">Week {w.week_number}</span>
                                  <span className="text-[11.5px] text-fg-faint tabular">
                                    Days {w.start_day}–{w.end_day}
                                  </span>
                                  {isCurrent && <Badge tone="accent">Current</Badge>}
                                  {w.completed && (
                                    <Badge tone="success">
                                      <CheckCircle2 className="h-3 w-3" /> Done
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[13px] text-fg-muted mt-0.5 truncate">
                                  {w.dsa} · {w.core_cs} · {w.ai}
                                </p>
                              </div>
                              <ChevronRight
                                className={cn(
                                  'h-4 w-4 text-fg-faint shrink-0 transition-transform',
                                  isOpen && 'rotate-90',
                                )}
                              />
                            </button>

                            {isOpen && (
                              <div className="border-t border-border px-4 py-4 animate-fade-up">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                  <WeekCell label="DSA" tone="cyan" value={w.dsa} />
                                  <WeekCell label="Core CS" tone="violet" value={w.core_cs} />
                                  <WeekCell label="AI" tone="accent" value={w.ai} />
                                  <WeekCell label="Project / Career" tone="success" value={w.project_career} />
                                  <WeekCell label="Checkpoint" tone="warning" value={w.checkpoint} />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                  <Button
                                    size="sm"
                                    variant={w.completed ? 'secondary' : 'primary'}
                                    onClick={() => toggleWeek(w.id)}
                                  >
                                    {w.completed ? 'Mark as not done' : 'Mark week complete'}
                                  </Button>
                                  <Link to={`/daily?day=${w.start_day}`}>
                                    <Button size="sm" variant="ghost">
                                      Open first day <ArrowRight className="h-3.5 w-3.5" />
                                    </Button>
                                  </Link>
                                </div>

                                <div className="mt-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11.5px] uppercase tracking-[0.08em] text-fg-faint">
                                      This week’s tasks
                                    </span>
                                    <span className="text-[11.5px] tabular text-fg-muted">
                                      {data.tasks.filter((t) => t.week === w.week_number).length} tasks
                                    </span>
                                  </div>
                                  <div className="max-h-64 overflow-y-auto pr-1 space-y-1.5">
                                    {[...Array(7)]
                                      .map((_, i) => w.start_day + i)
                                      .filter((d) => d <= w.end_day)
                                      .map((d) => (
                                        <div key={d}>
                                          <Link
                                            to={`/daily?day=${d}`}
                                            className="text-[11.5px] text-fg-faint hover:text-[var(--accent)] tabular"
                                          >
                                            Day {d}
                                          </Link>
                                          <div className="space-y-1 mt-0.5">
                                            {data.tasks
                                              .filter((t) => t.day === d)
                                              .map((t) => (
                                                <div
                                                  key={t.id}
                                                  className={cn(
                                                    'flex items-center gap-2 text-[12.5px] pl-3 border-l-2',
                                                    t.completed
                                                      ? 'border-l-[var(--success)] text-fg-muted'
                                                      : 'border-l-border text-fg-muted',
                                                  )}
                                                >
                                                  <span className="truncate">{t.title}</span>
                                                  <span className="ml-auto shrink-0 text-fg-faint tabular text-[11px]">
                                                    {t.est_minutes}m
                                                  </span>
                                                </div>
                                              ))}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* reference */}
      <ReferenceSections />
    </div>
  );
}

function WeekCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'accent' | 'success' | 'warning' | 'violet' | 'cyan';
}) {
  const color =
    tone === 'success'
      ? 'var(--success)'
      : tone === 'warning'
        ? 'var(--warning)'
        : tone === 'violet'
          ? 'var(--violet)'
          : tone === 'cyan'
            ? 'var(--cyan)'
            : 'var(--accent)';
  return (
    <div className="rounded-xl bg-[var(--surface-2)] border border-border p-3">
      <div className="text-[10.5px] uppercase tracking-[0.1em] font-semibold" style={{ color }}>
        {label}
      </div>
      <p className="text-[13px] mt-1.5 leading-snug">{value}</p>
    </div>
  );
}

function ReferenceSections() {
  const block = (id: string, title: string, body: React.ReactNode) => (
    <Card key={id} className="p-5 min-w-0">
      <h3 className="text-[15px] font-semibold tracking-tight mb-3">{title}</h3>
      {body}
    </Card>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {block(
        'dsa-plan',
        'DSA master plan',
        <>
          <div className="space-y-2">
            {DSA_PLAN.map((s) => (
              <div key={s.weeks} className="flex items-start gap-3 text-[13px]">
                <span className="w-24 shrink-0 text-fg-faint tabular">{s.weeks}</span>
                <span className="grow">{s.topics}</span>
                <Badge tone="cyan">{s.target}</Badge>
              </div>
            ))}
          </div>
        </>,
      )}

      {block(
        'dsa-loop',
        'DSA learning loop',
        <div className="grid sm:grid-cols-2 gap-2">
          {DSA_LOOP.map((s) => (
            <div key={s.step} className="rounded-xl bg-[var(--surface-2)] border border-border p-3">
              <div className="text-[13px] font-semibold">{s.step}</div>
              <p className="text-[12.5px] text-fg-muted mt-1 leading-relaxed">{s.action}</p>
            </div>
          ))}
        </div>,
      )}

      {block(
        'daily',
        'Default focused day',
        <div className="space-y-2">
          {DAILY_BLOCKS.map((b) => (
            <div key={b.block} className="flex items-center gap-3 text-[13px]">
              <span className="w-32 shrink-0 font-medium">{b.block}</span>
              <span className="grow text-fg-muted">{b.work}</span>
              <span className="tabular text-fg-faint">{b.normal}</span>
            </div>
          ))}
          <p className="text-[12.5px] text-fg-muted pt-2 border-t border-border">{WORKLOAD_NOTE}</p>
        </div>,
      )}

      {block(
        'rhythm',
        'Weekly rhythm',
        <div className="space-y-2">
          {WEEKLY_RHYTHM.map((r) => (
            <div key={r.activity} className="flex items-center gap-3 text-[13px]">
              <span className="w-40 shrink-0 font-medium">{r.activity}</span>
              <span className="grow text-fg-muted">{r.frequency}</span>
              <span className="tabular text-fg-faint">
                {r.normal} <span className="text-fg-faint/70">(min {r.minimum})</span>
              </span>
            </div>
          ))}
        </div>,
      )}

      {block(
        'principles',
        'Design principles',
        <div className="space-y-2.5">
          {PRINCIPLES.map((p) => (
            <div
              key={p.title}
              className="flex items-start gap-3 text-[13px]"
            >
              <Circle className="h-2 w-2 mt-1.5 fill-current text-[var(--accent)] shrink-0" />
              <div>
                <span className="font-medium">{p.title}</span>
                <span className="text-fg-muted"> — {p.detail}</span>
              </div>
            </div>
          ))}
        </div>,
      )}

      {block(
        'career',
        'Career preparation',
        <div className="space-y-2">
          {CAREER_ACTIONS.map((a) => (
            <div key={a.when} className="flex items-start gap-3 text-[13px]">
              <span className="w-24 shrink-0">
                <Badge tone={a.when === 'Day 90' ? 'success' : 'neutral'}>{a.when}</Badge>
              </span>
              <span className="grow text-fg-muted">{a.action}</span>
            </div>
          ))}
        </div>,
      )}
    </div>
  );
}

/* ==================================================================== *
 *  Milestones
 * ==================================================================== */

function MilestonesView() {
  const data = useStore((s) => s.data);
  const toggleReq = useStore((s) => s.toggleMilestoneRequirement);
  if (!data) return null;
  const info = getDayInfo(data.settings);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {data.milestones.map((ms) => {
        const status = milestoneStatus(data, ms, info);
        const daysLeft = ms.day - info.day;
        return (
          <Card key={ms.id} className="p-5">
            <div className="flex items-start gap-4">
              <ProgressRing
                value={status.pct}
                size={78}
                stroke={7}
                tone={status.completed ? 'var(--success)' : 'var(--accent)'}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone={status.completed ? 'success' : 'accent'}>DAY {ms.day}</Badge>
                  <span className="text-[12px] text-fg-faint">
                    {daysLeft >= 0 ? `in ${daysLeft} days` : 'checkpoint passed'}
                  </span>
                </div>
                <h3 className="font-semibold tracking-tight mt-1.5">{ms.title}</h3>
                <p className="text-[12.5px] text-fg-muted mt-1 leading-relaxed">{ms.criteria}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {status.items.map((it) => (
                <div key={it.id} className="flex items-start gap-2.5">
                  {it.source === 'auto' ? (
                    <span
                      className={cn(
                        'mt-0.5 h-[18px] w-[18px] rounded-md border-2 flex items-center justify-center shrink-0',
                        it.done
                          ? 'bg-[var(--success)] border-[var(--success)] text-white'
                          : 'bg-[var(--surface-2)] border-border-strong',
                      )}
                    >
                      {it.done && <CheckCircle2 className="h-3 w-3" />}
                    </span>
                  ) : (
                    <span className="mt-0.5">
                      <Checkbox checked={it.done} onChange={() => toggleReq(ms.id, it.id)} />
                    </span>
                  )}
                  <span className={cn('text-[13px] leading-snug', it.done && 'text-fg-muted line-through')}>
                    {it.label}
                    {it.source === 'auto' && (
                      <span className="ml-1.5 text-[10.5px] text-fg-faint">auto-tracked</span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[12.5px] text-fg-muted tabular">
                {status.done}/{status.total} requirements
              </span>
              <Badge tone={status.completed ? 'success' : status.reachedDay ? 'warning' : 'neutral'}>
                {status.completed ? 'Checkpoint passed' : status.reachedDay ? 'Due now' : 'Upcoming'}
              </Badge>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ==================================================================== *
 *  90-day success checklist
 * ==================================================================== */

function ChecklistView() {
  const data = useStore((s) => s.data);
  const toggle = useStore((s) => s.toggleChecklist);
  if (!data) return null;

  const doneCount = checklistDone(data);
  const total = data.checklist.length;
  const categories = [...new Set(data.checklist.map((c) => c.category))];

  return (
    <div className="grid lg:grid-cols-4 gap-4">
      <Card className="p-5 lg:sticky lg:top-20 h-fit">
        <div className="flex items-center gap-4">
          <ProgressRing
            value={pct(doneCount, total)}
            size={84}
            stroke={8}
            tone={doneCount === total ? 'var(--success)' : 'var(--accent)'}
          />
          <div>
            <p className="text-[15px] font-semibold tracking-tight">90-day success</p>
            <p className="text-[13px] text-fg-muted tabular">
              {doneCount} of {total} complete
            </p>
          </div>
        </div>
        <p className="text-[12.5px] text-fg-muted mt-4 leading-relaxed">
          Definition of success: solve unfamiliar problems with a repeatable process, explain core
          CS, build and debug AI systems, show credible projects, and communicate your work in an
          interview.
        </p>
        <div className="mt-4">
          <Progress value={pct(doneCount, total)} tone={doneCount === total ? 'success' : 'accent'} />
        </div>
      </Card>

      <div className="lg:col-span-3 space-y-4">
        {categories.map((cat) => {
          const items = data.checklist.filter((c) => c.category === cat);
          const catDone = items.filter((i) => i.done).length;
          return (
            <Card key={cat} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-fg-faint">
                  {cat}
                </h3>
                <span className="text-[12px] tabular text-fg-muted">
                  {catDone}/{items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg px-2 py-1.5 -mx-2 hover:bg-[var(--surface-2)] transition-colors"
                  >
                    <span className="mt-0.5">
                      <Checkbox checked={item.done} onChange={() => toggle(item.id)} />
                    </span>
                    <span
                      className={cn(
                        'text-[13.5px] leading-snug',
                        item.done && 'text-fg-muted line-through',
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
