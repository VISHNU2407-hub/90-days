/* ------------------------------------------------------------------ *
 * 90-Day Career OS — domain model
 * Persisted as a single JSON bundle in browser localStorage
 * ------------------------------------------------------------------ */

export type Category =
  | 'dsa'
  | 'corecs'
  | 'ai'
  | 'project'
  | 'career'
  | 'communication'
  | 'certification'
  | 'review';

export const CATEGORIES: Category[] = [
  'dsa',
  'corecs',
  'ai',
  'project',
  'career',
  'communication',
  'certification',
  'review',
];

export const CATEGORY_LABEL: Record<Category, string> = {
  dsa: 'DSA',
  corecs: 'Core CS',
  ai: 'AI / ML / GenAI',
  project: 'Project',
  career: 'Career',
  communication: 'Communication',
  certification: 'Certification',
  review: 'Weekly Review',
};

export type Priority = 'high' | 'medium' | 'low';

export type LearningStatus =
  | 'not_started'
  | 'learning'
  | 'understood'
  | 'needs_revision'
  | 'mastered';

export const LEARNING_STATUSES: LearningStatus[] = [
  'not_started',
  'learning',
  'understood',
  'needs_revision',
  'mastered',
];

export const LEARNING_STATUS_LABEL: Record<LearningStatus, string> = {
  not_started: 'Not Started',
  learning: 'Learning',
  understood: 'Understood',
  needs_revision: 'Needs Revision',
  mastered: 'Mastered',
};

/** Numeric score used for progress math: 0 → 100 */
export const LEARNING_STATUS_SCORE: Record<LearningStatus, number> = {
  not_started: 0,
  learning: 35,
  needs_revision: 55,
  understood: 80,
  mastered: 100,
};

export type DsaStatus = 'not_started' | 'attempted' | 'solved' | 'needs_revision' | 'mastered';

export const DSA_STATUSES: DsaStatus[] = [
  'not_started',
  'attempted',
  'solved',
  'needs_revision',
  'mastered',
];

export const DSA_STATUS_LABEL: Record<DsaStatus, string> = {
  not_started: 'Not Started',
  attempted: 'Attempted',
  solved: 'Solved',
  needs_revision: 'Needs Revision',
  mastered: 'Mastered',
};

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Track = 'corecs' | 'aiml' | 'genai' | 'agent';

export const TRACK_LABEL: Record<Track, string> = {
  corecs: 'Core CS',
  aiml: 'AI / ML',
  genai: 'GenAI & RAG',
  agent: 'AI Agents',
};

export type ProjectKey = 'p1' | 'p2' | 'p3' | 'sats';

export type EntityStatus = 'planned' | 'in_progress' | 'completed';

export const ENTITY_STATUS_LABEL: Record<EntityStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export type ThemeMode = 'dark' | 'light' | 'system';

/* ----------------------------- identity ---------------------------- */

