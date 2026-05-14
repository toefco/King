import { CognitionList, TraitPanel } from '../components/Spirit';
import { BackButton } from '../components/Layout';

export default function SpiritPage() {
  return (
    <div className="min-h-screen relative pt-16">
      {/* Spirit ambient glow - purple consciousness */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(168,85,247,0.10) 0%, transparent 65%)'
      }} />
      <BackButton />
      <main className="p-6 lg:p-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <TraitPanel />
          <CognitionList />
        </div>
      </main>
    </div>
  );
}
