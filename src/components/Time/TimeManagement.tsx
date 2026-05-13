import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store';


export default function TimeManagement() {
  const happiness = useStore((state) => state.happiness);
  const addHappiness = useStore((state) => state.addHappiness);
  const deleteHappiness = useStore((state) => state.deleteHappiness);

  const [showAddHappiness, setShowAddHappiness] = useState(false);
  const [happinessForm, setHappinessForm] = useState({ event: '', level: 5 });

  const handleAddHappiness = (e: React.FormEvent) => {
    e.preventDefault();
    addHappiness({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      ...happinessForm,
    });
    setHappinessForm({ event: '', level: 5 });
    setShowAddHappiness(false);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-serif text-gold">幸福事件</h3>
        <button onClick={() => setShowAddHappiness(true)} className="btn-secondary text-sm flex items-center gap-2">
          <Plus size={16} />
          记录
        </button>
      </div>

      {showAddHappiness && (
        <form onSubmit={handleAddHappiness} className="mb-4 p-4 bg-ink/30 rounded-lg space-y-3">
          <input
            type="text"
            value={happinessForm.event}
            onChange={(e) => setHappinessForm({ ...happinessForm, event: e.target.value })}
            placeholder="幸福事件"
            className="w-full bg-ink/50 border border-gold/30 rounded px-3 py-2 text-paper text-sm"
            required
          />
          <div>
            <label className="text-xs text-paper/50 mb-2 block">幸福指数: {happinessForm.level}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={happinessForm.level}
              onChange={(e) => setHappinessForm({ ...happinessForm, level: Number(e.target.value) })}
              className="w-full accent-gold"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowAddHappiness(false)} className="flex-1 btn-secondary text-sm py-2">取消</button>
            <button type="submit" className="flex-1 btn-primary text-sm py-2">保存</button>
          </div>
        </form>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {happiness.map((h) => (
          <div key={h.id} className="flex items-center justify-between p-3 rounded bg-ink/30 border border-gold/10">
            <div className="flex-1">
              <div className="text-sm text-paper">{h.event}</div>
              <div className="text-xs text-paper/50">{h.date}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gold font-medium">{h.level}</span>
              <button onClick={() => deleteHappiness(h.id)} className="p-1 text-paper/40 hover:text-cinnabar">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
