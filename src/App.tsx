import { useEffect, Suspense, lazy } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useImagensStore } from './store/useImagensStore';
import { useAccessibilityStore } from './store/useAccessibilityStore';
import { useNavigationStore } from './store/useNavigationStore';
import { PublicLandingPage } from './pages/PublicLandingPage';
import { TopBar } from './components/layout/TopBar';
import { Header } from './components/layout/Header';
const Footer = lazy(() => import('./components/layout/Footer').then(m => ({ default: m.Footer })));
import { LazyLoadSection } from './components/ui/LazyLoadSection';
import { DashboardSkeleton } from './components/layout/DashboardSkeleton';
import { VLibrasWidget } from './components/ui/VLibrasWidget';

const ExternalLinkModal = lazy(() => import('./components/ui/ExternalLinkModal').then(m => ({ default: m.ExternalLinkModal })));

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const CompleteProfilePage = lazy(() => import('./pages/CompleteProfilePage').then(m => ({ default: m.CompleteProfilePage })));
const LoggedDashboard = lazy(() => import('./pages/LoggedDashboard').then(m => ({ default: m.LoggedDashboard })));

export default function App() {
  const { user, profileComplete, loading, initializeAuth, cleanupAuth, fetchTotais, isLoginOpen } = useAuthStore();
  const { fetchImagens } = useImagensStore();
  const { fontSizeScale, isHighContrast } = useAccessibilityStore();
  const { activeTab } = useNavigationStore();

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSizeScale * 100}%`;
    
    if (isHighContrast) {
      document.documentElement.classList.add('alto-contraste');
    } else {
      document.documentElement.classList.remove('alto-contraste');
    }
  }, [fontSizeScale, isHighContrast]);

  useEffect(() => {
    fetchTotais();
    fetchImagens();
    
    let hasPotentialSession = false;
    try {
      hasPotentialSession =
        localStorage.getItem('crasp_has_session') === '1' ||
        Object.keys(localStorage).some((k) => k.startsWith('firebase:'));
    } catch {}

    if (hasPotentialSession) {
      initializeAuth();
    } else {
      const handleFirstInteraction = () => {
        initializeAuth();
        window.removeEventListener('pointerdown', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('mousemove', handleFirstInteraction);
      };
      window.addEventListener('pointerdown', handleFirstInteraction, { passive: true, once: true });
      window.addEventListener('keydown', handleFirstInteraction, { passive: true, once: true });
      window.addEventListener('touchstart', handleFirstInteraction, { passive: true, once: true });
      window.addEventListener('mousemove', handleFirstInteraction, { passive: true, once: true });
      return () => {
        window.removeEventListener('pointerdown', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('mousemove', handleFirstInteraction);
        cleanupAuth();
      };
    }
    
    return () => {
      cleanupAuth();
    };
  }, [fetchTotais, initializeAuth, cleanupAuth, fetchImagens]);

  useEffect(() => {
    if (isLoginOpen) {
      initializeAuth();
    }
  }, [isLoginOpen, initializeAuth]);

  let viewContent;
  if (!user && isLoginOpen) {
    viewContent = (
      <Suspense fallback={null}>
        <LoginPage />
      </Suspense>
    );
  } else if (user && profileComplete === false) {
    viewContent = (
      <Suspense fallback={<DashboardSkeleton />}>
        <CompleteProfilePage />
      </Suspense>
    );
  } else {
    let mainContent;
    if (user && activeTab !== 'vitrine') {
      if (loading || profileComplete === null) {
        mainContent = <DashboardSkeleton />;
      } else {
        mainContent = (
          <Suspense fallback={<DashboardSkeleton />}>
            <LoggedDashboard />
          </Suspense>
        );
      }
    } else {
      mainContent = <PublicLandingPage />;
    }

    viewContent = (
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <Header />
        <main className="flex-1 flex flex-col">
          {mainContent}
        </main>
        <LazyLoadSection height="400px">
          <Suspense fallback={<div className="h-[400px] w-full bg-blue-900" />}>
            <Footer />
          </Suspense>
        </LazyLoadSection>
      </div>
    );
  }

  return (
    <>
      {viewContent}
      <VLibrasWidget />
      <Suspense fallback={null}><ExternalLinkModal /></Suspense>
    </>
  );
}
