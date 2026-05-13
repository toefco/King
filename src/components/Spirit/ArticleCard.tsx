import { useState } from 'react';
import { Trash2, ChevronRight } from 'lucide-react';
import { Article } from '../../types';
import { useStore } from '../../store';

interface Props {
  article: Article;
  onClick: () => void;
}

export default function ArticleCard({ article, onClick }: Props) {
  const deleteArticle = useStore((state) => state.deleteArticle);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        background: isHovered
          ? 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(255,255,255,0.03) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: isHovered
          ? '1px solid rgba(168,85,247,0.4)'
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isHovered
          ? '0 12px 40px rgba(168,85,247,0.18), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300"
        style={{
          background: isHovered
            ? 'linear-gradient(180deg, #a855f7, #ec4899)'
            : 'rgba(168,85,247,0.35)',
          boxShadow: isHovered ? '0 0 10px rgba(168,85,247,0.6)' : 'none',
        }}
      />

      {/* Top shimmer */}
      <div
        className="absolute top-0 left-6 right-6 h-px transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)',
          opacity: isHovered ? 1 : 0.3,
        }}
      />

      {/* Mouse glow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(168,85,247,0.08) 0%, transparent 70%)',
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-start justify-between gap-4 px-6 py-5 pl-7">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          {/* Date */}
          <div className="flex items-center gap-2 mb-2.5">
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: '#a855f7', boxShadow: '0 0 6px #a855f7' }}
            />
            <span
              className="text-[11px] font-mono tracking-wider"
              style={{ color: 'rgba(168,85,247,0.65)' }}
            >
              {article.publishDate}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-base font-bold mb-2 line-clamp-1 transition-colors duration-300"
            style={{ color: isHovered ? '#e9d5ff' : 'rgba(255,255,255,0.88)' }}
          >
            {article.title}
          </h3>

          {/* Content preview */}
          <p
            className="text-sm line-clamp-2 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.38)' }}
          >
            {article.content}
          </p>

          {/* Read more */}
          <div
            className="flex items-center gap-1 mt-3 transition-all duration-300"
            style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'translateX(0)' : 'translateX(-6px)' }}
          >
            <span className="text-xs" style={{ color: '#a855f7' }}>阅读全文</span>
            <ChevronRight size={11} style={{ color: '#a855f7' }} />
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); deleteArticle(article.id); }}
          className="p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.3)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          <Trash2 size={13} style={{ color: 'rgba(255,255,255,0.35)' }} />
        </button>
      </div>
    </div>
  );
}
