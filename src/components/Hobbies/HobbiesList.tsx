import { useState } from 'react';
import { Plus, X, Star, Trash2, Play, Upload, Camera, ExternalLink } from 'lucide-react';
import { useStore } from '../../store';
import { Hobby } from '../../types';

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

const hobbyTypeMeta = [
  { value: 'music' as const, label: '听歌', icon: '🎵' },
  { value: 'tea' as const, label: '饮茶', icon: '🍵' },
  { value: 'building' as const, label: '搭积木', icon: '🧱' },
  { value: 'gaming' as const, label: '玩游戏', icon: '🎮' },
];

// 自动提取 YouTube 缩略图
function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  return null;
}

export default function HobbiesList() {
  const hobbies = useStore((state) => state.hobbies);
  const addHobby = useStore((state) => state.addHobby);
  const deleteHobby = useStore((state) => state.deleteHobby);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  const [form, setForm] = useState({
    type: 'music' as Hobby['type'],
    title: '',
    content: '',
    milestone: false,
    imageUrl: '',
    imageLink: '',
    imageMode: 'local' as 'local' | 'url',
    mediaType: 'image' as 'image' | 'video',
    coverUrl: '',
  });

  // 渲染单个里程碑卡片
  const renderMilestoneCard = (hobby: Hobby) => {
    const isVideo = hobby.mediaType === 'video';
    return (
      <div
        key={hobby.id}
        className="group relative aspect-[1/1] rounded-xl overflow-hidden transition-all duration-300 cursor-pointer"
        style={{ border: '1px solid rgba(236,72,153,0.12)' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(236,72,153,0.35)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(236,72,153,0.12)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(236,72,153,0.12)';
          (e.currentTarget as HTMLDivElement).style.transform = 'none';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        }}
        onClick={() => {
          if (hobby.imageUrl) {
            isVideo
              ? setSelectedVideo({ url: hobby.imageUrl, title: hobby.title })
              : setSelectedImage({ url: hobby.imageUrl, title: hobby.title });
          }
        }}
      >
        {hobby.imageUrl && !isVideo ? (
          <img src={hobby.imageUrl} alt={hobby.title} loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
        ) : isVideo && hobby.imageUrl ? (
          (() => {
            const thumb = hobby.coverUrl || getYoutubeThumbnail(hobby.imageUrl);
            return thumb ? (
              <>
                <img src={thumb} alt={hobby.title} loading="lazy" decoding="async" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="p-3 rounded-full bg-gold/20 border border-gold/30 backdrop-blur-sm">
                    <Play size={22} className="text-gold fill-gold" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-ink flex items-center justify-center">
                <div className="p-4 rounded-full bg-gold/20 border border-gold/30">
                  <Play size={28} className="text-gold fill-gold" />
                </div>
              </div>
            );
          })()
        ) : (
          <div className="w-full h-full bg-ink/50 flex items-center justify-center">
            <Star size={24} className="text-gold/30 fill-gold/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-xs text-paper/90 font-serif line-clamp-1">{hobby.title}</p>
          <p className="text-[10px] text-paper/50">{hobby.date}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); deleteHobby(hobby.id); }}
          className="absolute top-1.5 right-1.5 z-10 p-1 rounded bg-ink/80 text-paper/40 hover:text-cinnabar opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={12} />
        </button>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImageUrl = form.mediaType === 'image' 
      ? (form.imageMode === 'local' ? form.imageUrl : form.imageLink)
      : form.imageUrl;
    const hobby: Hobby = {
      id: Date.now().toString(),
      ...form,
      imageUrl: finalImageUrl,
      date: new Date().toISOString().split('T')[0],
    };
    addHobby(hobby);
    setForm({ 
      type: 'music', 
      title: '', 
      content: '', 
      milestone: false, 
      imageUrl: '', 
      imageLink: '', 
      imageMode: 'local', 
      mediaType: 'image', 
      coverUrl: '' 
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">

      {isAdding && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 relative" style={{
            background: 'rgba(15,5,20,0.97)',
            border: '1px solid rgba(236,72,153,0.25)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(236,72,153,0.08)',
            backdropFilter: 'blur(24px)',
          }}>
            <div className="absolute top-0 left-8 right-8 h-px" style={{
              background: 'linear-gradient(90deg, transparent, rgba(236,72,153,0.6), transparent)'
            }} />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif" style={{ color: '#f9a8d4' }}>记录里程碑</h3>
              <button onClick={() => setIsAdding(false)} className="text-paper/60 hover:text-paper">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-paper/60 mb-2">爱好类型</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Hobby['type'] })}
                  className="w-full rounded-xl px-4 py-2.5 text-paper focus:outline-none"
                  style={{ background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.2)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(236,72,153,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(236,72,153,0.2)')}
                >
                  <option value="music">听歌</option>
                  <option value="tea">饮茶</option>
                  <option value="building">搭积木</option>
                  <option value="gaming">玩游戏</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-paper/60 mb-2">内容</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-paper focus:outline-none min-h-24 resize-none"
                  style={{ background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.2)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(236,72,153,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(236,72,153,0.2)')}
                  required
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.milestone}
                  onChange={(e) => setForm({ ...form, milestone: e.target.checked })}
                  className="w-5 h-5 rounded focus:ring-0"
                  style={{ accentColor: '#ec4899' }}
                />
                <span className="text-sm text-paper/70">标记为重要里程碑</span>
              </label>
              {form.milestone && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-paper/70 mb-2">媒体类型</label>
                    <div className="flex gap-3">
                      {(['image', 'video'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm({ ...form, mediaType: t, imageUrl: '' })}
                          className={`flex-1 py-2 rounded-lg text-sm transition-colors border ${
                            form.mediaType === t
                              ? 'bg-gold/20 text-gold border-gold/40'
                              : 'bg-ink/50 text-paper/60 border-gold/10 hover:text-paper'
                          }`}
                        >
                          {t === 'image' ? '🖼 图片' : '🎬 视频'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-paper/70 mb-2">
                      {form.mediaType === 'image' ? '图片（可选）' : '视频URL（可选）'}
                    </label>
                    {form.mediaType === 'image' ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, imageMode: 'local' })}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 border ${
                              form.imageMode === 'local' 
                                ? 'bg-gold/20 text-gold border-gold/40' 
                                : 'bg-ink/50 text-paper/60 border-gold/10 hover:text-paper'
                            }`}
                          >
                            <Camera size={14} />
                            本地图片
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, imageMode: 'url' })}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 border ${
                              form.imageMode === 'url' 
                                ? 'bg-gold/20 text-gold border-gold/40' 
                                : 'bg-ink/50 text-paper/60 border-gold/10 hover:text-paper'
                            }`}
                          >
                            <ExternalLink size={14} />
                            网络链接
                          </button>
                        </div>
                        
                        {form.imageMode === 'local' ? (
                          <div
                            className="w-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-pink-400/50 hover:bg-pink-500/5 transition-all"
                            style={{ borderColor: 'rgba(236,72,153,0.3)' }}
                            onClick={() => document.getElementById('hobby-image-upload')?.click()}
                          >
                            <input
                              id="hobby-image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const base64 = await fileToBase64(file);
                                  setForm({ ...form, imageUrl: base64 });
                                }
                              }}
                            />
                            {form.imageUrl ? (
                              <div className="relative">
                                <img src={form.imageUrl} alt="" className="w-full h-20 object-cover rounded-lg" />
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 p-1 bg-black/50 rounded"
                                  onClick={(e) => { e.stopPropagation(); setForm({ ...form, imageUrl: '' }); }}
                                >
                                  <X size={14} className="text-paper" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-paper/40">
                                <Upload size={20} />
                                <span className="text-sm">点击上传图片</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="url"
                              value={form.imageLink}
                              onChange={(e) => setForm({ ...form, imageLink: e.target.value })}
                              className="w-full rounded-xl px-4 py-2.5 text-paper focus:outline-none"
                              style={{ background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.2)' }}
                              onFocus={e => (e.target.style.borderColor = 'rgba(236,72,153,0.5)')}
                              onBlur={e => (e.target.style.borderColor = 'rgba(236,72,153,0.2)')}
                              placeholder="https://..."
                            />
                            {form.imageLink && (
                              <div className="relative rounded-lg overflow-hidden border border-gold/10">
                                <img
                                  src={form.imageLink}
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-20 object-cover rounded-lg"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="url"
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        className="w-full rounded-xl px-4 py-2.5 text-paper focus:outline-none"
                        style={{ background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.2)' }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(236,72,153,0.5)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(236,72,153,0.2)')}
                        placeholder="https://..."
                      />
                    )}
                    {form.mediaType === 'video' && (
                      <div className="mt-3 space-y-2">
                        <label className="block text-sm text-paper/70">封面图URL（可选，自动识别YouTube）</label>
                        <input
                          type="url"
                          value={form.coverUrl}
                          onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                          className="w-full rounded-xl px-4 py-2.5 text-paper focus:outline-none"
                          style={{ background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.2)' }}
                          onFocus={e => (e.target.style.borderColor = 'rgba(236,72,153,0.5)')}
                          onBlur={e => (e.target.style.borderColor = 'rgba(236,72,153,0.2)')}
                          placeholder="https://..."
                        />
                        {/* 预览封面：优先用户填写，其次自动提取YouTube缩略图 */}
                        {(form.coverUrl || (form.imageUrl && getYoutubeThumbnail(form.imageUrl))) && (
                          <div className="relative rounded-lg overflow-hidden border border-gold/10">
                            <img
                              src={form.coverUrl || getYoutubeThumbnail(form.imageUrl)!}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="w-full aspect-video object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="p-3 rounded-full bg-gold/30 border border-gold/50">
                                <Play size={20} className="text-gold fill-gold" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4个分类里程碑区 */}
      {hobbyTypeMeta.map(({ value, label, icon }) => {
        const typeMilestones = hobbies.filter((h) => h.milestone && h.type === value);
        return (
          <div key={value} className="panel-hobbies">
            <div className="absolute top-0 left-6 right-6 h-px" style={{
              background: 'linear-gradient(90deg, transparent, rgba(236,72,153,0.5), transparent)'
            }} />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <h3 className="text-lg font-serif" style={{ color: '#f472b6' }}>{label}</h3>
                {typeMilestones.length > 0 && (
                  <span className="text-sm text-paper/40">· {typeMilestones.length} 个</span>
                )}
              </div>
              <button
                onClick={() => { setForm((f) => ({ ...f, type: value, milestone: true })); setIsAdding(true); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{ color: 'rgba(236,72,153,0.6)', border: '1px solid rgba(236,72,153,0.15)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#f472b6';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(236,72,153,0.08)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(236,72,153,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(236,72,153,0.6)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(236,72,153,0.15)';
                }}
              >
                <Plus size={12} />
                添加
              </button>
            </div>
            {typeMilestones.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {typeMilestones.map(renderMilestoneCard)}
              </div>
            ) : (
              <div className="flex items-center justify-center h-16 text-paper/20 text-sm">
                暂无记录，点击添加
              </div>
            )}
          </div>
        );
      })}

      {/* 图片放大预览 */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="fixed top-4 right-4 z-50 p-2 rounded-full bg-ink/80 text-paper/70 hover:text-paper transition-colors">
              <X size={24} />
            </button>
            <img src={selectedImage.url} alt={selectedImage.title} loading="lazy" decoding="async" className="w-full rounded-xl" />
            <p className="text-center text-sm text-gold font-serif mt-3">{selectedImage.title}</p>
          </div>
        </div>
      )}

      {/* 视频播放弹窗 */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setSelectedVideo(null)}>
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedVideo(null)} className="fixed top-4 right-4 z-50 p-2 rounded-full bg-ink/80 text-paper/70 hover:text-paper transition-colors">
              <X size={24} />
            </button>
            <div className="aspect-video bg-ink rounded-xl overflow-hidden">
              <iframe
                src={selectedVideo.url}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-center text-sm text-gold font-serif mt-3">{selectedVideo.title}</p>
          </div>
        </div>
      )}

    </div>
  );
}
