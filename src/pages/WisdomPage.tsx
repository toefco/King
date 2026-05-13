import { BookGrid } from '../components/Wisdom';
import { BackButton } from '../components/Layout';

export default function WisdomPage() {
  return (
    <div className="min-h-screen relative pt-16">
      <BackButton />
      <main className="p-6 lg:p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <BookGrid />
        </div>
      </main>
    </div>
  );
}
