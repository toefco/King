import { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import { useStore, isOwnerMode } from '../../store';

export function DataManager() {
  const exportData = useStore(s => s.exportData);
  const [isOpen, setIsOpen] = useState(false);
  const [ownerOn, setOwnerOn] = useState(isOwnerMode());

  useEffect(() => {
    setOwnerOn(isOwnerMode());
  }, []);

  const handleExport = () => {
    try {
      const snapshot = exportData();
      const json = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `talent-showcase-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('导出失败', e);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
        style={{
          color: 'rgba(255,255,255,0.45)',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.04)',
        }}
      >
        <Database size={12} />
        <span>数据</span>
        {ownerOn && (
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#6ee7b7', boxShadow: '0 0 4px #6ee7b7',
            display: 'inline-block',
          }} />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1.5 w-56 rounded-xl overflow-hidden z-50"
            style={{
              background: 'rgba(10,10,28,0.96)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <button
              onClick={() => { handleExport(); setIsOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
              style={{ color: 'rgba(255,255,255,0.65)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span>导出数据</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
