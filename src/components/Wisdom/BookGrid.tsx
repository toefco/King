import { useState, useMemo } from 'react';
import { Plus, X, Image, Trash2, Upload } from 'lucide-react';
import { useStore } from '../../store';
import { Book, YearSummary } from '../../types';
import BookCard from './BookCard';

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

export default function BookGrid() {
  const books = useStore((state) => state.books);
  const yearSummaries = useStore((state) => state.yearSummaries);
  const addBook = useStore((state) => state.addBook);
  const deleteYearSummary = useStore((state) => state.deleteYearSummary);
  const updateBookThoughts = useStore((state) => state.updateBookThoughts);
  const readingSlots = useStore((state) => state.readingSlots);
  const brokenSlots = useStore((state) => state.brokenSlots);
  const setReadingSlots = useStore((state) => state.setReadingSlots);
  const setBrokenSlots = useStore((state) => state.setBrokenSlots);

  const [isAdding, setIsAdding] = useState(false);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedType, setSelectedType] = useState<'cover' | 'data'>('cover');
  const [thoughts, setThoughts] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title: '',
    category: '',
    coverUrl: '',
    dataUrl: '',
    readDate: today,
    totalHours: 0,
    totalMinutes: 0,
    readingDays: 0,
    maxDailyHours: 0,
    maxDailyMinutes: 0,
  });
  const [slotForm, setSlotForm] = useState({
    slotIndex: 0,
    url: '',
  });
  const [selectedSummary, setSelectedSummary] = useState<YearSummary | null>(null);
  const [selectedSlotSummary, setSelectedSlotSummary] = useState<{year: string; imageUrl: string} | null>(null);

  const [selectedMonth, setSelectedMonth] = useState('all');

  const completedBooks = useMemo(() => {
    return books
      .filter((b) => b.status === 'completed')
      .sort((a, b) => (b.readDate || '').localeCompare(a.readDate || ''));
  }, [books]);

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    for (const book of completedBooks) {
      const ym = (book.readDate || '').slice(0, 7);
      if (ym) set.add(ym);
    }
    return Array.from(set).sort().reverse();
  }, [completedBooks]);

  const groupedBooks = useMemo(() => {
    const filtered = selectedMonth === 'all'
      ? completedBooks
      : completedBooks.filter((b) => (b.readDate || '').slice(0, 7) === selectedMonth);
    const groups: { label: string; books: Book[] }[] = [];
    for (const book of filtered) {
      const ym = (book.readDate || '').slice(0, 7);
      const label = ym ? `${ym.replace('-', '年')}月` : '未标记';
      const last = groups[groups.length - 1];
      if (last && last.label === label) {
        last.books.push(book);
      } else {
        groups.push({ label, books: [book] });
      }
    }
    return groups;
  }, [completedBooks, selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const book: Book = {
      id: Date.now().toString(),
      title: form.title || '未命名',
      category: form.category,
      author: '',
      ...form,
      status: 'completed',
    };
    addBook(book);
    setForm({ title: '', category: '', coverUrl: '', dataUrl: '', readDate: today, totalHours: 0, totalMinutes: 0, readingDays: 0, maxDailyHours: 0, maxDailyMinutes: 0 });
    setIsAdding(false);
  };

  const handleSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.url.trim()) return;
    const newSlots = [...readingSlots];
    newSlots[slotForm.slotIndex] = slotForm.url.trim();
    setReadingSlots(newSlots);
    const newBroken = brokenSlots.filter(s => s !== slotForm.slotIndex);
    setBrokenSlots(newBroken);
    setSlotForm({ slotIndex: 0, url: '' });
    setIsAddingSlot(false);
  };

  const openSlotModal = (index?: number) => {
    setSlotForm({ slotIndex: index || 0, url: readingSlots[index || 0] || '' });
    setIsAddingSlot(true);
  };

  const openModal = (book: Book, type: 'cover' | 'data' = 'cover') => {
    setSelectedBook(book);
    setSelectedType(type);
    setThoughts(book.thoughts || '');
  };

  const handleThoughtsSave = () => {
    if (selectedBook) {
      updateBookThoughts(selectedBook.id, thoughts);
      setSelectedBook({ ...selectedBook, thoughts });
    }
  };

  const handleDeleteSlot = (index: number) => {
    const newSlots = [...readingSlots];
    newSlots[index] = null;
    setReadingSlots(newSlots);
    const newBroken = brokenSlots.filter(s => s !== index);
    setBrokenSlots(newBroken);
  };

  const handleImageError = (index: number) => {
    if (!brokenSlots.includes(index)) {
      setBrokenSlots([...brokenSlots, index]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 阅读汇总栏 - 10格图片上传 */}
      <div className="bg-ink/70 border border-gold/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif text-gold">🏯 慧府</h3>
          <button
            onClick={() => openSlotModal()}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            深蓝加点
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {readingSlots.map((url, i) => (
            <div key={i} className="aspect-[1/1] rounded-xl overflow-hidden border border-gold/10 hover:border-gold/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300">
              {url ? (
                brokenSlots.includes(i) ? (
                  <button
                    className="flex flex-col items-center justify-center w-full h-full gap-1 text-cinnabar/40 hover:text-cinnabar hover:bg-cinnabar/5 transition-colors"
                    onClick={() => openSlotModal(i)}
                  >
                    <Image size={16} />
                    <span className="text-[10px]">重试</span>
                  </button>
                ) : (
                <div className="relative group/slot w-full h-full cursor-pointer" onClick={() => setSelectedSlotSummary({ year: `汇总 ${i + 1}`, imageUrl: url })}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSlot(i);
                    }}
                    className="absolute top-1.5 right-1.5 z-10 p-1 rounded bg-ink/80 text-paper/40 hover:text-cinnabar opacity-0 group-hover/slot:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                  <img
                    src={url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top"
                    onError={() => handleImageError(i)}
                  />
                </div>
                )
              ) : (
                <button
                  className="flex flex-col items-center justify-center w-full h-full gap-1 text-paper/30 hover:text-gold hover:bg-gold/5 transition-colors"
                  onClick={() => openSlotModal(i)}
                >
                  <Plus size={16} />
                  <span className="text-[10px]">添加</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 10格图片添加弹窗 - 深蓝加点风格 */}
      {isAddingSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink border border-gold/30 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center mb-6">
              <h3 className="text-xl font-serif text-gold text-center flex-1">深蓝加点</h3>
              <button onClick={() => setIsAddingSlot(false)} className="text-paper/60 hover:text-paper">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSlotSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-paper/70 mb-2">选择槽位</label>
                <select
                  value={slotForm.slotIndex}
                  onChange={(e) => setSlotForm({ ...slotForm, slotIndex: parseInt(e.target.value) })}
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-4 py-2 text-paper focus:outline-none focus:border-gold appearance-none"
                >
                  {readingSlots.map((_, i) => (
                    <option key={i} value={i} className="bg-ink">第 {i + 1} 格 {readingSlots[i] ? '(已占用)' : '(空)'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">图片文件</label>
                <div
                  className="w-full border-2 border-dashed border-gold/30 rounded-lg p-4 text-center cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all"
                  onClick={() => document.getElementById('slot-upload')?.click()}
                >
                  <input
                    id="slot-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const base64 = await fileToBase64(file);
                        setSlotForm({ ...slotForm, url: base64 });
                      }
                    }}
                  />
                  {slotForm.url ? (
                    <div className="relative">
                      <img src={slotForm.url} alt="" className="w-full h-24 object-cover rounded" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded"
                        onClick={(e) => { e.stopPropagation(); setSlotForm({ ...slotForm, url: '' }); }}
                      >
                        <X size={14} className="text-paper" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-paper/40">
                      <Upload size={24} />
                      <span className="text-sm">点击上传图片</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingSlot(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button type="submit" disabled={!slotForm.url.trim()} className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                  确定
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 顶部：日期筛选 + 添加按钮 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedMonth('all')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedMonth === 'all'
                ? 'bg-gold/20 text-gold'
                : 'bg-ink/50 text-paper/60 hover:text-paper'
            }`}
          >
            全部
          </button>
          {monthOptions.map((ym) => (
            <button
              key={ym}
              onClick={() => setSelectedMonth(ym)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedMonth === ym
                  ? 'bg-gold/20 text-gold'
                  : 'bg-ink/50 text-paper/60 hover:text-paper'
              }`}
            >
              {ym.replace('-', '年')}月
            </button>
          ))}
        </div>
        <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          深蓝加点
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink border border-gold/30 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center mb-6">
              <h3 className="text-xl font-serif text-gold text-center flex-1">深蓝加点</h3>
              <button onClick={() => setIsAdding(false)} className="text-paper/60 hover:text-paper">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-paper/70 mb-2">书籍名称</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="输入书籍名称"
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-4 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">书籍分类</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-4 py-2 text-paper focus:outline-none focus:border-gold"
                >
                  <option value="">选择分类</option>
                  <option value="哲学">哲学</option>
                  <option value="文学">文学</option>
                  <option value="历史">历史</option>
                  <option value="心理">心理</option>
                  <option value="商业">商业</option>
                  <option value="科技">科技</option>
                  <option value="艺术">艺术</option>
                  <option value="社科">社科</option>
                  <option value="生活">生活</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">封面图片</label>
                <div
                  className="w-full border-2 border-dashed border-gold/30 rounded-lg p-4 text-center cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all"
                  onClick={() => document.getElementById('cover-upload')?.click()}
                >
                  <input
                    id="cover-upload"
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
                      <img src={form.coverUrl} alt="" className="w-full h-24 object-cover rounded" />
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
                      <Upload size={24} />
                      <span className="text-sm">点击上传封面图片</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">数据图片</label>
                <div
                  className="w-full border-2 border-dashed border-gold/30 rounded-lg p-4 text-center cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all"
                  onClick={() => document.getElementById('data-upload')?.click()}
                >
                  <input
                    id="data-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const base64 = await fileToBase64(file);
                        setForm({ ...form, dataUrl: base64 });
                      }
                    }}
                  />
                  {form.dataUrl ? (
                    <div className="relative">
                      <img src={form.dataUrl} alt="" className="w-full h-24 object-cover rounded" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded"
                        onClick={(e) => { e.stopPropagation(); setForm({ ...form, dataUrl: '' }); }}
                      >
                        <X size={14} className="text-paper" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-paper/40">
                      <Upload size={24} />
                      <span className="text-sm">点击上传数据图片（可选）</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">读完日期</label>
                <input
                  type="date"
                  value={form.readDate}
                  onChange={(e) => setForm({ ...form, readDate: e.target.value })}
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-4 py-2 text-paper focus:outline-none focus:border-gold"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm text-paper/70 mb-2">累计时长</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="时"
                      value={form.totalHours || ''}
                      onChange={(e) => setForm({ ...form, totalHours: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="分"
                      value={form.totalMinutes || ''}
                      onChange={(e) => setForm({ ...form, totalMinutes: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-paper/70 mb-2">阅读天数</label>
                  <input
                    type="number"
                    min="0"
                    value={form.readingDays}
                    onChange={(e) => setForm({ ...form, readingDays: Number(e.target.value) })}
                    className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-paper/70 mb-2">单日最久</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="时"
                      value={form.maxDailyHours || ''}
                      onChange={(e) => setForm({ ...form, maxDailyHours: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="分"
                      value={form.maxDailyMinutes || ''}
                      onChange={(e) => setForm({ ...form, maxDailyMinutes: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button type="submit" disabled={!form.coverUrl} className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10格图片预览 */}
      {selectedSlotSummary && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-start justify-center z-50 overflow-y-auto p-4"
          onClick={() => setSelectedSlotSummary(null)}
        >
          <div className="relative w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedSlotSummary(null)}
              className="fixed top-4 right-4 z-50 p-2 rounded-full bg-ink/80 text-paper/70 hover:text-paper hover:bg-ink transition-colors"
            >
              <X size={24} />
            </button>
            <img src={selectedSlotSummary.imageUrl} alt="" loading="lazy" decoding="async" className="w-full rounded-xl" />
            <div className="absolute top-4 left-4 bg-ink/80 px-3 py-1.5 rounded-lg text-sm text-gold">
              {selectedSlotSummary.year} 数据
            </div>
          </div>
        </div>
      )}

      {/* 年度数据大图预览 */}
      {selectedSummary && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-start justify-center z-50 overflow-y-auto p-4"
          onClick={() => setSelectedSummary(null)}
        >
          <div className="relative w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedSummary(null)}
              className="fixed top-4 right-4 z-50 p-2 rounded-full bg-ink/80 text-paper/70 hover:text-paper hover:bg-ink transition-colors"
            >
              <X size={24} />
            </button>
            <img src={selectedSummary.imageUrl} alt="" loading="lazy" decoding="async" className="w-full rounded-xl" />
            <div className="absolute top-4 left-4 bg-ink/80 px-3 py-1.5 rounded-lg text-sm text-gold">
              {selectedSummary.year}年 数据总结
            </div>
          </div>
        </div>
      )}

      {/* 图片放大弹窗 */}
      {selectedBook && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-start justify-center z-50 overflow-y-auto p-4"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="relative w-full max-w-lg my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBook(null)}
              className="fixed top-4 right-4 z-50 p-2 rounded-full bg-ink/80 text-paper/70 hover:text-paper hover:bg-ink transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={selectedType === 'cover' ? selectedBook.coverUrl : selectedBook.dataUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full rounded-t-xl"
            />
            <div className="p-4 bg-ink border-t border-white/10 rounded-b-xl">
              <textarea
                value={thoughts}
                onChange={(e) => setThoughts(e.target.value)}
                onBlur={handleThoughtsSave}
                placeholder="写下对这本书的认知思考..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-paper/80 placeholder:text-paper/30 focus:outline-none focus:border-gold/40 resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 年度数据总览 */}
      {yearSummaries.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gold/20" />
            <span className="text-sm text-gold whitespace-nowrap flex items-center gap-2">
              <Image size={14} />
              年度数据总览
            </span>
            <div className="h-px flex-1 bg-gold/20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {yearSummaries.map((summary) => (
              <div key={summary.id} className="group relative rounded-2xl overflow-hidden border border-gold/10 hover:border-gold/30 transition-colors cursor-pointer" onClick={() => setSelectedSummary(summary)}>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteYearSummary(summary.id); }}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded bg-ink/80 text-paper/50 hover:text-cinnabar opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Trash2 size={14} />
                </button>
                <img src={summary.imageUrl} alt="" loading="lazy" decoding="async" className="w-full aspect-[1/1] object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/90 to-transparent p-3">
                  <span className="text-sm text-gold font-serif">{summary.year}年</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 按年月分组的网格 */}
      {groupedBooks.length === 0 ? (
        <div className="text-center py-20 text-paper/20">
          <p className="text-lg">暂无已读书籍</p>
          <p className="text-sm mt-2">点击"深蓝加点"上传你的阅读记录</p>
        </div>
      ) : (
        groupedBooks.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gold/10" />
              <span className="text-sm text-paper/40 whitespace-nowrap">
                {group.label} · {group.books.length}本
              </span>
              <div className="h-px flex-1 bg-gold/10" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
              {group.books.map((book) => (
                <BookCard key={book.id} book={book} onImageClick={openModal} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
