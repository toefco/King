import { Trash2, Star } from 'lucide-react';
import { Hobby } from '../../types';
import { useStore } from '../../store';

interface Props {
  hobby: Hobby;
}

const typeLabels: Record<string, string> = {
  music: '听歌',
  tea: '饮茶',
  building: '搭积木',
  gaming: '玩游戏',
};

const typeColors: Record<string, string> = {
  music: 'from-purple-500/80',
  tea: 'from-green-500/80',
  building: 'from-blue-500/80',
  gaming: 'from-pink-500/80',
};

export default function MilestoneCard({ hobby }: Props) {
  const deleteHobby = useStore((state) => state.deleteHobby);

  return (
    <div className="group relative overflow-hidden rounded-xl bg-ink/50 border border-gold/20 hover:border-gold/40 transition-colors">
      <div className={`absolute inset-0 bg-gradient-to-br ${typeColors[hobby.type]} to-transparent opacity-10`} />
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {hobby.milestone && <Star size={16} className="text-gold fill-gold" />}
              <span className="text-xs px-2 py-0.5 rounded bg-gold/10 text-gold">
                {typeLabels[hobby.type]}
              </span>
            </div>
            <h4 className="text-base font-serif text-paper mb-2">{hobby.title}</h4>
            <p className="text-sm text-paper/60">{hobby.content}</p>
            <p className="text-xs text-paper/40 mt-3">{hobby.date}</p>
          </div>
          <button
            onClick={() => deleteHobby(hobby.id)}
            className="p-2 text-paper/40 hover:text-cinnabar transition-colors opacity-0 group-hover:opacity-100 duration-200"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
