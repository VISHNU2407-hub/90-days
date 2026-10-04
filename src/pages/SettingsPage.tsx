import { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  HardDrive,
} from 'lucide-react';
import { useStore } from '@/store';
import type { ThemeMode } from '@/lib/types';
import { CATEGORIES, CATEGORY_LABEL } from '@/lib/types';
import { cn, todayKey, formatDuration, relativeDay } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Modal,
  PageHeader,
  SectionTitle,
  Select,
  Switch,
} from '@/components/ui';

export default function SettingsPage() {
  const data = useStore((s) => s.data);
  const saveSettings = useStore((s) => s.saveSettings);
  const rename = useStore((s) => s.rename);
  const exportData = useStore((s) => s.exportData);
  const resetProgress = useStore((s) => s.resetProgress);
  const addSession = useStore((s) => s.addSession);
  const deleteSession = useStore((s) => s.deleteSession);
  const showToast = useStore((s) => s.showToast);

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [session, setSession] = useState({ date_key: todayKey(), minutes: 60, category: 'dsa', note: '' });

  if (!data || !data.settings) return null;
  const s = data.settings;

  const themes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { id: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { id: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Settings"
        subtitle="Your plan dates, workload, appearance and data."
      />

      <div className="grid lg:grid-cols-2 gap-4">
        {/* --------------------------- profile --------------------------- */}
        <Card className="p-5">
          <SectionTitle>Profile</SectionTitle>
          <div className="space-y-4">
            <Field label="Name">
              <div className="flex gap-2">
                <Input
                  value={nameDraft ?? data.profile?.name ?? ''}
                  onChange={(e) => setNameDraft(e.target.value)}
                />
                <Button
                  onClick={() => {
                    const v = (nameDraft ?? data.profile?.name ?? '').trim();
                    if (!v) return;
                    rename(v);
                    setNameDraft(null);
                    showToast('Name updated');
                  }}
                  disabled={(nameDraft ?? data.profile?.name ?? '').trim().length < 2}
                >
                  Save
                </Button>
              </div>
            </Field>
            <div className="flex items-center gap-2 text-[13px] text-fg-muted">
              <HardDrive className="h-4 w-4 text-[var(--success)]" /> Local storage · data stays in this
              browser
            </div>
            <div className="flex gap-2 pt-1">
              <Badge tone="neutral">Plan starts {s.start_date}</Badge>
            </div>
          </div>
        </Card>

        {/* --------------------------- plan --------------------------- */}
        <Card className="p-5">
          <SectionTitle>Plan &amp; workload</SectionTitle>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Start date" hint="Day 1 of your 90-day plan.">
              <Input
                type="date"
                value={s.start_date}
                onChange={(e) => e.target.value && saveSettings({ start_date: e.target.value })}
              />
            </Field>
            <Field label="Daily target" hint="Required tasks per day.">
              <Input
                type="number"
                min={1}
                max={12}
                value={s.daily_target}
                onChange={(e) => saveSettings({ daily_target: Math.max(1, Number(e.target.value) || 1) })}
              />
            </Field>
            <Field label="Preferred study hours" hint="Target focused load per day.">
              <Input
                type="number"
                min={1}
                max={14}
                value={s.preferred_hours}
                onChange={(e) => saveSettings({ preferred_hours: Math.max(1, Number(e.target.value) || 1) })}
              />
            </Field>
            <div className="flex items-end pb-2">
              <div className="flex items-start gap-3">
                <Switch
                  checked={s.min_day_mode}
                  onChange={(v) => saveSettings({ min_day_mode: v })}
                  label="Minimum day mode"
                />
                <div>
                  <p className="text-[13.5px] font-medium">Minimum-day mode</p>
                  <p className="text-[12.5px] text-fg-muted leading-snug">
                    Lower workload on hard weeks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* --------------------------- appearance --------------------------- */}
        <Card className="p-5">
          <SectionTitle>Appearance</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => saveSettings({ theme: t.id })}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border py-4 transition-colors',
                  s.theme === t.id
                    ? 'border-[var(--accent)] bg-accent-soft text-[var(--accent)]'
                    : 'border-border bg-[var(--surface-2)] text-fg-muted hover:border-border-strong',
                )}
              >
                {t.icon}
                <span className="text-[13px] font-medium">{t.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[12.5px] text-fg-faint mt-3">
            Light-first; System follows your OS preference.
          </p>
        </Card>

        {/* --------------------------- notifications --------------------------- */}
        <Card className="p-5">
          <SectionTitle>Notifications</SectionTitle>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13.5px] font-medium">Streak reminder</p>
                <p className="text-[12.5px] text-fg-muted">Nudge when today’s streak is at risk.</p>
              </div>
              <Switch
                checked={s.notify_streak}
                onChange={(v) => saveSettings({ notify_streak: v })}
                label="Streak reminder"
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13.5px] font-medium">Weekly review reminder</p>
                <p className="text-[12.5px] text-fg-muted">Prompt on the lighter review day.</p>
              </div>
              <Switch
                checked={s.notify_review}
                onChange={(v) => saveSettings({ notify_review: v })}
                label="Weekly review reminder"
              />
            </div>
          </div>
        </Card>

        {/* --------------------------- study log --------------------------- */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle action={<span className="text-[12.5px] text-fg-muted">{data.sessions.length} entries</span>}>
            Extra study log
          </SectionTitle>
          <p className="text-[12.5px] text-fg-faint -mt-1 mb-3">
            Time studied outside planned tasks — mock interviews, long project sessions, extra
            revision.
          </p>

          <div className="grid sm:grid-cols-[130px_110px_160px_1fr_auto] gap-2 items-end">
            <Field label="Date">
              <Input
                type="date"
                value={session.date_key}
                onChange={(e) => setSession((p) => ({ ...p, date_key: e.target.value }))}
              />
            </Field>
            <Field label="Minutes">
              <Input
                type="number"
                min={0}
                value={session.minutes}
                onChange={(e) => setSession((p) => ({ ...p, minutes: Number(e.target.value) }))}
              />
            </Field>
            <Field label="Area">
              <Select
                value={session.category}
                onChange={(e) => setSession((p) => ({ ...p, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Note">
              <Input
                value={session.note}
                placeholder="Mock interview with a friend…"
                onChange={(e) => setSession((p) => ({ ...p, note: e.target.value }))}
              />
            </Field>
            <Button
              onClick={() => {
                if (!session.minutes || !session.date_key) return;
                addSession({
                  date_key: session.date_key,
                  minutes: Number(session.minutes) || 0,
                  category: session.category as never,
                  note: session.note,
                });
                setSession({ date_key: todayKey(), minutes: 60, category: 'dsa', note: '' });
                showToast('Study time logged');
              }}
            >
              <Plus className="h-4 w-4" /> Log
            </Button>
          </div>

          {data.sessions.length > 0 && (
            <div className="mt-4 divide-y divide-border">
              {[...data.sessions]
                .sort((a, b) => b.date_key.localeCompare(a.date_key))
                .slice(0, 8)
                .map((row) => (
                  <div key={row.id} className="flex items-center gap-3 py-2 text-[13px]">
                    <span className="w-24 text-fg-faint tabular">{relativeDay(row.date_key)}</span>
                    <span className="w-20 tabular text-fg-muted">{formatDuration(row.minutes)}</span>
                    <Badge tone="neutral">{CATEGORY_LABEL[row.category]}</Badge>
                    <span className="grow truncate text-fg-muted">{row.note}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete entry"
                      onClick={() => deleteSession(row.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </Card>

        {/* --------------------------- data --------------------------- */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle>Data</SectionTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={exportData} className="sm:w-auto">
              <Download className="h-4 w-4" /> Export data (JSON)
            </Button>
            <Button variant="danger" onClick={() => setResetOpen(true)} className="sm:w-auto">
              <RotateCcw className="h-4 w-4" /> Reset progress
            </Button>
          </div>
          <p className="text-[12.5px] text-fg-faint mt-3">
            Reset re-seeds the roadmap and clears completions, DSA logs, reviews and progress. Your
            settings are kept. Export first if you want a backup.
          </p>
        </Card>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset all progress?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                await resetProgress();
                setResetOpen(false);
              }}
            >
              Yes, reset everything
            </Button>
          </>
        }
      >
        <p className="text-[14px] leading-relaxed">
          This clears task completions, DSA problems and attempts, learning statuses, project
          checklists, certifications, weekly reviews, milestones, checklist items and study logs —
          then re-seeds the full 90-day roadmap from the plan.
        </p>
        <p className="text-[13px] text-[var(--danger)] mt-2">
          This cannot be undone. Export your data first if you need a backup.
        </p>
      </Modal>
    </div>
  );
}
