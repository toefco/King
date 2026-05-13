import { useEffect, useRef } from 'react';

export default function Angel3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let angleY = 0;
    let angleX = 10;

    const animate = () => {
      angleY += 0.8;
      
      if (containerRef.current) {
        containerRef.current.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
      }
      
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative w-28 h-36 md:w-40 md:h-48 perspective-1000">
      <div 
        ref={containerRef}
        className="absolute inset-0 transform-style-3d"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Halo - Front */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full"
          style={{
            transform: 'translateZ(15px)',
            border: '3px solid rgba(212, 175, 55, 0.8)',
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.6), inset 0 0 15px rgba(212, 175, 55, 0.3)'
          }}
        />
        {/* Halo - Back */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full"
          style={{
            transform: 'translateZ(-15px)',
            border: '3px solid rgba(212, 175, 55, 0.6)',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)'
          }}
        />

        {/* Head - Front */}
        <div 
          className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full"
          style={{
            transform: 'translateZ(20px)',
            background: 'linear-gradient(135deg, #fff9e6 0%, #f5e6d3 50%, #e8d4c0 100%)',
            boxShadow: '8px 8px 16px rgba(0,0,0,0.3), inset -4px -4px 8px rgba(0,0,0,0.1)'
          }}
        >
          {/* Eyes */}
          <div className="absolute top-4 left-3 w-2 h-2 md:w-3 md:h-3 bg-gray-800 rounded-full" style={{ boxShadow: '1px 1px 2px rgba(0,0,0,0.3)' }} />
          <div className="absolute top-4 right-3 w-2 h-2 md:w-3 md:h-3 bg-gray-800 rounded-full" style={{ boxShadow: '1px 1px 2px rgba(0,0,0,0.3)' }} />
          {/* Smile */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-2 md:w-6 md:h-3 border-b-2 border-gray-600 rounded-b-full" />
        </div>
        {/* Head - Back */}
        <div 
          className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full"
          style={{
            transform: 'translateZ(0px)',
            background: 'linear-gradient(135deg, #e8d4c0 0%, #d4c0b0 100%)'
          }}
        />

        {/* Hair - Left */}
        <div 
          className="absolute top-5 left-1/2 -translate-x-1/2 -ml-6 w-6 h-8 md:w-8 md:h-10"
          style={{
            transform: 'translateZ(22px) rotateY(-30deg)',
            background: 'linear-gradient(90deg, #f5e6d3 0%, #e8d4c0 100%)',
            borderRadius: '50% 0 0 50%'
          }}
        />
        {/* Hair - Right */}
        <div 
          className="absolute top-5 left-1/2 -translate-x-1/2 ml-6 w-6 h-8 md:w-8 md:h-10"
          style={{
            transform: 'translateZ(22px) rotateY(30deg)',
            background: 'linear-gradient(-90deg, #f5e6d3 0%, #e8d4c0 100%)',
            borderRadius: '0 50% 50% 0'
          }}
        />

        {/* Body - Front */}
        <div 
          className="absolute top-16 left-1/2 -translate-x-1/2 w-14 h-14 md:w-20 md:h-20 rounded-lg"
          style={{
            transform: 'translateZ(15px)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #e0e0e0 100%)',
            boxShadow: '8px 8px 16px rgba(0,0,0,0.3), inset -4px -4px 8px rgba(0,0,0,0.1)'
          }}
        />
        {/* Body - Back */}
        <div 
          className="absolute top-16 left-1/2 -translate-x-1/2 w-14 h-14 md:w-20 md:h-20 rounded-lg"
          style={{
            transform: 'translateZ(0px)',
            background: 'linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%)'
          }}
        />

        {/* Left Wing - Front Layer */}
        <div 
          className="absolute top-10 -left-4 w-14 h-20 md:w-20 md:h-28"
          style={{
            transform: 'translateZ(5px) rotateY(-60deg)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(212,175,55,0.5) 100%)',
            borderRadius: '60% 10% 60% 10%',
            boxShadow: '0 0 40px rgba(212,175,55,0.4)',
            animation: 'flapLeft 1.5s ease-in-out infinite'
          }}
        />
        {/* Left Wing - Back Layer */}
        <div 
          className="absolute top-10 -left-6 w-12 h-18 md:w-18 md:h-26"
          style={{
            transform: 'translateZ(-5px) rotateY(-70deg)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(212,175,55,0.3) 100%)',
            borderRadius: '60% 10% 60% 10%',
            animation: 'flapLeft 1.5s ease-in-out infinite 0.1s'
          }}
        />

        {/* Right Wing - Front Layer */}
        <div 
          className="absolute top-10 -right-4 w-14 h-20 md:w-20 md:h-28"
          style={{
            transform: 'translateZ(5px) rotateY(60deg)',
            background: 'linear-gradient(-135deg, rgba(255,255,255,0.95) 0%, rgba(212,175,55,0.5) 100%)',
            borderRadius: '10% 60% 10% 60%',
            boxShadow: '0 0 40px rgba(212,175,55,0.4)',
            animation: 'flapRight 1.5s ease-in-out infinite'
          }}
        />
        {/* Right Wing - Back Layer */}
        <div 
          className="absolute top-10 -right-6 w-12 h-18 md:w-18 md:h-26"
          style={{
            transform: 'translateZ(-5px) rotateY(70deg)',
            background: 'linear-gradient(-135deg, rgba(255,255,255,0.7) 0%, rgba(212,175,55,0.3) 100%)',
            borderRadius: '10% 60% 10% 60%',
            animation: 'flapRight 1.5s ease-in-out infinite 0.1s'
          }}
        />

        {/* Skirt - Front */}
        <div 
          className="absolute top-28 left-1/2 -translate-x-1/2 w-16 h-10 md:w-22 md:h-14"
          style={{
            transform: 'translateZ(12px) rotateX(-10deg)',
            background: 'linear-gradient(180deg, #ffffff 0%, #d4af37 50%, #c9a22f 100%)',
            clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)',
            boxShadow: '4px 8px 12px rgba(0,0,0,0.3)'
          }}
        />
        {/* Skirt - Back */}
        <div 
          className="absolute top-28 left-1/2 -translate-x-1/2 w-16 h-10 md:w-22 md:h-14"
          style={{
            transform: 'translateZ(2px) rotateX(10deg)',
            background: 'linear-gradient(180deg, #e0e0e0 0%, #b8932a 50%, #a88325 100%)',
            clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)'
          }}
        />

        {/* Glow - Outer */}
        <div 
          className="absolute inset-[-30px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 60%)',
            animation: 'glowPulse 2.5s ease-in-out infinite'
          }}
        />
      </div>

      <style>{`
        @keyframes flapLeft {
          0%, 100% { transform: translateZ(5px) rotateY(-60deg) rotateX(0deg); }
          50% { transform: translateZ(5px) rotateY(-60deg) rotateX(25deg); }
        }
        @keyframes flapRight {
          0%, 100% { transform: translateZ(5px) rotateY(60deg) rotateX(0deg); }
          50% { transform: translateZ(5px) rotateY(60deg) rotateX(25deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
