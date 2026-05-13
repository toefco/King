import { HobbiesList } from '../components/Hobbies';
import { BackButton } from '../components/Layout';

export default function HobbiesPage() {
  return (
    <div className="min-h-screen relative pt-16">
      {/* Hobbies ambient glow - pink life */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse 60% 50% at 95% 60%, rgba(236,72,153,0.08) 0%, transparent 65%)'
      }} />
      <BackButton />
      <main className="p-6 lg:p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <HobbiesList />
        </div>
      </main>
    </div>
  );
}
