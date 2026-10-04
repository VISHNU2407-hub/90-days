import type { DataBundle, DataKey, Profile, UserSettings } from '@/lib/types';
import { DATA_KEYS } from '@/lib/types';
import { SEED_WEEKS, seedRoadmapTopics, seedDailyTasks, DSA_PATTERNS, SEED_MILESTONES, SEED_CHECKLIST, phaseForWeek, weekStartDay, weekEndDay, weekForDay } from '@/lib/seed/roadmap';
import { seedLearningTopics } from '@/lib/seed/learning';
import { seedProjects, seedCertifications } from '@/lib/seed/projects';
import { todayKey, uid } from '@/lib/utils';

export type RowOf<K extends DataKey> = DataBundle[K][number];

/**
 * The app is single-user: there are no accounts. Everything lives under one
 * local profile in this browser's localStorage.
 */
export const LOCAL_PROFILE_ID = 'local';
export const LOCAL_DATA_KEY = 'careeros:data:v1:local';

/* ==================================================================== *
 *  Seeding — a fresh install gets the entire PDF roadmap automatically
 * ==================================================================== */

export function defaultSettings(): UserSettings {
  return {
    start_date: todayKey(),
    daily_target: 5,
    preferred_hours: 5,
    theme: 'light',
    notify_streak: true,
    notify_review: true,
    min_day_mode: false,
    updated_at: new Date().toISOString(),
  };
}

export function defaultProfile(): Profile {
  return {
    id: LOCAL_PROFILE_ID,
    email: '',
    name: 'Me',
    created_at: new Date().toISOString(),
  };
}

export function seedBundle(profile: Profile): DataBundle {
  const { tasks } = seedDailyTasks();
  const { projects, projectTasks } = seedProjects();

  const weeks = SEED_WEEKS.map((w) => ({
    id: `wk_${w.week_number}`,
    week_number: w.week_number,
    phase: phaseForWeek(w.week_number),
    start_day: weekStartDay(w.week_number),
    end_day: weekEndDay(w.week_number),
    dsa: w.dsa,
    core_cs: w.core_cs,
    ai: w.ai,
    project_career: w.project_career,
    checkpoint: w.checkpoint,
    completed: false,
    completed_at: null,
  }));

  return {
    profile,
    settings: defaultSettings(),
    weeks,
    topics: seedRoadmapTopics(),
    tasks,
    completions: [],
    patterns: DSA_PATTERNS.map((p, i) => ({
      id: `pat_${i + 1}`,
      name: p.name,
      target: p.target,
      week_from: p.week_from,
      week_to: p.week_to,
      sort: i + 1,
    })),
    problems: [],
    attempts: [],
    learning: seedLearningTopics(),
    projects,
    projectTasks,
    certifications: seedCertifications(),
    reviews: SEED_WEEKS.map((w) => ({
      id: `rev_${w.week_number}`,
      week: w.week_number,
      answers: {},
      consistency: 0,
      completion_pct: 0,
      focused_hours: 0,
      dsa_problems: 0,
      project_progress: 0,
      learning_progress: 0,
      completed: false,
      updated_at: '',
    })),
    milestones: SEED_MILESTONES.map((m) => ({ ...m })),
    checklist: SEED_CHECKLIST.map((c) => ({ ...c })),
    sessions: [],
    aiUpdates: [],
  };
}

/* ==================================================================== *
 *  Storage helpers
 * ==================================================================== */

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write failed', e);
  }
}

/**
 * Older builds had sign-up/sign-in. Adopt the signed-in user's bundle under the
 * single-user key once, then drop the account/session records.
 */
function migrateLegacyAuthData() {
  try {
    const session = readJson<{ id?: string } | null>('careeros:session:v1', null);
    if (session?.id && !localStorage.getItem(LOCAL_DATA_KEY)) {
      const legacy = localStorage.getItem(`careeros:data:v1:${session.id}`);
      if (legacy) localStorage.setItem(LOCAL_DATA_KEY, legacy);
    }
    localStorage.removeItem('careeros:session:v1');
    localStorage.removeItem('careeros:accounts:v1');
  } catch {
    /* ignore — migration is best-effort */
  }
}

