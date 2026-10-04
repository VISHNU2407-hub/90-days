import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Code2,
  Timer,
  RefreshCw,
  Lightbulb,
  Flame,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '@/store';
import { dsaStats, dueRevisions, getDayInfo } from '@/lib/compute';
import type { Difficulty, DsaProblem, DsaStatus } from '@/lib/types';
import { DSA_STATUSES, DSA_STATUS_LABEL } from '@/lib/types';
import { cn, formatDuration, todayKey } from '@/lib/utils';
import { COMPLEXITY_RULE, DSA_CHECKPOINT, DSA_DAILY_TARGET, DSA_WEEK_STRUCTURE } from '@/lib/seed/roadmap';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Progress,
  ProgressRing,
  SectionTitle,
  Select,
  Tabs,
  Textarea,
} from '@/components/ui';
import { StatCard } from '@/components/shared';

const STATUS_TONE: Record<DsaStatus, 'neutral' | 'accent' | 'success' | 'warning' | 'violet'> = {
  not_started: 'neutral',
  attempted: 'warning',
  solved: 'success',
  needs_revision: 'warning',
  mastered: 'violet',
};

const DIFF_TONE: Record<Difficulty, 'success' | 'warning' | 'danger'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

export default function DsaPage() {
  const data = useStore((s) => s.data);
  const addProblem = useStore((s) => s.addProblem);
  const updateProblem = useStore((s) => s.updateProblem);
  const deleteProblems = useStore((s) => s.deleteProblems);
  const addAttempt = useStore((s) => s.addAttempt);
  const showToast = useStore((s) => s.showToast);
  const [tab, setTab] = useState('overview');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DsaProblem | null>(null);
  const [query, setQuery] = useState('');
  const [filterPattern, setFilterPattern] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const stats = data ? dsaStats(data) : null;
  const revisions = data ? dueRevisions(data) : [];

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.problems
      .filter((p) => {
        if (filterPattern !== 'all' && p.pattern !== filterPattern) return false;
        if (filterStatus !== 'all' && p.status !== filterStatus) return false;
        if (query.trim()) {
          const q = query.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.pattern.toLowerCase().includes(q) ||
            p.platform.toLowerCase().includes(q) ||
            p.notes.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  }, [data, query, filterPattern, filterStatus]);

  if (!data || !stats) return null;

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="DSA Tracker"
        action={
          <Button variant="primary" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add problem
          </Button>
        }
      />

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'problems', label: 'Problems', count: data.problems.length },
          { id: 'revisions', label: 'Revisions', count: revisions.length },
        ]}
      />

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Solved"
              value={`${stats.solved} / ${stats.target}`}
              sub={`${stats.pct}% of the 100–150 target`}
              icon={<Code2 className="h-4 w-4" />}
              tone="accent"
            />
            <Card className="p-4 flex items-center gap-4">
              <ProgressRing value={stats.pct} size={76} stroke={7} />
              <div>
                <div className="text-[12px] uppercase tracking-wider text-fg-faint">Pattern goal</div>
                <div className="text-[15px] font-semibold tabular mt-0.5">
                  {stats.patternsOnTrack}/{stats.patterns.length}
                </div>
                <div className="text-[12px] text-fg-muted">patterns on track</div>
              </div>
            </Card>
            <StatCard
              label="Difficulty split"
              value={
                <span className="text-[18px]">
                  <span className="text-[var(--success)]">{stats.easy}</span>
                  <span className="text-fg-faint"> / </span>
                  <span className="text-[var(--warning)]">{stats.medium}</span>
                  <span className="text-fg-faint"> / </span>
                  <span className="text-[var(--danger)]">{stats.hard}</span>
                </span>
              }
              sub="easy / medium / hard solved"
            />
            <StatCard
              label="DSA streak"
              value={`${stats.streak} days`}
              sub={`${stats.avgTime ? formatDuration(stats.avgTime) : '—'} avg solve time`}
              icon={<Flame className="h-4 w-4" />}
              tone="warning"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Needs revision" value={stats.needsRevision} sub="flagged problems" tone={stats.needsRevision ? 'warning' : 'neutral'} icon={<RefreshCw className="h-4 w-4" />} />
            <StatCard label="Solved without hints" value={stats.withoutHints} sub={`${stats.withHints} used hints`} icon={<Lightbulb className="h-4 w-4" />} />
            <StatCard label="Revision due" value={revisions.length} sub={revisions.length ? 'dates passed' : 'all clear'} tone={revisions.length ? 'danger' : 'success'} />
            <StatCard label="Logged" value={stats.totalLogged} sub={`${stats.attempted} attempted, not solved`} />
          </div>

          <div>
            <SectionTitle action={<span className="text-[12px] text-fg-muted">Plan target</span>}>
              Pattern progress
            </SectionTitle>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.patterns.map((p) => (
                <Card key={p.id} className="p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13.5px] font-medium truncate">{p.name}</span>
                    <span
                      className={cn(
                        'text-[12.5px] tabular',
                        p.onTrack ? 'text-[var(--success)]' : 'text-fg-muted',
                      )}
                    >
                      {p.solved} / {p.target}
                    </span>
                  </div>
                  <Progress
                    value={p.pct}
                    className="mt-2"
                    tone={p.pct >= 100 ? 'success' : p.pct >= 50 ? 'accent' : 'warning'}
                    height={7}
                  />
                  <div className="flex items-center justify-between mt-2 text-[11.5px] text-fg-faint">
                    <span>{p.pct}%</span>
                    <span>
                      weeks {p.week_from}–{p.week_to}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="p-4">
            <p className="text-[13px] font-semibold mb-1">DSA checkpoint</p>
            <p className="text-[13px] text-fg-muted leading-relaxed">{DSA_CHECKPOINT}</p>
            <p className="text-[12.5px] text-fg-faint leading-relaxed mt-2 pt-2 border-t border-border">{COMPLEXITY_RULE}</p>
          </Card>

          <Card className="p-4">
            <p className="text-[13px] font-semibold mb-2">Daily DSA target (normal day)</p>
            <div className="space-y-1.5">
              {DSA_DAILY_TARGET.map((t) => (
                <div key={t.part} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="text-fg-muted">{t.part}</span>
                  <span className="tabular text-fg-faint shrink-0">{t.time}</span>
                </div>
              ))}
            </div>
            <p className="text-[12.5px] text-fg-muted mt-3 pt-3 border-t border-border leading-relaxed">
              Weekly structure: {DSA_WEEK_STRUCTURE.map((s) => `${s.day} — ${s.focus}`).join(' · ')}
            </p>
          </Card>
        </div>
      )}

      {tab === 'problems' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-faint" />
              <Input
                className="pl-9"
                placeholder="Search problems, patterns, notes…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select
              className="sm:w-52"
              value={filterPattern}
              onChange={(e) => setFilterPattern(e.target.value)}
            >
              <option value="all">All patterns</option>
              {data.patterns.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Select
              className="sm:w-44"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All statuses</option>
              {DSA_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {DSA_STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </div>

          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Code2 className="h-5 w-5" />}
                title={data.problems.length ? 'No problems match these filters' : 'No problems logged yet'}
                body={
                  data.problems.length
                    ? 'Try clearing the filters.'
                    : 'Log the first problem you solve — pattern, difficulty, time and any mistake.'
                }
                action={
                  <Button variant="primary" onClick={openNew}>
                    <Plus className="h-4 w-4" /> Add problem
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((p) => (
                <Card key={p.id} className="p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          className="text-[14px] font-medium hover:text-[var(--accent)] text-left"
                          onClick={() => setEditing(p)}
                        >
                          {p.name}
                        </button>
                        <Badge tone={STATUS_TONE[p.status]}>{DSA_STATUS_LABEL[p.status]}</Badge>
                        <Badge tone={DIFF_TONE[p.difficulty]}>{p.difficulty}</Badge>
                        <Badge tone="neutral">{p.pattern}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11.5px] text-fg-faint">
                        {p.platform && <span>{p.platform}</span>}
                        {p.time_complexity && (
                          <span className="font-mono">time {p.time_complexity}</span>
                        )}
                        {p.space_complexity && (
                          <span className="font-mono">space {p.space_complexity}</span>
                        )}
                        {p.time_minutes > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Timer className="h-3 w-3" /> {formatDuration(p.time_minutes)}
                          </span>
                        )}
                        {p.needed_hint && (
                          <span className="inline-flex items-center gap-1 text-[var(--warning)]">
                            <Lightbulb className="h-3 w-3" /> used hint
                          </span>
                        )}
                        {p.revision_date && (
                          <span
                            className={cn(
                              'inline-flex items-center gap-1',
                              p.revision_date <= todayKey() && 'text-[var(--danger)]',
                            )}
                          >
                            <RefreshCw className="h-3 w-3" /> revise {p.revision_date}
                          </span>
                        )}
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 hover:text-[var(--accent)]"
                          >
                            <ExternalLink className="h-3 w-3" /> open
                          </a>
                        )}
                      </div>
                      {p.mistake && (
                        <p className="text-[12.5px] text-[var(--warning)] mt-1.5">
                          Mistake: {p.mistake}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>
                        Edit
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete problem"
                        onClick={() => {
                          deleteProblems([p.id]);
                          showToast('Problem removed', 'info');
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'revisions' && (
        <div className="space-y-4">
          <Card className="p-4 border-l-2 border-l-[var(--warning)]">
            <p className="text-[13.5px] font-medium">
              {revisions.length} problem{revisions.length === 1 ? '' : 's'} due now
            </p>
            <p className="text-[13px] text-fg-muted mt-1">
              Retry after 3–7 days and again before each phase checkpoint.
            </p>
          </Card>

          {revisions.length === 0 ? (
            <Card>
              <EmptyState
                icon={<RefreshCw className="h-5 w-5" />}
                title="Nothing due for revision"
                body="Set a revision date when you log a problem."
                action={
                  <Button onClick={openNew}>
                    <Plus className="h-4 w-4" /> Log a problem
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="space-y-2.5">
              {revisions.map((p) => (
                <Card key={p.id} className="p-3.5 flex items-center gap-3">
                  <RefreshCw className="h-4 w-4 text-[var(--warning)] shrink-0" />
                  <div className="grow min-w-0">
                    <p className="text-[14px] font-medium truncate">{p.name}</p>
                    <p className="text-[12px] text-fg-faint">
                      {p.pattern} · due {p.revision_date}
                      {p.mistake ? ` · last mistake: ${p.mistake}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateProblem(p.id, {
                          status: 'mastered',
                          revision_date: null,
                        })
                      }
                    >
                      Mastered
                    </Button>
                    <Button size="sm" onClick={() => setEditing(p)}>
                      Re-solve
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <ProblemForm
        open={formOpen || !!editing}
        problem={editing}
        patterns={data.patterns.map((p) => p.name)}
        attempts={editing ? data.attempts.filter((a) => a.problem_id === editing.id) : []}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={(values) => {
          if (editing) {
            updateProblem(editing.id, values);
            showToast('Problem updated');
          } else {
            addProblem(values);
          }
          setFormOpen(false);
          setEditing(null);
        }}
        onDelete={(id) => {
          deleteProblems([id]);
          setFormOpen(false);
          setEditing(null);
        }}
        onAddAttempt={(attempt) => {
          if (editing) addAttempt({ ...attempt, problem_id: editing.id });
        }}
      />
    </div>
  );
}

/* ------------------------------ problem form --------------------------- */

type FormValues = Omit<DsaProblem, 'id' | 'created_at'>;

const emptyValues: FormValues = {
  name: '',
  platform: 'LeetCode',
  url: '',
  pattern: 'Arrays',
  difficulty: 'medium',
  status: 'solved',
  time_complexity: '',
  space_complexity: '',
  time_minutes: 0,
  needed_hint: false,
  notes: '',
  mistake: '',
  revision_date: '',
  solved_at: null,
};

function ProblemForm({
  open,
  problem,
  patterns,
  attempts,
  onClose,
  onSubmit,
  onDelete,
  onAddAttempt,
}: {
  open: boolean;
  problem: DsaProblem | null;
  patterns: string[];
  attempts: { id: string; date_key: string; outcome: string; minutes: number; notes: string }[];
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
  onDelete: (id: string) => void;
  onAddAttempt: (a: { date_key: string; outcome: 'solved' | 'stuck' | 'revised' | 'hinted'; minutes: number; notes: string }) => void;
}) {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [key, setKey] = useState('');
  const [attempt, setAttempt] = useState({ outcome: 'revised', minutes: 20, notes: '' });

  const currentKey = problem?.id ?? (open ? 'new' : '');
  if (currentKey !== key) {
    setKey(currentKey);
    setValues(
      problem
        ? {
            name: problem.name,
            platform: problem.platform,
            url: problem.url,
            pattern: problem.pattern,
            difficulty: problem.difficulty,
            status: problem.status,
            time_complexity: problem.time_complexity ?? '',
            space_complexity: problem.space_complexity ?? '',
            time_minutes: problem.time_minutes,
            needed_hint: problem.needed_hint,
            notes: problem.notes,
            mistake: problem.mistake,
            revision_date: problem.revision_date ?? '',
            solved_at: problem.solved_at,
          }
        : emptyValues,
    );
  }

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) =>
    setValues((p) => ({ ...p, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={problem ? 'Edit problem' : 'Add problem'}
      wide
      footer={
        <>
          {problem && (
            <Button
              variant="danger"
              className="mr-auto"
              onClick={() => onDelete(problem.id)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!values.name.trim()}
            onClick={() =>
              onSubmit({
                ...values,
                time_minutes: Number(values.time_minutes) || 0,
                revision_date: values.revision_date || null,
                solved_at:
                  ['solved', 'needs_revision', 'mastered'].includes(values.status)
                    ? (values.solved_at ?? new Date().toISOString())
                    : null,
              })
            }
          >
            {problem ? 'Save changes' : 'Log problem'}
          </Button>
        </>
      }
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field label="Problem name">
            <Input
              value={values.name}
              autoFocus
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Two Sum"
            />
          </Field>
        </div>
        <Field label="Platform">
          <Select value={values.platform} onChange={(e) => set('platform', e.target.value)}>
            {['LeetCode', 'HackerRank', 'GeeksforGeeks', 'Codeforces', 'CodeStudio', 'InterviewBit', 'Other'].map(
              (p) => (
                <option key={p}>{p}</option>
              ),
            )}
          </Select>
        </Field>
        <Field label="Link">
          <Input
            value={values.url}
            onChange={(e) => set('url', e.target.value)}
            placeholder="https://…"
          />
        </Field>
        <Field label="Pattern">
          <Select value={values.pattern} onChange={(e) => set('pattern', e.target.value)}>
            {patterns.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </Select>
        </Field>
        <Field label="Difficulty">
          <Select value={values.difficulty} onChange={(e) => set('difficulty', e.target.value as Difficulty)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={values.status} onChange={(e) => set('status', e.target.value as DsaStatus)}>
            {DSA_STATUSES.map((s) => (
              <option key={s} value={s}>
                {DSA_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Time complexity">
          <Input
            value={values.time_complexity}
            onChange={(e) => set('time_complexity', e.target.value)}
            placeholder="e.g. O(n)"
          />
        </Field>
        <Field label="Space complexity">
          <Input
            value={values.space_complexity}
            onChange={(e) => set('space_complexity', e.target.value)}
            placeholder="e.g. O(1)"
          />
        </Field>
        <Field label="Time taken (minutes)">
          <Input
            type="number"
            min={0}
            value={values.time_minutes}
            onChange={(e) => set('time_minutes', Number(e.target.value))}
          />
        </Field>
        <div className="sm:col-span-2 flex items-center gap-6 pt-1">
          <label className="flex items-center gap-2 text-[13.5px] cursor-pointer">
            <input
              type="checkbox"
              checked={values.needed_hint}
              onChange={(e) => set('needed_hint', e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Needed a hint
          </label>
          <Field label="Revision date">
            <Input
              type="date"
              value={values.revision_date ?? ''}
              onChange={(e) => set('revision_date', e.target.value)}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Mistake">
            <Textarea
              value={values.mistake}
              onChange={(e) => set('mistake', e.target.value)}
              placeholder="e.g. forgot to check empty input; over-complicated the two-pointer condition"
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Notes">
            <Textarea
              value={values.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Approach, invariant, complexity, why the solution works…"
            />
          </Field>
        </div>
      </div>

      {problem && (
        <div className="mt-5 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-fg-faint">
              Attempts
            </h4>
            <span className="text-[12px] text-fg-muted tabular">{attempts.length}</span>
          </div>

          <div className="flex flex-wrap gap-2 items-end">
            <div className="grow min-w-[130px]">
              <Field label="Outcome">
                <Select
                  value={attempt.outcome}
                  onChange={(e) => setAttempt((a) => ({ ...a, outcome: e.target.value }))}
                >
                  <option value="revised">Revised</option>
                  <option value="solved">Solved</option>
                  <option value="hinted">Used hint</option>
                  <option value="stuck">Stuck</option>
                </Select>
              </Field>
            </div>
            <div className="w-24">
              <Field label="Minutes">
                <Input
                  type="number"
                  min={0}
                  value={attempt.minutes}
                  onChange={(e) => setAttempt((a) => ({ ...a, minutes: Number(e.target.value) }))}
                />
              </Field>
            </div>
            <Button
              onClick={() => {
                onAddAttempt({
                  date_key: todayKey(),
                  outcome: attempt.outcome as 'solved' | 'stuck' | 'revised' | 'hinted',
                  minutes: Number(attempt.minutes) || 0,
                  notes: attempt.notes,
                });
                setAttempt({ outcome: 'revised', minutes: 20, notes: '' });
              }}
            >
              Log attempt
            </Button>
          </div>

          <div className="mt-3 space-y-1.5">
            {attempts.length === 0 && (
              <p className="text-[13px] text-fg-faint">No attempts logged yet.</p>
            )}
            {attempts.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 text-[13px] py-1.5 border-b border-border last:border-0"
              >
                <Badge tone={a.outcome === 'solved' ? 'success' : a.outcome === 'stuck' ? 'danger' : 'neutral'}>
                  {a.outcome}
                </Badge>
                <span className="text-fg-faint tabular">{a.date_key}</span>
                <span className="text-fg-muted tabular">{a.minutes}m</span>
                {a.notes && <span className="truncate text-fg-muted">{a.notes}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
