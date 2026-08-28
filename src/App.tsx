import { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import ImportDialog from './components/features/ImportDialog';
import NicknameModal from './components/features/NicknameModal';
import AppShell from './components/layout/AppShell';
import ScrollToTop from './components/layout/ScrollToTop';
import { LearningPathProvider } from './contexts/LearningPathContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { ThemeProvider } from './contexts/ThemeContext';
import EinordnenPage from './pages/EinordnenPage';
import EntdeckenGalleryPage from './pages/EntdeckenGalleryPage';
import EntdeckenPage from './pages/EntdeckenPage';
import InformationenPage from './pages/InformationenPage';
import KnowledgeUnitPage from './pages/KnowledgeUnitPage';
import LandingPage from './pages/LandingPage';
import LearningPathBriefingPage from './pages/LearningPathBriefingPage';
import LearningPathCheckoutPage from './pages/LearningPathCheckoutPage';
import LernenPage from './pages/LernenPage';
import TaskPage from './pages/TaskPage';
import VerstehenPage from './pages/VerstehenPage';

// Dev-only routes: dynamically imported so they never enter the production bundle.
// Vite replaces import.meta.env.DEV with `false` in production builds,
// and tree-shaking removes the entire lazy() call and its import target.
const DevRoutes = import.meta.env.DEV
  ? lazy(() => import('./DevRoutes'))
  : null;

export default function App() {
  useEffect(() => {
    const splash = document.getElementById('splash');
    if (!splash) return;

    let removeTimer: number | undefined;
    const fadeTimer = window.setTimeout(() => {
      splash.style.opacity = '0';
      removeTimer = window.setTimeout(() => {
        splash.remove();
      }, 400);
    }, 200);

    return () => {
      window.clearTimeout(fadeTimer);
      if (removeTimer !== undefined) {
        window.clearTimeout(removeTimer);
      }
    };
  }, []);

  return (
    <ThemeProvider>
      <ProgressProvider>
        <HashRouter>
          <LearningPathProvider>
            <ScrollToTop />
            <NicknameModal />
            <ImportDialog />
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/verstehen" element={<VerstehenPage />} />
                <Route path="/verstehen/:unitId" element={<KnowledgeUnitPage />} />
                <Route path="/entdecken" element={<EntdeckenPage />} />
                <Route path="/entdecken/:subject" element={<EntdeckenGalleryPage />} />
                <Route path="/einordnen" element={<EinordnenPage />} />
                <Route path="/einordnen/:unitId" element={<KnowledgeUnitPage />} />
                <Route path="/lernen" element={<LernenPage />} />
                <Route path="/lernen/:pathId" element={<LernenPage />} />
                <Route path="/lernen/:pathId/briefing" element={<LearningPathBriefingPage />} />
                <Route path="/lernen/:pathId/aufgabe/:stepNumber" element={<TaskPage />} />
                <Route path="/lernen/:pathId/abschluss/:stepNumber" element={<LearningPathCheckoutPage />} />
                <Route path="/informationen" element={<InformationenPage />} />
                {DevRoutes && (
                  <Route path="/*" element={<Suspense fallback={null}><DevRoutes /></Suspense>} />
                )}
              </Route>
            </Routes>
          </LearningPathProvider>
        </HashRouter>
      </ProgressProvider>
    </ThemeProvider>
  );
}
