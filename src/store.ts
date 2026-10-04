import { create } from 'zustand';
import type {
  AiUpdate,
  Certification,
  ChecklistItem,
  DataBundle,
  DataKey,
  DsaAttempt,
  DsaProblem,
  LearningTopic,
  Project,
  ProjectTask,
  StudySession,
  UserSettings,
  WeeklyReview,
} from '@/lib/types';
import { repo, repoMode, downloadJson, defaultSettings, type RowOf } from '@/lib/repo';
import { todayKey } from '@/lib/utils';

export type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' };
export type Status = 'loading' | 'ready';

interface StoreState {
  status: Status;
  mode: 'local';
  data: DataBundle | null;
  busy: boolean;
  toast: Toast | null;

  init(): Promise<void>;
  showToast(message: string, type?: Toast['type']): void;
  dismissToast(): void;

  /* generic row operations */
  addRow<K extends DataKey>(key: K, row: RowOf<K>): void;
  patchRow<K extends DataKey>(key: K, id: string, patch: Partial<RowOf<K>>): void;
  deleteRows<K extends DataKey>(key: K, ids: string[]): void;

  /* domain actions */
  toggleTask(id: string): void;
  setTaskNotes(id: string, notes: string): void;
  toggleWeek(id: string): void;
  toggleRoadmapTopic(id: string): void;

  addProblem(problem: Omit<DsaProblem, 'id' | 'created_at'>): void;
  updateProblem(id: string, patch: Partial<DsaProblem>): void;
  deleteProblems(ids: string[]): void;
  addAttempt(attempt: Omit<DsaAttempt, 'id' | 'created_at'>): void;
  deleteAttempts(ids: string[]): void;

  setLearning(id: string, patch: Partial<LearningTopic>): void;

  updateProject(id: string, patch: Partial<Project>): void;
  toggleProjectTask(id: string): void;
  addProjectTask(task: Omit<ProjectTask, 'id'>): void;
  deleteProjectTask(id: string): void;

  addCertification(cert: Omit<Certification, 'id'>): void;
  updateCertification(id: string, patch: Partial<Certification>): void;
  deleteCertification(id: string): void;

  saveReview(id: string, patch: Partial<WeeklyReview>): void;

  toggleMilestoneRequirement(milestoneId: string, reqId: string): void;

  toggleChecklist(id: string): void;

  addSession(session: Omit<StudySession, 'id' | 'created_at'>): void;
  deleteSession(id: string): void;

  addAiUpdate(row: Omit<AiUpdate, 'id'>): void;
  updateAiUpdate(id: string, patch: Partial<AiUpdate>): void;
  deleteAiUpdate(id: string): void;

  saveSettings(patch: Partial<UserSettings>): void;
  rename(name: string): void;
  resetProgress(): Promise<void>;
  exportData(): void;
}

function replaceRows<K extends DataKey>(d: DataBundle, key: K, rows: RowOf<K>[]): DataBundle {
  return { ...d, [key]: rows } as DataBundle;
}