const LIGHT_THEME_MIGRATED_KEY = 'careeros:migrated:light-theme:v1';
const DSA_CURRICULUM_KEY = 'careeros:migrated:dsa-curriculum:v2';

/**
 * One-time: regenerate the DSA daily tasks so the new 13-week progression
 * shows up in existing Daily Plans (complexity is taught alongside every
 * topic/problem — never as a standalone week or full-day task).
 * Non-DSA tasks are untouched; DSA completion/notes carry over by id/day.
 * Also refreshes stored week DSA labels and pattern week ranges.
 */
function migrateDsaCurriculum(bundle: DataBundle | null): DataBundle | null {
  if (!bundle?.tasks?.length) return bundle;
  try {
    if (localStorage.getItem(DSA_CURRICULUM_KEY)) return bundle;

    // 1. weekly labels + pattern week ranges (displayed on Roadmap/DSA pages)
    if (bundle.weeks?.length === SEED_WEEKS.length) {
      bundle.weeks = bundle.weeks.map((w, i) => ({ ...w, dsa: SEED_WEEKS[i].dsa }));
    }
    if (bundle.patterns?.length === DSA_PATTERNS.length) {
      bundle.patterns = bundle.patterns.map((p) => {
        const seed = DSA_PATTERNS.find((s) => s.name === p.name);
        return seed ? { ...p, week_from: seed.week_from, week_to: seed.week_to } : p;
      });
    }

    // 2. regenerate DSA tasks, preserving completion + notes
    const oldDsa = bundle.tasks.filter((t) => t.category === 'dsa');
    const oldById = new Map(oldDsa.map((t) => [t.id, t]));
    const oldByDay = new Map<number, (typeof oldDsa)[number]>();
    for (const t of oldDsa) if (!oldByDay.has(t.day)) oldByDay.set(t.day, t);
    const nonDsa = bundle.tasks.filter((t) => t.category !== 'dsa');
    const nonDsaIds = new Set(nonDsa.map((t) => t.id));

    const freshDsa = seedDailyTasks().tasks.filter((t) => t.category === 'dsa');
    const newDsa = freshDsa.map((f) => {
      const prev = oldById.get(f.id) ?? oldByDay.get(f.day);
      const id = nonDsaIds.has(f.id) ? `${f.id}_dsa` : f.id; // defensive: never collide
      return {
        ...f,
        id,
        completed: prev?.completed ?? false,
        completed_at: prev?.completed_at ?? null,
        notes: prev?.notes ?? '',
      };
    });

    bundle.tasks = [...nonDsa, ...newDsa].sort((a, b) => a.day - b.day || a.sort - b.sort);

    // 3. older problems predate the complexity fields
    for (const p of bundle.problems ?? []) {
      (p as { time_complexity?: string }).time_complexity ??= '';
      (p as { space_complexity?: string }).space_complexity ??= '';
    }

    localStorage.setItem(DSA_CURRICULUM_KEY, '1');
    writeJson(LOCAL_DATA_KEY, bundle);
  } catch {
    /* ignore — migration is best-effort */
  }
  return bundle;
}

/** One-time: the app is light-first now, so flip stored dark defaults to light. */
function migrateToLightTheme(bundle: DataBundle | null): DataBundle | null {
  if (!bundle?.settings) return bundle;
  try {
    if (localStorage.getItem(LIGHT_THEME_MIGRATED_KEY)) return bundle;
    bundle.settings = { ...bundle.settings, theme: 'light' };
    localStorage.setItem(LIGHT_THEME_MIGRATED_KEY, '1');
    writeJson(LOCAL_DATA_KEY, bundle);
  } catch {
    /* ignore — migration is best-effort */
  }
  return bundle;
}

/* ==================================================================== *
 *  Repository — local (localStorage), single user, no auth
 * ==================================================================== */

