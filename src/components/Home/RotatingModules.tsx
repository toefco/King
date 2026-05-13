import { useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';

const modules = [
  {
    path: '/fitness', label: '力', color: '#ef4444',
    font: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    fontWeight: 900, letterSpacing: '0.08em',
  },
  {
    path: '/wisdom', label: '智', color: '#d4af37',
    font: "'STSong', 'Songti SC', 'SimSun', serif",
    fontWeight: 700, letterSpacing: '0.12em',
  },
  {
    path: '/spirit', label: '神', color: '#a855f7',
    font: "'STKaiti', 'Kaiti SC', 'KaiTi', cursive",
    fontWeight: 600, letterSpacing: '0.1em',
  },
  {
    path: '/skills', label: '技', color: '#3b82f6',
    font: "'Helvetica Neue', 'Arial', 'PingFang SC', sans-serif",
    fontWeight: 800, letterSpacing: '0.06em',
  },
  {
    path: '/hobbies', label: '逸', color: '#ec4899',
    font: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    fontWeight: 500, letterSpacing: '0.14em',
  },
  {
    path: '/time', label: '时', color: '#10b981',
    font: "'Noto Serif SC', 'STSong', 'SimSun', serif",
    fontWeight: 600, letterSpacing: '0.1em',
  },
];

export default function RotatingModules() {
  const wheelRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const draggingRef = useRef(false);
  const lastAngleRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef(0);
  const transitionRef = useRef<'none' | 'ease'>('ease');
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // 同步文字反向旋转，保持正立
  const syncText = useCallback(() => {
    const deg = -rotationRef.current;
    textRefs.current.forEach((el) => {
      if (el) el.style.transform = `rotate(${deg}deg)`;
    });
  }, []);

  const radius = typeof window !== 'undefined' && window.innerWidth > 767 ? 240 : 165;

  // Momentum decay animation
  const applyMomentum = useCallback(() => {
    if (draggingRef.current) return;

    const absV = Math.abs(velocityRef.current);
    if (absV < 0.02) {
      velocityRef.current = 0;
      transitionRef.current = 'ease';
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)';
      }
      return;
    }

    rotationRef.current += velocityRef.current;
    rotationRef.current = rotationRef.current % 360;
    velocityRef.current *= 0.96;

    if (wheelRef.current) {
      const deg = rotationRef.current;
      wheelRef.current.style.transform = `rotate(${deg}deg)`;
    }
    syncText();

    rafRef.current = requestAnimationFrame(applyMomentum);
  }, []);

  const getAngle = useCallback((clientX: number, clientY: number): number => {
    const el = wheelRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    transitionRef.current = 'none';

    // Stop momentum
    cancelAnimationFrame(rafRef.current);
    velocityRef.current = 0;

    // Kill transition for instant response
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 0s linear';
    }

    lastAngleRef.current = getAngle(e.clientX, e.clientY);
    lastTimeRef.current = performance.now();
  }, [getAngle]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;

    const now = performance.now();
    const angle = getAngle(e.clientX, e.clientY);
    const delta = angle - lastAngleRef.current;

    // Normalize delta
    const normalizedDelta = ((delta + 180) % 360) - 180;

    rotationRef.current += normalizedDelta;
    rotationRef.current = rotationRef.current % 360;

    if (wheelRef.current) {
      const deg = rotationRef.current;
      wheelRef.current.style.transform = `rotate(${deg}deg)`;
    }
    syncText();

    // Track velocity
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      velocityRef.current = normalizedDelta / dt * 16;
    }

    lastAngleRef.current = angle;
    lastTimeRef.current = now;
  }, [getAngle, syncText]);

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    // Apply smooth deceleration
    if (Math.abs(velocityRef.current) > 0.05) {
      rafRef.current = requestAnimationFrame(applyMomentum);
    } else {
      // Snap to nearest 60 degree multiple for clean alignment
      const snapDeg = 60;
      const current = rotationRef.current;
      const snapped = Math.round(current / snapDeg) * snapDeg;
      rotationRef.current = snapped;
      
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)';
        wheelRef.current.style.transform = `rotate(${snapped}deg)`;
      }
      syncText();
    }
  }, [applyMomentum, syncText]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div
        className="relative pointer-events-auto"
        style={{
          width: radius * 2 + 120,
          height: radius * 2 + 120,
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Track ring 1 */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: '0 0 60px rgba(139,92,246,0.06)',
          }}
        />

        {/* Track ring 2 */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '1px solid rgba(255,255,255,0.02)',
            transform: 'scale(0.75)',
          }}
        />

        {/* Rotating wheel */}
        <div
          ref={wheelRef}
          className="absolute inset-0 will-change-transform"
          style={{
            transition: 'transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)',
            transform: 'rotate(0deg)',
          }}
        >
          {modules.map((mod, idx) => {
            const angleDeg = idx * 60 - 90;
            const angleRad = angleDeg * (Math.PI / 180);
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;

            return (
              <div
                key={mod.path}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                }}
              >
                <Link
                  to={mod.path}
                  className="module-orb group relative block no-underline"
                  draggable={false}
                  onClick={(e) => {
                    if (Math.abs(velocityRef.current) > 1.5) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div
                    className="module-orb-surface flex items-center justify-center rounded-full transition-all duration-400 cursor-pointer relative overflow-hidden"
                    style={{
                      width: 72,
                      height: 72,
                      '--orb-color': mod.color,
                      background: `
                        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 10%, transparent 35%),
                        radial-gradient(circle at 75% 75%, rgba(0,0,0,0.6) 0%, transparent 45%),
                        radial-gradient(circle at 50% 50%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%),
                        
                        /* Star field */
                        radial-gradient(1px 1px at 15% 25%, rgba(255,255,255,0.9) 50%, transparent 51%),
                        radial-gradient(1px 1px at 85% 15%, rgba(255,255,255,0.7) 50%, transparent 51%),
                        radial-gradient(1px 1px at 45% 85%, rgba(255,255,255,0.8) 50%, transparent 51%),
                        radial-gradient(1px 1px at 70% 75%, rgba(255,255,255,0.6) 50%, transparent 51%),
                        radial-gradient(2px 2px at 25% 65%, rgba(255,255,255,0.95) 50%, transparent 51%),
                        radial-gradient(1px 1px at 60% 35%, rgba(255,255,255,0.75) 50%, transparent 51%),
                        radial-gradient(1px 1px at 90% 55%, rgba(255,255,255,0.85) 50%, transparent 51%),
                        radial-gradient(1px 1px at 35% 45%, rgba(255,255,255,0.7) 50%, transparent 51%),
                        radial-gradient(2px 2px at 55% 10%, ${mod.color}cc 50%, transparent 51%),
                        radial-gradient(1px 1px at 10% 80%, ${mod.color}aa 50%, transparent 51%),
                        radial-gradient(2px 2px at 80% 90%, ${mod.color}dd 50%, transparent 51%),
                        radial-gradient(1px 1px at 40% 20%, ${mod.color}bb 50%, transparent 51%),
                        
                        /* Nebula effect */
                        radial-gradient(circle at 20% 35%, ${mod.color}55 0%, transparent 40%),
                        radial-gradient(circle at 75% 65%, ${mod.color}44 0%, transparent 45%),
                        radial-gradient(circle at 45% 75%, ${mod.color}33 0%, transparent 40%),
                        radial-gradient(circle at 65% 25%, ${mod.color}38 0%, transparent 35%),
                        
                        /* Outer glow */
                        radial-gradient(ellipse at 50% 50%, ${mod.color}aa 0%, ${mod.color}66 25%, ${mod.color}33 50%, rgba(0,0,0,0.85) 78%, rgba(0,0,0,0.98) 100%)
                      `,
                      boxShadow: `
                        inset -8px -8px 24px rgba(0,0,0,0.65),
                        inset 8px 8px 24px rgba(255,255,255,0.22),
                        0 0 18px ${mod.color}ff,
                        0 0 36px ${mod.color}cc,
                        0 0 64px ${mod.color}88,
                        0 0 96px ${mod.color}44,
                        inset 0 0 32px ${mod.color}66,
                        inset 0 0 64px ${mod.color}33
                      `,
                      border: `3px solid ${mod.color}ee`,
                      transformStyle: 'preserve-3d',
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.15) rotateX(15deg) rotateY(15deg) translateZ(28px)';
                      e.currentTarget.style.boxShadow = `
                        inset -10px -10px 28px rgba(0,0,0,0.75),
                        inset 10px 10px 28px rgba(255,255,255,0.3),
                        0 0 26px ${mod.color}ff,
                        0 0 52px ${mod.color}dd,
                        0 0 88px ${mod.color}aa,
                        0 0 128px ${mod.color}66,
                        inset 0 0 42px ${mod.color}88,
                        inset 0 0 78px ${mod.color}44
                      `;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) rotateX(0deg) rotateY(0deg) translateZ(0px)';
                      e.currentTarget.style.boxShadow = `
                        inset -8px -8px 24px rgba(0,0,0,0.65),
                        inset 8px 8px 24px rgba(255,255,255,0.22),
                        0 0 18px ${mod.color}ff,
                        0 0 36px ${mod.color}cc,
                        0 0 64px ${mod.color}88,
                        0 0 96px ${mod.color}44,
                        inset 0 0 32px ${mod.color}66,
                        inset 0 0 64px ${mod.color}33
                      `;
                    }}
                  >
                    <span
                      ref={(el) => { textRefs.current[idx] = el; }}
                      className="select-none transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-110 z-10"
                      style={{
                        color: '#ffffff',
                        fontFamily: mod.font,
                        fontSize: 17,
                        fontWeight: mod.fontWeight,
                        letterSpacing: mod.letterSpacing,
                        textShadow: `
                          0 0 12px ${mod.color}ff,
                          0 0 24px ${mod.color}dd,
                          0 0 40px ${mod.color}bb,
                          0 4px 12px rgba(0,0,0,0.85)
                        `,
                        lineHeight: 1,
                        transform: 'translateZ(36px)',
                      }}
                    >
                      {mod.label}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
