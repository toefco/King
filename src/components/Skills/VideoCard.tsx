import { useState } from 'react';
import { Play, X } from 'lucide-react';
import { Skill } from '../../types';
import { useStore } from '../../store';

interface Props {
  skill: Skill;
}

const typeLabels: Record<string, string> = {
  sword: '剑花',
  boxing: '拳击',
  nunchaku: '双节棍',
  calligraphy: '毛笔字',
};

export default function VideoCard({ skill }: Props) {
  const [showVideo, setShowVideo] = useState(false);
  const deleteSkill = useStore((state) => state.deleteSkill);

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl bg-ink/50 border border-gold/20 hover:border-gold/40 transition-colors">
        <div className="aspect-video overflow-hidden">
          <img
            src={skill.coverUrl}
            alt={skill.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 will-change-transform"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowVideo(true)}
              className="p-4 rounded-full bg-gold/90 text-ink hover:bg-gold transition-colors"
            >
              <Play size={32} fill="currentColor" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-xs text-paper/50">{typeLabels[skill.type]}</span>
              <h4 className="text-sm font-medium text-paper">{skill.title}</h4>
            </div>
          </div>
          <p className="text-xs text-paper/50 line-clamp-2">{skill.description}</p>
        </div>
        <button
          onClick={() => deleteSkill(skill.id)}
          className="absolute top-2 right-2 p-1.5 rounded bg-ink/80 text-paper/50 hover:text-cinnabar opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <X size={14} />
        </button>
      </div>

      {showVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowVideo(false)}>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video bg-ink rounded-lg overflow-hidden">
              <iframe
                src={skill.videoUrl}
                title={skill.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <button
              onClick={() => setShowVideo(false)}
              className="mt-4 mx-auto block text-paper/60 hover:text-paper"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}
