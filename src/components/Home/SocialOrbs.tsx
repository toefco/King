import { useEffect, useRef } from 'react';

interface Person {
  name: string;
  lunar: string;
  solar: string; // YY.M.D
  color: string;
}

const PEOPLE: Person[] = [
  { name: '梅', lunar: '腊月十八', solar: '27.1.25',  color: '#f472b6' },
  { name: '菁', lunar: '冬月二十', solar: '26.12.28', color: '#818cf8' },
  { name: '荣', lunar: '十月十三', solar: '26.11.21', color: '#34d399' },
  { name: '妹', lunar: '九月十八', solar: '26.10.27', color: '#fb923c' },
  { name: '妈', lunar: '七月十七', solar: '26.8.29',  color: '#f87171' },
  { name: '秀', lunar: '六月十四', solar: '26.7.27',  color: '#60a5fa' },
  { name: '锋', lunar: '五月二四', solar: '26.7.8',   color: '#a78bfa' },
  { name: '华', lunar: '四月初三', solar: '26.5.19',  color: '#4ade80' },
  { name: '朋', lunar: '二月初二', solar: '26.3.20',  color: '#fbbf24' },
  { name: '爸', lunar: '正月二六', solar: '26.3.14',  color: '#e879f9' },
  { name: '馨', lunar: '待定',     solar: '—',        color: '#94a3b8' },
];

// 预先分配每个球的随机起始位置（避免水合问题）
const POSITIONS = PEOPLE.map((_, i) => {
  // 环绕屏幕周边分布，避开中间导航区域
  const seed = (i * 137.5) % 360; // 黄金角度分布
  const angle = (seed * Math.PI) / 180;
  const rx = 42; // x半径%
  const ry = 38; // y半径%
  return {
    left: 50 + rx * Math.cos(angle),
    top:  50 + ry * Math.sin(angle),
    delay: (i * 0.7).toFixed(1),
    duration: (6 + (i % 4) * 1.5).toFixed(1),
    dx: ((i % 3) - 1) * 12,  // 飘动 x 幅度 px
    dy: ((i % 5) - 2) * 10,  // 飘动 y 幅度 px
  };
});

export default function SocialOrbs() {
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    // 注入 keyframes
    const css = PEOPLE.map((_, i) => {
      const { dx, dy } = POSITIONS[i];
      return `
        @keyframes float-${i} {
          0%   { transform: translate(0px, 0px) scale(1); }
          25%  { transform: translate(${dx * 0.6}px, ${dy * -0.8}px) scale(1.03); }
          50%  { transform: translate(${dx}px, ${dy}px) scale(0.97); }
          75%  { transform: translate(${dx * -0.4}px, ${dy * 0.5}px) scale(1.02); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `;
    }).join('\n');

    const el = document.createElement('style');
    el.textContent = css;
    document.head.appendChild(el);
    styleRef.current = el;
    return () => { el.remove(); };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-5" style={{ zIndex: 5 }}>
      {PEOPLE.map((person, i) => {
        const pos = POSITIONS[i];
        return (
          <div
            key={person.name}
            className="absolute pointer-events-auto"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              transform: 'translate(-50%, -50%)',
              animation: `float-${i} ${pos.duration}s ease-in-out ${pos.delay}s infinite`,
            }}
          >
            <OrbCard person={person} />
          </div>
        );
      })}
    </div>
  );
}

function OrbCard({ person }: { person: Person }) {
  return (
    <div
      className="flex flex-col items-center justify-center w-16 h-16 rounded-full cursor-default select-none transition-transform duration-300 hover:scale-125"
      style={{
        background: `radial-gradient(circle at 35% 35%, ${person.color}55, ${person.color}22)`,
        border: `1.5px solid ${person.color}60`,
        boxShadow: `0 0 16px ${person.color}30, inset 0 1px 0 ${person.color}40`,
        backdropFilter: 'blur(6px)',
      }}
      title={`${person.lunar} · ${person.solar}`}
    >
      <span className="text-lg font-bold leading-none" style={{ color: person.color, textShadow: `0 0 8px ${person.color}80` }}>
        {person.name}
      </span>
      <span className="text-xs mt-0.5 leading-none" style={{ color: `${person.color}99`, fontSize: '9px' }}>
        {person.lunar}
      </span>
    </div>
  );
}
