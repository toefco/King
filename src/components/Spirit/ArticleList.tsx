import { useState, useMemo } from 'react';
import { X, ChevronLeft, FileText } from 'lucide-react';
import { useStore } from '../../store';
import { Article } from '../../types';
import ArticleCard from './ArticleCard';

export default function CognitionList() {
  const articles = useStore((state) => state.articles);
  const addArticle = useStore((state) => state.addArticle);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    publishDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const article: Article = {
      id: Date.now().toString(),
      title: form.title,
      content: form.content,
      category: '',
      publishDate: form.publishDate,
    };
    addArticle(article);
    setForm({ title: '', content: '', publishDate: new Date().toISOString().split('T')[0] });
    setIsAdding(false);
  };

  const totalChars = useMemo(
    () => articles.reduce((sum, a) => sum + a.content.length, 0),
    [articles]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button onClick={() => setIsAdding(true)} className="relative overflow-hidden bg-gradient-to-b from-slate-800/90 via-ink to-ink text-gold font-bold rounded-xl px-5 py-2.5 border border-gold/10 shadow-[0_4px_0_rgba(15,23,42,0.6),0_8px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_2px_0_rgba(15,23,42,0.5),0_6px_16px_rgba(212,175,55,0.08)] hover:translate-y-[2px] hover:border-gold/25 hover:text-amber-200 active:shadow-none active:translate-y-[4px] transition-all duration-200 ease-out">
          意识海
        </button>
      </div>

      {/* 统计栏 */}
      {articles.length > 0 && (
        <div className="flex items-center gap-6 px-5 py-3 rounded-xl bg-ink/50 border border-gold/10">
          <div className="flex items-center gap-2 text-sm">
            <FileText size={16} className="text-gold/60" />
            <span className="text-paper/40">共</span>
            <span className="text-gold font-serif">{articles.length}</span>
            <span className="text-paper/40">篇</span>
          </div>
          <div className="w-px h-4 bg-gold/10" />
          <div className="text-sm">
            <span className="text-paper/40">总计 </span>
            <span className="text-gold font-serif">{totalChars.toLocaleString()}</span>
            <span className="text-paper/40"> 字</span>
          </div>
        </div>
      )}

      {selectedArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-ink border border-gold/30 rounded-xl w-full max-w-2xl p-8 my-8">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setSelectedArticle(null)} className="text-paper/60 hover:text-paper">
                <ChevronLeft size={24} />
              </button>
              <span className="text-sm text-paper/40">{selectedArticle.publishDate}</span>
            </div>
            <h2 className="text-2xl font-serif text-gold mb-6">{selectedArticle.title}</h2>
            <div className="prose prose-invert max-w-none">
              {selectedArticle.content.split('\n').map((p, i) => (
                <p key={i} className="text-paper/80 leading-relaxed mb-4">{p}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink border border-gold/30 rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif text-gold">记录意识海</h3>
              <button onClick={() => setIsAdding(false)} className="text-paper/60 hover:text-paper">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-paper/70 mb-2">时间</label>
                <input
                  type="date"
                  value={form.publishDate}
                  onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-4 py-2 text-paper focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">内容</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-4 py-2 text-paper focus:outline-none focus:border-gold min-h-48"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  发布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
        ))}
      </div>
    </div>
  );
}
