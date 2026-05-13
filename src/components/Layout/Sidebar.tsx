import { Link, useLocation } from 'react-router-dom';
import { BicepsFlexed, Brain, Sparkles, Sword, Heart, Clock } from 'lucide-react';

const modules = [
  { path: '/fitness', label: '体魄体能', sub: '训练成果', icon: BicepsFlexed, accent: '#ef4444', num: '01' },
  { path: '/wisdom',  label: '智慧脑子', sub: '阅读积累', icon: Brain,        accent: '#d4af37', num: '02' },
  { path: '/spirit',  label: '精神意识', sub: '思考成长', icon: Sparkles,     accent: '#a855f7', num: '03' },
  { path: '/skills',  label: '技艺系统', sub: '招式展示', icon: Sword,        accent: '#3b82f6', num: '04' },
  { path: '/hobbies', label: '日常爱好', sub: '生活乐趣', icon: Heart,        accent: '#ec4899', num: '05' },
  { path: '/time',    label: '时间系统', sub: '作息记录', icon: Clock,        accent: '#10b981', num: '06' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      className="w-56 min-h-screen flex-shrink-0 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(8,6,24,0.96) 0%, rgba(4,3,14,0.98) 100%)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderRight: '1px solid rgba(255,255,255,0.055)',
        boxShadow: '6px 0 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* 顶部标识区 */}
      <div className="px-5 pt-6 pb-5">
        <div className="text-[10px] font-mono tracking-[0.25em] uppercase mb-2"
          style={{ color: 'rgba(255,255,255,0.2)' }}>
          Personal OS
        </div>
        <div className="h-px" style={{
          background: 'linear-gradient(90deg, rgba(139,92,246,0.5), rgba(59,130,246,0.3), transparent)'
        }} />
      </div>

      {/* 导航项 */}
      <nav className="px-3 flex-1 space-y-0.5">
        {modules.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-hidden transition-all duration-200"
              style={isActive ? {
                background: `linear-gradient(135deg, ${item.accent}18, ${item.accent}06)`,
                boxShadow: `inset 0 0 0 1px ${item.accent}35, 0 4px 20px ${item.accent}12`,
              } : {}}
            >
              {/* Active left bar */}
              <div
                className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-all duration-300"
                style={{
                  background: isActive
                    ? `linear-gradient(180deg, ${item.accent}, ${item.accent}70)`
                    : 'transparent',
                  boxShadow: isActive ? `0 0 8px ${item.accent}` : 'none',
                }}
              />

              {/* Hover bg */}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)' }} />
              )}

              {/* Icon */}
              <div
                className="relative z-10 w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-200"
                style={isActive ? {
                  background: `${item.accent}22`,
                  boxShadow: `0 0 14px ${item.accent}35`,
                  border: `1px solid ${item.accent}35`,
                } : {
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Icon
                  size={15}
                  style={{ color: isActive ? item.accent : 'rgba(255,255,255,0.38)' }}
                  className="transition-colors duration-200 group-hover:opacity-70"
                />
              </div>

              {/* Text */}
              <div className="relative z-10 flex-1 min-w-0">
                <div
                  className="text-sm font-medium leading-none mb-0.5 transition-colors duration-200"
                  style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.52)' }}
                >
                  {item.label}
                </div>
                <div
                  className="text-[10px] leading-none transition-colors duration-200"
                  style={{ color: isActive ? `${item.accent}90` : 'rgba(255,255,255,0.22)' }}
                >
                  {item.sub}
                </div>
              </div>

              {/* Number */}
              <span
                className="relative z-10 text-[10px] font-mono transition-all duration-200 opacity-0 group-hover:opacity-100"
                style={{ color: item.accent }}
              >
                {item.num}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 底部 */}
      <div className="px-5 py-4">
        <div className="h-px mb-3" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)'
        }} />
        <div className="text-[10px] font-mono text-center animate-border-glow"
          style={{ color: 'rgba(139,92,246,0.4)' }}>
          ◈ SYSTEM ONLINE ◈
        </div>
      </div>
    </aside>
  );
}
