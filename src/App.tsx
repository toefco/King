import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header, SpaceBackground } from './components/Layout';
import { HomePage, FitnessPage, WisdomPage, SpiritPage, SkillsPage, HobbiesPage, TimePage } from './pages';
import { AiSprite } from './components/shared/AiSprite';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 强制跳转到首页
    const currentPath = window.location.pathname;
    if (currentPath !== '/' && currentPath !== '') {
      // 延迟一点确保页面完全加载
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } else {
      setIsReady(true);
    }
  }, []);

  // 如果还没准备好，不渲染主要内容
  if (!isReady) {
    return (
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <SpaceBackground />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* 全局共用星空画布：放在路由外面，切换页面不销毁重建 */}
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
      {/* 全站共用智能复盘精灵 */}
      <AiSprite />
    </div>
  );
}

export default App;
