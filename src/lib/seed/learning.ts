import type { LearningTopic, Track } from '@/lib/types';

/* ==================================================================== *
 *  Learning tracks — transcribed from the PDF (sections 5, 6, 7, 8)
 *  and the product spec (sections 8, 9, 10).
 * ==================================================================== */

interface TopicSeed {
  track: Track;
  group: string;
  title: string;
  detail: string;
  output: string;
}

const SEED: TopicSeed[] = [
  /* ------------------------------ Core CS ------------------------------ */
  {
    track: 'corecs',
    group: 'OOP',
    title: 'Classes, objects, inheritance, polymorphism, abstraction',
    detail: 'Learn: classes, objects, inheritance, polymorphism, abstraction, composition vs inheritance.',
    output: 'Explain with a small Python example; compare composition vs inheritance.',
  },
  {
    track: 'corecs',
    group: 'OOP',
    title: 'Composition vs inheritance',
    detail: 'When to prefer composition, how the two model real systems differently.',
    output: 'Answer "when is composition preferable?" without notes.',
  },
  {
    track: 'corecs',
    group: 'SQL',
    title: 'SELECT, filtering, grouping, subqueries, constraints',
    detail: 'Learn: SELECT, filtering, joins, grouping, subqueries, constraints, indexes.',
    output: 'Write queries from a schema without notes.',
  },
  {
    track: 'corecs',
    group: 'SQL',
    title: 'Joins and indexes in practice',
    detail: 'All join types, when an index is used, and what queries become slow without one.',
    output: 'Write 10 interview-style queries from a given schema.',
  },
  {
    track: 'corecs',
    group: 'DBMS',
    title: 'Keys and normalization',
    detail: 'Primary/foreign/unique keys, normal forms and why they exist.',
    output: 'Normalize a small schema and justify each decision.',
  },
  {
    track: 'corecs',
    group: 'DBMS',
    title: 'Joins/normalization/transactions',
    detail: 'Transactions, ACID, isolation levels and what each level allows.',
    output: 'Explain why indexes and transactions matter.',
  },
  {
    track: 'corecs',
    group: 'DBMS',
    title: 'ACID, isolation and indexing',
    detail: 'Isolation levels, dirty reads/non-repeatable reads/phantoms, B-tree vs hash indexes.',
    output: 'Explain the trade-off indexes create (write cost vs read speed).',
  },
  {
    track: 'corecs',
    group: 'OS',
    title: 'Processes and threads',
    detail: 'Process vs thread, context switching, synchronization primitives.',
    output: 'Explain process vs thread and common scheduling/deadlock concepts.',
  },
  {
    track: 'corecs',
    group: 'OS',
    title: 'Scheduling and memory management',
    detail: 'CPU scheduling algorithms, paging, virtual memory, thrashing.',
    output: 'Compare scheduling policies and explain what happens on a page fault.',
  },
  {
    track: 'corecs',
    group: 'OS',
    title: 'Deadlocks and synchronization',
    detail: 'Conditions for deadlock, prevention/avoidance/detection, semaphores, mutexes.',
    output: 'Walk through a classic deadlock example and its fix.',
  },
  {
    track: 'corecs',
    group: 'Networks',
    title: 'OSI/TCP-IP models and HTTP',
    detail: 'Layers, what each layer does, HTTP methods/status codes, HTTPS.',
    output: 'Trace what happens when a browser requests a website.',
  },
  {
    track: 'corecs',
    group: 'Networks',
    title: 'DNS, TCP/UDP and basic APIs',
    detail: 'DNS resolution, TCP vs UDP, REST basics, common API failure modes.',
    output: 'Explain DNS resolution and why TCP is chosen over UDP (and vice versa).',
  },

  /* ------------------------------- AI / ML ----------------------------- */
  {
    track: 'aiml',
    group: 'AI foundations',
    title: 'Python for AI',
    detail: 'Python essentials used in AI work: data structures, functions, modules, virtual envs.',
    output: 'Explain the AI hierarchy with examples.',
  },
  {
    track: 'aiml',
    group: 'AI foundations',
    title: 'AI vs ML vs DL vs GenAI',
    detail: 'How the four relate, where each is applied, when each is the wrong tool.',
    output: 'Explain the hierarchy with examples.',
  },
  {
    track: 'aiml',
    group: 'Data',
    title: 'NumPy',
    detail: 'Arrays, vectorised operations, shape/broadcasting, basic linear algebra.',
    output: 'Clean and inspect a small dataset.',
  },
  {
    track: 'aiml',
    group: 'Data',
    title: 'Pandas',
    detail: 'DataFrames, filtering, groupby, missing values, joins, basic plotting.',
    output: 'Clean and inspect a small dataset.',
  },
  {
    track: 'aiml',
    group: 'Data',
    title: 'Datasets and data preparation',
    detail: 'Choosing a small real dataset with a clear question; cleaning and inspection.',
    output: 'Produce a cleaned dataset with a written problem statement.',
  },
  {
    track: 'aiml',
    group: 'Data',
    title: 'Train/test split',
    detail: 'Why leakage is dangerous, stratification, validation strategy.',
    output: 'Explain train vs test and why leakage is dangerous.',
  },
  {
    track: 'aiml',
    group: 'Supervised ML',
    title: 'Regression',
    detail: 'Linear/regression baselines, residuals, when regression is the right frame.',
    output: 'Train at least one model of each type.',
  },
  {
    track: 'aiml',
    group: 'Supervised ML',
    title: 'Classification',
    detail: 'Logistic regression, decision boundaries, class imbalance, thresholds.',
    output: 'Train at least one model of each type.',
  },
  {
    track: 'aiml',
    group: 'Evaluation',
    title: 'Metrics, validation and error analysis',
    detail: 'Accuracy/precision/recall/F1/RMSE, cross-validation, reading a confusion matrix.',
    output: 'Compare models and explain metric choice.',
  },
  {
    track: 'aiml',
    group: 'Generalization',
    title: 'Feature engineering',
    detail: 'Encoding, scaling, interaction features, leakage in features.',
    output: 'Improve a baseline with deliberate feature changes.',
  },
  {
    track: 'aiml',
    group: 'Generalization',
    title: 'Overfitting and underfitting',
    detail: 'Bias/variance, learning curves, regularisation, early stopping.',
    output: 'Demonstrate a model that overfits and improve it.',
  },
  {
    track: 'aiml',
    group: 'Generalization',
    title: 'Regularization',
    detail: 'L1/L2, dropout idea, data augmentation, simpler models.',
    output: 'Show a regularised model beating an overfit baseline.',
  },
  {
    track: 'aiml',
    group: 'Neural networks',
    title: 'Layers, activation, loss, optimisation',
    detail: 'How layers, activations, losses and optimisers fit together; training loop basics.',
    output: 'Build a small neural-network experiment.',
  },

  /* --------------------------- GenAI & RAG ----------------------------- */
  {
    track: 'genai',
    group: 'LLM basics',
    title: 'LLMs and API usage',
    detail: 'Tokens, models, temperature, cost, latency, streaming, failure modes of an LLM API.',
    output: 'Call an LLM API and handle structured output.',
  },
  {
    track: 'genai',
    group: 'Prompting',
    title: 'Prompting with constraints, examples and validation',
    detail: 'System prompts, few-shot examples, constraints, formatting instructions.',
    output: 'Create prompts with constraints, examples and validation.',
  },
  {
    track: 'genai',
    group: 'Structured output',
    title: 'Structured outputs (JSON schema)',
    detail: 'Schema-constrained generation, validation, retrying on invalid output.',
    output: 'Return predictable JSON and validate it.',
  },
  {
    track: 'genai',
    group: 'Embeddings',
    title: 'Embeddings and semantic similarity',
    detail: 'Vector representations, similarity measures, dimensionality and cost.',
    output: 'Embed text and compare semantic similarity.',
  },
  {
    track: 'genai',
    group: 'Vector DB',
    title: 'Vector databases and retrieval',
    detail: 'Chunking strategies, storing vectors, similarity search, top-k and thresholds.',
    output: 'Store/retrieve chunks by similarity.',
  },
  {
    track: 'genai',
    group: 'RAG',
    title: 'RAG pipeline: retrieval → context → answer',
    detail: 'Ingestion, chunking, embeddings, retrieval and answer generation with citations.',
    output: 'Build a retrieval → context → answer pipeline.',
  },
  {
    track: 'genai',
    group: 'RAG quality',
    title: 'Retrieval failures, hallucinations, missing context',
    detail: 'Test set of 15–20 questions including questions with no answer in the documents.',
    output: 'Test retrieval failures, hallucinations and missing context.',
  },

  /* ---------------------------- AI Agents ------------------------------ */
  {
    track: 'agent',
    group: 'L1',
    title: 'LLM APIs',
    detail: 'L1 — LLM + structured output. Reliable JSON task as evidence.',
    output: 'Evidence: reliable JSON task.',
  },
  {
    track: 'agent',
    group: 'L2',
    title: 'Tool calling',
    detail: 'L2 — tool/function calling with deterministic, well-described tools.',
    output: 'Evidence: agent invokes 2–3 deterministic tools.',
  },
  {
    track: 'agent',
    group: 'L2',
    title: 'Function calling',
    detail: 'Schema design, argument validation, deciding when to call vs answer directly.',
    output: 'Evidence: correct tool selection with valid arguments.',
  },
  {
    track: 'agent',
    group: 'L3',
    title: 'Workflows',
    detail: 'L3 — multi-step stateful execution; explicit state machine instead of a free loop.',
    output: 'Evidence: multi-step stateful execution.',
  },
  {
    track: 'agent',
    group: 'L3',
    title: 'Planning',
    detail: 'Decomposing a task, choosing steps, re-planning when a step fails.',
    output: 'Evidence: a plan that survives a failed step.',
  },
  {
    track: 'agent',
    group: 'L4',
    title: 'RAG agents',
    detail: 'L4 — the agent retrieves knowledge before acting; grounded answers with sources.',
    output: 'Evidence: retrieval before action, with citations.',
  },
  {
    track: 'agent',
    group: 'L5',
    title: 'Memory',
    detail: 'L5 — useful short/long-term state with clear boundaries and expiry.',
    output: 'Evidence: useful short/long-term state with clear boundaries.',
  },
  {
    track: 'agent',
    group: 'L6',
    title: 'Error handling',
    detail: 'Retries with backoff, validation, timeouts, fallbacks, logging.',
    output: 'Evidence: retries, validation, timeouts, fallbacks, logging.',
  },
  {
    track: 'agent',
    group: 'L6',
    title: 'Reliability',
    detail: 'Making the same input produce a good outcome repeatedly; observable traces.',
    output: 'Evidence: a run trace you can read after the fact.',
  },
  {
    track: 'agent',
    group: 'L7',
    title: 'Evaluation',
    detail: 'L7 — test set + success criteria + failure analysis, not vibes.',
    output: 'Evidence: test set + success criteria + failure analysis.',
  },
  {
    track: 'agent',
    group: 'L8',
    title: 'Security',
    detail: 'Tool permissions, input validation, secrets handling, prompt-injection awareness.',
    output: 'Evidence: tool permissions + input validation + secrets handling.',
  },
  {
    track: 'agent',
    group: 'L8',
    title: 'Responsible AI',
    detail: 'Stating what the agent cannot do and where human approval is required.',
    output: 'Evidence: documented limits and human-in-the-loop points.',
  },
];

