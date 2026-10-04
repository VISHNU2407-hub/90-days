import { useMemo, useState } from 'react';
import { ChevronDown, NotebookPen, CheckCircle2, CircleDashed } from 'lucide-react';
import { useStore } from '@/store';
import { trackStats } from '@/lib/compute';
import type { LearningStatus, Track } from '@/lib/types';
import { LEARNING_STATUSES, LEARNING_STATUS_LABEL, TRACK_LABEL } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Progress,
  ProgressRing,
  Select,
  Textarea,
} from '@/components/ui';

const STATUS_TONE: Record<LearningStatus, 'neutral' | 'accent' | 'success' | 'warning' | 'violet'> = {
  not_started: 'neutral',
  learning: 'accent',
  understood: 'success',
  needs_revision: 'warning',
  mastered: 'violet',
};

export function ConfidenceDots({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Confidence">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`Confidence ${n}`}
          onClick={() => onChange(value === n ? 0 : n)}
          className={cn(
            'h-5 w-5 rounded-md text-[11px] font-semibold border transition-colors',
            value >= n
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
              : 'bg-[var(--surface-2)] border-border text-fg-faint hover:border-border-strong',
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export function LearningPanel({
  track,
  extra,
}: {
  track: Track;
  extra?: React.ReactNode;
}) {
  const data = useStore((s) => s.data);
  const setLearning = useStore((s) => s.setLearning);
  const [openNotes, setOpenNotes] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const stats = useMemo(() => (data ? trackStats(data, track) : null), [data, track]);

  const groups = useMemo(() => {
    if (!stats) return [];
    const map = new Map<string, typeof stats.topics>();
    stats.topics.forEach((t) => {
      const arr = map.get(t.group_name) ?? [];
      arr.push(t);
      map.set(t.group_name, arr);
    });
    return [...map.entries()];
  }, [stats]);

  if (!data || !stats) return null;

  const counts = stats.counts;
  const total = stats.topics.length;

  return (
    <div className="space-y-5">
      {/* summary */}
      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-center">
        <div className="flex items-center gap-4 grow w-full">
          <ProgressRing
            value={stats.pct}
            size={92}
            stroke={8}
            tone={stats.pct >= 75 ? 'var(--success)' : 'var(--accent)'}
            label={<span className="text-[20px] font-semibold tabular">{stats.pct}%</span>}
            sub={<span className="text-[10.5px] text-fg-faint mt-0.5">{TRACK_LABEL[track]}</span>}
          />
          <div className="grow w-full space-y-2">
            <Progress value={stats.pct} height={8} tone={stats.pct >= 75 ? 'success' : 'accent'} />
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-fg-muted">
              <span>{total} topics</span>
              <span className="text-[var(--success)]">{counts.mastered} mastered</span>
              <span className="text-[var(--accent)]">{counts.understood} understood</span>
              <span className="text-[var(--warning)]">{counts.needs_revision} need revision</span>
              <span>{counts.learning} in progress</span>
              <span className="text-fg-faint">{counts.not_started} not started</span>
            </div>
          </div>
        </div>
        <div className="text-center sm:text-right shrink-0">
          <div className="text-[11px] uppercase tracking-wider text-fg-faint">Confidence</div>
          <div className="text-[20px] font-semibold tabular">{stats.avgConfidence || '—'}/5</div>
          <div className="text-[12px] text-fg-muted tabular">{stats.practiced}/{total} practiced</div>
        </div>
      </Card>

      {extra}

      {/* topics by group */}
      <div className="space-y-4">
        {groups.map(([groupName, topics]) => {
          const groupPct = Math.round(
            topics.reduce((s, t) => s + statusScore(t.status), 0) / (topics.length || 1),
          );
          return (
            <Card key={groupName} className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-[var(--surface-2)]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[13.5px] font-semibold truncate">{groupName}</span>
                  <Badge tone={STATUS_TONE[worstStatus(topics)] as never}>
                    {topics.length} topic{topics.length === 1 ? '' : 's'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[12.5px] tabular text-fg-muted">{groupPct}%</span>
                  <Progress value={groupPct} className="w-20" height={6} />
                </div>
              </div>

              <div className="divide-y divide-border">
                {topics.map((t) => (
                  <div key={t.id} className="px-4 py-3">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-3">
                      <div className="grow min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[14px] font-medium">{t.title}</span>
                          <Badge tone={STATUS_TONE[t.status]}>{LEARNING_STATUS_LABEL[t.status]}</Badge>
                          {t.practice_done && (
                            <Badge tone="success">
                              <CheckCircle2 className="h-3 w-3" /> practiced
                            </Badge>
                          )}
                        </div>
                        <p className="text-[12.5px] text-fg-muted mt-1 leading-relaxed">{t.detail}</p>
                        {t.output && (
                          <p className="text-[12.5px] text-[var(--accent)] mt-1">
                            → {t.output}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                        <div className="w-[150px]">
                          <Select
                            value={t.status}
                            aria-label="Status"
                            onChange={(e) =>
                              setLearning(t.id, { status: e.target.value as LearningStatus })
                            }
                            className="h-9"
                          >
                            {LEARNING_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {LEARNING_STATUS_LABEL[s]}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <ConfidenceDots
                          value={t.confidence}
                          onChange={(v) => setLearning(t.id, { confidence: v })}
                        />
                        <Button
                          size="sm"
                          variant={t.practice_done ? 'secondary' : 'ghost'}
                          onClick={() => setLearning(t.id, { practice_done: !t.practice_done })}
                          title="Practice completed"
                        >
                          {t.practice_done ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />
                          ) : (
                            <CircleDashed className="h-3.5 w-3.5" />
                          )}
                          Practice
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const isOpen = openNotes === t.id;
                            setOpenNotes(isOpen ? null : t.id);
                            setDraft(t.notes);
                          }}
                        >
                          <NotebookPen className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Notes</span>
                          <ChevronDown
                            className={cn('h-3 w-3 transition-transform', openNotes === t.id && 'rotate-180')}
                          />
                        </Button>
                      </div>
                    </div>

                    {openNotes === t.id && (
                      <div className="mt-2.5">
                        <Textarea
                          value={draft}
                          placeholder="Your notes, mnemonics, links, questions to revisit…"
                          className="min-h-[70px] text-[13px]"
                          onChange={(e) => setDraft(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <Button size="sm" variant="ghost" onClick={() => setOpenNotes(null)}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setLearning(t.id, { notes: draft });
                              setOpenNotes(null);
                            }}
                          >
                            Save note
                          </Button>
                        </div>
                      </div>
                    )}
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

function statusScore(s: LearningStatus): number {
  return s === 'mastered' ? 100 : s === 'understood' ? 80 : s === 'needs_revision' ? 55 : s === 'learning' ? 35 : 0;
}

function worstStatus(topics: { status: LearningStatus }[]): LearningStatus {
  const order: LearningStatus[] = ['not_started', 'needs_revision', 'learning', 'understood', 'mastered'];
  for (const s of order) if (topics.some((t) => t.status === s)) return s;
  return 'not_started';
}

export default LearningPanel;
