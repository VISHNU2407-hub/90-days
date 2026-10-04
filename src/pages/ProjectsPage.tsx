import { useState } from 'react';
import {
  GitBranch,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/store';
import { projectSummaries, projectProgress } from '@/lib/compute';
import type { EntityStatus, Project, ProjectTask } from '@/lib/types';
import { ENTITY_STATUS_LABEL } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Progress,
  ProgressRing,
  SectionTitle,
  Select,
  Textarea,
} from '@/components/ui';

const STATUS_TONE: Record<EntityStatus, 'neutral' | 'accent' | 'success'> = {
  planned: 'neutral',
  in_progress: 'accent',
  completed: 'success',
};

const GROUP_TITLES: Record<ProjectTask['group_name'], string> = {
  milestone: 'Milestones',
  agent: 'AI-agent functionality',
  deliverable: 'Repository checklist',
  task: 'Tasks',
};

export default function ProjectsPage() {
  const data = useStore((s) => s.data);
  const showToast = useStore((s) => s.showToast);
  const toggleProjectTask = useStore((s) => s.toggleProjectTask);
  const addProjectTask = useStore((s) => s.addProjectTask);
  const deleteProjectTask = useStore((s) => s.deleteProjectTask);
  const updateProject = useStore((s) => s.updateProject);

  const [openId, setOpenId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [newTask, setNewTask] = useState<Record<string, string>>({});

  if (!data) return null;
  const projects = projectSummaries(data);

  const selected = projects.find((p) => p.id === openId) ?? null;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Projects"
        subtitle="2–3 meaningful projects plus the SATS major project."
      />

      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((p) => {
          const milestones = data.projectTasks.filter(
            (t) => t.project_id === p.id && t.group_name === 'milestone',
          );
          return (
            <Card
              key={p.id}
              className={cn(
                'p-5 transition-colors cursor-pointer min-w-0',
                openId === p.id && 'border-[var(--accent)]',
              )}
              onClick={() => setOpenId(openId === p.id ? null : p.id)}
            >
              <div className="flex items-start gap-4">
                <ProgressRing
                  value={p.pct}
                  size={78}
                  stroke={7}
                  tone={p.pct === 100 ? 'var(--success)' : 'var(--accent)'}
                />
                <div className="min-w-0 grow">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <h3 className="text-[15px] font-semibold tracking-tight truncate min-w-0">{p.name}</h3>
                    <Badge tone={STATUS_TONE[p.status]}>{ENTITY_STATUS_LABEL[p.status]}</Badge>
                  </div>
                  <p className="text-[13px] text-fg-muted mt-1">{p.purpose}</p>
                  <p className="text-[12.5px] text-[var(--accent)] mt-1">DoD: {p.definition_of_done}</p>
                </div>
              </div>

              <div className="mt-4">
                <Progress value={p.pct} tone={p.pct === 100 ? 'success' : 'accent'} />
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {milestones.map((m) => (
                    <span
                      key={m.id}
                      title={m.title}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] border',
                        m.done
                          ? 'bg-success-soft border-transparent text-[var(--success)]'
                          : 'bg-[var(--surface-2)] border-border text-fg-faint',
                      )}
                    >
                      {m.done ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />}
                      {m.title}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-[12.5px] text-fg-muted">
                <span className="tabular">
                  {p.done}/{p.total} items · {p.milestonesDone}/{p.milestonesTotal} milestones
                </span>
                <span className="inline-flex items-center gap-1 text-[var(--accent)]">
                  {openId === p.id ? 'Hide details' : 'Open details'}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {projects.length === 0 && (
        <Card>
          <EmptyState
            icon={<FolderKanban className="h-5 w-5" />}
            title="No projects yet"
          />
        </Card>
      )}

      {/* ------------------------- detail panel ------------------------- */}
      {selected && (
        <Card className="mt-5 p-5 animate-fade-up">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold tracking-tight">{selected.name}</h2>
                <Badge tone={STATUS_TONE[selected.status]}>{ENTITY_STATUS_LABEL[selected.status]}</Badge>
                <Badge tone={selected.pct === 100 ? 'success' : 'accent'}>{selected.pct}%</Badge>
              </div>
              <p className="text-[13.5px] text-fg-muted mt-1.5 max-w-3xl leading-relaxed">
                {selected.description}
              </p>
              <p className="text-[13px] mt-1.5">
                <span className="text-fg-faint">Goal:</span> {selected.goal}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setOpenId(null)}>
                Close
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-[12.5px] text-fg-muted">
            {selected.tech_stack && (
              <span>
                <span className="text-fg-faint">Stack:</span> {selected.tech_stack}
              </span>
            )}
            {selected.github_url && (
              <a
                href={selected.github_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[var(--accent)]"
              >
                <GitBranch className="h-3.5 w-3.5" /> GitHub
              </a>
            )}
            {selected.demo_url && (
              <a
                href={selected.demo_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[var(--accent)]"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Demo
              </a>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-5 mt-5">
            {(['milestone', 'agent', 'deliverable', 'task'] as const).map((group) => {
              const rows = data.projectTasks
                .filter((t) => t.project_id === selected.id && t.group_name === group)
                .sort((a, b) => a.sort - b.sort);
              if (!rows.length) return null;
              const done = rows.filter((r) => r.done).length;
              return (
                <div key={group} className={cn(group === 'task' && 'lg:col-span-2')}>
                  <SectionTitle
                    action={
                      <span className="text-[12px] tabular text-fg-muted">
                        {done}/{rows.length}
                      </span>
                    }
                  >
                    {GROUP_TITLES[group]}
                  </SectionTitle>
                  <Card className="divide-y divide-border">
                    {rows.map((t) => (
                      <div key={t.id} className="flex items-start gap-3 px-3.5 py-2.5">
                        <span className="mt-0.5">
                          <Checkbox checked={t.done} onChange={() => toggleProjectTask(t.id)} />
                        </span>
                        <div className="grow min-w-0">
                          <p
                            className={cn(
                              'text-[13.5px] leading-snug',
                              t.done && 'line-through text-fg-muted',
                            )}
                          >
                            {t.title}
                          </p>
                          {t.detail && <p className="text-[12px] text-fg-faint mt-0.5">{t.detail}</p>}
                        </div>
                        {group === 'task' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Delete task"
                            onClick={() => deleteProjectTask(t.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}

                    {group === 'task' && (
                      <div className="flex gap-2 px-3.5 py-3 bg-[var(--surface-2)]">
                        <Input
                          placeholder="Add a custom task…"
                          className="h-9"
                          value={newTask[selected.id] ?? ''}
                          onChange={(e) =>
                            setNewTask((p) => ({ ...p, [selected.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (newTask[selected.id] ?? '').trim()) {
                              addProjectTask({
                                project_id: selected.id,
                                group_name: 'task',
                                title: (newTask[selected.id] ?? '').trim(),
                                detail: '',
                                done: false,
                                due_day: null,
                                sort: rows.length + 1,
                              });
                              setNewTask((p) => ({ ...p, [selected.id]: '' }));
                              showToast('Task added');
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const title = (newTask[selected.id] ?? '').trim();
                            if (!title) return;
                            addProjectTask({
                              project_id: selected.id,
                              group_name: 'task',
                              title,
                              detail: '',
                              done: false,
                              due_day: null,
                              sort: rows.length + 1,
                            });
                            setNewTask((p) => ({ ...p, [selected.id]: '' }));
                            showToast('Task added');
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>

          <ProjectEditModal
            project={selected as Project}
            open={editOpen}
            onClose={() => setEditOpen(false)}
            onSave={(patch) => {
              updateProject(selected.id, patch);
              setEditOpen(false);
              showToast('Project updated');
            }}
          />
        </Card>
      )}
    </div>
  );
}

function ProjectEditModal({
  project,
  open,
  onClose,
  onSave,
}: {
  project: Project;
  open: boolean;
  onClose: () => void;
  onSave: (patch: Partial<Project>) => void;
}) {
  const [form, setForm] = useState({
    name: project.name,
    description: project.description,
    goal: project.goal,
    tech_stack: project.tech_stack,
    github_url: project.github_url,
    demo_url: project.demo_url,
    status: project.status,
  });
  const [key, setKey] = useState(project.id);
  if (key !== project.id || (open && key === '')) {
    setKey(project.id);
    setForm({
      name: project.name,
      description: project.description,
      goal: project.goal,
      tech_stack: project.tech_stack,
      github_url: project.github_url,
      demo_url: project.demo_url,
      status: project.status,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit project"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onSave(form)}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Goal">
            <Textarea
              className="min-h-[60px]"
              value={form.goal}
              onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
            />
          </Field>
        </div>
        <Field label="Tech stack">
          <Input
            value={form.tech_stack}
            onChange={(e) => setForm((f) => ({ ...f, tech_stack: e.target.value }))}
          />
        </Field>
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as EntityStatus }))}
          >
            {(['planned', 'in_progress', 'completed'] as const).map((s) => (
              <option key={s} value={s}>
                {ENTITY_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="GitHub URL">
          <Input
            value={form.github_url}
            onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))}
            placeholder="https://github.com/…"
          />
        </Field>
        <Field label="Demo URL">
          <Input
            value={form.demo_url}
            onChange={(e) => setForm((f) => ({ ...f, demo_url: e.target.value }))}
            placeholder="https://…"
          />
        </Field>
      </div>
    </Modal>
  );
}
