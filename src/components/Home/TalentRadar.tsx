import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store';

export default function TalentRadar() {
  const talents = useStore((state) => state.talents);

  const data = talents.map((t) => ({
    subject: t.name,
    A: t.score,
    fullMark: 100,
  }));

  return (
    <div className="card">
      <h2 className="text-xl font-serif text-gold mb-6 text-center">天赋雷达图</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#d4af37" strokeOpacity={0.3} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#f5f0e6', fontSize: 14 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#f5f0e6' }} />
            <Radar
              name="天赋评分"
              dataKey="A"
              stroke="#d4af37"
              fill="#d4af37"
              fillOpacity={0.5}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
