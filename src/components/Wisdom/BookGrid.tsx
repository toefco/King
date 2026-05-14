import { useState, useMemo } from 'react';
import { Plus, X, Image, Trash2, Upload, Edit2, ExternalLink, Camera } from 'lucide-react';
import { useStore } from '../../store';
import { Book, ReadingSlotObject } from '../../types';
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
  const addBook = useStore((state) => state.addBook);
  const updateBookThoughts = useStore((state) => state.updateBookThoughts);
  const updateBook = useStore((state) => state.updateBook);
  const readingSlots = useStore((state) => state.readingSlots);
  const brokenSlots = useStore((state) => state.brokenSlots);
  const setBrokenSlots = useStore((state) => state.setBrokenSlots);
  const updateReadingSlot = useStore((state) => state.updateReadingSlot);
  const deleteReadingSlot = useStore((state) => state.deleteReadingSlot);

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedType, setSelectedType] = useState<'cover' | 'data'>('cover');
  const [thoughts, setThoughts] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title: '',
    category: '',
    coverUrl: '',
    coverLink: '',
    coverMode: 'local' as 'local' | 'url',
    dataUrl: '',
    dataLink: '',
    dataMode: 'local' as 'local' | 'url',
    readDate: today,
    totalHours: 0,
    totalMinutes: 0,
    readingDays: 0,
    maxDailyHours: 0,
    maxDailyMinutes: 0,
  });
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [isZengHuanOpen, setIsZengHuanOpen] = useState(false);
  const [zengHuanSlotIndex, setZengHuanSlotIndex] = useState<number>(0);
  const [zengHuanForm, setZengHuanForm] = useState({
    imageUrl: '',
    imageLink: '',
    imageMode: 'local' as 'local' | 'url',
    totalYears: 0,
    totalHours: 0,
    totalMinutes: 0,
    totalBooks: 0,
    readingDays: 0,
  });
  const [selectedSlotSummary, setSelectedSlotSummary] = useState<{ year: string; imageUrl: string } | null>(null);

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
      author: '',
      ...form,
      status: 'completed',
    };
    addBook(book);
    setForm({ 
      title: '', 
      category: '', 
      coverUrl: '', 
      coverLink: '', 
      coverMode: 'local', 
      dataUrl: '', 
      dataLink: '', 
      dataMode: 'local', 
      readDate: today, 
      totalHours: 0, 
      totalMinutes: 0, 
      readingDays: 0, 
      maxDailyHours: 0, 
      maxDailyMinutes: 0 
    });
    setIsAdding(false);
  };

  const openEditModal = (book: Book) => {
    setEditingBookId(book.id);
    const isCoverUrl = book.coverUrl.startsWith('http');
    const isDataUrl = book.dataUrl?.startsWith('http') || false;
    setForm({
      title: book.title,
      category: book.category,
      coverUrl: isCoverUrl ? '' : book.coverUrl,
      coverLink: isCoverUrl ? book.coverUrl : '',
      coverMode: isCoverUrl ? 'url' : 'local',
      dataUrl: isDataUrl ? '' : (book.dataUrl || ''),
      dataLink: isDataUrl ? (book.dataUrl || '') : '',
      dataMode: isDataUrl ? 'url' : 'local',
      readDate: book.readDate || today,
      totalHours: book.totalHours || 0,
      totalMinutes: book.totalMinutes || 0,
      readingDays: book.readingDays || 0,
      maxDailyHours: book.maxDailyHours || 0,
      maxDailyMinutes: book.maxDailyMinutes || 0,
    });
    setIsEditing(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBookId) {
      const finalCoverUrl = form.coverMode === 'local' ? form.coverUrl : form.coverLink;
      const finalDataUrl = form.dataMode === 'local' ? form.dataUrl : form.dataLink;
      updateBook(editingBookId, {
        ...form,
        coverUrl: finalCoverUrl,
        dataUrl: finalDataUrl,
      });
    }
    setForm({ 
      title: '', 
      category: '', 
      coverUrl: '', 
      coverLink: '', 
      coverMode: 'local', 
      dataUrl: '', 
      dataLink: '', 
      dataMode: 'local', 
      readDate: today, 
      totalHours: 0, 
      totalMinutes: 0, 
      readingDays: 0, 
      maxDailyHours: 0, 
      maxDailyMinutes: 0 
    });
    setIsEditing(false);
    setEditingBookId(null);
  };

  const openZengHuanModal = (index: number) => {
    setZengHuanSlotIndex(index);
    const slot = readingSlots[index];
    if (slot && typeof slot === 'object' && 'id' in slot) {
      const isUrl = slot.imageUrl.startsWith('http');
      setZengHuanForm({
        imageUrl: isUrl ? '' : slot.imageUrl,
        imageLink: isUrl ? slot.imageUrl : '',
        imageMode: isUrl ? 'url' : 'local',
        totalYears: slot.totalYears || 0,
        totalHours: slot.totalHours || 0,
        totalMinutes: slot.totalMinutes || 0,
        totalBooks: slot.totalBooks || 0,
        readingDays: slot.readingDays || 0,
      });
    } else if (slot && typeof slot === 'string') {
      const isUrl = slot.startsWith('http');
      setZengHuanForm({
        imageUrl: isUrl ? '' : slot,
        imageLink: isUrl ? slot : '',
        imageMode: isUrl ? 'url' : 'local',
        totalYears: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalBooks: 0,
        readingDays: 0,
      });
    } else {
      setZengHuanForm({
        imageUrl: '',
        imageLink: '',
        imageMode: 'local',
        totalYears: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalBooks: 0,
        readingDays: 0,
      });
    }
    setIsZengHuanOpen(true);
  };

  const handleZengHuanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImageUrl = zengHuanForm.imageMode === 'local' ? zengHuanForm.imageUrl : zengHuanForm.imageLink;
    if (!finalImageUrl.trim()) return;
    
    const newSlot: ReadingSlotObject = {
      id: `slot-${zengHuanSlotIndex}`,
      imageUrl: finalImageUrl,
      totalYears: zengHuanForm.totalYears || undefined,
      totalHours: zengHuanForm.totalHours || undefined,
      totalMinutes: zengHuanForm.totalMinutes || undefined,
      totalBooks: zengHuanForm.totalBooks || undefined,
      readingDays: zengHuanForm.readingDays || undefined,
    };
    
    updateReadingSlot(zengHuanSlotIndex, newSlot);
    
    const newBroken = brokenSlots.filter(s => s !== zengHuanSlotIndex);
    setBrokenSlots(newBroken);
    
    setZengHuanForm({
      imageUrl: '',
      imageLink: '',
      imageMode: 'local',
      totalYears: 0,
      totalHours: 0,
      totalMinutes: 0,
      totalBooks: 0,
      readingDays: 0,
    });
    setIsZengHuanOpen(false);
  };

  const handleDeleteSlot = (index: number) => {
    deleteReadingSlot(index);
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

  const handleImageError = (index: number) => {
    if (!brokenSlots.includes(index)) {
      setBrokenSlots([...brokenSlots, index]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-ink/70 border border-gold/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif text-gold">🏯 慧府</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {readingSlots.map((slot, i) => {
            const url = slot && typeof slot === 'object' ? slot.imageUrl : (slot || null);
            return (
              <div key={i} className="aspect-[1/1] rounded-xl overflow-hidden border border-gold/10 hover:border-gold/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300">
                {url ? (
                  brokenSlots.includes(i) ? (
                    <button
                      className="flex flex-col items-center justify-center w-full h-full gap-1 text-cinnabar/40 hover:text-cinnabar hover:bg-cinnabar/5 transition-colors"
                      onClick={() => openZengHuanModal(i)}
                    >
                      <Image size={16} />
                      <span className="text-[10px]">重试</span>
                    </button>
                  ) : (
                  <div className="relative group/slot w-full h-full cursor-pointer" onClick={() => setSelectedSlotSummary({ year: `汇总 ${i + 1}`, imageUrl: url })}>
                    <div className="absolute top-1.5 left-1.5 flex gap-1 z-10 opacity-0 group-hover/slot:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openZengHuanModal(i);
                        }}
                        className="p-1 rounded bg-ink/80 text-paper/40 hover:text-gold"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
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
                    onClick={() => openZengHuanModal(i)}
                  >
                    <Plus size={16} />
                    <span className="text-[10px]">增寰</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isZengHuanOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink border border-gold/30 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center mb-6">
              <h3 className="text-xl font-serif text-gold text-center flex-1">增寰</h3>
              <button onClick={() => setIsZengHuanOpen(false)} className="text-paper/60 hover:text-paper">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleZengHuanSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-paper/70 mb-2">图片</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setZengHuanForm({ ...zengHuanForm, imageMode: 'local' })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                        zengHuanForm.imageMode === 'local' 
                          ? 'bg-gold/20 text-gold border border-gold/50' 
                          : 'bg-ink/50 text-paper/60 hover:text-paper'
                      }`}
                    >
                      <Camera size={14} />
                      本地图片
                    </button>
                    <button
                      type="button"
                      onClick={() => setZengHuanForm({ ...zengHuanForm, imageMode: 'url' })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                        zengHuanForm.imageMode === 'url' 
                          ? 'bg-gold/20 text-gold border border-gold/50' 
                          : 'bg-ink/50 text-paper/60 hover:text-paper'
                      }`}
                    >
                      <ExternalLink size={14} />
                      网络链接
                    </button>
                  </div>
                  
                  {zengHuanForm.imageMode === 'local' ? (
                    <div
                      className="w-full border-2 border-dashed border-gold/30 rounded-lg p-4 text-center cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all"
                      onClick={() => document.getElementById('zenghuan-cover-upload')?.click()}
                    >
                      <input
                        id="zenghuan-cover-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const base64 = await fileToBase64(file);
                            setZengHuanForm({ ...zengHuanForm, imageUrl: base64 });
                          }
                        }}
                      />
                      {zengHuanForm.imageUrl ? (
                        <div className="relative">
                          <img src={zengHuanForm.imageUrl} alt="" className="w-full h-24 object-cover rounded" />
                          <button
                            type="button"
                            className="absolute top-1 right-1 p-1 bg-black/50 rounded"
                            onClick={(e) => { e.stopPropagation(); setZengHuanForm({ ...zengHuanForm, imageUrl: '' }); }}
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
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={zengHuanForm.imageLink}
                        onChange={(e) => setZengHuanForm({ ...zengHuanForm, imageLink: e.target.value })}
                        placeholder="输入图片URL链接"
                        className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                      />
                      {zengHuanForm.imageLink && (
                        <div className="relative">
                          <img 
                            src={zengHuanForm.imageLink} 
                            alt="" 
                            className="w-full h-24 object-cover rounded" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-paper/70 mb-2">年份</label>
                  <input
                    type="number"
                    min="0"
                    value={zengHuanForm.totalYears || ''}
                    onChange={(e) => setZengHuanForm({ ...zengHuanForm, totalYears: Number(e.target.value) || 0 })}
                    className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm text-paper/70 mb-2">读过多少本</label>
                  <input
                    type="number"
                    min="0"
                    value={zengHuanForm.totalBooks || ''}
                    onChange={(e) => setZengHuanForm({ ...zengHuanForm, totalBooks: Number(e.target.value) || 0 })}
                    className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-paper/70 mb-2">阅读总计</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="小时"
                      value={zengHuanForm.totalHours || ''}
                      onChange={(e) => setZengHuanForm({ ...zengHuanForm, totalHours: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="分钟"
                      value={zengHuanForm.totalMinutes || ''}
                      onChange={(e) => setZengHuanForm({ ...zengHuanForm, totalMinutes: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-paper/70 mb-2">阅读天数</label>
                  <input
                    type="number"
                    min="0"
                    value={zengHuanForm.readingDays || ''}
                    onChange={(e) => setZengHuanForm({ ...zengHuanForm, readingDays: Number(e.target.value) || 0 })}
                    className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsZengHuanOpen(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button 
                  type="submit" 
                  disabled={!((zengHuanForm.imageMode === 'local' ? zengHuanForm.imageUrl : zengHuanForm.imageLink).trim())} 
                  className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  确定
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper focus:outline-none focus:border-gold"
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
                    className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
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

      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink border border-gold/30 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center mb-6">
              <h3 className="text-xl font-serif text-gold text-center flex-1">加点方向</h3>
              <button onClick={() => {
                setIsEditing(false);
                setEditingBookId(null);
              }} className="text-paper/60 hover:text-paper">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-paper/70 mb-2">书籍名称</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="输入书籍名称"
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">书籍分类</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper focus:outline-none focus:border-gold"
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
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, coverMode: 'local' })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                        form.coverMode === 'local' 
                          ? 'bg-gold/20 text-gold border border-gold/50' 
                          : 'bg-ink/50 text-paper/60 hover:text-paper'
                      }`}
                    >
                      <Camera size={14} />
                      本地图片
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, coverMode: 'url' })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                        form.coverMode === 'url' 
                          ? 'bg-gold/20 text-gold border border-gold/50' 
                          : 'bg-ink/50 text-paper/60 hover:text-paper'
                      }`}
                    >
                      <ExternalLink size={14} />
                      网络链接
                    </button>
                  </div>
                  
                  {form.coverMode === 'local' ? (
                    <div
                      className="w-full border-2 border-dashed border-gold/30 rounded-lg p-4 text-center cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all"
                      onClick={() => document.getElementById('edit-cover-upload')?.click()}
                    >
                      <input
                        id="edit-cover-upload"
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
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={form.coverLink}
                        onChange={(e) => setForm({ ...form, coverLink: e.target.value })}
                        placeholder="输入图片URL链接"
                        className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                      />
                      {form.coverLink && (
                        <div className="relative">
                          <img 
                            src={form.coverLink} 
                            alt="" 
                            className="w-full h-24 object-cover rounded" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">数据图片</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, dataMode: 'local' })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                        form.dataMode === 'local' 
                          ? 'bg-gold/20 text-gold border border-gold/50' 
                          : 'bg-ink/50 text-paper/60 hover:text-paper'
                      }`}
                    >
                      <Camera size={14} />
                      本地图片
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, dataMode: 'url' })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                        form.dataMode === 'url' 
                          ? 'bg-gold/20 text-gold border border-gold/50' 
                          : 'bg-ink/50 text-paper/60 hover:text-paper'
                      }`}
                    >
                      <ExternalLink size={14} />
                      网络链接
                    </button>
                  </div>
                  
                  {form.dataMode === 'local' ? (
                    <div
                      className="w-full border-2 border-dashed border-gold/30 rounded-lg p-4 text-center cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all"
                      onClick={() => document.getElementById('edit-data-upload')?.click()}
                    >
                      <input
                        id="edit-data-upload"
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
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={form.dataLink}
                        onChange={(e) => setForm({ ...form, dataLink: e.target.value })}
                        placeholder="输入数据图片URL链接（可选）"
                        className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                      />
                      {form.dataLink && (
                        <div className="relative">
                          <img 
                            src={form.dataLink} 
                            alt="" 
                            className="w-full h-24 object-cover rounded" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
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
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper focus:outline-none focus:border-gold"
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
                    className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
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
                <button type="button" onClick={() => {
                  setIsEditing(false);
                  setEditingBookId(null);
                }} className="flex-1 btn-secondary">
                  取消
                </button>
                <button 
                  type="submit" 
                  disabled={!((form.coverMode === 'local' ? form.coverUrl : form.coverLink))} 
                  className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <BookCard key={book.id} book={book} onImageClick={openModal} onEdit={openEditModal} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
