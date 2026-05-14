import { useState, useRef } from 'react';
import { Trash2, BookOpen, Edit2 } from 'lucide-react';
import { Book } from '../../types';
import { useStore } from '../../store';

interface Props {
  book: Book;
  onImageClick: (book: Book, type: 'cover' | 'data') => void;
  onEdit?: (book: Book) => void;
}

export default function BookCard({ book, onImageClick, onEdit }: Props) {
  const deleteBook = useStore((state) => state.deleteBook);
  const updateBookThoughts = useStore((state) => state.updateBookThoughts);
  const [thoughts, setThoughts] = useState(book.thoughts || '');
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTilt({
      x: ((y - rect.height / 2) / (rect.height / 2)) * -5,
      y: ((x - rect.width / 2) / (rect.width / 2)) * 7,
    });
  };

  const handleThoughtsSave = () => {
    updateBookThoughts(book.id, thoughts);
  };

  return (
    <div>
      {/* 主卡片 */}
      <div
        ref={cardRef}
        className="group relative overflow-hidden rounded-2xl aspect-square flex"
        style={{
          transform: isHovered
            ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.025)`
            : 'perspective(900px) rotateX(0) rotateY(0) scale(1)',
          transition: isHovered
            ? 'transform 0.08s ease'
            : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          willChange: 'transform',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(26,26,46,0.98) 100%)',
          border: isHovered
            ? '1px solid rgba(212,175,55,0.45)'
            : '1px solid rgba(212,175,55,0.15)',
          boxShadow: isHovered
            ? '0 20px 60px rgba(212,175,55,0.18), 0 0 0 1px rgba(212,175,55,0.22), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 6px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setIsHovered(false); }}
      >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 h-px z-10 pointer-events-none transition-opacity duration-300"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)',
            opacity: isHovered ? 1 : 0.4,
          }}
        />

        {/* Gold inner glow */}
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(212,175,55,0.06) 0%, transparent 60%)',
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Edit button */}
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(book); }}
            className="absolute top-2 right-12 z-20 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
            style={{
              background: 'rgba(0,0,0,0.75)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,175,55,0.2)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.4)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.75)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <Edit2 size={12} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        )}
        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); deleteBook(book.id); }}
          className="absolute top-2 right-2 z-20 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
          style={{
            background: 'rgba(0,0,0,0.75)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.4)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.75)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          <Trash2 size={12} style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>

        {/* 左：封面 */}
        <div
          className="w-1/2 h-full flex-shrink-0 overflow-hidden cursor-pointer relative"
          onClick={(e) => {
            if (book.coverLink) {
              e.stopPropagation();
              window.open(book.coverLink, '_blank');
            } else {
              onImageClick(book, 'cover');
            }
          }}
        >
          <img
            src={book.coverUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            style={{ transition: 'transform 0.5s ease', transform: isHovered ? 'scale(1.06)' : 'scale(1)', objectPosition: 'top center' }}
          />
          {book.coverLink && (
            <div className="absolute top-2 left-2 z-20 p-1 rounded-lg bg-black/70 text-white/60 hover:text-gold transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </div>
          )}
          {/* Bottom shadow overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1/5 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.4) 65%, transparent 100%)'
            }} />
          {/* Separator line on right edge */}
          <div className="absolute top-0 bottom-0 right-0 w-1 z-10 pointer-events-none"
            style={{ 
              background: 'linear-gradient(180deg, rgba(212,175,55,0.05) 0%, rgba(212,175,55,0.8) 15%, rgba(212,175,55,0.95) 50%, rgba(212,175,55,0.8) 85%, rgba(212,175,55,0.05) 100%)',
              boxShadow: '0 0 12px rgba(212,175,55,0.5), 0 0 24px rgba(212,175,55,0.3), inset 0 0 4px rgba(255,255,255,0.3)'
            }} />
        </div>

        {/* 右：数据图 */}
        <div
          className="w-1/2 h-full flex-shrink-0 relative overflow-hidden cursor-pointer"
          onClick={(e) => {
            if (book.dataLink) {
              e.stopPropagation();
              window.open(book.dataLink, '_blank');
            } else if (book.dataUrl) {
              onImageClick(book, 'data');
            }
          }}
        >
          {book.dataUrl ? (
            <>
              <img
                src={book.dataUrl}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                style={{ transition: 'transform 0.5s ease', transform: isHovered ? 'scale(1.04)' : 'scale(1)', objectPosition: 'top center' }}
              />
              {book.dataLink && (
                <div className="absolute top-2 left-2 z-20 p-1 rounded-lg bg-black/70 text-white/60 hover:text-gold transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </div>
              )}
            </>
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.03)' }}
            >
              <BookOpen size={26} style={{ color: 'rgba(212,175,55,0.2)' }} />
            </div>
          )}
          {/* Bottom shadow overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1/5 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.4) 65%, transparent 100%)'
            }} />
        </div>
      </div>

      {/* 认知思考 */}
      <div className="mt-2">
        <textarea
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          onBlur={handleThoughtsSave}
          placeholder="写认知思考..."
          rows={2}
          className="w-full text-xs resize-none focus:outline-none rounded-xl px-3 py-2"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.55)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(212,175,55,0.4)';
            e.target.style.boxShadow = '0 0 0 2px rgba(212,175,55,0.08)';
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,0.07)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
}
