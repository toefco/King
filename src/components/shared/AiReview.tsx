import { AnalysisResult, AnalysisBlock, WisdomAnalysisResult, FitnessAnalysisResult, SpiritAnalysisResult, HobbiesAnalysisResult, SkillsAnalysisResult, TimeAnalysisResult, GlobalPortraitResult } from '../../utils/aiAnalysis';
import { Loader2, RefreshCw, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';

interface AiReviewPanelProps {
  result: AnalysisResult | null;
  loading: boolean;
  accentColor: string;
  show: boolean;
}

interface AiReviewButtonProps {
  loading: boolean;
  show: boolean;
  accentColor: string;
  onToggle: () => void;
}

/** 触发 / 收起按钮 */
export function AiReviewButton({ loading, show, accentColor, onToggle }: AiReviewButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border"
      style={{
        color: accentColor,
        borderColor: `${accentColor}40`,
        background: `${accentColor}10`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = `${accentColor}1e`;
        (e.currentTarget as HTMLButtonElement).style.borderColor = `${accentColor}70`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = `${accentColor}10`;
        (e.currentTarget as HTMLButtonElement).style.borderColor = `${accentColor}40`;
      }}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : show ? (
        <RefreshCw size={14} />
      ) : (
        <BrainCircuit size={14} />
      )}
      <span>
        {loading ? '复盘分析中…' : show ? '刷新复盘' : '开启智能复盘'}
      </span>
      {!loading && (show ? <ChevronUp size={13} className="opacity-50" /> : <ChevronDown size={13} className="opacity-50" />)}
    </button>
  );
}

/** 分析内容面板 */
export function AiReviewPanel({ result, loading, accentColor, show }: AiReviewPanelProps) {
  if (!show) return null;

  if (loading || !result) {
    return (
      <div
        className="rounded-2xl border p-6 mb-6 flex items-center justify-center gap-3"
        style={{ borderColor: `${accentColor}20`, background: `${accentColor}06` }}
      >
        <Loader2 size={18} className="animate-spin" style={{ color: accentColor }} />
        <span className="text-sm" style={{ color: `${accentColor}99` }}>正在生成复盘分析…</span>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border mb-6 overflow-hidden"
      style={{ borderColor: `${accentColor}20`, background: `${accentColor}05` }}
    >
      {/* 顶部标识栏 */}
      <div
        className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ borderColor: `${accentColor}15`, background: `${accentColor}0c` }}
      >
        <BrainCircuit size={15} style={{ color: accentColor }} />
        <span className="text-xs font-medium tracking-wide" style={{ color: `${accentColor}cc` }}>
          智能复盘 · 基于当前数据生成
        </span>
      </div>

      <div className="p-5 space-y-5">

        {/* 数据概览 */}
        <section>
          <SectionTitle color={accentColor}>数据概览</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
            {result.stats.map((s, i) => (
              <div
                key={i}
                className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
                style={{ background: `${accentColor}0e`, border: `1px solid ${accentColor}20` }}
              >
                <span className="text-xs" style={{ color: `${accentColor}80` }}>{s.label}</span>
                <span className="text-sm font-semibold" style={{ color: accentColor }}>{s.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 状态研判 */}
        <section>
          <SectionTitle color={accentColor}>状态研判</SectionTitle>
          <div className="flex gap-3 mt-2">
            <div className="w-0.5 flex-shrink-0 rounded-full" style={{ background: accentColor }} />
            <p className="text-sm leading-relaxed text-paper/65">{result.status}</p>
          </div>
        </section>

        {/* 短板总结 */}
        <section>
          <SectionTitle color={accentColor}>短板总结</SectionTitle>
          <div
            className="mt-2 px-4 py-3 rounded-xl text-sm leading-relaxed text-paper/60"
            style={{ background: `${accentColor}0b`, border: `1px solid ${accentColor}18` }}
          >
            {result.weakness}
          </div>
        </section>

        {/* 专属提升建议 */}
        <section>
          <SectionTitle color={accentColor}>专属提升建议</SectionTitle>
          <ol className="mt-2 space-y-2">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-paper/60">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
                  style={{ background: `${accentColor}20`, color: accentColor }}
                >
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </section>

      </div>
    </div>
  );
}

function SectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold tracking-widest uppercase" style={{ color: `${color}99` }}>
      {children}
    </h4>
  );
}

// ─── 智慧藏书专属：悬浮精灵触发按钮 ──────────────────────────────────────────

interface WisdomFloatingSpriteProps {
  loading: boolean;
  show: boolean;
  accentColor: string;
  onToggle: () => void;
}

