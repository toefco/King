import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useStore } from '../../store';

const activityColors: Record<string, string> = {
  '晨跑': '#4a90d9',
  '早餐': '#d4af37',
  '工作': '#2d5a27',
  '午餐': '#c73e3a',
  '午休': '#9b59b6',
  '健身': '#c73e3a',
  '晚餐': '#d4af37',
  '阅读/学习': '#2d5a27',
  '休闲娱乐': '#9b59b6',
};

export default function ScheduleChart() {
  const schedules = useStore((state) => state.schedules);

  const chartData = schedules.map((s) => ({
    time: s.timeSlot.split('-')[0],
    activity: s.activity,
    hours: parseFloat(((parseInt(s.timeSlot.split('-')[1]) - parseInt(s.timeSlot.split('-')[0]))).toString()),
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-serif text-gold mb-4">今日作息</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#d4af37" strokeOpacity={0.2} />
            <XAxis type="number" stroke="#f5f0e6" strokeOpacity={0.6} />
            <YAxis type="category" dataKey="time" stroke="#f5f0e6" strokeOpacity={0.6} width={50} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #d4af37', borderRadius: '8px' }}
              labelStyle={{ color: '#f5f0e6' }}
              formatter={(value: number, _name: string, props: any) => [value + '小时', props.payload.activity]}
            />
            <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={activityColors[entry.activity] || '#d4af37'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