export const LEARNING_SEEDS = SEED;

export function seedLearningTopics(): LearningTopic[] {
  const counters: Record<string, number> = {};
  return SEED.map((s, i) => {
    const key = `${s.track}:${s.group}`;
    counters[key] = (counters[key] ?? 0) + 1;
    return {
      id: `lt_${i + 1}`,
      track: s.track,
      group_name: s.group,
      title: s.title,
      detail: s.detail,
      output: s.output,
      status: 'not_started',
      notes: '',
      confidence: 0,
      practice_done: false,
      sort: i + 1,
    };
  });
}

/** Visual progression required by spec section 10. */
export const AGENT_PROGRESSION = [
  'LLM',
  'Structured Output',
  'Tool Calling',
  'Workflows',
  'RAG',
  'Memory',
  'Evaluation',
  'Reliable Agents',
];

export const AGENT_LEVELS = [
  { level: 'L1', capability: 'LLM + structured output', evidence: 'Reliable JSON task' },
  { level: 'L2', capability: 'Tool/function calling', evidence: 'Agent invokes 2–3 deterministic tools' },
  { level: 'L3', capability: 'Workflow', evidence: 'Multi-step stateful execution' },
  { level: 'L4', capability: 'RAG agent', evidence: 'Agent retrieves knowledge before acting' },
  { level: 'L5', capability: 'Memory', evidence: 'Useful short/long-term state with clear boundaries' },
  { level: 'L6', capability: 'Reliability', evidence: 'Retries, validation, timeouts, fallbacks, logging' },
  { level: 'L7', capability: 'Evaluation', evidence: 'Test set + success criteria + failure analysis' },
  { level: 'L8', capability: 'Security', evidence: 'Tool permissions, input validation, secrets handling' },
];

