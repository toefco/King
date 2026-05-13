import { Link } from 'react-router-dom';
import { BicepsFlexed, Brain, Sparkles, Sword, Heart, Clock } from 'lucide-react';

const modules = [
  { path: '/fitness', label: '体魄体能', icon: BicepsFlexed, color: 'from-cinnabar/80', desc: '记录身体素质与训练成果', stats: '平衡力 · 柔韧性 · 核心力量 · 心肺有氧' },
  { path: '/wisdom', label: '智慧脑子', icon: Brain, color: 'from-gold/80', desc: '展示阅读与知识积累', stats: '书籍封面 · 阅读进度 · 知识体系' },
  { path: '/spirit', label: '精神意识', icon: Sparkles, color: 'from-purple-500/80', desc: '记录思考与认知成长', stats: '文章随笔 · 人生感悟 · 方法论' },
  { path: '/skills', label: '技艺系统', icon: Sword, color: 'from-blue-500/80', desc: '视频展示技艺招式', stats: '剑花 · 拳击 · 双节棍 · 毛笔字' },
  { path: '/hobbies', label: '日常爱好', icon: Heart, color: 'from-pink-500/80', desc: '记录生活乐趣与成就', stats: '听歌 · 饮茶 · 搭积木 · 玩游戏' },
  { path: '/time', label: '时间系统', icon: Clock, color: 'from-green-500/80', desc: '作息与幸福记录', stats: '时间分配 · 作息规律 · 幸福指数' },
];

export default function ModuleCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((module) => {
        const Icon = module.icon;
        return (
          <Link
            key={module.path}
            to={module.path}
            className="group relative overflow-hidden rounded-xl bg-ink/50 border border-gold/20 hover:border-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold/10"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${module.color} to-transparent opacity-0 group-hover:opacity-10 transition-opacity`} />
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-gold/10">
                  <Icon size={28} className="text-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-gold">{module.label}</h3>
                  <p className="text-sm text-paper/60">{module.desc}</p>
                </div>
              </div>
              <p className="text-xs text-paper/40">{module.stats}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          </Link>
        );
      })}
    </div>
  );
}