export const useStore = create<StoreState>((set, get) => {
  /** Optimistic mutation with rollback on persistence failure. */
  async function apply(
    mutator: (d: DataBundle) => DataBundle | null,
    persist: () => Promise<void>,
  ): Promise<void> {
    const prev = get().data;
    if (!prev) return;
    const next = mutator(prev);
    if (!next) return;
    set({ data: next });
    try {
      await persist();
    } catch (e) {
      set({ data: prev });
      console.error(e);
      get().showToast('Could not save that change — check your connection.', 'error');
    }
  }

  async function patchRowPersist<K extends DataKey>(
    key: K,
    id: string,
    patch: Partial<RowOf<K>>,
  ) {
    await repo.update(key, id, patch);
  }

  async function insertRowPersist<K extends DataKey>(key: K, row: RowOf<K>) {
    await repo.insert(key, [row]);
  }

  async function removeRowsPersist<K extends DataKey>(key: K, ids: string[]) {
    await repo.remove(key, ids);
  }

  return {
    status: 'loading',
    mode: repoMode,
    data: null,
    busy: false,
    toast: null,

    async init() {
      try {
        const data = await repo.load();
        set({ status: 'ready', data });
      } catch (e) {
        console.error(e);
        set({ status: 'ready' });
        get().showToast('Could not load your plan from this browser.', 'error');
      }
    },

    showToast(message, type = 'success') {
      set({ toast: { id: Date.now(), message, type } });
      window.setTimeout(() => {
        if (get().toast?.message === message) set({ toast: null });
      }, 3200);
    },

    dismissToast() {
      set({ toast: null });
    },

    /* --------------------------- generic --------------------------- */

    addRow(key, row) {
      void apply(
        (d) => replaceRows(d, key, [...(d[key] as RowOf<typeof key>[]), row]),
        () => insertRowPersist(key, row),
      );
    },

    patchRow(key, id, patch) {
      void apply(
        (d) =>
          replaceRows(
            d,
            key,
            (d[key] as { id: string }[]).map((r) => (r.id === id ? { ...r, ...patch } : r)) as never,
          ),
        () => patchRowPersist(key, id, patch),
      );
    },

    deleteRows(key, ids) {
      const set0 = new Set(ids);
      void apply(
        (d) =>
          replaceRows(
            d,
            key,
            (d[key] as { id: string }[]).filter((r) => !set0.has(r.id)) as never,
          ),
        () => removeRowsPersist(key, ids),
      );
    },

    /* ----------------------------- tasks --------------------------- */

    toggleTask(id) {
      const data = get().data;
      if (!data) return;
      const task = data.tasks.find((t) => t.id === id);
      if (!task) return;
      const completed = !task.completed;
      const completed_at = completed ? new Date().toISOString() : null;
      const date_key = todayKey();

      const completionId = `cmp_${task.id}`;
      const completionRow = {
        id: completionId,
        task_id: task.id,
        day: task.day,
        date_key,
        category: task.category,
        minutes: task.est_minutes,
        created_at: new Date().toISOString(),
      };

      void apply(
        (d) => ({
          ...d,
          tasks: d.tasks.map((t) => (t.id === id ? { ...t, completed, completed_at } : t)),
          completions: completed
            ? [...d.completions.filter((c) => c.task_id !== id), completionRow]
            : d.completions.filter((c) => c.task_id !== id),
        }),
        async () => {
          await repo.update('tasks', id, { completed, completed_at } as never);
          const existing = data.completions.find((c) => c.task_id === id);
          if (completed) {
            if (existing) await repo.remove('completions', [existing.id]);
            await repo.insert('completions', [completionRow]);
          } else if (existing) {
            await repo.remove('completions', [existing.id]);
          }
        },
      );
    },

    setTaskNotes(id, notes) {
      get().patchRow('tasks', id, { notes } as never);
    },

    toggleWeek(id) {
      const data = get().data;
      const week = data?.weeks.find((w) => w.id === id);
      if (!week) return;
      get().patchRow('weeks', id, {
        completed: !week.completed,
        completed_at: !week.completed ? new Date().toISOString() : null,
      });
    },

    toggleRoadmapTopic(id) {
      const data = get().data;
      const t = data?.topics.find((x) => x.id === id);
      if (!t) return;
      get().patchRow('topics', id, { status: t.status === 'done' ? 'open' : 'done' });
    },

    /* ------------------------------ DSA ---------------------------- */

    addProblem(problem) {
      const row: DsaProblem = {
        ...problem,
        id: `prob_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        created_at: new Date().toISOString(),
      };
      get().addRow('problems', row);
      get().showToast(`“${problem.name}” logged`);
    },

    updateProblem(id, patch) {
      get().patchRow('problems', id, patch);
    },

    deleteProblems(ids) {
      get().deleteRows('problems', ids);
      const data = get().data;
      const attempts = (data?.attempts ?? []).filter((a) => ids.includes(a.problem_id)).map((a) => a.id);
      if (attempts.length) get().deleteRows('attempts', attempts);
      get().showToast('Problem removed', 'info');
    },

    addAttempt(attempt) {
      const row: DsaAttempt = {
        ...attempt,
        id: `att_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        created_at: new Date().toISOString(),
      };
      get().addRow('attempts', row);
    },

    deleteAttempts(ids) {
      get().deleteRows('attempts', ids);
    },

    /* --------------------------- learning -------------------------- */

    setLearning(id, patch) {
      get().patchRow('learning', id, patch);
    },

    /* --------------------------- projects -------------------------- */

    updateProject(id, patch) {
      get().patchRow('projects', id, patch);
    },

    toggleProjectTask(id) {
      const data = get().data;
      const t = data?.projectTasks.find((x) => x.id === id);
      if (!t) return;
      get().patchRow('projectTasks', id, { done: !t.done });
    },

    addProjectTask(task) {
      get().addRow('projectTasks', {
        ...task,
        id: `pt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      });
    },

    deleteProjectTask(id) {
      get().deleteRows('projectTasks', [id]);
    },

    /* ------------------------ certifications ----------------------- */

    addCertification(cert) {
      get().addRow('certifications', {
        ...cert,
        id: `cert_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      });
    },

    updateCertification(id, patch) {
      get().patchRow('certifications', id, patch);
    },

    deleteCertification(id) {
      get().deleteRows('certifications', [id]);
    },

    /* ---------------------------- reviews -------------------------- */

    saveReview(id, patch) {
      get().patchRow('reviews', id, {
        ...patch,
        updated_at: new Date().toISOString(),
      });
    },

    /* -------------------------- milestones ------------------------- */

    toggleMilestoneRequirement(milestoneId, reqId) {
      const ms = get().data?.milestones.find((m) => m.id === milestoneId);
      if (!ms) return;
      const has = ms.manual_done.includes(reqId);
      const manual_done = has ? ms.manual_done.filter((r) => r !== reqId) : [...ms.manual_done, reqId];
      get().patchRow('milestones', milestoneId, { manual_done, completed: false });
    },

    /* --------------------------- checklist ------------------------- */

    toggleChecklist(id) {
      const item = get().data?.checklist.find((c) => c.id === id);
      if (!item) return;
      get().patchRow('checklist', id, { done: !item.done });
    },

    /* --------------------------- sessions -------------------------- */

    addSession(session) {
      get().addRow('sessions', {
        ...session,
        id: `ses_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        created_at: new Date().toISOString(),
      });
    },

    deleteSession(id) {
      get().deleteRows('sessions', [id]);
    },

    /* --------------------------- AI updates ------------------------ */

    addAiUpdate(row) {
      get().addRow('aiUpdates', {
        ...row,
        id: `aiu_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      });
    },

    updateAiUpdate(id, patch) {
      get().patchRow('aiUpdates', id, patch);
    },

    deleteAiUpdate(id) {
      get().deleteRows('aiUpdates', [id]);
    },

    /* ---------------------------- settings ------------------------- */

    saveSettings(patch) {
      const data = get().data;
      if (!data) return;
      const next: UserSettings = {
        ...(data.settings ?? defaultSettings()),
        ...patch,
        updated_at: new Date().toISOString(),
      };
      set({ data: { ...data, settings: next } });
      applyTheme(next.theme);
      repo.saveSettings(next).catch((e) => {
        console.error(e);
        get().showToast('Settings could not be saved.', 'error');
      });
    },

    rename(name) {
      const data = get().data;
      if (!data?.profile) return;
      const profile = { ...data.profile, name };
      set({ data: { ...data, profile } });
      repo
        .saveProfile(profile)
        .catch(() => get().showToast('Name could not be saved.', 'error'));
    },

    async resetProgress() {
      set({ busy: true });
      try {
        const fresh = await repo.resetProgress();
        set({ data: fresh });
        get().showToast('Progress reset — your plan is fresh again.', 'info');
      } catch (e) {
        console.error(e);
        get().showToast('Reset failed. Please try again.', 'error');
      } finally {
        set({ busy: false });
      }
    },

    exportData() {
      const data = get().data;
      if (!data) return;
      downloadJson(data, `career-os-export-${todayKey()}.json`);
      get().showToast('Data exported as JSON');
    },
  };
});

/* ------------------------------ theme ------------------------------ */

export function applyTheme(theme: UserSettings['theme']) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  const dark = theme === 'dark' || (theme === 'system' && prefersDark);
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (meta) meta.setAttribute('content', dark ? '#070b14' : '#f5f7fb');
}