/** Section 6 — checkpoint before moving to GenAI. */
export const AI_GATE = [
  'Can explain train vs test and why leakage is dangerous.',
  'Can choose a reasonable metric for a basic classification/regression problem.',
  'Can describe overfitting and at least two ways to reduce it.',
  'Can read a simple Python ML notebook without feeling lost.',
];

/** Section 6 — mini-project 1 requirements. */
export const MINI_PROJECT_1 = [
  'Choose a small real dataset with a clear question.',
  'Document data preparation, baseline, model choice, evaluation and limitations.',
  'Keep the scope small enough to finish within 1–2 weeks.',
  'Publish a clean README and a short demo/result section.',
];

/** Section 7 — GenAI/RAG project requirements. */
export const RAG_PROJECT_RULES = [
  'Use a bounded document set rather than trying to index the whole internet.',
  'Show ingestion, chunking, embeddings, retrieval and answer generation.',
  'Add citations/source references inside the app where appropriate.',
  'Create 15–20 test questions, including questions whose answers are not in the documents.',
  'Document limitations and failure cases.',
];

export const RAG_NOTE =
  'RAG is not "just a chatbot". The project must demonstrate retrieval quality, grounding and failure handling.';

/** Section 8 — agent projects. */
export const AGENT_PROJECT_A =
  'Agent Project A — small practical agent: a research/planning assistant that can call a search-like tool, calculator, note store or task tool. Keep the tool set small and deterministic.';
export const AGENT_PROJECT_B =
  'Agent Project B — RAG + tools: combine retrieval with at least one action tool. Add validation and a visible execution trace so the user can understand what happened.';
export const MAJOR_AGENT_PROJECT = [
  'Must solve a real multi-step problem rather than only chat.',
  'Must have tools, state/workflow, error handling and an evaluation set.',
  'Must have architecture documentation and a 2–3 minute demo.',
  'Must clearly state what the agent cannot do and where human approval is required.',
];
