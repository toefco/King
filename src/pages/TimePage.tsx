import { TimeAllocation, HappinessEvent } from '../components/Time';
import { BackButton } from '../components/Layout';

export default function TimePage() {
  return (
    <div className="min-h-screen relative pt-16">
      {/* Time ambient glow - green flow */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse 50% 60% at 5% 90%, rgba(16,185,129,0.09) 0%, transparent 65%)'
      }} />
      <BackButton />
      <main className="p-6 lg:p-8 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <TimeAllocation />
          <HappinessEvent />
        </div>
      </main>
    </div>
  );
}
