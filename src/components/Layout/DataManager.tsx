import { useState, useEffect, useRef } from 'react';
import { Database, Download, Upload, Trash2 } from 'lucide-react';
import { useStore, isOwnerMode } from '../../store';

export function DataManager() {
  const downloadData = useStore(s => s.downloadData);
  const importData = useStore(s => s.importData);
  const clearAllData = useStore(s => s.clearAllData);
  const [isOpen, setIsOpen] = useState(false);
  const [ownerOn, setOwnerOn] = useState(isOwnerMode());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOwnerOn(isOwnerMode());
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          const result = importData(data);
          alert(result.message);
        } catch (error) {
          alert('导入失败：无效的JSON文件');
        }
      };
      reader.readAsText(file);
      // 清空input以便再次选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      clearAllData();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
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
              onClick={() => { downloadData(); setIsOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
              style={{ color: 'rgba(255,255,255,0.65)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Download size={14} />
              <span>下载数据</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
              style={{ color: 'rgba(255,255,255,0.65)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Upload size={14} />
              <span>导入数据</span>
            </button>
            
            <button
              onClick={handleClear}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
              style={{ color: 'rgba(239, 68, 68, 0.8)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Trash2 size={14} />
              <span>清空数据</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
