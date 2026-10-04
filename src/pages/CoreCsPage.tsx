import { LearningPanel } from '@/components/LearningPanel';
import { CORE_CS_ROWS, CORE_CS_METHOD, HIGH_VALUE_QUESTIONS } from '@/lib/seed/roadmap';
import { Badge, Card, PageHeader, SectionTitle } from '@/components/ui';

export default function CoreCsPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Core CS"
        subtitle="OOP · SQL · DBMS · OS · Networks — every topic attached to an interview output, not just reading."
      />

      <LearningPanel
        track="corecs"
        extra={
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-5 lg:col-span-2">
              <h3 className="text-[15px] font-semibold tracking-tight mb-3">
                Learn → must be able to answer/build
              </h3>
              <div className="space-y-3">
                {CORE_CS_ROWS.map((r) => (
                  <div
                    key={r.topic}
                    className="rounded-xl bg-[var(--surface-2)] border border-border p-3.5 grid sm:grid-cols-[90px_1fr_1fr] gap-2 sm:gap-4"
                  >
                    <Badge tone="violet">{r.topic}</Badge>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-fg-faint mb-1">
                        Learn
                      </div>
                      <p className="text-[13px] leading-relaxed">{r.learn}</p>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-fg-faint mb-1">
                        Must be able to
                      </div>
                      <p className="text-[13px] leading-relaxed text-[var(--accent)]">{r.output}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <SectionTitle>Core CS weekly method</SectionTitle>
              <ol className="space-y-2 text-[13.5px] list-decimal pl-5 text-fg-muted">
                {CORE_CS_METHOD.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ol>
            </Card>

            <Card className="p-5">
              <SectionTitle>High-value interview questions</SectionTitle>
              <ul className="space-y-2 text-[13.5px]">
                {HIGH_VALUE_QUESTIONS.map((q, i) => (
                  <li key={q} className="flex gap-2.5">
                    <span className="text-fg-faint tabular shrink-0">{i + 1}.</span>
                    <span className="text-fg-muted">{q}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        }
      />
    </div>
  );
}