export interface Profile {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface UserSettings {
  start_date: string; // YYYY-MM-DD
  daily_target: number; // required tasks per day
  preferred_hours: number; // target focused hours per day
  theme: ThemeMode;
  notify_streak: boolean;
  notify_review: boolean;
  min_day_mode: boolean; // use the "minimum day" workload from the PDF
  updated_at: string;
}

/* ----------------------------- roadmap ----------------------------- */

export interface RoadmapWeek {
  id: string;
  week_number: number; // 1..13
  phase: 1 | 2 | 3;
  start_day: number;
  end_day: number;
  dsa: string;
  core_cs: string;
  ai: string;
  project_career: string;
  checkpoint: string;
  completed: boolean;
  completed_at: string | null;
}

/** Reference content items that come straight out of the PDF. */
export type RoadmapTopicKind =
  | 'phase'
  | 'dsa_plan'
  | 'python_fundamental'
  | 'career_action'
  | 'principle'
  | 'daily_block'
  | 'core_method'
  | 'interview_question'
  | 'dsa_loop'
  | 'rhythm';

export interface RoadmapTopic {
  id: string;
  kind: RoadmapTopicKind;
  title: string;
  detail: string;
  target: string;
  sort: number;
  status: 'open' | 'done';
  meta: string; // JSON string (keeps SQL simple/portable)
}

export interface DailyTask {
  id: string;
  day: number; // 1..90
  week: number;
  category: Category;
  title: string;
  detail: string;
  est_minutes: number;
  priority: Priority;
  required: boolean;
  completed: boolean;
  completed_at: string | null;
  notes: string;
  sort: number;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  day: number;
  date_key: string;
  category: Category;
  minutes: number;
  created_at: string;
}

/* ------------------------------- DSA ------------------------------- */

export interface DsaPattern {
  id: string;
  name: string;
  target: number;
  week_from: number;
  week_to: number;
  sort: number;
}

export interface DsaProblem {
  id: string;
  name: string;
  platform: string;
  url: string;
  pattern: string;
  difficulty: Difficulty;
  status: DsaStatus;
  time_complexity: string;
  space_complexity: string;
  time_minutes: number;
  needed_hint: boolean;
  notes: string;
  mistake: string;
  revision_date: string | null;
  solved_at: string | null;
  created_at: string;
}

export interface DsaAttempt {
  id: string;
  problem_id: string;
  date_key: string;
  outcome: 'solved' | 'stuck' | 'revised' | 'hinted';
  minutes: number;
  notes: string;
  created_at: string;
}

/* --------------------------- learning ------------------------------ */

export interface LearningTopic {
  id: string;
  track: Track;
  group_name: string;
  title: string;
  detail: string;
  output: string;
  status: LearningStatus;
  notes: string;
  confidence: number; // 0..5
  practice_done: boolean;
  sort: number;
}

/* ---------------------------- projects ----------------------------- */

export interface Project {
  id: string;
  key: ProjectKey;
  name: string;
  purpose: string;
  definition_of_done: string;
  description: string;
  goal: string;
  status: EntityStatus;
  progress: number; // 0..100, derived from tasks, can be overridden
  tech_stack: string;
  github_url: string;
  demo_url: string;
  sort: number;
}

export type ProjectTaskGroup = 'milestone' | 'deliverable' | 'task' | 'agent';

export interface ProjectTask {
  id: string;
  project_id: string;
  group_name: ProjectTaskGroup;
  title: string;
  detail: string;
  done: boolean;
  due_day: number | null;
  sort: number;
}

/* ------------------------- certifications -------------------------- */

export interface Certification {
  id: string;
  name: string;
  provider: string;
  url: string;
  start_date: string | null;
  target_date: string | null;
  status: EntityStatus;
  progress: number;
  certificate_url: string;
  related_project: string;
  notes: string;
}

/* --------------------------- weekly review -------------------------- */

export interface WeeklyReview {
  id: string;
  week: number;
  answers: Record<string, string>;
  consistency: number; // 1..5
  completion_pct: number;
  focused_hours: number;
  dsa_problems: number;
  project_progress: number;
  learning_progress: number;
  completed: boolean;
  updated_at: string;
}

/* ---------------------------- milestones ---------------------------- */

export interface MilestoneRequirement {
  id: string;
  label: string;
  source: 'auto' | 'manual';
  /** for auto requirements */
  metric?: string;
}

export interface Milestone {
  id: string;
  day: 30 | 60 | 75 | 90;
  title: string;
  phase: string;
  criteria: string;
  requirements: MilestoneRequirement[];
  manual_done: string[];
  completed: boolean;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  done: boolean;
  sort: number;
}

/* ----------------------- sessions & AI updates ---------------------- */

export interface StudySession {
  id: string;
  date_key: string;
  minutes: number;
  category: Category;
  note: string;
  created_at: string;
}

export interface AiUpdate {
  id: string;
  date_key: string;
  topic: string;
  changed: string;
  learned: string;
  tried: boolean;
}

/* ------------------------------ bundle ------------------------------ */

export interface DataBundle {
  profile: Profile | null;
  settings: UserSettings | null;
  weeks: RoadmapWeek[];
  topics: RoadmapTopic[];
  tasks: DailyTask[];
  completions: TaskCompletion[];
  patterns: DsaPattern[];
  problems: DsaProblem[];
  attempts: DsaAttempt[];
  learning: LearningTopic[];
  projects: Project[];
  projectTasks: ProjectTask[];
  certifications: Certification[];
  reviews: WeeklyReview[];
  milestones: Milestone[];
  checklist: ChecklistItem[];
  sessions: StudySession[];
  aiUpdates: AiUpdate[];
}

export type DataKey = Exclude<keyof DataBundle, 'profile' | 'settings'>;

export const DATA_KEYS: DataKey[] = [
  'weeks',
  'topics',
  'tasks',
  'completions',
  'patterns',
  'problems',
  'attempts',
  'learning',
  'projects',
  'projectTasks',
  'certifications',
  'reviews',
  'milestones',
  'checklist',
  'sessions',
  'aiUpdates',
];
