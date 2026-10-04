import { CheckCircle2, Circle } from 'lucide-react';
import { LearningPanel } from '@/components/LearningPanel';
import { AI_GATE, MINI_PROJECT_1 } from '@/lib/seed/learning';
import { PROJECT_SEEDS } from '@/lib/seed/projects';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Badge, Button, Card, PageHeader, SectionTitle } from '@/components/ui';

export default function AiMlPage() {
  const p1 = PROJECT_SEEDS[0];
  return (
    <div className="animate-fade-up">
      <PageHeader
        title="AI / ML Foundation"
        subtitle="Python for AI → data → supervised ML → evaluation → generalisation → neural networks."
      />

      <LearningPanel
        track="aiml"
        extra={
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <SectionTitle
                action={<Badge tone="accent">Gate before GenAI</Badge>}
              >
                Checkpoint before moving to GenAI
              </SectionTitle>
              <ul className="space-y-2.5 text-[13.5px]">
                {AI_GATE.map((g) => (
                  <li key={g} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[var(--success)] mt-0.5 shrink-0" />
                    <span className="text-fg-muted">{g}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <SectionTitle
                action={
                  <Link to="/projects" className="text-[12.5px] text-[var(--accent)] hover:underline inline-flex items-center gap-1">
                    Open project <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              >
                Mini-project 1 — ML/AI
              </SectionTitle>
              <ul className="space-y-2.5 text-[13.5px]">
                {MINI_PROJECT_1.map((r) => (
                  <li key={r} className="flex items-start gap-2.5">
                    <Circle className="h-2 w-2 mt-2 fill-current text-[var(--accent)] shrink-0" />
                    <span className="text-fg-muted">{r}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13.5px] font-medium">{p1.name}</p>
                  <p className="text-[12.5px] text-fg-faint">{p1.definition_of_done}</p>
                </div>
                <Link to="/projects">
                  <Button size="sm">Track it</Button>
                </Link>
              </div>
            </Card>
          </div>
        }
      />
    </div>
  );
}
