import type { Certification, Project, ProjectTask } from '@/lib/types';

/* ==================================================================== *
 *  Section 9 — Portfolio system + Section 10 — Certifications
 * ==================================================================== */

interface ProjectSeed {
  key: Project['key'];
  name: string;
  purpose: string;
  definition_of_done: string;
  description: string;
  goal: string;
  tech_stack: string;
  milestones: string[];
  tasks: string[];
  agentTasks?: string[];
}

export const PROJECT_SEEDS: ProjectSeed[] = [
  {
    key: 'p1',
    name: 'Project 1 — AI/ML Project',
    purpose: 'Demonstrate data + model fundamentals',
    definition_of_done: 'Working repo + README + evaluation + limitations',
    description:
      'Mini-project 1: pick a small real dataset with a clear question, prepare the data, build a baseline, train a model, evaluate it honestly and document the limits.',
    goal: 'Finish within 1–2 weeks with a clean README and a short demo/result section.',
    tech_stack: 'Python, pandas, scikit-learn, Jupyter',
    milestones: [
      'Problem framing & dataset chosen',
      'Data preparation',
      'Baseline model',
      'Model + evaluation',
      'README + demo',
    ],
    tasks: [
      'Choose a small real dataset with a clear question.',
      'Document data preparation, baseline, model choice, evaluation and limitations.',
      'Keep the scope small enough to finish within 1–2 weeks.',
      'Publish a clean README and a short demo/result section.',
      'Train at least one regression and one classification model.',
      'Explain your metric choice in the README.',
    ],
  },
  {
    key: 'p2',
    name: 'Project 2 — GenAI / RAG Application',
    purpose: 'Demonstrate LLM + retrieval',
    definition_of_done: 'Working app + retrieval pipeline + test set + demo',
    description:
      'A bounded-document RAG application: ingestion, chunking, embeddings, retrieval, answer generation with citations, plus a test set that proves retrieval quality.',
    goal: 'Show retrieval quality, grounding and failure handling — not just a chatbot.',
    tech_stack: 'Python, LLM API, embeddings, vector DB',
    milestones: [
      'Ingestion + chunking',
      'Embeddings + vector store',
      'Retrieval',
      'Answer generation + citations',
      'Test set (15–20 questions)',
      'README + demo',
    ],
    tasks: [
      'Use a bounded document set rather than trying to index the whole internet.',
      'Show ingestion, chunking, embeddings, retrieval and answer generation.',
      'Add citations/source references inside the app where appropriate.',
      'Create 15–20 test questions, including questions whose answers are not in the documents.',
      'Document limitations and failure cases.',
      'Test retrieval failures, hallucinations and missing context.',
    ],
  },
  {
    key: 'p3',
    name: 'Project 3 — AI Agent',
    purpose: 'Demonstrate tools + multi-step execution',
    definition_of_done: 'Working agent + tool calls + error handling + demo',
    description:
      'Agent A (small practical agent) then Agent B (RAG + tools) with a visible execution trace, validation and deterministic tools.',
    goal: 'Two small agents with working tools, plus an evaluation set and a demo.',
    tech_stack: 'Python, LLM API, tool/function calling',
    milestones: [
      'Tool design',
      'Function-calling loop',
      'Workflow / state',
      'Error handling + trace',
      'Evaluation set',
      'README + demo',
    ],
    tasks: [
      'Agent A: research/planning assistant with 2–3 small deterministic tools.',
      'Agent B: combine retrieval with at least one action tool.',
      'Add validation and a visible execution trace so the user can understand what happened.',
      'Add retries, validation, timeouts, fallbacks and logging.',
      'Build a test set with success criteria and a short failure analysis.',
      'State what the agent cannot do and where human approval is required.',
    ],
  },
  {
    key: 'sats',
    name: 'Major Project — SATS',
    purpose: 'Turn the existing major project into a strong portfolio + AI-agent functionality',
    definition_of_done: 'Strong portfolio piece + AI-agent functionality + docs + demo + measurable contribution',
    description:
      'The flagship portfolio project: existing major project plus real AI-agent functionality, architecture documentation, a 2–3 minute demo and a measurable contribution.',
    goal: 'A real multi-step problem solved by an agent — tools, state/workflow, error handling, evaluation set.',
    tech_stack: 'Existing major project stack + agent layer (LLM API, tools, vector DB)',
    milestones: [
      'Planning',
      'Architecture',
      'Backend',
      'Frontend',
      'AI Agent',
      'Testing',
      'Documentation',
      'Demo',
    ],
    tasks: [
      'Must solve a real multi-step problem rather than only chat.',
      'Must have tools, state/workflow, error handling and an evaluation set.',
      'Must have architecture documentation and a 2–3 minute demo.',
      'Must clearly state what the agent cannot do and where human approval is required.',
      'Record measurable contribution (metrics before/after, tests, latency, cost).',
      'Prepare the project explanation you will use in interviews.',
    ],
    agentTasks: [
      'Agent use-case defined: a real multi-step problem (not only chat)',
      'Tool set designed and implemented (deterministic where possible)',
      'State / workflow implemented with explicit steps',
      'Error handling: retries, validation, timeouts, fallbacks, logging',
      'Evaluation set with success criteria and failure analysis',
      'Execution trace visible so a user can see what happened',
      'Limits documented: what the agent cannot do + human approval points',
      '2–3 minute demo recorded',
    ],
  },
];

