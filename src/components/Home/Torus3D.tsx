import { useEffect, useRef } from 'react';

export default function Torus3D() {
  const torusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rotationX = 0;
    let rotationY = 0;

    const animate = () => {
      rotationX += 0.3;
      rotationY += 0.5;

      if (torusRef.current) {
        torusRef.current.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96 perspective-[1000px]">
      <div
        ref={torusRef}
        className="absolute inset-0 transform-style-preserve-3d"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/80 via-indigo-600/90 to-purple-800/80 shadow-[0_0_60px_rgba(139,92,246,0.5)] animate-pulse">
          <div className="absolute inset-4 rounded-full border-2 border-white/20"></div>
        </div>

        <div
          className="absolute rounded-full bg-gradient-to-br from-slate-300/60 via-blue-300/40 to-purple-400/30"
          style={{
            width: '80%',
            height: '80%',
            left: '10%',
            top: '10%',
            transform: 'rotateX(60deg) translateZ(50px)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.2)',
          }}
        ></div>

        <div
          className="absolute rounded-full bg-gradient-to-br from-white/50 via-blue-200/30 to-purple-300/20"
          style={{
            width: '60%',
            height: '60%',
            left: '20%',
            top: '20%',
            transform: 'rotateY(90deg) rotateX(30deg) translateZ(30px)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
          }}
        ></div>

        <div
          className="absolute rounded-full border border-white/30"
          style={{
            width: '90%',
            height: '90%',
            left: '5%',
            top: '5%',
            transform: 'translateZ(20px)',
            boxShadow: 'inset 0 0 40px rgba(255, 255, 255, 0.1)',
          }}
        ></div>

        <div
          className="absolute"
          style={{
            width: '150%',
            height: '150%',
            left: '-25%',
            top: '-25%',
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, transparent 70%)',
            transform: 'translateZ(-80px)',
          }}
        ></div>
      </div>
    </div>
  );
}
