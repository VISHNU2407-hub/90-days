import { useState } from 'react';
import { Clock, Flag, StickyNote, ChevronDown } from 'lucide-react';
import type { Category, DailyTask, Priority } from '@/lib/types';
import { CATEGORY_LABEL } from '@/lib/types';
import { cn, formatDuration } from '@/lib/utils';
import { Badge, Checkbox, Card, Textarea, Progress } from '@/components/ui';

export const CATEGORY_TONE: Record<Category, 'accent' | 'violet' | 'cyan' | 'success' | 'warning' | 'neutral'> = {
  dsa: 'cyan',
  corecs: 'violet',
  ai: 'accent',
  project: 'success',
  career: 'warning',
  communication: 'neutral',
  certification: 'violet',
  review: 'accent',
};

export const CATEGORY_SHORT: Record<Category, string> = {
  dsa: 'DSA',
  corecs: 'Core CS',
  ai: 'AI',
  project: 'Project',
  career: 'Career',
  communication: 'Comm',
  certification: 'Cert',
  review: 'Review',
};

export const PRIORITY_TONE: Record<Priority, 'danger' | 'warning' | 'neutral'> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
};

export function CategoryBadge({ category, short }: { category: Category; short?: boolean }) {
  return (
    <Badge tone={CATEGORY_TONE[category]}>
      {short ? CATEGORY_SHORT[category] : CATEGORY_LABEL[category]}
    </Badge>
  );
}

/* ------------------------------ Stat card ------------------------------ */

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = 'neutral',
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  className?: string;
}) {
  const valueTone =
    tone === 'success'
      ? 'text-[var(--success)]'
      : tone === 'warning'
        ? 'text-[var(--warning)]'
        : tone === 'danger'
          ? 'text-[var(--danger)]'
          : tone === 'accent'
            ? 'text-[var(--accent)]'
            : '';
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] font-medium text-fg-faint uppercase tracking-[0.06em]">
          {label}
        </span>
        {icon && <span className="text-fg-faint">{icon}</span>}
      </div>
      <div className={cn('text-[22px] font-semibold tracking-tight mt-1.5 tabular', valueTone)}>
        {value}
      </div>
      {sub && <div className="text-[12.5px] text-fg-muted mt-0.5">{sub}</div>}
    </Card>
  );
}

/* ------------------------------- Task card ----------------------------- */

export function TaskCard({
  task,
  onToggle,
  onNotes,
  showDay,
  compact,
}: {
  task: DailyTask;
  onToggle: () => void;
  onNotes?: (notes: string) => void;
  showDay?: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(task.notes);

  return (
    <Card
      className={cn(
        'transition-colors',
        task.completed && 'opacity-70',
        compact ? 'p-3' : 'p-3.5',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox checked={task.completed} onChange={onToggle} label={`Complete ${task.title}`} />
        </div>

        <div className="min-w-0 grow">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'text-[14px] font-medium leading-snug',
                task.completed && 'line-through text-fg-muted',
              )}
            >
              {task.title}
            </p>
            {task.priority === 'high' && !task.completed && (
              <Flag className="h-3.5 w-3.5 text-[var(--danger)] shrink-0 mt-0.5" aria-label="High priority" />
            )}
          </div>

          {task.detail && !compact && (
            <p className="text-[12.5px] text-fg-muted mt-1 leading-relaxed line-clamp-2">
              {task.detail}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-[11.5px] text-fg-faint">
            <CategoryBadge category={task.category} short />
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(task.est_minutes)}
            </span>
            {showDay && <span className="tabular">Day {task.day}</span>}
            {task.required && <span className="text-[var(--accent)] font-medium">Required</span>}
            {task.completed_at && (
              <span className="text-[var(--success)]">
                ✓ {new Date(task.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {onNotes && (
              <button
                onClick={() => {
                  setOpen((o) => !o);
                  setDraft(task.notes);
                }}
                className="inline-flex items-center gap-1 hover:text-fg"
              >
                <StickyNote className="h-3 w-3" />
                {task.notes ? 'Note' : 'Add note'}
                <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
              </button>
            )}
          </div>

          {open && onNotes && (
            <div className="mt-2">
              <Textarea
                value={draft}
                placeholder="Notes, links, what went wrong…"
                className="min-h-[64px] text-[13px]"
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                  if (draft !== task.notes) onNotes(draft);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------- Meter -------------------------------- */

export function MeterRow({
  label,
  value,
  detail,
  tone = 'accent',
}: {
  label: string;
  value: number;
  detail?: string;
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'violet' | 'cyan';
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[13px] mb-1.5">
        <span className="font-medium">{label}</span>
        <span className="text-fg-muted tabular">
          {detail ?? `${value}%`}
        </span>
      </div>
      <Progress value={value} tone={tone} />
    </div>
  );
}

/* ------------------------------ Insight ------------------------------- */

export function InsightCard({
  title,
  body,
  action,
  tone = 'accent',
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
}) {
  const border =
    tone === 'success'
      ? 'border-l-[var(--success)]'
      : tone === 'warning'
        ? 'border-l-[var(--warning)]'
        : tone === 'danger'
          ? 'border-l-[var(--danger)]'
          : 'border-l-[var(--accent)]';
  return (
    <Card className={cn('p-4 border-l-2', border)}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-fg-faint">{title}</p>
          <p className="text-[14px] mt-1 leading-relaxed">{body}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </Card>
  );
}