const REPO_DELIVERABLES = [
  { id: 'readme', title: 'README (setup + usage)', detail: 'Technology stack and setup instructions.' },
  { id: 'arch', title: 'Architecture diagram', detail: 'Features and architecture diagram.' },
  { id: 'shots', title: 'Screenshots / demo link', detail: 'Screenshots or a working demo link.' },
  { id: 'docs', title: 'Documentation', detail: 'Known limitations, future work and your exact contribution.' },
];

const REPO_TASKS = [
  { title: 'Problem statement and target user', detail: 'One paragraph: what it solves and for whom.' },
  { title: 'Features list', detail: 'What works today, clearly separated from what is planned.' },
  { title: 'A short "How it works" section', detail: 'Explainable in an interview, end to end.' },
  { title: 'Your exact contribution', detail: 'Especially important for a team/college project.' },
];

export function seedProjects(): { projects: Project[]; projectTasks: ProjectTask[] } {
  const projects: Project[] = [];
  const projectTasks: ProjectTask[] = [];

  PROJECT_SEEDS.forEach((p, pi) => {
    const id = `pr_${p.key}`;
    projects.push({
      id,
      key: p.key,
      name: p.name,
      purpose: p.purpose,
      definition_of_done: p.definition_of_done,
      description: p.description,
      goal: p.goal,
      status: 'planned',
      progress: 0,
      tech_stack: p.tech_stack,
      github_url: '',
      demo_url: '',
      sort: pi + 1,
    });

    let sort = 0;
    p.milestones.forEach((m) => {
      sort += 1;
      projectTasks.push({
        id: `pt_${p.key}_m${sort}`,
        project_id: id,
        group_name: 'milestone',
        title: m,
        detail: '',
        done: false,
        due_day: null,
        sort,
      });
    });
    REPO_DELIVERABLES.forEach((d) => {
      sort += 1;
      projectTasks.push({
        id: `pt_${p.key}_d_${d.id}`,
        project_id: id,
        group_name: 'deliverable',
        title: d.title,
        detail: d.detail,
        done: false,
        due_day: null,
        sort,
      });
    });
    p.tasks.forEach((t) => {
      sort += 1;
      projectTasks.push({
        id: `pt_${p.key}_t${sort}`,
        project_id: id,
        group_name: 'task',
        title: t,
        detail: '',
        done: false,
        due_day: null,
        sort,
      });
    });
    (p.agentTasks ?? []).forEach((t) => {
      sort += 1;
      projectTasks.push({
        id: `pt_${p.key}_a${sort}`,
        project_id: id,
        group_name: 'agent',
        title: t,
        detail: 'Tracked separately from the rest of the project.',
        done: false,
        due_day: null,
        sort,
      });
    });
    REPO_TASKS.forEach((t) => {
      sort += 1;
      projectTasks.push({
        id: `pt_${p.key}_r${sort}`,
        project_id: id,
        group_name: 'task',
        title: t.title,
        detail: t.detail,
        done: false,
        due_day: null,
        sort,
      });
    });
  });

  return { projects, projectTasks };
}

export const CERT_RULES = [
  { rule: 'Choose 2–3', implementation: 'Do not collect certificates for appearance.' },
  { rule: 'Match the roadmap', implementation: 'Certification should reinforce a topic already being learned.' },
  { rule: 'Build after learning', implementation: 'Create a mini-project or practical artifact from the material.' },
  { rule: 'Record proof', implementation: 'Keep certificate + project + short reflection in your career tracker.' },
];

const CERT_SEEDS: {
  name: string;
  provider: string;
  related_project: string;
  notes: string;
}[] = [
  {
    name: 'Generative AI',
    provider: '',
    related_project: 'Project 2 — GenAI / RAG',
    notes: 'Priority from the plan. Pair with the RAG project as the practical artifact.',
  },
  {
    name: 'Machine Learning',
    provider: '',
    related_project: 'Project 1 — AI/ML Project',
    notes: 'Reinforces AI/ML fundamentals already in the roadmap. Pair with the ML project.',
  },
  {
    name: 'AI Fundamentals / Cloud AI',
    provider: '',
    related_project: 'Major Project — SATS',
    notes: 'Optional third. Only start if the first two are on track.',
  },
];

export function seedCertifications(): Certification[] {
  return CERT_SEEDS.map((c, i) => ({
    id: `cert_${i + 1}`,
    name: c.name,
    provider: c.provider,
    url: '',
    start_date: null,
    target_date: null,
    status: 'planned',
    progress: 0,
    certificate_url: '',
    related_project: c.related_project,
    notes: c.notes,
  }));
}