export function WisdomFloatingSprite({ loading, show, accentColor, onToggle }: WisdomFloatingSpriteProps) {
  return (
    <div className="flex justify-end mb-5">
      <button
        onClick={onToggle}
        disabled={loading}
        title={show ? '收起智能复盘' : '开启智能复盘'}
        className="relative flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
        style={{
          color: accentColor,
          background: `radial-gradient(ellipse at 30% 40%, ${accentColor}18 0%, ${accentColor}08 70%)`,
          border: `1px solid ${accentColor}35`,
          boxShadow: `0 0 18px ${accentColor}20, 0 2px 8px rgba(0,0,0,0.3)`,
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.boxShadow = `0 0 28px ${accentColor}35, 0 4px 12px rgba(0,0,0,0.4)`;
          el.style.borderColor = `${accentColor}60`;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.boxShadow = `0 0 18px ${accentColor}20, 0 2px 8px rgba(0,0,0,0.3)`;
          el.style.borderColor = `${accentColor}35`;
        }}
      >
        {/* 精灵光晕圆点 */}
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}50` }}
        >
          {loading
            ? <Loader2 size={11} className="animate-spin" style={{ color: accentColor }} />
            : <BrainCircuit size={11} style={{ color: accentColor }} />
          }
        </span>
        <span className="tracking-wide">
          {loading ? '分析中…' : show ? '刷新复盘' : '开启智能复盘'}
        </span>
        {!loading && (
          show
            ? <ChevronUp size={12} className="opacity-50" />
            : <ChevronDown size={12} className="opacity-50" />
        )}
      </button>
    </div>
  );
}

// ─── 智慧藏书专属：5板块纯数据复盘面板 ───────────────────────────────────────

interface WisdomReviewPanelProps {
  result: WisdomAnalysisResult | null;
  loading: boolean;
  accentColor: string;
  show: boolean;
}

export function WisdomReviewPanel({ result, loading, accentColor, show }: WisdomReviewPanelProps) {
  if (!show) return null;

  if (loading || !result) {
    return (
      <div
        className="rounded-2xl border p-6 mb-6 flex items-center justify-center gap-3"
        style={{ borderColor: `${accentColor}20`, background: `${accentColor}06` }}
      >
        <Loader2 size={18} className="animate-spin" style={{ color: accentColor }} />
        <span className="text-sm" style={{ color: `${accentColor}99` }}>正在生成复盘分析…</span>
      </div>
    );
  }

  const SECTIONS: { key: keyof WisdomAnalysisResult; label: string; type: 'cards' | 'bar' | 'box' | 'plain' }[] = [
    { key: 'rawData',        label: '原始阅读数据陈列',           type: 'cards' },
    { key: 'peerComparison', label: '同龄普通人阅读量横向档位对标', type: 'bar'   },
    { key: 'growthRate',     label: '自身历史阅读增速对比',        type: 'bar'   },
    { key: 'categoryBalance',label: '书籍类目结构均衡判定',        type: 'box'   },
    { key: 'periodSummary',  label: '周期整体数据总结',            type: 'plain' },
  ];

  return (
    <div
      className="rounded-2xl border mb-6 overflow-hidden"
      style={{ borderColor: `${accentColor}20`, background: `${accentColor}05` }}
    >
      {/* 顶部标识栏 */}
      <div
        className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ borderColor: `${accentColor}15`, background: `${accentColor}0c` }}
      >
        <BrainCircuit size={15} style={{ color: accentColor }} />
        <span className="text-xs font-medium tracking-wide" style={{ color: `${accentColor}cc` }}>
          智能复盘 · 智慧藏书 · 基于当前数据生成
        </span>
      </div>

      <div className="p-5 space-y-5">
        {SECTIONS.map(({ key, label, type }) => (
          <section key={key}>
            <WisdomSectionTitle color={accentColor}>{label}</WisdomSectionTitle>
            {type === 'cards' && Array.isArray(result[key]) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-2">
                {(result[key] as AnalysisBlock[]).map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
                    style={{ background: `${accentColor}0e`, border: `1px solid ${accentColor}20` }}
                  >
                    <span className="text-xs" style={{ color: `${accentColor}80` }}>{s.label}</span>
                    <span className="text-sm font-semibold" style={{ color: accentColor }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
            {type === 'bar' && (
              <div className="flex gap-3 mt-2">
                <div className="w-0.5 flex-shrink-0 rounded-full mt-0.5" style={{ background: accentColor }} />
                <p className="text-sm leading-relaxed text-paper/60" style={{ whiteSpace: 'pre-line' }}>{result[key] as string}</p>
              </div>
            )}
            {type === 'box' && (
              <div
                className="mt-2 px-4 py-3 rounded-xl text-sm leading-relaxed text-paper/60"
                style={{ background: `${accentColor}0b`, border: `1px solid ${accentColor}18`, whiteSpace: 'pre-line' }}
              >
                {result[key] as string}
              </div>
            )}
            {type === 'plain' && (
              <p className="mt-2 text-sm leading-relaxed text-paper/55" style={{ whiteSpace: 'pre-line' }}>{result[key] as string}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function WisdomSectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold tracking-widest" style={{ color: `${color}88` }}>
      {children}
    </h4>
  );
}

// ─── 体魄力量专属：悬浮精灵触发按钮 ──────────────────────────────────────────

interface FitnessFloatingSpriteProps {
  loading: boolean;
  show: boolean;
  accentColor: string;
  onToggle: () => void;
}

export function FitnessFloatingSprite({ loading, show, accentColor, onToggle }: FitnessFloatingSpriteProps) {
  return (
    <div className="flex justify-end mb-5">
      <button
        onClick={onToggle}
        disabled={loading}
        title={show ? '收起智能复盘' : '开启智能复盘'}
        className="relative flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
        style={{
          color: accentColor,
          background: `radial-gradient(ellipse at 30% 40%, ${accentColor}18 0%, ${accentColor}08 70%)`,
          border: `1px solid ${accentColor}35`,
          boxShadow: `0 0 18px ${accentColor}20, 0 2px 8px rgba(0,0,0,0.3)`,
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.boxShadow = `0 0 28px ${accentColor}35, 0 4px 12px rgba(0,0,0,0.4)`;
          el.style.borderColor = `${accentColor}60`;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.boxShadow = `0 0 18px ${accentColor}20, 0 2px 8px rgba(0,0,0,0.3)`;
          el.style.borderColor = `${accentColor}35`;
        }}
      >
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}50` }}
        >
          {loading
            ? <Loader2 size={11} className="animate-spin" style={{ color: accentColor }} />
            : <BrainCircuit size={11} style={{ color: accentColor }} />
          }
        </span>
        <span className="tracking-wide">
          {loading ? '分析中…' : show ? '刷新复盘' : '开启智能复盘'}
        </span>
        {!loading && (show ? <ChevronUp size={12} className="opacity-50" /> : <ChevronDown size={12} className="opacity-50" />)}
      </button>
    </div>
  );
}

