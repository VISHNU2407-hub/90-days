import type { Track } from '@/lib/types';

export interface LearningTrackDef {
  key: Track;
  label: string;
  route: string;
  blurb: string;
}

export const LEARNING_TRACKS: LearningTrackDef[] = [
  {
    key: 'corecs',
    label: 'Core CS',
    route: '/core-cs',
    blurb: 'OOP · SQL · DBMS · OS · Networks — interview-ready fundamentals.',
  },
  {
    key: 'aiml',
    label: 'AI / ML',
    route: '/ai-ml',
    blurb: 'Python for AI, data, supervised ML, evaluation, generalisation, neural nets.',
  },
  {
    key: 'genai',
    label: 'GenAI & RAG',
    route: '/genai',
    blurb: 'LLMs, prompting, structured output, embeddings, vector DB, RAG.',
  },
  {
    key: 'agent',
    label: 'AI Agents',
    route: '/genai',
    blurb: 'Tool calling, workflows, memory, evaluation, reliability and security.',
  },
];
