import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useStore } from '../../store';

export default function HappinessChart() {
  const happiness = useStore((state) => state.happiness);

  const chartData = happiness.map((h) => ({
    date: h.date.slice(5),
    level: h.level,
    event: h.event,
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-serif text-gold mb-4">幸福指数趋势</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#d4af37" strokeOpacity={0.2} />
            <XAxis dataKey="date" stroke="#f5f0e6" strokeOpacity={0.6} />
            <YAxis domain={[0, 10]} stroke="#f5f0e6" strokeOpacity={0.6} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #d4af37', borderRadius: '8px' }}
              labelStyle={{ color: '#f5f0e6' }}
              formatter={(value: number, _name: string, props: any) => [value + '分', props.payload.event]}
            />
            <Area
              type="monotone"
              dataKey="level"
              stroke="#d4af37"
              fillOpacity={1}
              fill="url(#colorLevel)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