// ─── 体魄力量专属：5板块纯数据复盘面板 ───────────────────────────────────────

interface FitnessReviewPanelProps {
  result: FitnessAnalysisResult | null;
  loading: boolean;
  accentColor: string;
  show: boolean;
}

export function FitnessReviewPanel({ result, loading, accentColor, show }: FitnessReviewPanelProps) {
  if (!show) return null;

  if (loading || !result) {
    return (
      <div
        className="rounded-2xl border p-6 mb-6 flex items-center justify-center gap-3"
        style={{ borderColor: `${accentColor}20`, background: `${accentColor}06` }}
      >
        <Loader2 size={18} className="animate-spin" style={{ color: accentColor }} />
        <span className="text-sm" style={{ color: `${accentColor}99` }}>正在生成复盘分析…</span>
      </div>
    );
  }

  const SECTIONS: { key: keyof FitnessAnalysisResult; label: string; type: 'cards' | 'bar' | 'box' | 'plain' }[] = [
    { key: 'rawData',        label: '原始数据展示',           type: 'cards' },
    { key: 'peerComparison', label: '同龄普通人横向档位对标',  type: 'bar'   },
    { key: 'growthRate',     label: '自身历史纵向增速对比',    type: 'bar'   },
    { key: 'balanceJudge',   label: '强弱项均衡判定',          type: 'box'   },
    { key: 'periodSummary',  label: '周期整体数据总结',         type: 'plain' },
  ];

  return (
    <div
      className="rounded-2xl border mb-6 overflow-hidden"
      style={{ borderColor: `${accentColor}20`, background: `${accentColor}05` }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ borderColor: `${accentColor}15`, background: `${accentColor}0c` }}
      >
        <BrainCircuit size={15} style={{ color: accentColor }} />
        <span className="text-xs font-medium tracking-wide" style={{ color: `${accentColor}cc` }}>
          智能复盘 · 体魄力量 · 基于当前数据生成
        </span>
      </div>

      <div className="p-5 space-y-5">
        {SECTIONS.map(({ key, label, type }) => (
          <section key={key}>
            <FitnessSectionTitle color={accentColor}>{label}</FitnessSectionTitle>
            {type === 'cards' && Array.isArray(result[key]) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-2">
                {(result[key] as AnalysisBlock[]).map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
                    style={{ background: `${accentColor}0e`, border: `1px solid ${accentColor}20` }}
                  >
                    <span className="text-xs" style={{ color: `${accentColor}80` }}>{s.label}</span>
                    <span className="text-sm font-semibold" style={{ color: accentColor }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
            {type === 'bar' && (
              <div className="flex gap-3 mt-2">
                <div className="w-0.5 flex-shrink-0 rounded-full mt-0.5" style={{ background: accentColor }} />
                <p className="text-sm leading-relaxed text-paper/60" style={{ whiteSpace: 'pre-line' }}>{result[key] as string}</p>
              </div>
            )}
            {type === 'box' && (
              <div
                className="mt-2 px-4 py-3 rounded-xl text-sm leading-relaxed text-paper/60"
                style={{ background: `${accentColor}0b`, border: `1px solid ${accentColor}18`, whiteSpace: 'pre-line' }}
              >
                {result[key] as string}
              </div>
            )}
            {type === 'plain' && (
              <p className="mt-2 text-sm leading-relaxed text-paper/55" style={{ whiteSpace: 'pre-line' }}>{result[key] as string}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function FitnessSectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold tracking-widest" style={{ color: `${color}88` }}>
      {children}
    </h4>
  );
}

// ─── 精神意识专属：悬浮精灵触发按钮 ──────────────────────────────────────────

interface SpiritFloatingSpriteProps {
  loading: boolean;
  show: boolean;
  accentColor: string;
  onToggle: () => void;
}

export function SpiritFloatingSprite({ loading, show, accentColor, onToggle }: SpiritFloatingSpriteProps) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      title={show ? '收起智能复盘' : '开启智能复盘'}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex-shrink-0"
      style={{
        color: accentColor,
        background: `radial-gradient(ellipse at 30% 40%, ${accentColor}18 0%, ${accentColor}08 70%)`,
        border: `1px solid ${accentColor}35`,
        boxShadow: `0 0 14px ${accentColor}18, 0 2px 6px rgba(0,0,0,0.25)`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.boxShadow = `0 0 22px ${accentColor}30, 0 3px 10px rgba(0,0,0,0.35)`;
        el.style.borderColor = `${accentColor}55`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.boxShadow = `0 0 14px ${accentColor}18, 0 2px 6px rgba(0,0,0,0.25)`;
        el.style.borderColor = `${accentColor}35`;
      }}
    >
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}45` }}
      >
        {loading
          ? <Loader2 size={9} className="animate-spin" style={{ color: accentColor }} />
          : <BrainCircuit size={9} style={{ color: accentColor }} />
        }
      </span>
      <span className="tracking-wide">{loading ? '分析中…' : show ? '刷新复盘' : '开启智能复盘'}</span>
      {!loading && (show ? <ChevronUp size={11} className="opacity-40" /> : <ChevronDown size={11} className="opacity-40" />)}
    </button>
  );
}

// ─── 精神意识专属：5板块纯数据复盘面板 ───────────────────────────────────────

interface SpiritReviewPanelProps {
  result: SpiritAnalysisResult | null;
  loading: boolean;
  accentColor: string;
  show: boolean;
}

export function SpiritReviewPanel({ result, loading, accentColor, show }: SpiritReviewPanelProps) {
  if (!show) return null;

  if (loading || !result) {
    return (
      <div
        className="rounded-2xl border p-6 mb-4 flex items-center justify-center gap-3"
        style={{ borderColor: `${accentColor}20`, background: `${accentColor}06` }}
      >
        <Loader2 size={18} className="animate-spin" style={{ color: accentColor }} />
        <span className="text-sm" style={{ color: `${accentColor}99` }}>正在生成复盘分析…</span>
      </div>
    );
  }

  const SECTIONS: { key: keyof SpiritAnalysisResult; label: string; type: 'cards' | 'bar' | 'box' | 'plain' }[] = [
    { key: 'rawData',       label: '客观统计',                   type: 'cards' },
    { key: 'themeFreq',     label: '高频主题提炼',               type: 'bar'   },
    { key: 'emotionTone',   label: '整体情绪底色',               type: 'bar'   },
    { key: 'longitudinal',  label: '纵向对比·思考节奏/心智变化', type: 'box'   },
    { key: 'periodSummary', label: '周期整体数据总结',           type: 'plain' },
  ];

  return (
    <div
      className="rounded-2xl border mb-4 overflow-hidden"
      style={{ borderColor: `${accentColor}20`, background: `${accentColor}05` }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ borderColor: `${accentColor}15`, background: `${accentColor}0c` }}
      >
        <BrainCircuit size={14} style={{ color: accentColor }} />
        <span className="text-xs font-medium tracking-wide" style={{ color: `${accentColor}cc` }}>
          智能复盘 · 精神意识 · 基于当前时段数据生成
        </span>
      </div>

      <div className="p-5 space-y-5">
        {SECTIONS.map(({ key, label, type }) => (
          <section key={key}>
            <SpiritSectionTitle color={accentColor}>{label}</SpiritSectionTitle>
            {type === 'cards' && Array.isArray(result[key]) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-2">
                {(result[key] as AnalysisBlock[]).map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
                    style={{ background: `${accentColor}0e`, border: `1px solid ${accentColor}20` }}
                  >
                    <span className="text-xs" style={{ color: `${accentColor}80` }}>{s.label}</span>
                    <span className="text-sm font-semibold" style={{ color: accentColor }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
            {type === 'bar' && (
              <div className="flex gap-3 mt-2">
                <div className="w-0.5 flex-shrink-0 rounded-full mt-0.5" style={{ background: accentColor }} />
                <p className="text-sm leading-relaxed text-paper/60" style={{ whiteSpace: 'pre-line' }}>{result[key] as string}</p>
              </div>
            )}
            {type === 'box' && (
              <div
                className="mt-2 px-4 py-3 rounded-xl text-sm leading-relaxed text-paper/60"
                style={{ background: `${accentColor}0b`, border: `1px solid ${accentColor}18`, whiteSpace: 'pre-line' }}
              >
                {result[key] as string}
              </div>
            )}
            {type === 'plain' && (
              <p className="mt-2 text-sm leading-relaxed text-paper/55" style={{ whiteSpace: 'pre-line' }}>{result[key] as string}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function SpiritSectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold tracking-widest" style={{ color: `${color}88` }}>
      {children}
    </h4>
  );
}

// ─── 爱好板块专属：悬浮精灵触发按钮 ──────────────────────────────────────────

interface HobbiesFloatingSpriteProps {
  loading: boolean;
  show: boolean;
  accentColor: string;
  onToggle: () => void;
}

export function HobbiesFloatingSprite({ loading, show, accentColor, onToggle }: HobbiesFloatingSpriteProps) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      title={show ? '收起智能复盘' : '开启智能复盘'}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex-shrink-0"
      style={{
        color: accentColor,
        background: `radial-gradient(ellipse at 30% 40%, ${accentColor}18 0%, ${accentColor}08 70%)`,
        border: `1px solid ${accentColor}35`,
        boxShadow: `0 0 14px ${accentColor}18, 0 2px 6px rgba(0,0,0,0.25)`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.boxShadow = `0 0 22px ${accentColor}30, 0 3px 10px rgba(0,0,0,0.35)`;
        el.style.borderColor = `${accentColor}55`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.boxShadow = `0 0 14px ${accentColor}18, 0 2px 6px rgba(0,0,0,0.25)`;
        el.style.borderColor = `${accentColor}35`;
      }}
    >
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}45` }}
      >
        {loading
          ? <Loader2 size={9} className="animate-spin" style={{ color: accentColor }} />
          : <BrainCircuit size={9} style={{ color: accentColor }} />
        }
      </span>
      <span className="tracking-wide">{loading ? '分析中…' : show ? '刷新复盘' : '开启智能复盘'}</span>
      {!loading && (show ? <ChevronUp size={11} className="opacity-40" /> : <ChevronDown size={11} className="opacity-40" />)}
    </button>
  );
}

// ─── 爱好板块专属：5板块叙事型复盘面板 ───────────────────────────────────────

interface HobbiesReviewPanelProps {
  result: HobbiesAnalysisResult | null;
  loading: boolean;
  accentColor: string;
  show: boolean;
}

export function HobbiesReviewPanel({ result, loading, accentColor, show }: HobbiesReviewPanelProps) {
  if (!show) return null;

  if (loading || !result) {
    return (
      <div
        className="rounded-2xl border p-6 mb-4 flex items-center justify-center gap-3"
        style={{ borderColor: `${accentColor}20`, background: `${accentColor}06` }}
      >
        <Loader2 size={18} className="animate-spin" style={{ color: accentColor }} />
        <span className="text-sm" style={{ color: `${accentColor}99` }}>正在生成复盘分析…</span>
      </div>
    );
  }

  const SECTIONS: { key: keyof HobbiesAnalysisResult; label: string; type: 'cards' | 'bar' | 'box' | 'plain' }[] = [
    { key: 'rawList',      label: '时段留存清单',               type: 'cards' },
    { key: 'focus',        label: '爱好重心',                   type: 'bar'   },
    { key: 'relaxState',   label: '日常松弛状态 & 心境氛围',    type: 'bar'   },
    { key: 'rhythmShift',  label: '长期节奏迁移变化',           type: 'box'   },
    { key: 'periodSummary',label: '周期整体陈述',               type: 'plain' },
  ];

  return (
    <div
      className="rounded-2xl border mb-4 overflow-hidden"
      style={{ borderColor: `${accentColor}20`, background: `${accentColor}05` }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ borderColor: `${accentColor}15`, background: `${accentColor}0c` }}
      >
        <BrainCircuit size={14} style={{ color: accentColor }} />
        <span className="text-xs font-medium tracking-wide" style={{ color: `${accentColor}cc` }}>
          智能复盘 · 爱好板块 · 基于当前时段数据生成
        </span>
      </div>

      <div className="p-5 space-y-5">
        {SECTIONS.map(({ key, label, type }) => (
          <section key={key}>
            <HobbiesSectionTitle color={accentColor}>{label}</HobbiesSectionTitle>
            {type === 'cards' && Array.isArray(result[key]) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-2">
                {(result[key] as AnalysisBlock[]).map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
                    style={{ background: `${accentColor}0e`, border: `1px solid ${accentColor}20` }}
                  >
                    <span className="text-xs" style={{ color: `${accentColor}80` }}>{s.label}</span>
                    <span className="text-sm font-semibold" style={{ color: accentColor }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
            {type === 'bar' && (
              <div className="flex gap-3 mt-2">
                <div className="w-0.5 flex-shrink-0 rounded-full mt-0.5" style={{ background: accentColor }} />
                <p className="text-sm leading-relaxed text-paper/60" style={{ whiteSpace: 'pre-line' }}>{result[key] as string}</p>
              </div>
            )}
            {type === 'box' && (
              <div
                className="mt-2 px-4 py-3 rounded-xl text-sm leading-relaxed text-paper/60"
                style={{ background: `${accentColor}0b`, border: `1px solid ${accentColor}18`, whiteSpace: 'pre-line' }}
              >
                {result[key] as string}
              </div>
            )}
            {type === 'plain' && (
              <p className="mt-2 text-sm leading-relaxed text-paper/55" style={{ whiteSpace: 'pre-line' }}>{result[key] as string}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function HobbiesSectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold tracking-widest" style={{ color: `${color}88` }}>
      {children}
    </h4>
  );
}

// ─── 技艺板块专属：悬浮精灵触发按钮 ──────────────────────────────────────────

interface SkillsFloatingSpriteProps {
  loading: boolean;
  show: boolean;
  accentColor: string;
  onToggle: () => void;
}

export function SkillsFloatingSprite({ loading, show, accentColor, onToggle }: SkillsFloatingSpriteProps) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      title={show ? '收起智能复盘' : '开启智能复盘'}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex-shrink-0"
      style={{
        color: accentColor,
        background: `radial-gradient(ellipse at 30% 40%, ${accentColor}18 0%, ${accentColor}08 70%)`,
        border: `1px solid ${accentColor}35`,
        boxShadow: `0 0 14px ${accentColor}18, 0 2px 6px rgba(0,0,0,0.25)`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.boxShadow = `0 0 22px ${accentColor}30, 0 3px 10px rgba(0,0,0,0.35)`;
        el.style.borderColor = `${accentColor}55`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.boxShadow = `0 0 14px ${accentColor}18, 0 2px 6px rgba(0,0,0,0.25)`;
        el.style.borderColor = `${accentColor}35`;
      }}
    >
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}45` }}
      >
        {loading
          ? <Loader2 size={9} className="animate-spin" style={{ color: accentColor }} />
          : <BrainCircuit size={9} style={{ color: accentColor }} />
        }
      </span>
      <span className="tracking-wide">{loading ? '分析中…' : show ? '刷新复盘' : '开启智能复盘'}</span>
      {!loading && (show ? <ChevronUp size={11} className="opacity-40" /> : <ChevronDown size={11} className="opacity-40" />)}
    </button>
  );
}

// ─── 技艺板块专属：5板块成品归档复盘面板 ─────────────────────────────────────

interface SkillsReviewPanelProps {
  result: SkillsAnalysisResult | null;
  loading: boolean;
  accentColor: string;
  show: boolean;
}

export function SkillsReviewPanel({ result, loading, accentColor, show }: SkillsReviewPanelProps) {
  if (!show) return null;

  if (loading || !result) {
    return (
      <div
        className="rounded-2xl border p-6 mb-4 flex items-center justify-center gap-3"
        style={{ borderColor: `${accentColor}20`, background: `${accentColor}06` }}
      >
        <Loader2 size={18} className="animate-spin" style={{ color: accentColor }} />
        <span className="text-sm" style={{ color: `${accentColor}99` }}>正在生成复盘分析…</span>
      </div>
    );
  }

  const SECTIONS: { key: keyof SkillsAnalysisResult; label: string; type: 'cards' | 'bar' | 'box' | 'plain' }[] = [
    { key: 'rawList',        label: '时段成品归档清单',      type: 'cards' },
    { key: 'archivePattern', label: '该时段归档重心',         type: 'bar'   },
    { key: 'lineage',        label: '各技艺留存脉络',         type: 'bar'   },
    { key: 'rhythmShift',    label: '长期归档节奏迁移',       type: 'box'   },
    { key: 'periodSummary',  label: '周期整体陈述',           type: 'plain' },
  ];

  return (
    <div
      className="rounded-2xl border mb-4 overflow-hidden"
      style={{ borderColor: `${accentColor}20`, background: `${accentColor}05` }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ borderColor: `${accentColor}15`, background: `${accentColor}0c` }}
      >
        <BrainCircuit size={14} style={{ color: accentColor }} />
        <span className="text-xs font-medium tracking-wide" style={{ color: `${accentColor}cc` }}>
          智能复盘 · 技艺成品 · 基于当前时段数据生成
        </span>
      </div>

      <div className="p-5 space-y-5">
        {SECTIONS.map(({ key, label, type }) => (
          <section key={key}>
            <SkillsSectionTitle color={accentColor}>{label}</SkillsSectionTitle>
            {type === 'cards' && Array.isArray(result[key]) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-2">
                {(result[key] as AnalysisBlock[]).map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
                    style={{ background: `${accentColor}0e`, border: `1px solid ${accentColor}20` }}
                  >
                    <span className="text-xs" style={{ color: `${accentColor}80` }}>{s.label}</span>
                    <span className="text-sm font-semibold" style={{ color: accentColor }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
            {type === 'bar' && (
              <div className="flex gap-3 mt-2">
                <div className="w-0.5 flex-shrink-0 rounded-full mt-0.5" style={{ background: accentColor }} />
                <p className="text-sm leading-relaxed text-paper/60" style={{ whiteSpace: 'pre-line' }}>{result[key] as string}</p>
              </div>
            )}
            {type === 'box' && (
              <div
                className="mt-2 px-4 py-3 rounded-xl text-sm leading-relaxed text-paper/60"
                style={{ background: `${accentColor}0b`, border: `1px solid ${accentColor}18`, whiteSpace: 'pre-line' }}
              >
                {result[key] as string}
              </div>
            )}
            {type === 'plain' && (
              <p className="mt-2 text-sm leading-relaxed text-paper/55" style={{ whiteSpace: 'pre-line' }}>{result[key] as string}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function SkillsSectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold tracking-widest" style={{ color: `${color}88` }}>
      {children}
    </h4>
  );
}

// ─── 时间板块专属：悬浮精灵触发按钮 ──────────────────────────────────────────

interface TimeFloatingSpriteProps {
  loading: boolean;
  show: boolean;
  accentColor: string;
  onToggle: () => void;
}

export function TimeFloatingSprite({ loading, show, accentColor, onToggle }: TimeFloatingSpriteProps) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      title={show ? '收起智能复盘' : '开启智能复盘'}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex-shrink-0"
      style={{
        color: accentColor,
        background: `radial-gradient(ellipse at 30% 40%, ${accentColor}18 0%, ${accentColor}08 70%)`,
        border: `1px solid ${accentColor}35`,
        boxShadow: `0 0 14px ${accentColor}18, 0 2px 6px rgba(0,0,0,0.25)`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.boxShadow = `0 0 22px ${accentColor}30, 0 3px 10px rgba(0,0,0,0.35)`;
        el.style.borderColor = `${accentColor}55`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.boxShadow = `0 0 14px ${accentColor}18, 0 2px 6px rgba(0,0,0,0.25)`;
        el.style.borderColor = `${accentColor}35`;
      }}
    >
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}45` }}
      >
        {loading
          ? <Loader2 size={9} className="animate-spin" style={{ color: accentColor }} />
          : <BrainCircuit size={9} style={{ color: accentColor }} />
        }
      </span>
      <span className="tracking-wide">{loading ? '分析中…' : show ? '刷新复盘' : '开启智能复盘'}</span>
      {!loading && (show ? <ChevronUp size={11} className="opacity-40" /> : <ChevronDown size={11} className="opacity-40" />)}
    </button>
  );
}

// ─── 时间板块专属：5板块生活时间线归档面板 ────────────────────────────────────

interface TimeReviewPanelProps {
  result: TimeAnalysisResult | null;
  loading: boolean;
  accentColor: string;
  show: boolean;
}

export function TimeReviewPanel({ result, loading, accentColor, show }: TimeReviewPanelProps) {
  if (!show) return null;

  if (loading || !result) {
    return (
      <div
        className="rounded-2xl border p-6 mb-4 flex items-center justify-center gap-3"
        style={{ borderColor: `${accentColor}20`, background: `${accentColor}06` }}
      >
        <Loader2 size={18} className="animate-spin" style={{ color: accentColor }} />
        <span className="text-sm" style={{ color: `${accentColor}99` }}>正在生成复盘分析…</span>
      </div>
    );
  }

  const SECTIONS: { key: keyof TimeAnalysisResult; label: string; type: 'cards' | 'bar' | 'box' | 'plain' }[] = [
    { key: 'rawList',        label: '时段留存清单',           type: 'cards' },
    { key: 'scheduleTrace',  label: '作息脉络',               type: 'bar'   },
    { key: 'eventTrace',     label: '关键事件留存',           type: 'bar'   },
    { key: 'longitudinal',   label: '纵向阶段变化',           type: 'box'   },
    { key: 'periodSummary',  label: '周期整体陈述',           type: 'plain' },
  ];

  return (
    <div
      className="rounded-2xl border mb-4 overflow-hidden"
      style={{ borderColor: `${accentColor}20`, background: `${accentColor}05` }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ borderColor: `${accentColor}15`, background: `${accentColor}0c` }}
      >
        <BrainCircuit size={14} style={{ color: accentColor }} />
        <span className="text-xs font-medium tracking-wide" style={{ color: `${accentColor}cc` }}>
          智能复盘 · 时间记录 · 基于当前时段数据生成
        </span>
      </div>

      <div className="p-5 space-y-5">
        {SECTIONS.map(({ key, label, type }) => (
          <section key={key}>
            <TimeSectionTitle color={accentColor}>{label}</TimeSectionTitle>
            {type === 'cards' && Array.isArray(result[key]) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-2">
                {(result[key] as AnalysisBlock[]).map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
                    style={{ background: `${accentColor}0e`, border: `1px solid ${accentColor}20` }}
                  >
                    <span className="text-xs" style={{ color: `${accentColor}80` }}>{s.label}</span>
                    <span className="text-sm font-semibold" style={{ color: accentColor }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
            {type === 'bar' && (
              <div className="flex gap-3 mt-2">
                <div className="w-0.5 flex-shrink-0 rounded-full mt-0.5" style={{ background: accentColor }} />
                <p className="text-sm leading-relaxed text-paper/60" style={{ whiteSpace: 'pre-line' }}>{result[key] as string}</p>
              </div>
            )}
            {type === 'box' && (
              <div
                className="mt-2 px-4 py-3 rounded-xl text-sm leading-relaxed text-paper/60"
                style={{ background: `${accentColor}0b`, border: `1px solid ${accentColor}18`, whiteSpace: 'pre-line' }}
              >
                {result[key] as string}
              </div>
            )}
            {type === 'plain' && (
              <p className="mt-2 text-sm leading-relaxed text-paper/55" style={{ whiteSpace: 'pre-line' }}>{result[key] as string}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function TimeSectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold tracking-widest" style={{ color: `${color}88` }}>
      {children}
    </h4>
  );
}

// ─── 全局人格画像：悬浮精灵触发按钮 ──────────────────────────────────────────

interface GlobalFloatingSpriteProps {
  loading: boolean;
  show: boolean;
  accentColor: string;
  onToggle: () => void;
}

export function GlobalFloatingSprite({ loading, show, accentColor, onToggle }: GlobalFloatingSpriteProps) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      title={show ? '收起人格画像' : '生成人格画像'}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex-shrink-0"
      style={{
        color: accentColor,
        background: `radial-gradient(ellipse at 30% 40%, ${accentColor}18 0%, ${accentColor}08 70%)`,
        border: `1px solid ${accentColor}35`,
        boxShadow: `0 0 14px ${accentColor}18, 0 2px 6px rgba(0,0,0,0.25)`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.boxShadow = `0 0 22px ${accentColor}30, 0 3px 10px rgba(0,0,0,0.35)`;
        el.style.borderColor = `${accentColor}55`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.boxShadow = `0 0 14px ${accentColor}18, 0 2px 6px rgba(0,0,0,0.25)`;
        el.style.borderColor = `${accentColor}35`;
      }}
    >
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}45` }}
      >
        {loading
          ? <Loader2 size={9} className="animate-spin" style={{ color: accentColor }} />
          : <BrainCircuit size={9} style={{ color: accentColor }} />
        }
      </span>
      <span className="tracking-wide">{loading ? '生成中…' : show ? '刷新画像' : '生成人格画像'}</span>
      {!loading && (show ? <ChevronUp size={11} className="opacity-40" /> : <ChevronDown size={11} className="opacity-40" />)}
    </button>
  );
}

// ─── 全局人格画像：8板块人格画像面板 ─────────────────────────────────────────

interface GlobalReviewPanelProps {
  result: GlobalPortraitResult | null;
  loading: boolean;
  accentColor: string;
  show: boolean;
}

export function GlobalReviewPanel({ result, loading, accentColor, show }: GlobalReviewPanelProps) {
  if (!show) return null;

  if (loading || !result) {
    return (
      <div
        className="rounded-2xl border p-6 mb-4 flex items-center justify-center gap-3"
        style={{ borderColor: `${accentColor}20`, background: `${accentColor}06` }}
      >
        <Loader2 size={18} className="animate-spin" style={{ color: accentColor }} />
        <span className="text-sm" style={{ color: `${accentColor}99` }}>正在生成人格画像…</span>
      </div>
    );
  }

  const SECTIONS: { key: keyof GlobalPortraitResult; label: string; type: 'cards' | 'bar' | 'box' | 'plain' }[] = [
    { key: 'rawList',          label: '各系统存档数量总览',   type: 'cards' },
    { key: 'mindset',          label: '心性',                 type: 'bar'   },
    { key: 'behavioralStyle',  label: '行事风格',             type: 'bar'   },
    { key: 'solitaryMode',     label: '独处模式',             type: 'bar'   },
    { key: 'persistentHabits', label: '坚持习惯',             type: 'box'   },
    { key: 'lifePref',         label: '生活偏好',             type: 'bar'   },
    { key: 'spiritualCore',    label: '精神内核',             type: 'bar'   },
    { key: 'whoAmI',           label: '我是谁',               type: 'box'   },
  ];

  return (
    <div
      className="rounded-2xl border mb-4 overflow-hidden"
      style={{ borderColor: `${accentColor}20`, background: `${accentColor}05` }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ borderColor: `${accentColor}15`, background: `${accentColor}0c` }}
      >
        <BrainCircuit size={14} style={{ color: accentColor }} />
        <span className="text-xs font-medium tracking-wide" style={{ color: `${accentColor}cc` }}>
          全局人格画像 · 基于六大子系统存档 · 纯事实陈述
        </span>
      </div>

      <div className="p-5 space-y-5">
        {SECTIONS.map(({ key, label, type }) => (
          <section key={key}>
            <GlobalSectionTitle color={accentColor}>{label}</GlobalSectionTitle>
            {type === 'cards' && Array.isArray(result[key]) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-2">
                {(result[key] as AnalysisBlock[]).map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
                    style={{ background: `${accentColor}0e`, border: `1px solid ${accentColor}20` }}
                  >
                    <span className="text-xs" style={{ color: `${accentColor}80` }}>{s.label}</span>
                    <span className="text-sm font-semibold" style={{ color: accentColor }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
            {type === 'bar' && (
              <div className="flex gap-3 mt-2">
                <div className="w-0.5 flex-shrink-0 rounded-full mt-0.5" style={{ background: accentColor }} />
                <p className="text-sm leading-relaxed text-paper/60" style={{ whiteSpace: 'pre-line' }}>{result[key] as string}</p>
              </div>
            )}
            {type === 'box' && key !== 'whoAmI' && (
              <div
                className="mt-2 px-4 py-3 rounded-xl text-sm leading-relaxed text-paper/60"
                style={{ background: `${accentColor}0b`, border: `1px solid ${accentColor}18`, whiteSpace: 'pre-line' }}
              >
                {result[key] as string}
              </div>
            )}
            {type === 'box' && key === 'whoAmI' && (
              <div
                className="mt-2 px-5 py-4 rounded-xl text-sm leading-loose"
                style={{
                  background: `${accentColor}12`,
                  border: `1px solid ${accentColor}30`,
                  color: `${accentColor}dd`,
                  whiteSpace: 'pre-line',
                }}
              >
                {result[key] as string}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function GlobalSectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold tracking-widest" style={{ color: `${color}88` }}>
      {children}
    </h4>
  );
}
