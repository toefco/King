import { useRef, useMemo, useState, useEffect } from 'react';
import { read, utils } from 'xlsx';
import { Upload, Smile, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useStore } from '../../store';
import { HappinessRecord } from '../../types';

type ViewMode = 'day' | 'week' | 'month' | 'year';
type SortKey = 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc' | 'sensory' | 'memory' | 'soul' | 'growth' | 'social';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date_desc',  label: '日期最新' },
  { value: 'date_asc',   label: '日期最早' },
  { value: 'score_desc', label: '综合分 ↓' },
  { value: 'score_asc',  label: '综合分 ↑' },
  { value: 'sensory',    label: '感官感觉度 ↓' },
  { value: 'memory',     label: '记忆留存度 ↓' },
  { value: 'soul',       label: '灵魂触动度 ↓' },
  { value: 'growth',     label: '自我成长度 ↓' },
  { value: 'social',     label: '人际连接度 ↓' },
];

const DIMS = [
  { 
    key: 'sensory' as const, 
    label: '情绪感觉', 
    color: '#f87171', 
    desc: '身体感官的愉悦程度',
    standards: [
      '1. 表情无变化，内心无感',
      '2. 呼吸平稳，轻微愉悦',
      '3. 嘴角微扬，淡淡开心',
      '4. 稍微波动，想笑',
      '5. 自然微笑，心情变好',
      '6. 快乐明显，想分享',
      '7. 笑出声，情绪释放',
      '8. 激昂抖动，难以平复',
      '9. 大笑大叫，情绪爆发',
      '10. 喜极而泣，极致巅峰'
    ]
  },
  { 
    key: 'memory' as const, 
    label: '记忆留存', 
    color: '#60a5fa', 
    desc: '事件在记忆中留存时长',
    standards: [
      '1. 几分钟转瞬即逝',
      '2. 半小时，结束即忘',
      '3. 几小时，当日有效',
      '4. 一下午，次日淡忘',
      '5. 一两天，持久回味',
      '6. 一周内，反复想起',
      '7. 人生锚点，永久记忆',
      '8. 年度亮点，持久赋能',
      '9. 长期影响，改变轨迹',
      '10. 里程碑，蜕变'
    ]
  },
  { 
    key: 'soul' as const, 
    label: '灵魂触动', 
    color: '#a78bfa', 
    desc: '内心深层的触动与震撼',
    standards: [
      '1. 正常事',
      '2. 无特别',
      '3. 认同感，轻微共鸣',
      '4. 挺不错，有点触动',
      '5. 真好，被治愈',
      '6. 善意连接，被理解',
      '7. 打动触动，内心震撼',
      '8. 生命意义，通透觉醒',
      '9. 彻底觉醒，认知重构',
      '10. 死亡重生'
    ]
  },
  { 
    key: 'growth' as const, 
    label: '自我成长', 
    color: '#34d399', 
    desc: '对自身成长的促进程度',
    standards: [
      '1. 无意义',
      '2. 重复性',
      '3. 小知识',
      '4. 有用技巧',
      '5. 修正理念',
      '6. 理解内化',
      '7. 能力上升',
      '8. 改变习惯',
      '9. 新价值观',
      '10. 我是谁'
    ]
  },
  { 
    key: 'social' as const, 
    label: '人际连接', 
    color: '#fb923c', 
    desc: '与他人或精神的联接深度',
    standards: [
      '1. 个人',
      '2. 独处',
      '3. 事物交接',
      '4. 平等对话',
      '5. 陪伴在一起',
      '6. 阅读精神联接',
      '7. 团队协作',
      '8. 集体认同',
      '9. 理念同频',
      '10. 爱'
    ]
  },
];

const VIEW_LABELS: Record<ViewMode, string> = { day: '日', week: '周', month: '月', year: '年' };
const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekStart(d: Date) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const s = new Date(d);
  s.setDate(d.getDate() + diff);
  return s;
}

function extractScore(raw: unknown): number {
  const str = String(raw ?? '');
  const m = str.match(/^(\d+)/);
  return m ? Math.min(10, Math.max(1, parseInt(m[1]))) : 0;
}

