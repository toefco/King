import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BicepsFlexed, Brain, Sparkles, Sword, Heart, Clock } from 'lucide-react';

const navItems = [
  {
    path: '/fitness', label: '力量', fullLabel: '体魄体能', icon: BicepsFlexed,
    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.3) 0%, rgba(234,88,12,0.15) 100%)',
    accent: '#ef4444', glow: 'rgba(239,68,68,0.35)',
    shimmer: 'rgba(239,68,68,0.15)', num: '01', desc: '身体素质 · 训练成果',
  },
  {
    path: '/wisdom', label: '智慧', fullLabel: '智慧脑子', icon: Brain,
    gradient: 'linear-gradient(135deg, rgba(212,175,55,0.3) 0%, rgba(245,158,11,0.15) 100%)',
    accent: '#d4af37', glow: 'rgba(212,175,55,0.35)',
    shimmer: 'rgba(212,175,55,0.15)', num: '02', desc: '阅读 · 知识积累',
  },
  {
    path: '/spirit', label: '精神', fullLabel: '精神意识', icon: Sparkles,
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(236,72,153,0.15) 100%)',
    accent: '#a855f7', glow: 'rgba(168,85,247,0.35)',
    shimmer: 'rgba(168,85,247,0.15)', num: '03', desc: '思考 · 认知成长',
  },
  {
    path: '/skills', label: '技艺', fullLabel: '技艺系统', icon: Sword,
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(6,182,212,0.15) 100%)',
    accent: '#3b82f6', glow: 'rgba(59,130,246,0.35)',
    shimmer: 'rgba(59,130,246,0.15)', num: '04', desc: '视频 · 招式展示',
  },
  {
    path: '/hobbies', label: '爱好', fullLabel: '日常爱好', icon: Heart,
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.3) 0%, rgba(244,63,94,0.15) 100%)',
    accent: '#ec4899', glow: 'rgba(236,72,153,0.35)',
    shimmer: 'rgba(236,72,153,0.15)', num: '05', desc: '生活 · 乐趣成就',
  },
  {
    path: '/time', label: '时间', fullLabel: '时间系统', icon: Clock,
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(5,150,105,0.15) 100%)',
    accent: '#10b981', glow: 'rgba(16,185,129,0.35)',
    shimmer: 'rgba(16,185,129,0.15)', num: '06', desc: '作息 · 幸福记录',
  },
];

type NavItem = typeof navItems[0];

function NavCard({ item, index, isActive }: { item: NavItem; index: number; isActive: boolean }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTilt({
      x: ((y - cy) / cy) * -10,
      y: ((x - cx) / cx) * 12,
    });
    setGlowPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const Icon = item.icon;
  const delay = `${index * 0.08}s`;

  return (
    <Link
      ref={cardRef}
      to={item.path}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? 'scale(1.04)' : 'scale(1)'}`,
        transition: isHovered
          ? 'transform 0.1s ease'
          : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        willChange: 'transform',
        boxShadow: isHovered
          ? `0 24px 64px ${item.glow}, 0 0 0 1px ${item.accent}45`
          : isActive
          ? `0 8px 32px ${item.glow}, 0 0 0 1px ${item.accent}30`
          : '0 4px 20px rgba(0,0,0,0.35)',
        animationDelay: delay,
        opacity: 0,
        animation: `card-entrance 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay} forwards`,
      }}
      className="group relative overflow-hidden rounded-3xl"
    >
      {/* Base glass background */}
      <div
        className="absolute inset-0"
        style={{
          background: isActive || isHovered
            ? item.gradient
            : 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.01) 100%)',
          transition: 'background 0.4s ease',
        }}
      />

      {/* Deep dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0,0,0,0.52)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      />

      {/* Gradient on hover/active */}
      {(isHovered || isActive) && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{ background: item.gradient, opacity: 0.25 }}
        />
      )}

      {/* Mouse-tracking inner glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${item.shimmer} 0%, transparent 65%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${item.accent}70, transparent)`,
          opacity: isHovered || isActive ? 1 : 0.3,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Border */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          boxShadow: isHovered || isActive
            ? `inset 0 0 0 1px ${item.accent}50`
            : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
          transition: 'box-shadow 0.3s ease',
        }}
      />

      {/* Shimmer sweep on hover */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none animate-shimmer-sweep"
          style={{
            background: `linear-gradient(105deg, transparent 40%, ${item.accent}20 50%, transparent 60%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-5 p-8 py-10">
        {/* Number badge */}
        <div
          className="absolute top-3.5 right-4 text-[11px] font-mono tracking-widest transition-opacity duration-300"
          style={{ color: item.accent, opacity: isHovered ? 0.7 : 0.2 }}
        >
          {item.num}
        </div>

        {/* Icon with glow ring */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-2xl blur-xl transition-all duration-300"
            style={{
              background: item.accent,
              opacity: isHovered ? 0.45 : isActive ? 0.25 : 0.1,
              transform: 'scale(1.3)',
            }}
          />
          <div
            className="relative z-10 p-4 rounded-2xl transition-all duration-300"
            style={{
              background: isHovered
                ? `linear-gradient(135deg, ${item.accent}28, ${item.accent}10)`
                : 'rgba(255,255,255,0.07)',
              border: `1px solid ${isHovered || isActive ? item.accent + '45' : 'rgba(255,255,255,0.1)'}`,
              boxShadow: isHovered ? `0 0 20px ${item.accent}30` : 'none',
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            <Icon
              size={36}
              style={{ color: isHovered || isActive ? item.accent : 'rgba(255,255,255,0.65)' }}
              className="transition-colors duration-300 drop-shadow-lg"
            />
          </div>
        </div>

        {/* Labels */}
        <div className="text-center">
          <div
            className="text-2xl font-bold tracking-wide mb-1 transition-colors duration-300"
            style={{ color: isHovered ? '#ffffff' : 'rgba(255,255,255,0.85)' }}
          >
            {item.label}
          </div>
          <div
            className="text-xs tracking-wider transition-colors duration-300"
            style={{ color: isHovered ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)' }}
          >
            {item.desc}
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          className="rounded-full transition-all duration-500"
          style={{
            width: isHovered ? '48px' : '20px',
            height: '2px',
            background: item.accent,
            opacity: isHovered ? 0.9 : 0.4,
            boxShadow: isHovered ? `0 0 10px ${item.accent}` : 'none',
          }}
        />
      </div>
    </Link>
  );
}

export default function NavModules() {
  const location = useLocation();

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 max-w-5xl w-full px-6">
        {navItems.map((item, index) => (
          <NavCard
            key={item.path}
            item={item}
            index={index}
            isActive={location.pathname === item.path}
          />
        ))}
      </div>
    </div>
  );
}
