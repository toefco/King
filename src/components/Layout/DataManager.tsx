import { useState, useRef, useEffect } from 'react';
import { Download, Upload, Trash2, Database, AlertTriangle, Shield } from 'lucide-react';
import { useStore, AppDataSnapshot, isOwnerMode } from '../../store';

export function DataManager() {
  const exportData = useStore(s => s.exportData);
  const importData = useStore(s => s.importData);
  const clearAllData = useStore(s => s.clearAllData);

  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [ownerOn, setOwnerOn] = useState(isOwnerMode());
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setMessage({ type: 'success', text: '数据已导出为 JSON 文件' });
    } catch (e) {
      setMessage({ type: 'error', text: `导出失败: ${e instanceof Error ? e.message : String(e)}` });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const snapshot: AppDataSnapshot = JSON.parse(reader.result as string);
        const result = importData(snapshot);
        setMessage({ type: result.success ? 'success' : 'error', text: result.message });
      } catch (err) {
        setMessage({ type: 'error', text: `文件解析失败: ${err instanceof Error ? err.message : String(err)}` });
      }
      setTimeout(() => setMessage(null), 4000);
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: '文件读取失败' });
      setTimeout(() => setMessage(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    clearAllData();
    setShowClearConfirm(false);
    setIsOpen(false);
    setMessage({ type: 'success', text: '所有数据已清空，已恢复初始状态' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
          style={{
            color: 'rgba(255,255,255,0.45)',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
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
              {/* 主人模式指示器 */}
              <div
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs"
                style={{ color: ownerOn ? 'rgba(110,231,183,0.85)' : 'rgba(255,255,255,0.45)' }}
              >
                <Shield size={13} className="opacity-50" />
                <span className="flex-1 text-left">主人模式</span>
                <span className="text-[10px] opacity-60">{ownerOn ? '本地访问中' : '外网访问'}</span>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              <button
                onClick={() => { handleExport(); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.65)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Download size={13} className="opacity-50" />
                导出全部数据
              </button>

              <button
                onClick={() => { fileInputRef.current?.click(); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.65)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Upload size={13} className="opacity-50" />
                导入数据备份
              </button>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              <button
                onClick={() => { setShowClearConfirm(true); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
                style={{ color: 'rgba(255,100,100,0.65)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,60,60,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Trash2 size={13} className="opacity-50" />
                清空所有数据
              </button>
            </div>
          </>
        )}

        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
      </div>

      {/* 清空确认弹窗 */}
      {showClearConfirm && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
          <div className="fixed inset-0 z-[61] flex items-center justify-center" onClick={() => setShowClearConfirm(false)}>
            <div
              className="w-full max-w-sm mx-4 rounded-2xl p-6"
              style={{
                background: 'rgba(12,12,30,0.97)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,60,60,0.15)', border: '1px solid rgba(255,60,60,0.25)' }}>
                  <AlertTriangle size={16} style={{ color: '#ff5555' }} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">确认清空所有数据？</h3>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    此操作将清除六大系统的全部录入记录，恢复为初始演示数据。建议先导出一份备份。此操作不可撤销。
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-1.5 rounded-lg text-xs transition-colors"
                  style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  取消
                </button>
                <button
                  onClick={() => handleClear()}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ color: '#fff', background: 'rgba(255,60,60,0.7)', border: '1px solid rgba(255,60,60,0.5)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,60,60,0.9)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,60,60,0.7)')}
                >
                  确认清空
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast 消息 */}
      {message && (
        <div
          className="fixed top-4 right-4 z-[70] px-4 py-2.5 rounded-xl text-xs animate-scale-in max-w-sm"
          style={{
            background: message.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(255,60,60,0.15)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,60,60,0.3)'}`,
            color: message.type === 'success' ? '#6ee7b7' : '#ff8888',
            backdropFilter: 'blur(12px)',
            whiteSpace: 'pre-line',
          }}
        >
          {message.text}
        </div>
      )}
    </>
  );
}
