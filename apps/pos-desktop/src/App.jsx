import React, { lazy, Suspense, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import Onboarding from './components/Onboarding';

// Lazy loading - Code Splitting
const DesktopLayout = lazy(() => import('./components/DesktopLayout'));
const WaiterApp = lazy(() => import('./mobile/WaiterApp'));

function App() {
  const [configChecked, setConfigChecked] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const settings = await window.electron.ipcRenderer.invoke('get-settings');
        if (settings && settings.restaurant_id && settings.access_key) {
          setIsConfigured(true);
        }
      } catch (err) {
        console.error('Config check failed:', err);
      } finally {
        setConfigChecked(true);
      }
    };
    checkConfig();
  }, []);

  if (!configChecked) return <LoadingSpinner />;

  if (!isConfigured) {
    return <Onboarding onComplete={() => window.location.reload()} />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Asosiy Desktop ilova */}
            <Route path="/" element={<DesktopLayout />} />

            {/* Mobil Ofitsiant ilovasi */}
            <Route path="/waiter" element={<WaiterApp />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;