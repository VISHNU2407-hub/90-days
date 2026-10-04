import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  Repeat,
  EyeOff,
  ArrowRight,
  Flame,
  Lightbulb,
} from 'lucide-react';
import { useStore } from '@/store';
import {
  getDayInfo,
  overallProgress,
  weeklyStats,
  activityHeatmap,
  completionCurve,
  strongestAndWeakest,
  dsaStats,
  trackStats,
  projectSummaries,
  categoryStats,
  focusedMinutes,
  currentStreak,
} from '@/lib/compute';
import { nextBestActions } from '@/lib/priority';
import { LEARNING_TRACKS } from '@/lib/seed/tracks';
import { CATEGORIES, CATEGORY_LABEL } from '@/lib/types';
import { cn, formatDuration, round1 } from '@/lib/utils';
import { Card, CardHeader, PageHeader, Progress, SectionTitle, Badge } from '@/components/ui';
import { InsightCard, MeterRow, StatCard } from '@/components/shared';

const ACCENT = 'var(--accent)';
const SERIES = ['var(--accent)', 'var(--cyan)', 'var(--violet)', 'var(--success)', 'var(--warning)', 'var(--fg-faint)', 'var(--danger)', 'var(--fg-muted)'];

function ChartCard({
  title,
  subtitle,
  height = 240,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  height?: number;
  children: React.ReactElement;
  className?: string;
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader title={title} subtitle={subtitle} />
      <div className="px-3 pb-4" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

const tooltipStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  fontSize: 12.5,
  color: 'var(--fg)',
  padding: '8px 10px',
};

export default function AnalyticsPage() {
  const data = useStore((s) => s.data);

  const info = useMemo(() => getDayInfo(data?.settings ?? null), [data?.settings]);

  const derived = useMemo(() => {
    if (!data) return null;
    const overall = overallProgress(data, info);
    const weeks = weeklyStats(data, info);
    const heat = activityHeatmap(data, info);
    const curve = completionCurve(data, info);
    const areas = strongestAndWeakest(data, info);
    const dsa = dsaStats(data);
    const projects = projectSummaries(data);
    const cats = categoryStats(data, info);
    const recs = nextBestActions(data, info);
    return { overall, weeks, heat, curve, areas, dsa, projects, cats, recs };
  }, [data, info]);

  if (!data || !derived) return null;

  const { overall, weeks, heat, curve, areas, dsa, projects, cats, recs } = derived;
  const categoryData = CATEGORIES.map((c, i) => {
    const stat = cats.find((s) => s.category === c);
    return {
      name: CATEGORY_LABEL[c],
      minutes: Math.round((stat?.minutes ?? 0) / 60),
      color: SERIES[i % SERIES.length],
    };
  }).filter((d) => d.minutes > 0);

  const patternData = dsa.patterns.map((p) => ({
    name: p.name.length > 16 ? `${p.name.slice(0, 15)}…` : p.name,
    pct: p.pct,
    solved: p.solved,
    target: p.target,
  }));

  const projectData = projects.map((p, i) => ({
    name: p.name.replace('Project ', 'P').replace(' — ', ' '),
    progress: p.pct,
    color: SERIES[i % SERIES.length],
  }));

  const heatmap = heat.map((h) => ({ ...h, level: h.count === 0 ? 0 : h.count === 1 ? 1 : h.count <= 3 ? 2 : 3 }));
  const activeDays = heatmap.filter((h) => h.count > 0).length;
  const maxCount = Math.max(1, ...heatmap.map((h) => h.count));

  const learningBars = LEARNING_TRACKS.map((t) => ({
    label: t.label,
    pct: trackStats(data, t.key).pct,
    route: t.route,
  }));

  return (
    <div className="animate-fade-up">
      <PageHeader title="Analytics" />

      {/* ------------------------- headline stats ------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <StatCard label="Overall progress" value={`${overall.overall}%`} sub="weighted composite" tone="accent" />
        <StatCard label="Execution" value={`${overall.execution}%`} sub="tasks due so far" />
        <StatCard label="Study time" value={`${round1(focusedMinutes(data, info) / 60)}h`} sub={`${formatDuration(focusedMinutes(data, info))} logged`} />
        <StatCard label="Active days" value={`${activeDays}/90`} sub={`${currentStreak(data)} day streak`} icon={<Flame className="h-4 w-4" />} tone="warning" />
        <StatCard label="DSA" value={`${dsa.solved}`} sub={`${dsa.pct}% of 139 target`} />
      </div>

      {/* ------------------------- insights ------------------------- */}
      <SectionTitle>Area insights</SectionTitle>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        <InsightCard
          title="Strongest area"
          tone="success"
          body={areas.strongest ? `${areas.strongest.label} · ${areas.strongest.pct}%` : 'Not enough data yet'}
        />
        <InsightCard
          title="Weakest area"
          tone="warning"
          body={areas.weakest ? `${areas.weakest.label} · ${areas.weakest.pct}%` : 'Not enough data yet'}
        />
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-fg-faint mb-1.5">
            <Repeat className="h-3.5 w-3.5" /> Most consistent
          </div>
          <p className="text-[14px]">
            {areas.mostConsistent ? `${areas.mostConsistent.label} · ${areas.mostConsistent.pct}%` : 'Keep going'}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-fg-faint mb-1.5">
            <EyeOff className="h-3.5 w-3.5" /> Most neglected
          </div>
          <p className="text-[14px]">
            {areas.mostNeglected ? `${areas.mostNeglected.label} · ${areas.mostNeglected.pct}%` : 'Nothing neglected'}
          </p>
        </Card>
      </div>

      {/* ------------------------- recommendation ------------------------- */}
      <SectionTitle>Recommended next action</SectionTitle>
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {recs.map((r, i) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge tone={i === 0 ? 'accent' : 'neutral'}>#{i + 1}</Badge>
              <Lightbulb className="h-3.5 w-3.5 text-fg-faint" />
            </div>
            <p className="text-[14px] font-medium leading-snug">{r.title}</p>
            <p className="text-[13px] text-fg-muted mt-1.5 leading-relaxed">{r.detail}</p>
            <Link to={r.to} className="inline-flex items-center gap-1 text-[13px] text-[var(--accent)] hover:underline mt-2">
              {r.cta} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        ))}
      </div>

      {/* ------------------------- charts row 1 ------------------------- */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Weekly study hours" subtitle="Completed task time per week" height={250}>
          <BarChart data={weeks} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--fg-faint)' }} tickLine={false} axisLine={false} interval={0} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--fg-faint)' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-2)' }} formatter={(v) => [`${v}h`, 'Focused']} />
            <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
              {weeks.map((w, i) => (
                <Cell key={w.week} fill={w.week === info.week ? ACCENT : 'color-mix(in srgb, var(--accent) 40%, transparent)'} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="90-day completion curve" subtitle="Cumulative execution vs plan" height={250}>
          <LineChart data={curve} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--fg-faint)' }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--fg-faint)' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v}%`, n === 'pct' ? 'Your execution' : 'Ideal pace']} />
            <Line type="monotone" dataKey="ideal" stroke="var(--fg-faint)" strokeDasharray="5 4" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="pct" stroke={ACCENT} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ChartCard>
      </div>

      {/* ------------------------- charts row 2 ------------------------- */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Category distribution"
          subtitle="Focused hours by area"
          height={250}
        >
          <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--fg-faint)' }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 11, fill: 'var(--fg-faint)' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-2)' }} formatter={(v) => [`${v}h`, 'Focused']} />
            <Bar dataKey="minutes" radius={[0, 6, 6, 0]} barSize={16}>
              {categoryData.map((c, i) => (
                <Cell key={c.name} fill={SERIES[i % SERIES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Project progress" height={250}>
          <BarChart data={projectData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: 'var(--fg-faint)' }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--fg-faint)' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-2)' }} formatter={(v) => [`${v}%`, 'Progress']} />
            <Bar dataKey="progress" radius={[6, 6, 0, 0]} barSize={34}>
              {projectData.map((p, i) => (
                <Cell key={p.name} fill={SERIES[i % SERIES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>
      </div>

      {/* ------------------------- DSA patterns ------------------------- */}
      <Card className="mb-4">
        <CardHeader
          title="DSA pattern progress"
          subtitle={`${dsa.patternsOnTrack} of ${dsa.patterns.length} patterns on track · ${dsa.solved} problems solved`}
        />
        <div className="px-5 pb-5 grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {patternData.map((p) => (
            <div key={p.name}>
              <div className="flex items-center justify-between text-[12.5px] mb-1">
                <span className="truncate">{p.name}</span>
                <span className="tabular text-fg-muted">
                  {p.solved}/{p.target}
                </span>
              </div>
              <Progress value={p.pct} height={6} tone={p.pct >= 100 ? 'success' : p.pct >= 50 ? 'accent' : 'warning'} />
            </div>
          ))}
        </div>
      </Card>

      {/* ------------------------- heatmap + breakdown ------------------------- */}
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Daily activity"
            subtitle={`Day 1–90 · max ${maxCount} tasks/day`}
          />
          <div className="px-5 pb-5">
            <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1.5">
              {heatmap.map((h) => (
                <div
                  key={h.dateKey}
                  title={`Day ${h.day} · ${h.dateKey} · ${h.count} task(s) · ${formatDuration(h.minutes)}`}
                  className={cn(
                    'aspect-square rounded-[4px] border border-border/60 transition-colors',
                    h.level === 0 && 'bg-[var(--surface-2)]',
                    h.level === 1 && 'bg-[color-mix(in_srgb,var(--accent)_35%,transparent)]',
                    h.level === 2 && 'bg-[color-mix(in_srgb,var(--accent)_65%,transparent)]',
                    h.level === 3 && 'bg-[var(--accent)]',
                    h.day === info.day && 'ring-2 ring-[var(--warning)]',
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-[11.5px] text-fg-faint">
              <span>Less</span>
              {[0, 1, 2, 3].map((l) => (
                <span
                  key={l}
                  className={cn(
                    'h-3 w-3 rounded-[3px] border border-border/60',
                    l === 0 && 'bg-[var(--surface-2)]',
                    l === 1 && 'bg-[color-mix(in_srgb,var(--accent)_35%,transparent)]',
                    l === 2 && 'bg-[color-mix(in_srgb,var(--accent)_65%,transparent)]',
                    l === 3 && 'bg-[var(--accent)]',
                  )}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle>Overall progress model</SectionTitle>
          <div className="space-y-3.5">
            {overall.parts.map((p) => (
              <MeterRow
                key={p.key}
                label={`${p.key} · ${Math.round(p.weight * 100)}%`}
                value={p.value}
                detail={`${p.value}%`}
                tone={p.value >= 70 ? 'success' : p.value >= 40 ? 'accent' : 'warning'}
              />
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-[13px] text-fg-muted">Composite</span>
            <span className="text-[18px] font-semibold tabular">{overall.overall}%</span>
          </div>
        </Card>
      </div>

      {/* ------------------------- learning tracks ------------------------- */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {learningBars.map((t) => (
          <Card key={t.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Link to={t.route} className="text-[13.5px] font-medium hover:text-[var(--accent)]">
                {t.label}
              </Link>
              <span className="text-[13px] tabular text-fg-muted">{t.pct}%</span>
            </div>
            <Progress value={t.pct} tone={t.pct >= 70 ? 'success' : t.pct >= 40 ? 'accent' : 'warning'} height={7} />
          </Card>
        ))}
      </div>
    </div>
  );
}
