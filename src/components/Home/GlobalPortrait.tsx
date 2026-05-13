import { useStore } from '../../store';

const ACCENT = '#8b90b8';

export default function GlobalPortrait() {
  const workouts         = useStore(s => s.workouts);
  const books            = useStore(s => s.books);
  const articles         = useStore(s => s.articles);
  const skills           = useStore(s => s.skills);
  const hobbies          = useStore(s => s.hobbies);
  const happinessRecords = useStore(s => s.happinessRecords);
  const traits           = useStore(s => s.traits);

  const overviewItems = [
    { label: '体魄训练', value: `${workouts.length} 次` },
    { label: '阅读完成', value: `${books.filter(b => b.status === 'completed').length} 本` },
    { label: '意识记录', value: `${articles.length} 篇` },
    { label: '技艺归档', value: `${skills.length} 件` },
    { label: '爱好留存', value: `${hobbies.length} 条` },
    { label: '关键事件', value: `${happinessRecords.length} 条` },
    { label: '特质记录', value: `${traits.length} 条` },
  ];

  return (
    <section
      className="border-t"
      style={{ borderColor: `${ACCENT}18`, background: 'rgba(8,8,18,0.72)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* 标题区 */}
        <div className="mb-6">
          <h2 className="text-base font-semibold tracking-widest" style={{ color: `${ACCENT}dd` }}>
            全局人格画像
          </h2>
          <p className="text-xs mt-1" style={{ color: `${ACCENT}55` }}>
            汇总六大子系统存档，从心性 / 行事风格 / 独处模式 / 坚持习惯 / 生活偏好 / 精神内核，客观凝练专属自我画像
          </p>
          <p className="text-xs mt-2" style={{ color: `${ACCENT}44` }}>
            点击右下角精灵图标，可生成专属人格画像
          </p>
        </div>

        {/* 数据概览卡片（全历史） */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {overviewItems.map((item, i) => (
            <div
              key={i}
              className="rounded-xl px-4 py-3"
              style={{ background: `${ACCENT}0a`, border: `1px solid ${ACCENT}18` }}
            >
              <div className="text-xs mb-1" style={{ color: `${ACCENT}66` }}>{item.label}</div>
              <div className="text-sm font-semibold" style={{ color: ACCENT }}>{item.value}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
