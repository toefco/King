import { useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { useStore } from '../../store';
import { Skill } from '../../types';
import VideoCard from './VideoCard';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

const skillTypeMeta = [
  { value: 'sword' as const, label: '剑花', icon: '⚔️' },
  { value: 'boxing' as const, label: '拳击', icon: '🥊' },
  { value: 'nunchaku' as const, label: '双节棍', icon: '🥋' },
  { value: 'calligraphy' as const, label: '毛笔字', icon: '🖌️' },
];

export default function SkillGrid() {
  const skills = useStore((state) => state.skills);
  const addSkill = useStore((state) => state.addSkill);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    type: 'sword' as Skill['type'],
    title: '',
    videoUrl: '',
    coverUrl: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skill: Skill = {
      id: Date.now().toString(),
      ...form,
      date: form.date || new Date().toISOString().split('T')[0],
    };
    addSkill(skill);
    setForm({ type: 'sword', title: '', videoUrl: '', coverUrl: '', description: '', date: new Date().toISOString().split('T')[0] });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {isAdding && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6" style={{
            background: 'rgba(8,15,35,0.97)',
            border: '1px solid rgba(59,130,246,0.25)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1)',
            backdropFilter: 'blur(24px)',
          }}>
            {/* top accent line */}
            <div className="absolute top-0 left-8 right-8 h-px rounded-full" style={{
              background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)'
            }} />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif" style={{ color: '#93c5fd' }}>添加技艺</h3>
              <button onClick={() => setIsAdding(false)} className="text-paper/60 hover:text-paper">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-paper/60 mb-2">技艺类型</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Skill['type'] })}
                  className="w-full rounded-xl px-4 py-2.5 text-paper focus:outline-none"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(59,130,246,0.2)')}
                >
                  {skillTypeMeta.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-paper/60 mb-2">标题</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-paper focus:outline-none"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(59,130,246,0.2)')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-paper/60 mb-2">视频URL</label>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-paper focus:outline-none"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(59,130,246,0.2)')}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm text-paper/60 mb-2">封面图片</label>
                <div
                  className="w-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-blue-400/50 hover:bg-blue-500/5 transition-all"
                  style={{ borderColor: 'rgba(59,130,246,0.3)' }}
                  onClick={() => document.getElementById('skill-cover-upload')?.click()}
                >
                  <input
                    id="skill-cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const base64 = await fileToBase64(file);
                        setForm({ ...form, coverUrl: base64 });
                      }
                    }}
                  />
                  {form.coverUrl ? (
                    <div className="relative">
                      <img src={form.coverUrl} alt="" className="w-full h-20 object-cover rounded-lg" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded"
                        onClick={(e) => { e.stopPropagation(); setForm({ ...form, coverUrl: '' }); }}
                      >
                        <X size={14} className="text-paper" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-paper/40">
                      <Upload size={20} />
                      <span className="text-sm">点击上传封面图片（可选）</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-paper/60 mb-2">描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-paper focus:outline-none min-h-24 resize-none"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(59,130,246,0.2)')}
                />
              </div>
              <div>
                <label className="block text-sm text-paper/60 mb-2">归档日期</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-paper focus:outline-none"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(59,130,246,0.2)')}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {skillTypeMeta.map(({ value, label, icon }) => {
        const typeSkills = skills.filter((s) => s.type === value);
        return (
          <div key={value} className="panel-skills">
            {/* top accent line */}
            <div className="absolute top-0 left-6 right-6 h-px" style={{
              background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)'
            }} />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <h3 className="text-lg font-serif" style={{ color: '#60a5fa' }}>{label}</h3>
                {typeSkills.length > 0 && (
                  <span className="text-sm text-paper/40">· {typeSkills.length} 个</span>
                )}
              </div>
              <button
                onClick={() => { setForm((f) => ({ ...f, type: value })); setIsAdding(true); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{ color: 'rgba(59,130,246,0.6)', border: '1px solid rgba(59,130,246,0.15)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#60a5fa';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.08)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(59,130,246,0.6)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.15)';
                }}
              >
                <Plus size={12} />
                添加
              </button>
            </div>
            {typeSkills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeSkills.map((skill) => (
                  <VideoCard key={skill.id} skill={skill} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-16 text-paper/20 text-sm">
                暂无记录，点击添加
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
