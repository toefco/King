import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store';

const typeNames: Record<string, string> = {
  balance: '平衡力：闭眼单腿站立',
  flexibility: '柔韧性：体前屈/背后交叉',
  core: '核心力：平板支撑',
  cardio: '心肺有氧：爬楼机8级',
};

const typeColors: Record<string, string> = {
  balance: '#c73e3a',
  flexibility: '#d4af37',
  core: '#2d5a27',
  cardio: '#4a90d9',
};

const typeKeys = Object.keys(typeNames) as Array<keyof typeof typeNames>;

export default function TestChart() {
  const fitnessTests = useStore((state) => state.fitnessTests);
  const [activeType, setActiveType] = useState<string>('balance');

  const filtered = fitnessTests
    .filter((t) => t.type === activeType)
    .sort((a, b) => a.date.localeCompare(b.date));

  const chartData = filtered.map((t) => ({
    date: t.date.slice(5),
    value: t.value,
  }));

  return (
    <div>
      <div className="mb-3" style={{ perspective: '120px' }}>
        <TrendingUp
          size={28}
          className="text-gold"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.5)) drop-shadow(0 2px 4px rgba(212,175,55,0.3))',
            transform: 'rotateY(12deg) rotateX(-4deg) scale(1.05)',
          }}
        />
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {typeKeys.map((key) => (
          <button
            key={key}
            onClick={() => setActiveType(key)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              activeType === key
                ? 'text-ink font-medium'
                : 'text-paper/50 hover:text-paper border border-white/10'
            }`}
            style={{ backgroundColor: activeType === key ? typeColors[key] : 'transparent' }}
          >
            {key === 'balance' ? '平衡力' : key === 'flexibility' ? '柔韧性' : key === 'core' ? '核心力' : '心肺有氧'}
          </button>
        ))}
      </div>

      <div className="h-56">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${activeType}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={typeColors[activeType]} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={typeColors[activeType]} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#d4af37" strokeOpacity={0.2} />
              <XAxis dataKey="date" stroke="#f5f0e6" strokeOpacity={0.6} tick={{ fontSize: 12 }} />
              <YAxis stroke="#f5f0e6" strokeOpacity={0.6} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #d4af37', borderRadius: '8px' }}
                labelStyle={{ color: '#f5f0e6' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={typeColors[activeType]}
                fill={`url(#gradient-${activeType})`}
                strokeWidth={2}
                dot={{ fill: typeColors[activeType], r: 4 }}
                name={typeNames[activeType]}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-paper/30 text-sm">
            暂无该类型数据
          </div>
        )}
      </div>
    </div>
  );
}
