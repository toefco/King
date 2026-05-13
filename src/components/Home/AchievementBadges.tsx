import { Award, Trophy, Medal, Star } from 'lucide-react';
import { useStore } from '../../store';

const badgeIcons = {
  Award,
  Trophy,
  Medal,
  Star,
};

export default function AchievementBadges() {
  const talents = useStore((state) => state.talents);

  const badges = talents.filter(t => t.score >= 85).map((t, index) => {
    const Icon = Object.values(badgeIcons)[index % 4];
    return { ...t, Icon };
  });

  if (badges.length === 0) return null;

  return (
    <div className="card">
      <h2 className="text-xl font-serif text-gold mb-6 text-center">成就徽章</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="flex flex-col items-center p-4 rounded-lg bg-gold/5 hover:bg-gold/10 transition-colors"
          >
            <badge.Icon size={32} className="text-gold mb-2" />
            <span className="text-sm text-paper/80">{badge.name}</span>
            <span className="text-xs text-gold">{badge.score}分</span>
          </div>
        ))}
      </div>
    </div>
  );
}
