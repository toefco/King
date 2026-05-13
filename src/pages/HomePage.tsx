import { SpaceScene, RotatingModules } from '../components/Home';

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Space Scene */}
      <SpaceScene />

      {/* 圆形可拖动导航模块 */}
      <RotatingModules />
    </div>
  );
}
