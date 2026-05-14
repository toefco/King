import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header, SpaceBackground } from './components/Layout';
import { HomePage, FitnessPage, WisdomPage, SpiritPage, SkillsPage, HobbiesPage, TimePage } from './pages';
import { AiSprite } from './components/shared/AiSprite';
import { useDataSync } from './hooks/useDataSync';

function App() {
  const [isReady, setIsReady] = useState(false);
  useDataSync();

  useEffect(() => {
    if (!sessionStorage.getItem('app_initialized')) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '') {
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        setIsReady(true);
      }
      sessionStorage.setItem('app_initialized', 'true');
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return (
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <SpaceBackground />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <SpaceBackground />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fitness" element={<FitnessPage />} />
          <Route path="/wisdom" element={<WisdomPage />} />
          <Route path="/spirit" element={<SpiritPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/hobbies" element={<HobbiesPage />} />
          <Route path="/time" element={<TimePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <AiSprite />
    </div>
  );
}

export default App;
