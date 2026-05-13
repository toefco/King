import { SkillGrid } from '../components/Skills';
import { BackButton } from '../components/Layout';

export default function SkillsPage() {
  return (
    <div className="min-h-screen relative pt-16">
      {/* Skills ambient glow - blue tech */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse 50% 60% at 10% 50%, rgba(59,130,246,0.08) 0%, transparent 65%)'
      }} />
      <BackButton />
      <main className="p-6 lg:p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <SkillGrid />
        </div>
      </main>
    </div>
  );
}