export interface Repo {
  mode: 'local';
  load(): Promise<DataBundle>;
  saveProfile(profile: Profile): Promise<void>;
  saveSettings(settings: UserSettings): Promise<void>;
  insert<K extends DataKey>(key: K, rows: RowOf<K>[]): Promise<void>;
  update<K extends DataKey>(key: K, id: string, patch: Partial<RowOf<K>>): Promise<void>;
  remove<K extends DataKey>(key: K, ids: string[]): Promise<void>;
  resetProgress(): Promise<DataBundle>;
}

async function saveBundle(bundle: DataBundle) {
  writeJson(LOCAL_DATA_KEY, bundle);
}

const localRepo: Repo = {
  mode: 'local',

  async load() {
    migrateLegacyAuthData();
    const existing = migrateDsaCurriculum(
      migrateToLightTheme(readJson<DataBundle | null>(LOCAL_DATA_KEY, null)),
    );
    if (existing && existing.weeks?.length) {
      // Back-fill anything added by a newer version of the app.
      const seeded = seedBundle(existing.profile ?? defaultProfile());
      for (const key of DATA_KEYS) {
        if (!existing[key] || (existing[key] as unknown[]).length === 0) {
          (existing[key] as unknown[]) = seeded[key] as unknown[];
        }
      }
      // Normalize identity: single local user, no accounts.
      const fallback = defaultProfile();
      const prior = existing.profile;
      existing.profile = {
        id: LOCAL_PROFILE_ID,
        email: '',
        name: prior?.name && prior.name !== 'Me' ? prior.name : fallback.name,
        created_at: prior?.created_at ?? fallback.created_at,
      };
      existing.settings = existing.settings ?? seeded.settings;
      return existing;
    }
    const bundle = seedBundle(defaultProfile());
    writeJson(LOCAL_DATA_KEY, bundle);
    return bundle;
  },

  async saveProfile(profile) {
    const bundle = readJson<DataBundle | null>(LOCAL_DATA_KEY, null);
    if (bundle) {
      bundle.profile = profile;
      await saveBundle(bundle);
    }
  },

  async saveSettings(settings) {
    const bundle = readJson<DataBundle | null>(LOCAL_DATA_KEY, null);
    if (bundle) {
      bundle.settings = { ...settings, updated_at: new Date().toISOString() };
      await saveBundle(bundle);
    }
  },

  async insert(key, rows) {
    const bundle = readJson<DataBundle | null>(LOCAL_DATA_KEY, null);
    if (!bundle) return;
    (bundle[key] as unknown[]) = [...(bundle[key] as unknown[]), ...(rows as unknown[])];
    await saveBundle(bundle);
  },

  async update(key, id, patch) {
    const bundle = readJson<DataBundle | null>(LOCAL_DATA_KEY, null);
    if (!bundle) return;
    (bundle[key] as { id: string }[]) = (bundle[key] as { id: string }[]).map((row) =>
      row.id === id ? { ...row, ...patch } : row,
    );
    await saveBundle(bundle);
  },

  async remove(key, ids) {
    const bundle = readJson<DataBundle | null>(LOCAL_DATA_KEY, null);
    if (!bundle) return;
    const set = new Set(ids);
    (bundle[key] as { id: string }[]) = (bundle[key] as { id: string }[]).filter((r) => !set.has(r.id));
    await saveBundle(bundle);
  },

  async resetProgress() {
    const existing = readJson<DataBundle | null>(LOCAL_DATA_KEY, null);
    const fresh = seedBundle(existing?.profile ?? defaultProfile());
    fresh.settings = existing?.settings ?? fresh.settings;
    writeJson(LOCAL_DATA_KEY, fresh);
    return fresh;
  },
};

export const repo: Repo = localRepo;
export const repoMode = repo.mode;

/* ------------------------------ export ----------------------------- */

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function newId(prefix: string): string {
  return uid(prefix);
}

export { weekForDay };
