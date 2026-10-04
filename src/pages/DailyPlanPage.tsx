import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCheck, CalendarCheck, Flame, Clock } from 'lucide-react';
import { useStore } from '@/store';
import { getDayInfo, tasksOnDay, currentStreak } from '@/lib/compute';
import { PHASES, SEED_WEEKS, weekForDay, phaseForDay } from '@/lib/seed/roadmap';
import type { Category } from '@/lib/types';
import { CATEGORY_LABEL } from '@/lib/types';
import { clamp, formatDuration, formatLongDate, todayKey } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  Modal,
  PageHeader,
  Progress,
  ProgressRing,
  SectionTitle,
} from '@/components/ui';
import { TaskCard } from '@/components/shared';

const SECTION_ORDER: Category[] = [
  'dsa',
  'corecs',
  'ai',
  'project',
  'career',
  'communication',
  'certification',
  'review',
];

export default function DailyPlanPage() {
  const data = useStore((s) => s.data);
  const toggleTask = useStore((s) => s.toggleTask);
  const setTaskNotes = useStore((s) => s.setTaskNotes);
  const showToast = useStore((s) => s.showToast);
  const [params, setParams] = useSearchParams();
  const [confirmDay, setConfirmDay] = useState(false);

  const info = useMemo(() => getDayInfo(data?.settings ?? null), [data?.settings]);
  const requested = Number(params.get('day'));
  const day = clamp(Number.isFinite(requested) && requested >= 1 ? requested : info.day, 1, 90);
  const isToday = day === info.day;

  const dayData = useMemo(() => {
    if (!data) return null;
    const tasks = tasksOnDay(data, day);
    const done = tasks.filter((t) => t.completed);
    return {
      tasks,
      done: done.length,
      total: tasks.length,
      pct: tasks.length ? Math.round((done.length / tasks.length) * 100) : 0,
      minutes: done.reduce((s, t) => s + t.est_minutes, 0),
      plannedMinutes: tasks.reduce((s, t) => s + t.est_minutes, 0),
      openRequired: tasks.filter((t) => t.required && !t.completed).length,
    };
  }, [data, day]);

  if (!data || !dayData) return null;

  const week = SEED_WEEKS[weekForDay(day) - 1];
  const phase = PHASES[phaseForDay(day) - 1];
  const dateForDay = new Date(data.settings?.start_date ?? todayKey());
  dateForDay.setDate(dateForDay.getDate() + (day - 1));

  const grouped = SECTION_ORDER.map((category) => ({
    category,
    tasks: dayData.tasks.filter((t) => t.category === category),
  })).filter((g) => g.tasks.length > 0);

  const setDay = (next: number) => {
    const clamped = clamp(next, 1, 90);
    if (clamped === day) return;
    setParams(clamped === info.day ? {} : { day: String(clamped) }, { replace: true });
  };

  const completeDay = () => {
    const remaining = dayData.tasks.filter((t) => !t.completed);
    remaining.forEach((t) => toggleTask(t.id));
    setConfirmDay(false);
    showToast(
      remaining.length
        ? `Day ${day} complete — ${remaining.length} tasks logged`
        : `Day ${day} was already complete`,
    );
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={isToday ? 'Today’s plan' : `Day ${day} plan`}
        subtitle={`${formatLongDate(
          `${dateForDay.getFullYear()}-${`${dateForDay.getMonth() + 1}`.padStart(2, '0')}-${`${dateForDay.getDate()}`.padStart(2, '0')}`,
        )} · Week ${weekForDay(day)} · ${phase.name}`}
        action={
          <div className="flex items-center gap-1.5">
            <Button size="icon" variant="secondary" onClick={() => setDay(day - 1)} aria-label="Previous day" disabled={day <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setParams({}, { replace: true })} disabled={isToday}>
              Today
            </Button>
            <Button size="icon" variant="secondary" onClick={() => setDay(day + 1)} aria-label="Next day" disabled={day >= 90}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* ------------------------ day summary ------------------------ */}
      <Card className="p-4 sm:p-5 mb-5">
        <div className="flex flex-col sm:flex-row gap-5 items-center">
          <div className="flex items-center gap-4">
            <ProgressRing
              value={dayData.pct}
              size={92}
              stroke={8}
              tone={dayData.pct === 100 ? 'var(--success)' : 'var(--accent)'}
              label={<span className="text-[20px] font-semibold tabular">{dayData.pct}%</span>}
              sub={<span className="text-[10.5px] text-fg-faint mt-0.5">complete</span>}
            />
            <div className="text-center sm:text-left">
              <div className="text-[13px] text-fg-muted tabular">
                {dayData.done} / {dayData.total} tasks
              </div>
              <div className="text-[12.5px] text-fg-faint tabular mt-0.5">
                {formatDuration(dayData.minutes)} of {formatDuration(dayData.plannedMinutes)} planned
              </div>
              {dayData.openRequired > 0 && (
                <Badge tone="warning" className="mt-1.5">
                  {dayData.openRequired} required left
                </Badge>
              )}
            </div>
          </div>

          <div className="grow w-full hidden sm:block">
            <div className="flex items-center justify-between text-[12.5px] text-fg-muted mb-1.5">
              <span>{week.dsa}</span>
              <span>Week {week.week_number}</span>
            </div>
            <Progress value={dayData.pct} height={10} tone={dayData.pct === 100 ? 'success' : 'accent'} />
            <div className="grid grid-cols-2 gap-3 mt-3 text-[12.5px] text-fg-muted">
              <span className="inline-flex items-center gap-1.5">
                <CalendarCheck className="h-3.5 w-3.5 text-[var(--accent)]" /> Core CS: {week.core_cs}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[var(--cyan)]" /> AI: {week.ai}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--warning)]">
              <Flame className="h-4 w-4" /> {currentStreak(data)} day streak
            </span>
            <Button
              variant={dayData.pct === 100 ? 'secondary' : 'primary'}
              disabled={dayData.tasks.length === 0}
              onClick={() => setConfirmDay(true)}
            >
              <CheckCheck className="h-4 w-4" />
              {dayData.pct === 100 ? 'Day complete' : 'Complete day'}
            </Button>
          </div>
        </div>
      </Card>

      {/* ------------------------ checkpoint banner ------------------------ */}
      {[30, 60, 75, 90].includes(day) && (
        <Card className="p-4 mb-5 border-l-2 border-l-[var(--warning)] flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <p className="text-[13px] font-semibold">Day {day} checkpoint</p>
            <p className="text-[13px] text-fg-muted mt-0.5">
              Tick what is genuinely done in Milestones and note what must be repaired before moving on.
            </p>
          </div>
          <Link to="/roadmap?tab=milestones">
            <Button size="sm">Open milestones</Button>
          </Link>
        </Card>
      )}

      {/* ------------------------ sections ------------------------ */}
      <div className="space-y-6">
        {grouped.map((g) => {
          const gDone = g.tasks.filter((t) => t.completed).length;
          return (
            <section key={g.category}>
              <SectionTitle
                action={
                  <span className="text-[12px] tabular text-fg-muted">
                    {gDone}/{g.tasks.length}
                  </span>
                }
              >
                {CATEGORY_LABEL[g.category]}
              </SectionTitle>
              <div className="space-y-2.5">
                {g.tasks.map((t) => (
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
              </div>
            </section>
          );
        })}

        {dayData.tasks.length === 0 && (
          <Card className="p-6 text-center text-sm text-fg-muted">
            Rest day — no tasks scheduled.
          </Card>
        )}
      </div>

      {/* ------------------------ footer actions ------------------------ */}
      <Card className="p-4 mt-6 flex items-center justify-end gap-2">
        <Link to="/reviews" className="sm:mr-auto">
          <Button variant="secondary">Weekly review</Button>
        </Link>
        <Button variant="primary" onClick={() => setConfirmDay(true)}>
          <CheckCheck className="h-4 w-4" />
          Complete day
        </Button>
      </Card>

      <Modal
        open={confirmDay}
        onClose={() => setConfirmDay(false)}
        title={`Complete day ${day}?`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDay(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={completeDay}>
              {dayData.tasks.filter((t) => !t.completed).length > 0
                ? `Log ${dayData.tasks.filter((t) => !t.completed).length} remaining tasks`
                : 'Done'}
            </Button>
          </>
        }
      >
        <p className="text-[14px] leading-relaxed">
          This marks every remaining task on day {day} as completed and logs its planned time to your
          focused hours.
        </p>
      </Modal>
    </div>
  );
}
