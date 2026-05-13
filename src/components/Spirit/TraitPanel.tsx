import { useState, useRef, useEffect } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { useStore } from '../../store';
import { Trait } from '../../types';

export default function TraitPanel() {
  const traits = useStore((s) => s.traits);
  const addTrait = useStore((s) => s.addTrait);
  const deleteTrait = useStore((s) => s.deleteTrait);

  const [isAdding, setIsAdding] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  const handleAdd = () => {
    const text = inputVal.trim();
    if (!text) return;
    const trait: Trait = {
      id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString().split('T')[0],
    };
    addTrait(trait);
    setInputVal('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setIsAdding(false); setInputVal(''); }
  };

  return (
    <div className="panel-spirit mb-6">
      {/* top accent shimmer */}
      <div className="absolute top-0 left-6 right-6 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)'
      }} />
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: '#a855f7' }} />
          <h3 className="text-lg font-serif" style={{ color: '#c084fc' }}>特质</h3>
          {traits.length > 0 && (
            <span className="text-xs text-paper/30 ml-1">{traits.length} 条</span>
          )}
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ color: 'rgba(168,85,247,0.6)', border: '1px solid rgba(168,85,247,0.15)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#c084fc';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(168,85,247,0.08)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(168,85,247,0.3)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(168,85,247,0.6)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(168,85,247,0.15)';
          }}
        >
          <Plus size={12} />
          记录特质
        </button>
      </div>

      {/* 输入框（内联展开） */}
      {isAdding && (
        <div className="flex gap-2 mb-4">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述这个特质……"
            className="flex-1 rounded-xl px-4 py-2.5 text-sm text-paper placeholder-paper/25 focus:outline-none"
            style={{
              background: 'rgba(168,85,247,0.06)',
              border: '1px solid rgba(168,85,247,0.25)',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(168,85,247,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(168,85,247,0.25)')}
          />
          <button
            onClick={handleAdd}
            disabled={!inputVal.trim()}
            className="px-4 py-2.5 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            style={{
              background: 'rgba(168,85,247,0.15)',
              color: '#c084fc',
              border: '1px solid rgba(168,85,247,0.3)',
            }}
            onMouseEnter={e => !inputVal.trim() || ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(168,85,247,0.25)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(168,85,247,0.15)')}
          >
            确认
          </button>
          <button
            onClick={() => { setIsAdding(false); setInputVal(''); }}
            className="px-3 py-2.5 rounded-xl text-paper/40 hover:text-paper/70 transition-all"
            style={{ border: '1px solid rgba(168,85,247,0.15)' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 特质标签列表 */}
      {traits.length === 0 && !isAdding ? (
        <div
          className="flex items-center justify-center h-20 border-2 border-dashed rounded-xl cursor-pointer transition-all text-paper/25 text-sm gap-2"
          style={{ borderColor: 'rgba(168,85,247,0.15)' }}
          onClick={() => setIsAdding(true)}
          onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(168,85,247,0.35)')}
          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(168,85,247,0.15)')}
        >
          <Plus size={16} />
          点击记录你的第一条特质
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {traits.map((t) => (
            <TraitTag key={t.id} trait={t} onDelete={() => deleteTrait(t.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function TraitTag({ trait, onDelete }: { trait: Trait; onDelete: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="group relative flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all cursor-default"
      style={{
        background: 'rgba(168,85,247,0.07)',
        border: hover ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(168,85,247,0.18)',
        color: hover ? '#e9d5ff' : 'rgba(255,255,255,0.7)',
        boxShadow: hover ? '0 0 12px rgba(168,85,247,0.15)' : 'none',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className="leading-snug">{trait.text}</span>
      {hover && (
        <button
          onClick={onDelete}
          className="w-4 h-4 flex items-center justify-center rounded-full bg-paper/10 hover:bg-red-500/20 text-paper/40 hover:text-red-400 transition-all"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}
