import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface Nebula {
  x: number; y: number; radius: number; hue: number; opacity: number; phase: number;
}

interface Star {
  x: number; y: number; size: number; opacity: number; twinkle: number; speedX: number; speedY: number;
}

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nebulaeRef = useRef<Nebula[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animRef = useRef<number>(0);
  const isHiddenRef = useRef(false);
  const lastFrameRef = useRef(0);
  const isWisdomRef = useRef(false);
  const location = useLocation();

  const isHome = location.pathname === '/';
  isWisdomRef.current = location.pathname === '/wisdom';

  useEffect(() => {
    if (isHome) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      const isMobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initBackground(w, h);
    };

    const initBackground = (w: number, h: number) => {
      nebulaeRef.current = [];
      starsRef.current = [];

      // 星云保留但不加暗色遮罩
      for (let i = 0; i < 3; i++) {
        nebulaeRef.current.push({
          x: Math.random() * w, y: Math.random() * h,
          radius: Math.random() * 500 + 250,
          hue: Math.random() * 80 + 220,
          opacity: Math.random() * 0.12 + 0.04,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // 智慧系统星星翻倍：190 颗，亮度更高
      const starCount = 190;
      for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.03 + 0.008;
        starsRef.current.push({
          x: Math.random() * w, y: Math.random() * h,
          size: Math.random() * 2 + 0.6,
          opacity: Math.random() * 0.5 + 0.5,
          twinkle: Math.random() * Math.PI * 2,
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed,
        });
      }
    };

    const drawBackground = (time: number, w: number, h: number, isWisdom: boolean) => {
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h));

      if (isWisdom) {
        // 智慧系统：深邃暗紫渐变，通透不沉闷
        gradient.addColorStop(0, '#1a0f35');
        gradient.addColorStop(0.3, '#120b28');
        gradient.addColorStop(0.6, '#0a041a');
        gradient.addColorStop(1, '#05020f');
      } else {
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.5, '#050510');
        gradient.addColorStop(1, '#000000');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // 智慧系统星云更淡，不压暗背景
      const nebulaMult = isWisdom ? 0.45 : 1;
      nebulaeRef.current.forEach((nebula) => {
        const pulseOpacity = nebula.opacity * nebulaMult * (0.8 + 0.2 * Math.sin(time * 0.3 + nebula.phase));
        const shiftHue = nebula.hue + Math.sin(time * 0.15 + nebula.phase) * 10;
        const g = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius);
        g.addColorStop(0, `hsla(${shiftHue}, 60%, 30%, ${pulseOpacity})`);
        g.addColorStop(0.5, `hsla(${shiftHue + 20}, 40%, 15%, ${pulseOpacity * 0.4})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });
    };

    const drawStars = (time: number, w: number, h: number, isWisdom: boolean) => {
      const total = starsRef.current.length;
      // 非智慧页只绘前 95 颗
      const drawCount = isWisdom ? total : 95;

      for (let i = 0; i < drawCount; i++) {
        const star = starsRef.current[i];
        star.x += star.speedX;
        star.y += star.speedY;
        if (star.x < -10) star.x = w + 10;
        if (star.x > w + 10) star.x = -10;
        if (star.y < -10) star.y = h + 10;
        if (star.y > h + 10) star.y = -10;

        // 智慧系统：更慢更自然的呼吸闪烁
        const blink = isWisdom
          ? 0.55 + 0.45 * Math.sin(time * 0.7 + star.twinkle)
          : 0.5 + 0.5 * Math.sin(time * 2 + star.twinkle);

        const brightMult = isWisdom ? 1.35 : 0.75;
        const twinkleOpacity = Math.min(1, star.opacity * blink * brightMult);

        if (star.size <= 0.8) {
          ctx.fillStyle = `rgba(255, 255, 255, ${twinkleOpacity})`;
          ctx.fillRect(star.x - star.size * 0.5, star.y - star.size * 0.5, star.size, star.size);
        } else {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          const g = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2.5);
          g.addColorStop(0, `rgba(255, 255, 255, ${twinkleOpacity})`);
          g.addColorStop(0.4, `rgba(210, 200, 255, ${twinkleOpacity * 0.5})`);
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.fill();
        }
      }
    };

    const animate = () => {
      const now = performance.now();
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (isHiddenRef.current) {
        if (now - lastFrameRef.current < 500) {
          animRef.current = requestAnimationFrame(animate);
          return;
        }
      }
      lastFrameRef.current = now;

      const time = now / 1000;
      const isWisdom = isWisdomRef.current;
      drawBackground(time, w, h, isWisdom);
      drawStars(time, w, h, isWisdom);
      animRef.current = requestAnimationFrame(animate);
    };

    const handleVisibility = () => { isHiddenRef.current = document.hidden; };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isHome]);

  if (isHome) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ pointerEvents: 'none', transform: 'translate3d(0,0,0)', willChange: 'transform' }}
    />
  );
}