function totalScore(r: HappinessRecord) {
  return parseFloat(((r.sensory + r.memory + r.soul + r.growth + r.social) / 5).toFixed(1));
}

function getPeriodKey(d: Date, mode: ViewMode): string {
  if (mode === 'day') return toDateStr(d);
  if (mode === 'week') return toDateStr(getWeekStart(d));
  if (mode === 'month') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  return String(d.getFullYear());
}

export default function HappinessEvent() {
  const happinessRecords = useStore((s) => s.happinessRecords);
  const setHappinessRecords = useStore((s) => s.setHappinessRecords);
  const fileRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [hoveredDim, setHoveredDim] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerNav, setPickerNav] = useState(() => new Date());
  const [sortKey, setSortKey] = useState<SortKey>('date_desc');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (!showPicker) return;
    const h = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showPicker]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const wb = read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = utils.sheet_to_json<Record<string, unknown>>(ws);

    const records: HappinessRecord[] = data.map((row, i) => {
      const dateRaw = row['1、日期：'] ?? row['日期'] ?? '';
      const dateStr = typeof dateRaw === 'number'
        ? toDateStr(new Date(Math.round((dateRaw - 25569) * 86400 * 1000)))
        : String(dateRaw).trim().slice(0, 10);
      return {
        id: `h-${i}-${Date.now()}`,
        date: dateStr,
        event: String(row['2、今天发生了什么让你幸福的事？'] ?? row['事件'] ?? ''),
        sensory: extractScore(row['3、感官感觉度']),
        memory:  extractScore(row['4、记忆留存度']),
        soul:    extractScore(row['5、灵魂触动度']),
        growth:  extractScore(row['6、自我成长度']),
        social:  extractScore(row['7、人际连接度']),
      };
    }).filter(r => r.date && r.event);

    setHappinessRecords(records);
    e.target.value = '';
  };

  const navigate = (dir: 1 | -1) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (viewMode === 'day') d.setDate(d.getDate() + dir);
      else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
      else if (viewMode === 'month') d.setMonth(d.getMonth() + dir);
      else d.setFullYear(d.getFullYear() + dir);
      return d;
    });
  };

  const periodLabel = useMemo(() => {
    if (viewMode === 'day') {
      const isToday = toDateStr(currentDate) === toDateStr(new Date());
      return `${currentDate.getMonth() + 1}月${currentDate.getDate()}日，${WEEK_DAYS[currentDate.getDay()]}${isToday ? '（今天）' : ''}`;
    }
    if (viewMode === 'week') {
      const s = getWeekStart(currentDate);
      const e = new Date(s); e.setDate(s.getDate() + 6);
      return `${s.getMonth() + 1}月${s.getDate()}日 ~ ${e.getMonth() + 1}月${e.getDate()}日`;
    }
    if (viewMode === 'month') return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;
    return `${currentDate.getFullYear()}年`;
  }, [viewMode, currentDate]);

  const periodRecords = useMemo(() => {
    if (viewMode === 'day') return happinessRecords.filter(r => r.date === toDateStr(currentDate));
    if (viewMode === 'week') {
      const s = getWeekStart(currentDate);
      const e = new Date(s); e.setDate(s.getDate() + 6);
      return happinessRecords.filter(r => r.date >= toDateStr(s) && r.date <= toDateStr(e));
    }
    if (viewMode === 'month') {
      const prefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      return happinessRecords.filter(r => r.date.startsWith(prefix));
    }
    return happinessRecords.filter(r => r.date.startsWith(String(currentDate.getFullYear())));
  }, [happinessRecords, viewMode, currentDate]);

  // 数据时间范围
  const dataRange = useMemo(() => {
    if (happinessRecords.length === 0) return null;
    const dates = happinessRecords.map(r => r.date).filter(Boolean).sort();
    return { min: dates[0], max: dates[dates.length - 1] };
  }, [happinessRecords]);

  // 数据加载后跳到最新时间
  useEffect(() => {
    if (dataRange) setCurrentDate(new Date(dataRange.max + 'T00:00:00'));
  }, [dataRange?.max]);  // eslint-disable-line react-hooks/exhaustive-deps

  // 导航边界
  const canNavPrev = useMemo(() => {
    if (!dataRange) return false;
    return getPeriodKey(currentDate, viewMode) > getPeriodKey(new Date(dataRange.min + 'T00:00:00'), viewMode);
  }, [currentDate, viewMode, dataRange]);

  const canNavNext = useMemo(() => {
    if (!dataRange) return false;
    return getPeriodKey(currentDate, viewMode) < getPeriodKey(new Date(dataRange.max + 'T00:00:00'), viewMode);
  }, [currentDate, viewMode, dataRange]);

  // 5维度平均值（全量数据）
  const allDimAvgs = useMemo(() => {
    if (happinessRecords.length === 0) return null;
    const result: Record<string, number> = {};
    DIMS.forEach(({ key }) => {
      result[key] = parseFloat((happinessRecords.reduce((s, r) => s + r[key], 0) / happinessRecords.length).toFixed(1));
    });
    return result;
  }, [happinessRecords]);

  // 筛选 + 排序后的事件列表
  const sortedEvents = useMemo(() => {
    let list = [...periodRecords];
    // 关键词筛选
    if (searchText.trim()) {
      list = list.filter(r => r.event.includes(searchText.trim()));
    }
    // 排序
    list.sort((a, b) => {
      switch (sortKey) {
        case 'date_desc':  return b.date.localeCompare(a.date);
        case 'date_asc':   return a.date.localeCompare(b.date);
        case 'score_desc': return totalScore(b) - totalScore(a);
        case 'score_asc':  return totalScore(a) - totalScore(b);
        default:           return b[sortKey] - a[sortKey];
      }
    });
    return list;
  }, [periodRecords, sortKey, searchText]);

  // 选择器
  const openPicker = () => { setPickerNav(new Date(currentDate)); setShowPicker(v => !v); };
  const navPicker = (dir: 1 | -1) => {
    setPickerNav(prev => {
      const d = new Date(prev);
      if (viewMode === 'day') d.setMonth(d.getMonth() + dir);
      else if (viewMode === 'week' || viewMode === 'month') d.setFullYear(d.getFullYear() + dir);
      else d.setFullYear(d.getFullYear() + dir * 12);
      return d;
    });
  };

  const calDays = useMemo(() => {
    const y = pickerNav.getFullYear(), m = pickerNav.getMonth();
    const fd = new Date(y, m, 1).getDay();
    const offset = fd === 0 ? 6 : fd - 1;
    const dim = new Date(y, m + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= dim; i++) days.push(i);
    return { y, m, days };
  }, [pickerNav]);

  const weekList = useMemo(() => {
    const year = pickerNav.getFullYear();
    let s = getWeekStart(new Date(year, 0, 1));
    const limit = new Date(year + 1, 0, 1);
    const weeks: { n: number; start: Date; end: Date }[] = [];
    let n = 1;
    while (s < limit) {
      const e = new Date(s); e.setDate(s.getDate() + 6);
      weeks.push({ n, start: new Date(s), end: new Date(e) });
      n++; s = new Date(s); s.setDate(s.getDate() + 7);
    }
    return weeks;
  }, [pickerNav]);

  const yearBase = useMemo(() => Math.floor(pickerNav.getFullYear() / 12) * 12, [pickerNav]);

  const MONTHS_SHORT = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const WEEK_SHORT = ['一','二','三','四','五','六','日'];

  const navHdr = (label: string) => (
    <div className="flex items-center justify-between mb-3">
      <button onClick={() => navPicker(-1)} className="text-paper/40 hover:text-emerald-400 p-1 transition-colors rounded-lg hover:bg-emerald-500/10"><ChevronLeft size={15}/></button>
      <span className="text-sm text-paper/80 font-serif">{label}</span>
      <button onClick={() => navPicker(1)} className="text-paper/40 hover:text-emerald-400 p-1 transition-colors rounded-lg hover:bg-emerald-500/10"><ChevronRight size={15}/></button>
    </div>
  );

  const renderPicker = () => {
    if (viewMode === 'day') {
      const sel = toDateStr(currentDate), today = toDateStr(new Date());
      return (
        <div className="w-64">
          {navHdr(`${calDays.y}年${calDays.m + 1}月`)}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEK_SHORT.map(d => <div key={d} className="text-center text-xs text-paper/25 py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {calDays.days.map((day, i) => {
              if (!day) return <div key={`e${i}`}/>;
              const ds = toDateStr(new Date(calDays.y, calDays.m, day));
              return (
                <button key={day} onClick={() => { setCurrentDate(new Date(calDays.y, calDays.m, day)); setShowPicker(false); }}
                  className={`text-center text-xs py-1.5 rounded-lg transition-all`}
                  style={ds === sel ? { background: 'rgba(16,185,129,0.25)', color: '#6ee7b7', fontWeight: 500 }
                    : ds === today ? { border: '1px solid rgba(16,185,129,0.3)', color: 'rgba(110,231,183,0.7)' }
                    : { color: 'rgba(255,255,255,0.55)' }}
                  onMouseEnter={e => { if (ds !== sel && ds !== today) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.1)'; }}
                  onMouseLeave={e => { if (ds !== sel && ds !== today) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >{day}</button>
              );
            })}
          </div>
        </div>
      );
    }
    if (viewMode === 'week') {
      const selS = toDateStr(getWeekStart(currentDate));
      return (
        <div className="w-68">
          {navHdr(`${pickerNav.getFullYear()}年`)}
          <div className="space-y-0.5 max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(212,175,55,0.2) transparent' }}>
            {weekList.map(({ n, start, end }) => {
              const isSel = toDateStr(start) === selS;
              return (
                <button key={n} onClick={() => { setCurrentDate(new Date(start)); setShowPicker(false); }}
                  className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={isSel ? { background: 'rgba(16,185,129,0.18)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' } : { color: 'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.08)'; }}
                  onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <span style={{ color: isSel ? 'rgba(110,231,183,0.7)' : 'rgba(255,255,255,0.25)' }} className="shrink-0">第{n}周</span>
                  <span>{start.getMonth()+1}月{start.getDate()}日 ~ {end.getMonth()+1}月{end.getDate()}日</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    if (viewMode === 'month') {
      return (
        <div className="w-52">
          {navHdr(`${pickerNav.getFullYear()}年`)}
          <div className="grid grid-cols-4 gap-1.5">
            {MONTHS_SHORT.map((lbl, i) => {
              const isSel = currentDate.getFullYear() === pickerNav.getFullYear() && currentDate.getMonth() === i;
              return (
                <button key={i} onClick={() => { setCurrentDate(new Date(pickerNav.getFullYear(), i, 1)); setShowPicker(false); }}
                  className="py-2 rounded-xl text-sm transition-all"
                  style={isSel ? { background: 'rgba(16,185,129,0.22)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.35)', fontWeight: 500 } : { color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.1)'; }}
                  onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >{lbl}</button>
              );
            })}
          </div>
        </div>
      );
    }
    const years = Array.from({ length: 12 }, (_, i) => yearBase + i);
    return (
        <div className="w-52">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setPickerNav(p => new Date(p.getFullYear()-12,0,1))} className="text-paper/40 hover:text-emerald-400 p-1 transition-colors rounded-lg hover:bg-emerald-500/10"><ChevronLeft size={15}/></button>
          <span className="text-sm text-paper/80 font-serif">{yearBase} – {yearBase+11}</span>
          <button onClick={() => setPickerNav(p => new Date(p.getFullYear()+12,0,1))} className="text-paper/40 hover:text-emerald-400 p-1 transition-colors rounded-lg hover:bg-emerald-500/10"><ChevronRight size={15}/></button>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {years.map(y => (
            <button key={y} onClick={() => { setCurrentDate(new Date(y,0,1)); setShowPicker(false); }}
              className="py-2 rounded-xl text-sm transition-all"
              style={currentDate.getFullYear()===y ? { background: 'rgba(16,185,129,0.22)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.35)', fontWeight: 500 } : { color: 'rgba(255,255,255,0.6)' }}
              onMouseEnter={e => { if (currentDate.getFullYear()!==y) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.1)'; }}
              onMouseLeave={e => { if (currentDate.getFullYear()!==y) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >{y}</button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="panel-time">
      {/* top accent line */}
      <div className="absolute top-0 left-6 right-6 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent)'
      }} />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Smile size={18} style={{ color: '#34d399' }} />
          <h3 className="text-lg font-serif" style={{ color: '#6ee7b7' }}>幸福事件</h3>
          {happinessRecords.length > 0 && (
            <span className="text-xs text-paper/30 ml-1">{happinessRecords.length} 条</span>
          )}
        </div>
        <button onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ color: 'rgba(16,185,129,0.6)', border: '1px solid rgba(16,185,129,0.15)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#34d399';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.07)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16,185,129,0.3)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(16,185,129,0.6)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16,185,129,0.15)';
          }}
        >
          <Upload size={12} />
          导入表格
        </button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
      </div>

      {/* 全量维度平均分（置顶） */}
      {allDimAvgs && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-paper/40 font-serif">维度平均分（共 {happinessRecords.length} 条）</p>
            <div className="flex items-baseline gap-1">
                <span className="text-xl font-medium" style={{ color: '#6ee7b7' }}>
                {parseFloat(((allDimAvgs.sensory + allDimAvgs.memory + allDimAvgs.soul + allDimAvgs.growth + allDimAvgs.social) / 5).toFixed(1))}
              </span>
              <span className="text-xs text-paper/30">/ 10</span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 relative">
            {DIMS.map(({ key, label, color, desc, standards }) => (
              <div 
                key={key} 
                className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 relative cursor-pointer transition-all"
                style={{
                  background: 'rgba(16,185,129,0.04)', 
                  border: hoveredDim === key ? `1px solid ${color}` : '1px solid rgba(16,185,129,0.10)'
                }}
                onMouseEnter={() => setHoveredDim(key)}
                onMouseLeave={() => setHoveredDim(null)}
              >
                <span className="text-xs text-paper/35 text-center leading-tight">{label}</span>
                <span className="text-base font-medium" style={{ color }}>{allDimAvgs[key]}</span>
                <div className="relative w-1.5 h-10 bg-ink/80 rounded-full overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500"
                    style={{ height: `${(allDimAvgs[key] / 10) * 100}%`, background: color }} />
                </div>
                <span className="text-xs text-paper/25 text-center leading-snug mt-0.5">{desc}</span>
                
                {/* 评分标准提示框 */}
                {hoveredDim === key && (
                  <div 
                    className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 rounded-xl shadow-2xl"
                    style={{
                      background: 'rgba(5,20,15,0.98)',
                      border: `1px solid ${color}40`,
                      backdropFilter: 'blur(24px)',
                    }}
                  >
                    <div className="text-xs font-medium mb-2" style={{ color }}>{label} - 评分标准</div>
                    <div className="space-y-1">
                      {standards.map((std, idx) => (
                        <div 
                          key={idx} 
                          className="text-xs text-paper/70 flex items-start gap-2"
                        >
                          <span 
                            className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                            style={{ 
                              background: (idx + 1) <= Math.round(allDimAvgs[key]) ? color : color + '30' 
                            }}
                          />
                          <span>{std}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}


      {happinessRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 rounded-xl cursor-pointer transition-all"
          style={{ border: '2px dashed rgba(16,185,129,0.12)' }}
          onClick={() => fileRef.current?.click()}
          onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(16,185,129,0.28)')}
          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(16,185,129,0.12)')}
        >
          <Upload size={28} className="text-paper/20" />
          <p className="text-sm text-paper/30">点击上传幸福事件记录 .xlsx</p>
          <p className="text-xs text-paper/20">列：1、日期 / 2、事件 / 3-7、五维度评分</p>
        </div>
      ) : (
        <>
          {/* Tab */}
          <div className="flex gap-1 mb-4 rounded-xl p-1 w-fit" style={{
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)'
          }}>
            {(['day', 'week', 'month', 'year'] as ViewMode[]).map(mode => (
              <button key={mode} onClick={() => { setViewMode(mode); setShowPicker(false); }}
                className="px-4 py-1.5 rounded-lg text-sm transition-all"
                style={mode === viewMode ? {
                  background: 'rgba(16,185,129,0.18)',
                  color: '#6ee7b7',
                  border: '1px solid rgba(16,185,129,0.35)',
                } : { color: 'rgba(255,255,255,0.4)' }}
              >
                {VIEW_LABELS[mode]}
              </button>
            ))}
          </div>

          {/* 导航 + 选择器 */}
          <div className="relative flex items-center justify-center gap-4 mb-5" ref={pickerRef}>
            <button onClick={() => navigate(-1)} disabled={!canNavPrev} className={`transition-colors p-1 ${canNavPrev ? 'hover:text-emerald-400' : 'text-paper/15 cursor-not-allowed'}`} style={{ color: canNavPrev ? 'rgba(255,255,255,0.4)' : undefined }}><ChevronLeft size={18}/></button>
            <button onClick={openPicker} className="text-sm font-serif min-w-40 text-center hover:text-emerald-400 transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>{periodLabel}</button>
            <button onClick={() => navigate(1)} disabled={!canNavNext} className={`transition-colors p-1 ${canNavNext ? 'hover:text-emerald-400' : 'text-paper/15 cursor-not-allowed'}`} style={{ color: canNavNext ? 'rgba(255,255,255,0.4)' : undefined }}><ChevronRight size={18}/></button>
            {showPicker && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 rounded-2xl p-4 shadow-2xl" style={{
                background: 'rgba(5,20,15,0.97)',
                border: '1px solid rgba(16,185,129,0.2)',
                backdropFilter: 'blur(24px)',
              }}>
                {renderPicker()}
              </div>
            )}
          </div>

          {periodRecords.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-paper/25 text-sm">该时段暂无数据</div>
          ) : (
            <>

              {/* 幸福事件列表 */}
              <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <p className="text-xs text-paper/40 font-serif mr-auto">
                    事件明细 {searchText.trim() ? `（筛选 ${sortedEvents.length} 条）` : ''}
                  </p>
                  {/* 关键词搜索 */}
                    <div className="relative flex items-center">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-paper/30" />
                    <input
                      type="text"
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      placeholder="搜索事件"
                      className="pl-7 pr-3 py-1 text-xs rounded-lg text-paper/70 placeholder-paper/25 focus:outline-none w-28"
                      style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(16,185,129,0.4)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(16,185,129,0.15)')}
                    />
                  </div>
                  {/* 排序 */}
                  <select
                    value={sortKey}
                    onChange={e => setSortKey(e.target.value as SortKey)}
                    className="text-xs rounded-lg text-paper/60 px-2 py-1 focus:outline-none cursor-pointer"
                    style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(16,185,129,0.35)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(16,185,129,0.15)')}
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 pr-1">
                  {sortedEvents.map(r => {
                    const score = totalScore(r);
                    return (
                      <div key={r.id} className="rounded-xl px-4 py-3" style={{
                        background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.10)'
                      }}>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="text-sm text-paper/80 leading-snug flex-1">{r.event}</span>
                          <div className="flex flex-col items-end shrink-0">
                            <span className="text-base font-medium" style={{ color: '#6ee7b7' }}>{score}</span>
                            <span className="text-xs text-paper/30">{r.date.slice(5)}</span>
                          </div>
                        </div>
                        {/* 5维度小格 */}
                        <div className="flex gap-1.5 flex-wrap">
                          {DIMS.map(({ key, label, color }) => (
                            <span key={key} className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: color + '22', color: color, border: `1px solid ${color}44` }}>
                              {label.replace('度', '')} {r[key]}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
