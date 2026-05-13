import { useEffect, useRef } from 'react';

interface Nebula {
  x: number;
  y: number;
  radius: number;
  hue: number;
  opacity: number;
  speed: number;
  phase: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkle: number;
  speedX: number;
  speedY: number;
}

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nebulaeRef = useRef<Nebula[]>([]);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initBackground();
    };

    const initBackground = () => {
      nebulaeRef.current = [];
      starsRef.current = [];

      for (let i = 0; i < 4; i++) {
        nebulaeRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 500 + 300,
          hue: Math.random() * 60 + 200,
          opacity: Math.random() * 0.2 + 0.1,
          speed: (Math.random() - 0.5) * 0.5,
          phase: Math.random() * Math.PI * 2,
        });
      }

      const starCount = Math.floor((canvas.width * canvas.height) / 2500);
      for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.15 + 0.05;
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.7 + 0.3,
          twinkle: Math.random() * Math.PI * 2,
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed,
        });
      }
    };

    const drawBackground = () => {
      const time = Date.now() / 1000;

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );
      gradient.addColorStop(0, '#1a0a2e');
      gradient.addColorStop(0.3, '#0d1b2a');
      gradient.addColorStop(0.6, '#0a0a1a');
      gradient.addColorStop(1, '#000000');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nebulaeRef.current.forEach((nebula) => {
        const pulseOpacity = nebula.opacity * (0.8 + 0.2 * Math.sin(time * 0.5 + nebula.phase));
        const shiftHue = nebula.hue + Math.sin(time * 0.3 + nebula.phase) * 20;

        const gradient = ctx.createRadialGradient(
          nebula.x,
          nebula.y,
          0,
          nebula.x,
          nebula.y,
          nebula.radius
        );
        gradient.addColorStop(0, `hsla(${shiftHue}, 80%, 40%, ${pulseOpacity})`);
        gradient.addColorStop(0.4, `hsla(${shiftHue + 40}, 60%, 25%, ${pulseOpacity * 0.6})`);
        gradient.addColorStop(0.7, `hsla(${shiftHue + 60}, 50%, 15%, ${pulseOpacity * 0.3})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
    };

    const drawStars = () => {
      const time = Date.now() / 1000;

      starsRef.current.forEach((star) => {
        star.x += star.speedX;
        star.y += star.speedY;

        if (star.x < -10) star.x = canvas.width + 10;
        if (star.x > canvas.width + 10) star.x = -10;
        if (star.y < -10) star.y = canvas.height + 10;
        if (star.y > canvas.height + 10) star.y = -10;

        const twinkleOpacity = star.opacity * (0.6 + 0.4 * Math.sin(time * 1.5 + star.twinkle));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.size * 3
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${twinkleOpacity})`);
        gradient.addColorStop(0.3, `rgba(180, 200, 255, ${twinkleOpacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fill();
      });
    };

    const animate = () => {
      drawBackground();
      drawStars();
      requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  );
}
