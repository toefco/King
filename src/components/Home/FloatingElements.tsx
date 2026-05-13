import { useEffect, useRef } from 'react';

export default function FloatingElements() {
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const animate = () => {
      const time = Date.now() / 1000;
      
      elementsRef.current.forEach((el, index) => {
        if (!el) return;
        
        const yOffset = Math.sin(time * 0.5 + index * 0.7) * 20;
        const xOffset = Math.cos(time * 0.3 + index * 0.5) * 15;
        const rotation = Math.sin(time * 0.4 + index * 0.3) * 10;
        
        el.style.transform = `translate(${xOffset}px, ${yOffset}px) rotate(${rotation}deg)`;
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Diamond 1 */}
      <div
        ref={(el) => (elementsRef.current[0] = el)}
        className="absolute w-8 h-8 md:w-12 md:h-12"
        style={{
          top: '15%',
          left: '10%',
          transform: 'rotate(45deg)',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.6), rgba(59, 130, 246, 0.4))',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
        }}
      />
      
      {/* Diamond 2 */}
      <div
        ref={(el) => (elementsRef.current[1] = el)}
        className="absolute w-6 h-6 md:w-10 md:h-10"
        style={{
          top: '25%',
          right: '15%',
          transform: 'rotate(45deg)',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.6), rgba(139, 92, 246, 0.4))',
          boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)',
        }}
      />
      
      {/* Triangle 1 */}
      <div
        ref={(el) => (elementsRef.current[2] = el)}
        className="absolute"
        style={{
          top: '60%',
          left: '8%',
          width: 0,
          height: 0,
          borderLeft: '15px solid transparent',
          borderRight: '15px solid transparent',
          borderBottom: '26px solid rgba(59, 130, 246, 0.7)',
          filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))',
        }}
      />
      
      {/* Triangle 2 */}
      <div
        ref={(el) => (elementsRef.current[3] = el)}
        className="absolute"
        style={{
          bottom: '20%',
          right: '10%',
          width: 0,
          height: 0,
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderBottom: '21px solid rgba(168, 85, 247, 0.7)',
          filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))',
        }}
      />
      
      {/* Circle 1 */}
      <div
        ref={(el) => (elementsRef.current[4] = el)}
        className="absolute rounded-full"
        style={{
          top: '40%',
          right: '5%',
          width: '20px',
          height: '20px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(139, 92, 246, 0.4))',
          boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
        }}
      />
      
      {/* Circle 2 */}
      <div
        ref={(el) => (elementsRef.current[5] = el)}
        className="absolute rounded-full"
        style={{
          bottom: '35%',
          left: '15%',
          width: '16px',
          height: '16px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.7), rgba(59, 130, 246, 0.4))',
          boxShadow: '0 0 12px rgba(255, 255, 255, 0.3)',
        }}
      />
      
      {/* Hexagon outline */}
      <div
        ref={(el) => (elementsRef.current[6] = el)}
        className="absolute"
        style={{
          top: '70%',
          right: '20%',
          width: '40px',
          height: '40px',
        }}
      >
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <polygon
            points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
            stroke="rgba(139, 92, 246, 0.6)"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      </div>
      
      {/* Star */}
      <div
        ref={(el) => (elementsRef.current[7] = el)}
        className="absolute"
        style={{
          top: '10%',
          left: '30%',
          width: '30px',
          height: '30px',
        }}
      >
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <polygon
            points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
            fill="rgba(251, 191, 36, 0.7)"
            filter="drop-shadow(0 0 10px rgba(251, 191, 36, 0.5))"
          />
        </svg>
      </div>
    </div>
  );
}
