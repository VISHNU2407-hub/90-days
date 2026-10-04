import { useState } from 'react';
import { Award, Plus, Trash2, ExternalLink, GraduationCap } from 'lucide-react';
import { useStore } from '@/store';
import type { Certification, EntityStatus } from '@/lib/types';
import { ENTITY_STATUS_LABEL } from '@/lib/types';
import { formatShortDate } from '@/lib/utils';
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
  SectionTitle,
  Select,
  Textarea,
} from '@/components/ui';

const STATUS_TONE: Record<EntityStatus, 'neutral' | 'accent' | 'success'> = {
  planned: 'neutral',
  in_progress: 'accent',
  completed: 'success',
};

const emptyCert: Omit<Certification, 'id'> = {
  name: '',
  provider: '',
  url: '',
  start_date: null,
  target_date: null,
  status: 'planned',
  progress: 0,
  certificate_url: '',
  related_project: '',
  notes: '',
};

export default function CertificationsPage() {
  const data = useStore((s) => s.data);
  const addCertification = useStore((s) => s.addCertification);
  const updateCertification = useStore((s) => s.updateCertification);
  const deleteCertification = useStore((s) => s.deleteCertification);
  const showToast = useStore((s) => s.showToast);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Certification, 'id'>>(emptyCert);

  if (!data) return null;

  const active = data.certifications.filter((c) => c.status !== 'planned');
  const completed = data.certifications.filter((c) => c.status === 'completed');

  const openNew = () => {
    setForm(emptyCert);
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (c: Certification) => {
    const { id, ...rest } = c;
    setForm(rest);
    setEditingId(id);
    setOpen(true);
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Certifications"
        subtitle="Two to three meaningful certifications maximum."
        action={
          <Button variant="primary" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add certification
          </Button>
        }
      />

      <Card className="p-4 mb-5 border-l-2 border-l-[var(--accent)]">
        <p className="text-[13.5px] font-medium">
          {completed.length} completed · {active.length} active
        </p>
      </Card>

      {data.certifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={<GraduationCap className="h-5 w-5" />}
            title="No certifications tracked"
            body="Add your first certification."
            action={
              <Button variant="primary" onClick={openNew}>
                Add certification
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.certifications.map((c) => (
            <Card key={c.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Award className="h-4 w-4 text-[var(--warning)] shrink-0" />
                    <h3 className="font-semibold tracking-tight truncate">{c.name}</h3>
                  </div>
                  <p className="text-[12.5px] text-fg-muted mt-0.5">
                    {c.provider || 'Provider not set'}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[c.status]}>{ENTITY_STATUS_LABEL[c.status]}</Badge>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[12.5px] text-fg-muted mb-1.5">
                  <span>Progress</span>
                  <span className="tabular">{c.progress}%</span>
                </div>
                <Progress
                  value={c.progress}
                  tone={c.status === 'completed' ? 'success' : 'accent'}
                  height={7}
                />
              </div>

              <div className="mt-3 space-y-1 text-[12.5px] text-fg-muted grow">
                <div className="flex justify-between gap-3">
                  <span className="text-fg-faint">Start</span>
                  <span className="tabular">{formatShortDate(c.start_date)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-fg-faint">Target</span>
                  <span className="tabular">{formatShortDate(c.target_date)}</span>
                </div>
                {c.related_project && (
                  <div className="flex justify-between gap-3">
                    <span className="text-fg-faint">Related project</span>
                    <span className="truncate text-right">{c.related_project}</span>
                  </div>
                )}
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[var(--accent)] hover:underline pt-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Course page
                  </a>
                )}
              </div>

              {c.notes && (
                <p className="text-[12.5px] text-fg-faint mt-2 pt-2 border-t border-border leading-relaxed">
                  {c.notes}
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <Button size="sm" className="grow" onClick={() => openEdit(c)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Delete certification"
                  onClick={() => {
                    deleteCertification(c.id);
                    showToast('Certification removed', 'info');
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? 'Edit certification' : 'Add certification'}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!form.name.trim()}
              onClick={() => {
                if (editingId) {
                  updateCertification(editingId, form);
                  showToast('Certification updated');
                } else {
                  addCertification(form);
                  showToast('Certification added');
                }
                setOpen(false);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Certification name" hint="e.g. Generative AI, Machine Learning, Cloud AI">
              <Input
                autoFocus
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="Provider">
            <Input
              value={form.provider}
              onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
              placeholder="Coursera, NPTEL, Google Cloud…"
            />
          </Field>
          <Field label="Course URL">
            <Input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://…"
            />
          </Field>
          <Field label="Start date">
            <Input
              type="date"
              value={form.start_date ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value || null }))}
            />
          </Field>
          <Field label="Target date">
            <Input
              type="date"
              value={form.target_date ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value || null }))}
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
          <Field label="Progress (%)">
            <Input
              type="number"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => setForm((f) => ({ ...f, progress: Math.min(100, Number(e.target.value)) }))}
            />
          </Field>
          <Field label="Certificate URL / file">
            <Input
              value={form.certificate_url}
              onChange={(e) => setForm((f) => ({ ...f, certificate_url: e.target.value }))}
              placeholder="https://…"
            />
          </Field>
          <Field label="Related project">
            <Input
              value={form.related_project}
              onChange={(e) => setForm((f) => ({ ...f, related_project: e.target.value }))}
              placeholder="Project 2 — GenAI / RAG"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes / reflection">
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="What you learned and what you built from it."
              />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
