import { useState } from 'react';
import { Trash2, ArrowUp, ArrowDown, Edit2 } from 'lucide-react';
import { useStore } from '../../store';
import { Workout } from '../../types';

const actionColors = [
  '#4a90d9', '#c73e3a', '#d4af37', '#2d5a27', '#9b59b6',
  '#e67e22', '#1abc9c', '#e74c3c', '#3498db', '#f39c12',
];

type SortField = 'date' | 'volume';
type SortOrder = 'asc' | 'desc';

interface Props {
  onEdit?: (workout: Workout) => void;
}

export default function WorkoutList({ onEdit }: Props) {
  const workouts = useStore((state) => state.workouts);
  const deleteWorkout = useStore((state) => state.deleteWorkout);

  const [activeFilter, setActiveFilter] = useState<string>('全部');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const actionSet = ['全部', ...new Set(workouts.map((w) => w.exercise))];

  const filtered = workouts
    .filter((w) => activeFilter === '全部' || w.exercise === activeFilter)
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else {
        const volumeA = a.weight * a.sets * a.reps;
        const volumeB = b.weight * b.sets * b.reps;
        comparison = volumeA - volumeB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="panel-fitness">
      {/* top accent line */}
      <div className="absolute top-0 left-6 right-6 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)'
      }} />

      {/* 筛选按钮 */}
      <div className="flex flex-wrap gap-1 mb-4">
        {actionSet.map((action, i) => (
          <button
            key={action}
            onClick={() => setActiveFilter(action)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              activeFilter === action
                ? 'text-ink font-medium'
                : 'text-paper/50 hover:text-paper border border-white/10'
            }`}
            style={{ backgroundColor: activeFilter === action ? actionColors[(i - 1 + actionColors.length) % actionColors.length] : 'transparent' }}
          >
            {action}
          </button>
        ))}
      </div>

      {/* 排序按钮 */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => toggleSort('date')}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
          style={{
            color: sortField === 'date' ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.5)',
            background: sortField === 'date' ? 'rgba(239,68,68,0.1)' : 'transparent',
            border: '1px solid',
            borderColor: sortField === 'date' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)',
          }}
        >
          {sortField === 'date' && (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
          日期
        </button>
        <button
          onClick={() => toggleSort('volume')}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
          style={{
            color: sortField === 'volume' ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.5)',
            background: sortField === 'volume' ? 'rgba(239,68,68,0.1)' : 'transparent',
            border: '1px solid',
            borderColor: sortField === 'volume' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)',
          }}
        >
          {sortField === 'volume' && (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
          容量
        </button>
      </div>

      {/* 记录列表 */}
      <div className="space-y-3">
        {filtered.map((workout) => (
          <div
            key={workout.id}
            className="flex items-center justify-between p-3 rounded-xl transition-all duration-200"
            style={{
              background: 'rgba(239,68,68,0.04)',
              border: '1px solid rgba(239,68,68,0.10)'
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(239,68,68,0.28)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(239,68,68,0.10)')}
          >
            <div>
              <div className="text-paper/90 font-medium">{workout.exercise}</div>
              <div className="text-xs text-paper/50 mt-1">
                {workout.date} · {workout.sets}组 × {workout.reps}次 · {workout.weight}kg
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(workout)}
                  className="p-2 text-paper/40 hover:text-gold transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              )}
              <button
                onClick={() => deleteWorkout(workout.id)}
                className="p-2 text-paper/40 hover:text-cinnabar transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-paper/30 text-sm py-8">
          暂无记录
        </div>
      )}
    </div>
  );
}
