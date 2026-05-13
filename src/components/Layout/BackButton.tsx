import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setHasMoved(false);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  }, [position.x, position.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = Math.max(8, Math.min(window.innerWidth - 96, e.clientX - dragOffset.current.x));
    const newY = Math.max(8, Math.min(window.innerHeight - 96, e.clientY - dragOffset.current.y));
    
    const moved = Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5;
    if (moved) setHasMoved(true);
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, position.x, position.y]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!hasMoved) {
      navigate('/');
    }
  }, [hasMoved, navigate]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={buttonRef}
      className={`fixed z-50 cursor-move transition-shadow duration-200 ${isDragging ? 'shadow-2xl scale-105' : 'shadow-lg'}`}
      style={{
        left: position.x,
        top: position.y,
        transform: isDragging ? 'rotate(5deg)' : 'rotate(0deg)',
        transition: isDragging ? 'none' : 'transform 0.2s ease',
      }}
      onMouseDown={handleMouseDown}
    >
      <style>{`
        .back-button-wrapper {
          width: 80px;
          height: 80px;
        }
        @media (max-width: 768px) {
          .back-button-wrapper {
            width: 60px;
            height: 60px;
          }
          .back-button-text {
            font-size: 24px !important;
          }
        }
      `}</style>
      <button
        onClick={handleClick}
        className="back-button-wrapper relative flex items-center justify-center rounded-full group"
        style={{
          background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.4),
            0 0 60px rgba(139,144,184,0.08),
            inset 0 1px 0 rgba(255,255,255,0.18),
            inset 0 -1px 0 rgba(255,255,255,0.04)
          `,
        }}
      >
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(139,144,184,0.06) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(255,255,255,0.04) 0%, transparent 40%)
            `,
          }}
        />

        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.03) 15deg, transparent 30deg, rgba(255,255,255,0.02) 45deg, transparent 60deg, rgba(255,255,255,0.025) 75deg, transparent 90deg)',
            mask: 'radial-gradient(circle, black 70%, transparent 100%)',
            WebkitMask: 'radial-gradient(circle, black 70%, transparent 100%)',
          }}
        />

        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 1px, transparent 1px),
              radial-gradient(circle at 75% 30%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 1px, transparent 1px),
              radial-gradient(circle at 40% 60%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.06) 1px, transparent 1px),
              radial-gradient(circle at 80% 70%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 1px, transparent 1px),
              radial-gradient(circle at 30% 80%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 1px, transparent 1px),
              radial-gradient(circle at 65% 45%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.07) 1px, transparent 1px),
              radial-gradient(circle at 55% 85%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 1px, transparent 1px),
              radial-gradient(circle at 15% 55%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '12%',
            left: '15%',
            width: '35%',
            height: '25%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 40%, transparent 70%)',
            transform: 'rotate(-25deg)',
            filter: 'blur(1px)',
          }}
        />

        <div
          className="back-button-text"
          style={{
            fontSize: 32,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.85)',
            fontFamily: '"Ma Shan Zheng", cursive',
            textShadow: `
              0 0 20px rgba(255,255,255,0.5),
              0 0 40px rgba(255,255,255,0.3),
              0 0 60px rgba(255,255,255,0.2),
              0 2px 8px rgba(0,0,0,0.4),
              0 -1px 2px rgba(255,255,255,0.3)
            `,
            transform: 'translateZ(8px)',
            filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))',
          }}
        >
          归
        </div>

        <div
          className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 100%)',
            boxShadow: '0 0 4px rgba(255,255,255,0.4)',
          }}
        />
      </button>
    </div>
  );
}