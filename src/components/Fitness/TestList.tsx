import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import { FitnessTest } from '../../types';

const testTypes = [
  { value: 'flexibility', label: '柔韧性：坐姿体前屈', unit: '厘米' },
  { value: 'balance', label: '平衡力：单腿站立', unit: '秒' },
  { value: 'core', label: '核心力：平板支撑', unit: '秒' },
  { value: 'cardio', label: '心肺有氧：爬楼机8级', unit: '分钟' },
  { value: 'breathing', label: '吐纳：每分钟呼吸频率', unit: '次' },
];

export default function TestList() {
  const fitnessTests = useStore((state) => state.fitnessTests);
  const addFitnessTest = useStore((state) => state.addFitnessTest);
  const deleteFitnessTest = useStore((state) => state.deleteFitnessTest);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    type: 'balance' as FitnessTest['type'],
    value: 0,
    value2: 0,
    date: new Date().toISOString().split('T')[0],
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const info = testTypes.find((t) => t.value === form.type) || testTypes[0];
    const test: FitnessTest = {
      id: Date.now().toString(),
      date: form.date,
      type: form.type,
      value: form.value,
      unit: info.unit,
    };
    addFitnessTest(test);
    setForm({ type: 'flexibility', value: 0, value2: 0, date: new Date().toISOString().split('T')[0] });
    setIsAdding(false);
  };

  return (
    <div className="panel-fitness">
      {/* top accent line */}
      <div className="absolute top-0 left-6 right-6 h-px rounded-full" style={{
        background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)'
      }} />
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-serif" style={{ color: '#fca5a5' }}>身体基础数据</span>
        <button onClick={() => setIsAdding(!isAdding)} className="btn-secondary text-sm flex items-center gap-2">
          <Plus size={16} />
          扫描数据
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-4 p-4 rounded-xl space-y-3" style={{
          background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)'
        }}>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as FitnessTest['type'], value: 0, value2: 0 })}
              className="rounded-lg px-3 py-2 text-paper text-sm focus:outline-none"
              style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(239,68,68,0.2)' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(239,68,68,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(239,68,68,0.2)')}
            >
              {testTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="rounded-lg px-3 py-2 text-paper text-sm focus:outline-none"
              style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(239,68,68,0.2)' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(239,68,68,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(239,68,68,0.2)')}
            />
          </div>
          <input
            type="number"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            className="w-full rounded-lg px-3 py-2 text-paper text-sm focus:outline-none"
            style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(239,68,68,0.2)' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(239,68,68,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(239,68,68,0.2)')}
            placeholder="数值"
          />
          <button type="submit" className="w-full btn-primary text-sm">保存</button>
        </form>
      )}

      {/* 数据展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {testTypes.map((type) => {
          const latest = fitnessTests.filter((t) => t.type === type.value).slice(-1)[0];
          return (
            <div key={type.value} className="p-4 rounded-xl group" style={{
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.12)',
              boxShadow: 'inset 0 1px 0 rgba(239,68,68,0.06)'
            }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm text-paper/60 mb-1">{type.label}</div>
                  <div className="text-xl font-serif" style={{ color: '#ef4444' }}>
                    {latest ? latest.value : '--'}
                    <span className="text-sm text-paper/50 ml-1">{latest ? latest.unit : type.unit}</span>
                  </div>
                  <div className="text-xs text-paper/40 mt-1">
                    {latest ? latest.date : '暂无数据'}
                  </div>
                </div>
                {latest && (
                  <button
                    onClick={() => deleteFitnessTest(latest.id)}
                    className="text-paper/20 hover:text-cinnabar transition-colors opacity-0 group-hover:opacity-100 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 历史记录列表 */}
      {fitnessTests.length > 0 && (
        <div>
          <div className="text-sm text-paper/50 mb-3 pt-3" style={{ borderTop: '1px solid rgba(239,68,68,0.08)' }}>
            历史记录 · {fitnessTests.length} 条
          </div>
          <div className="space-y-2">
            {[...fitnessTests]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((test) => {
                const info = testTypes.find((t) => t.value === test.type);
                return (
                  <div key={test.id} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm group" style={{
                    background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.08)'
                  }}>
                    <span className="text-paper/60">{info?.label || test.type}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-sm" style={{ color: '#ef4444' }}>
                        {test.value}{test.unit}
                      </span>
                      <span className="text-xs text-paper/30">{test.date}</span>
                      <button
                        onClick={() => deleteFitnessTest(test.id)}
                        className="text-paper/30 hover:text-cinnabar transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
