import { useState } from 'react';
import { ChevronRight, Sparkles, Bot, ArrowRight, Plus, Trash2, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LearningPanel } from '@/components/LearningPanel';
import { useStore } from '@/store';
import { trackStats } from '@/lib/compute';
import { AGENT_PROGRESSION, AGENT_LEVELS, RAG_PROJECT_RULES, RAG_NOTE, AGENT_PROJECT_A, AGENT_PROJECT_B, MAJOR_AGENT_PROJECT } from '@/lib/seed/learning';
import { LEARNING_STATUS_SCORE } from '@/lib/types';
import { cn, todayKey } from '@/lib/utils';
import { Badge, Button, Card, Field, Input, PageHeader, Progress, SectionTitle, Tabs, Checkbox } from '@/components/ui';

const PROGRESSION_MAP: Record<string, string> = {
  LLM: 'LLMs and API usage',
  'Structured Output': 'Structured outputs (JSON schema)',
  'Tool Calling': 'Tool calling',
  Workflows: 'Workflows',
  RAG: 'RAG pipeline: retrieval → context → answer',
  Memory: 'Memory',
  Evaluation: 'Evaluation',
  'Reliable Agents': 'Reliability',
};

export default function GenAiPage() {
  const [tab, setTab] = useState('genai');
  const data = useStore((s) => s.data);

  const statusFor = (title: string) =>
    data?.learning.find((t) => t.title === title)?.status ?? 'not_started';

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="GenAI & AI Agents"
        subtitle="LLMs, prompting, embeddings, vector DB, RAG — then tool calling, workflows, memory, evaluation and reliability."
      />

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'genai', label: 'GenAI & RAG', icon: <Sparkles className="h-3.5 w-3.5" /> },
          { id: 'agents', label: 'AI Agents', icon: <Bot className="h-3.5 w-3.5" /> },
        ]}
      />

      {tab === 'genai' && (
        <>
          <Card className="p-5 mb-5">
            <SectionTitle>Build sequence — earn each step</SectionTitle>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
              {AGENT_PROGRESSION.map((step, i) => {
                const status = statusFor(PROGRESSION_MAP[step] ?? '');
                const learned = LEARNING_STATUS_SCORE[status] >= 80;
                return (
                  <div key={step} className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium border',
                        learned
                          ? 'bg-success-soft border-transparent text-[var(--success)]'
                          : status === 'learning' || status === 'needs_revision'
                            ? 'bg-accent-soft border-transparent text-[var(--accent)]'
                            : 'bg-[var(--surface-2)] border-border text-fg-muted',
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          learned ? 'bg-[var(--success)]' : status === 'not_started' ? 'bg-border-strong' : 'bg-[var(--accent)]',
                        )}
                      />
                      {step}
                    </span>
                    {i < AGENT_PROGRESSION.length - 1 && (
                      <ChevronRight className="h-3.5 w-3.5 text-fg-faint" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <LearningPanel
            track="genai"
            extra={
              <Card className="p-5">
                <SectionTitle
                  action={
                    <Link to="/projects" className="text-[12.5px] text-[var(--accent)] hover:underline inline-flex items-center gap-1">
                      Project 2 <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  }
                >
                  Project 2 — GenAI / RAG application
                </SectionTitle>
                <ul className="space-y-2.5 text-[13.5px]">
                  {RAG_PROJECT_RULES.map((r) => (
                    <li key={r} className="text-fg-muted">
                      {r}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 pt-3 border-t border-border text-[13px] text-[var(--warning)]">
                  {RAG_NOTE}
                </p>
              </Card>
            }
          />
        </>
      )}

      {tab === 'agents' && (
        <>
          <AgentLevels />

          <LearningPanel
            track="agent"
            extra={
              <div className="grid lg:grid-cols-3 gap-4">
                <AgentRule title="Agent Project A — small practical agent" body={AGENT_PROJECT_A} />
                <AgentRule title="Agent Project B — RAG + tools" body={AGENT_PROJECT_B} />
                <AgentRule title="Major Agent Project" body={MAJOR_AGENT_PROJECT.join(' · ')} />
              </div>
            }
          />
        </>
      )}

      <AiUpdateTracker />
    </div>
  );
}

/* ---------------------- weekly AI update tracker ---------------------- */

function AiUpdateTracker() {
  const data = useStore((s) => s.data);
  const addAiUpdate = useStore((s) => s.addAiUpdate);
  const updateAiUpdate = useStore((s) => s.updateAiUpdate);
  const deleteAiUpdate = useStore((s) => s.deleteAiUpdate);
  const [form, setForm] = useState({ date_key: todayKey(), topic: '', changed: '', learned: '' });

  if (!data) return null;

  return (
    <Card className="p-5 mt-5">
      <SectionTitle
        action={<Badge tone="warning">30–60 min / week max</Badge>}
      >
        <span className="inline-flex items-center gap-1.5">
          <Newspaper className="h-3.5 w-3.5" /> Weekly AI update tracker
        </span>        </SectionTitle>

      <div className="grid sm:grid-cols-[130px_1fr_1fr_1fr_auto] gap-2 items-end">
        <Field label="Date">
          <Input
            type="date"
            value={form.date_key}
            onChange={(e) => setForm((f) => ({ ...f, date_key: e.target.value }))}
          />
        </Field>
        <Field label="Tool / model / topic">
          <Input
            value={form.topic}
            placeholder="New embedding model release"
            onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
          />
        </Field>
        <Field label="What changed?">
          <Input
            value={form.changed}
            placeholder="Cheaper, longer context"
            onChange={(e) => setForm((f) => ({ ...f, changed: e.target.value }))}
          />
        </Field>
        <Field label="What I learned">
          <Input
            value={form.learned}
            placeholder="Retrieval quality improved for…"
            onChange={(e) => setForm((f) => ({ ...f, learned: e.target.value }))}
          />
        </Field>
        <Button
          disabled={!form.topic.trim()}
          onClick={() => {
            addAiUpdate({ ...form, tried: false });
            setForm({ date_key: todayKey(), topic: '', changed: '', learned: '' });
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 divide-y divide-border">
        {data.aiUpdates.length === 0 && (
          <p className="text-[13px] text-fg-faint py-2">No entries yet this cycle.</p>
        )}
        {[...data.aiUpdates]
          .sort((a, b) => b.date_key.localeCompare(a.date_key))
          .map((row) => (
            <div key={row.id} className="flex items-start gap-3 py-2.5 text-[13px]">
              <span className="w-24 shrink-0 text-fg-faint tabular">{row.date_key}</span>
              <div className="grow min-w-0">
                <p className="font-medium">{row.topic}</p>
                <p className="text-fg-muted text-[12.5px]">
                  {row.changed && <>Changed: {row.changed} · </>}
                  {row.learned && <>Learned: {row.learned}</>}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[12px] text-fg-faint">Tried?</span>
                <Checkbox
                  checked={row.tried}
                  onChange={() => updateAiUpdate(row.id, { tried: !row.tried })}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Delete entry"
                  onClick={() => deleteAiUpdate(row.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}

function AgentLevels() {
  const data = useStore((s) => s.data);
  if (!data) return null;
  const agent = trackStats(data, 'agent');

  return (
    <Card className="p-5 mb-5">
      <SectionTitle action={<span className="text-[12.5px] text-fg-muted tabular">{agent.pct}% overall</span>}>
        Agent capability levels L1 → L8
      </SectionTitle>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {AGENT_LEVELS.map((l) => {
          const topics = agent.topics.filter((t) => t.group_name === l.level);
          const pct = topics.length
            ? Math.round(topics.reduce((s, t) => s + LEARNING_STATUS_SCORE[t.status], 0) / topics.length)
            : 0;
          return (
            <div key={l.level} className="rounded-xl bg-[var(--surface-2)] border border-border p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[var(--accent)]">{l.level}</span>
                <span className="text-[11.5px] tabular text-fg-muted">{pct}%</span>
              </div>
              <p className="text-[13.5px] font-medium mt-1">{l.capability}</p>
              <p className="text-[12px] text-fg-faint mt-1 leading-relaxed">{l.evidence}</p>
              <Progress value={pct} className="mt-2.5" height={6} tone={pct >= 80 ? 'success' : 'accent'} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AgentRule({ title, body }: { title: string; body: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge tone="accent">{title.split('—')[0].trim()}</Badge>
      </div>
      <p className="text-[13.5px] font-medium">{title.split('—')[1]?.trim()}</p>
      <p className="text-[12.5px] text-fg-muted mt-2 leading-relaxed">{body}</p>
    </Card>
  );
}
