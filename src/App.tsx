import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useStore, applyTheme } from '@/store';
import { AppShell } from '@/components/AppShell';
import { PageSkeleton, Toast } from '@/components/ui';
import DashboardPage from '@/pages/DashboardPage';

const RoadmapPage = lazy(() => import('@/pages/RoadmapPage'));
const DailyPlanPage = lazy(() => import('@/pages/DailyPlanPage'));
const DsaPage = lazy(() => import('@/pages/DsaPage'));
const CoreCsPage = lazy(() => import('@/pages/CoreCsPage'));
const AiMlPage = lazy(() => import('@/pages/AiMlPage'));
const GenAiPage = lazy(() => import('@/pages/GenAiPage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const CertificationsPage = lazy(() => import('@/pages/CertificationsPage'));
const ReviewsPage = lazy(() => import('@/pages/ReviewsPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

function Booting() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-semibold">
            90
          </div>
          <div className="font-semibold tracking-tight">90-Day Career OS</div>
        </div>
        <PageSkeleton />
      </div>
    </div>
  );
}

export default function App() {
  const init = useStore((s) => s.init);
  const status = useStore((s) => s.status);
  const toast = useStore((s) => s.toast);
  const dismissToast = useStore((s) => s.dismissToast);
  const theme = useStore((s) => s.data?.settings?.theme);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (theme) applyTheme(theme);
    else applyTheme('light');
  }, [theme]);

  if (status === 'loading') {
    return (
      <>
        <Booting />
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route
            path="/roadmap"
            element={<Suspense fallback={<PageSkeleton />}><RoadmapPage /></Suspense>}
          />
          <Route
            path="/daily"
            element={<Suspense fallback={<PageSkeleton />}><DailyPlanPage /></Suspense>}
          />
          <Route
            path="/dsa"
            element={<Suspense fallback={<PageSkeleton />}><DsaPage /></Suspense>}
          />
          <Route
            path="/core-cs"
            element={<Suspense fallback={<PageSkeleton />}><CoreCsPage /></Suspense>}
          />
          <Route
            path="/ai-ml"
            element={<Suspense fallback={<PageSkeleton />}><AiMlPage /></Suspense>}
          />
          <Route
            path="/genai"
            element={<Suspense fallback={<PageSkeleton />}><GenAiPage /></Suspense>}
          />
          <Route
            path="/projects"
            element={<Suspense fallback={<PageSkeleton />}><ProjectsPage /></Suspense>}
          />
          <Route
            path="/certifications"
            element={<Suspense fallback={<PageSkeleton />}><CertificationsPage /></Suspense>}
          />
          <Route
            path="/reviews"
            element={<Suspense fallback={<PageSkeleton />}><ReviewsPage /></Suspense>}
          />
          <Route
            path="/analytics"
            element={<Suspense fallback={<PageSkeleton />}><AnalyticsPage /></Suspense>}
          />
          <Route
            path="/settings"
            element={<Suspense fallback={<PageSkeleton />}><SettingsPage /></Suspense>}
          />
        </Route>
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </>
  );
}
