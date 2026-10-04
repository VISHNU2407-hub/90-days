import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  Code2,
  Database,
  BrainCircuit,
  Bot,
  FolderKanban,
  Award,
  NotebookPen,
  ChartLine,
  Settings as SettingsIcon,
  Menu,
  X,
  Flame,
  Sun,
  Moon,
  MoreHorizontal,
} from 'lucide-react';
import { cn, initials } from '@/lib/utils';
import { useStore, applyTheme } from '@/store';
import { getDayInfo } from '@/lib/compute';
import { currentStreak } from '@/lib/compute';
import { Button } from '@/components/ui';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'Today' },
  { to: '/daily', label: 'Daily Plan', icon: CalendarCheck, group: 'Today' },
  { to: '/roadmap', label: '90-Day Roadmap', icon: Map, group: 'Plan' },
  { to: '/reviews', label: 'Weekly Reviews', icon: NotebookPen, group: 'Plan' },
  { to: '/analytics', label: 'Analytics', icon: ChartLine, group: 'Plan' },
  { to: '/dsa', label: 'DSA', icon: Code2, group: 'Learn' },
  { to: '/core-cs', label: 'Core CS', icon: Database, group: 'Learn' },
  { to: '/ai-ml', label: 'AI / ML', icon: BrainCircuit, group: 'Learn' },
  { to: '/genai', label: 'GenAI & Agents', icon: Bot, group: 'Learn' },
  { to: '/projects', label: 'Projects', icon: FolderKanban, group: 'Build' },
  { to: '/certifications', label: 'Certifications', icon: Award, group: 'Build' },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, group: 'Build' },
];

const BOTTOM_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/daily', label: 'Today', icon: CalendarCheck },
  { to: '/dsa', label: 'DSA', icon: Code2 },
  { to: '/analytics', label: 'Stats', icon: ChartLine },
];

function usePlanMeta() {
  const data = useStore((s) => s.data);
  const info = getDayInfo(data?.settings ?? null);
  const streak = data ? currentStreak(data) : 0;
  return { info, streak };
}

function Brand() {
  const { info } = usePlanMeta();
  return (
    <div className="flex items-center gap-2.5 px-1">
      <div className="h-9 w-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-semibold text-[13px] shadow-sm">
        90
      </div>
      <div className="leading-tight">
        <div className="text-[14px] font-semibold tracking-tight">Career OS</div>
        <div className="text-[11px] text-fg-faint">Day {info.day} of 90</div>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const saveSettings = useStore((s) => s.saveSettings);
  const isDark = document.documentElement.classList.contains('dark');
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={() => {
        const next = isDark ? 'light' : 'dark';
        applyTheme(next);
        saveSettings({ theme: next });
      }}
      data-theme-toggle
      suppressHydrationWarning
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const groups = ['Today', 'Plan', 'Learn', 'Build'];
  return (
    <nav className="space-y-5">
      {groups.map((g) => (
        <div key={g}>
          <div className="px-3 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-fg-faint">
            {g}
          </div>
          <div className="space-y-0.5">
            {NAV_ITEMS.filter((n) => n.group === g).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-3 h-9 rounded-lg text-[13.5px] font-medium transition-colors',
                    isActive
                      ? 'bg-accent-soft text-[var(--accent)]'
                      : 'text-fg-muted hover:text-fg hover:bg-[var(--surface-2)]',
                  )
                }
              >
                <n.icon className="h-4 w-4 shrink-0" />
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function ProfileBlock() {
  const data = useStore((s) => s.data);
  const name = data?.profile?.name ?? 'Me';
  return (
    <div className="flex items-center gap-2.5 px-2 py-2 border-t border-border mt-3 pt-3">
      <div className="h-8 w-8 rounded-full bg-[var(--surface-3)] border border-border flex items-center justify-center text-[12px] font-semibold">
        {initials(name)}
      </div>
      <div className="min-w-0 grow">
        <div className="text-[13px] font-medium truncate">{name}</div>
        <div className="text-[11px] text-fg-faint truncate">Saved on this device</div>
      </div>
    </div>
  );
}

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { info, streak } = usePlanMeta();

  return (
    <div className="min-h-screen bg-bg">
      {/* ---------------- desktop sidebar ---------------- */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-[248px] flex-col border-r border-border bg-surface px-3 py-4 z-30">
        <div className="px-1 mb-6">
          <Brand />
        </div>
        <div className="grow overflow-y-auto -mx-1 px-1">
          <SideNav />
        </div>
        <ProfileBlock />
      </aside>

      {/* ---------------- mobile drawer ---------------- */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[80%] max-w-[300px] bg-surface border-r border-border px-4 py-4 flex flex-col animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <Brand />
              <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grow overflow-y-auto">
              <SideNav onNavigate={() => setDrawerOpen(false)} />
            </div>
            <ProfileBlock />
          </div>
        </div>
      )}

      {/* ---------------- main column ---------------- */}
      <div className="md:pl-[248px]">
        <header className="sticky top-0 z-20 bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] backdrop-blur-md border-b border-border">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
            <button
              className="md:hidden h-9 w-9 -ml-1.5 rounded-lg flex items-center justify-center hover:bg-[var(--surface-2)]"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="md:hidden grow">
              <Brand />
            </div>

            <div className="hidden md:flex items-center gap-2 text-[13px] text-fg-muted">
              <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-lg bg-[var(--surface-2)] border border-border font-medium text-fg tabular">
                DAY {info.day} <span className="text-fg-faint">/ 90</span>
              </span>
              <span className="text-fg-faint">
                Phase {info.phase} · Week {info.week}
              </span>
            </div>

            <div className="grow md:grow-0" />

            <span className="inline-flex items-center gap-1 px-2.5 h-7 rounded-lg bg-warning-soft text-[var(--warning)] text-[12.5px] font-medium tabular">
              <Flame className="h-3.5 w-3.5" />
              {streak}
            </span>
            <ThemeToggle />
          </div>
        </header>

        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12">
          <Outlet context={{ info }} />
        </main>
      </div>

      {/* ---------------- mobile bottom nav ---------------- */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">
          {BOTTOM_ITEMS.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition-colors',
                  isActive ? 'text-[var(--accent)]' : 'text-fg-faint',
                )
              }
            >
              <n.icon className="h-5 w-5" />
              {n.label}
            </NavLink>
          ))}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-[10.5px] font-medium text-fg-faint"
          >
            <MoreHorizontal className="h-5 w-5" />
            More
          </button>
        </div>
      </nav>
    </div>
  );
}

export function useInfo() {
  const { info } = usePlanMeta();
  return info;
}
