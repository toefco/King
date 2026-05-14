import { useRef, useMemo, useState, useEffect } from 'react';
import { read, utils } from 'xlsx';
import { Upload, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';
import { ScheduleRecord } from '../../types';

type ViewMode = 'day' | 'week' | 'month' | 'year';

const categoryColors: Record<string, string> = {
  '归元': '#1e40af', '入魔': '#d4af37', '敛息': '#60a5fa',
  '打坐': '#34d399', '贪欲': '#f87171', '痴妄': '#9ca3af',
  '锻体': '#fb923c', '境域探索': '#a78bfa', '深蓝加点': '#0891b2',
  '涤心': '#22d3ee', '养魂': '#818cf8', '写字': '#fbbf24',
};

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}小时${m}分钟`;
  if (h > 0) return `${h}小时`;
  return `${m}分钟`;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekStart(d: Date) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  return start;
}

const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const WEEK_DAYS_SHORT = ['一', '二', '三', '四', '五', '六', '日'];
const VIEW_LABELS: Record<ViewMode, string> = { day: '日', week: '周', month: '月', year: '年' };
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function getPeriodKey(d: Date, mode: ViewMode): string {
  if (mode === 'day') return toDateStr(d);
  if (mode === 'week') return toDateStr(getWeekStart(d));
  if (mode === 'month') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  return String(d.getFullYear());
}

export default function TimeAllocation() {
  const scheduleRecords = useStore((state) => state.scheduleRecords);
  const setScheduleRecords = useStore((state) => state.setScheduleRecords);
  const fileRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerNav, setPickerNav] = useState(() => new Date());

  // 点击弹窗外部时关闭
  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPicker]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const wb = read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = utils.sheet_to_json<Record<string, unknown>>(ws);
    const records: ScheduleRecord[] = data.map((row, i) => {
      let dateStr = '';
      const raw = row['开始时间'];
      if (typeof raw === 'number') {
        const date = new Date(Math.round((raw - 25569) * 86400 * 1000));
        dateStr = toDateStr(date);
      } else {
        dateStr = String(raw ?? '').trim();
      }
      return {
        id: `${i}-${Date.now()}`,
        date: dateStr,
        duration: Number(row['持续时间'] ?? 0),
        category: String(row['事件类别'] ?? ''),
      };
    }).filter(r => r.date && r.category);
    setScheduleRecords(records);
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

  const openPicker = () => {
    setPickerNav(new Date(currentDate));
    setShowPicker(v => !v);
  };

  // 弹窗内部导航
  const navPicker = (dir: 1 | -1) => {
    setPickerNav(prev => {
      const d = new Date(prev);
      if (viewMode === 'day') d.setMonth(d.getMonth() + dir);
      else if (viewMode === 'week' || viewMode === 'month') d.setFullYear(d.getFullYear() + dir);
      else d.setFullYear(d.getFullYear() + dir * 12);
      return d;
    });
  };

  const periodLabel = useMemo(() => {
    if (viewMode === 'day') {
      const isToday = toDateStr(currentDate) === toDateStr(new Date());
      return `${currentDate.getMonth() + 1}月${currentDate.getDate()}日，${WEEK_DAYS[currentDate.getDay()]}${isToday ? '（今天）' : ''}`;
    }
    if (viewMode === 'week') {
      const start = getWeekStart(currentDate);
      const end = new Date(start); end.setDate(start.getDate() + 6);
      return `${start.getMonth() + 1}月${start.getDate()}日 ~ ${end.getMonth() + 1}月${end.getDate()}日`;
    }
    if (viewMode === 'month') return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;
    return `${currentDate.getFullYear()}年`;
  }, [viewMode, currentDate]);

  const periodRecords = useMemo(() => {
    if (viewMode === 'day') return scheduleRecords.filter(r => r.date === toDateStr(currentDate));
    if (viewMode === 'week') {
      const start = getWeekStart(currentDate);
      const end = new Date(start); end.setDate(start.getDate() + 6);
      return scheduleRecords.filter(r => r.date >= toDateStr(start) && r.date <= toDateStr(end));
    }
    if (viewMode === 'month') {
      const prefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      return scheduleRecords.filter(r => r.date.startsWith(prefix));
    }
    return scheduleRecords.filter(r => r.date.startsWith(String(currentDate.getFullYear())));
  }, [scheduleRecords, viewMode, currentDate]);

  // 数据时间范围
  const dataRange = useMemo(() => {
    if (scheduleRecords.length === 0) return null;
    const dates = scheduleRecords.map(r => r.date).filter(Boolean).sort();
    return { min: dates[0], max: dates[dates.length - 1] };
  }, [scheduleRecords]);

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

  const distinctDays = useMemo(() => Math.max(new Set(periodRecords.map(r => r.date)).size, 1), [periodRecords]);

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    periodRecords.forEach(r => { map[r.category] = (map[r.category] || 0) + r.duration; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [periodRecords]);

  const maxValue = categoryTotals[0]?.value || 1;

  // 日历数据（日模式）
  const calendarData = useMemo(() => {
    const year = pickerNav.getFullYear();
    const month = pickerNav.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return { year, month, days };
  }, [pickerNav]);

  // 周列表（周模式）
  const weekList = useMemo(() => {
    const year = pickerNav.getFullYear();
    let start = getWeekStart(new Date(year, 0, 1));
    const limit = new Date(year + 1, 0, 1);
    const weeks: { n: number; start: Date; end: Date }[] = [];
    let n = 1;
    while (start < limit) {
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      weeks.push({ n, start: new Date(start), end: new Date(end) });
      n++;
      start = new Date(start);
      start.setDate(start.getDate() + 7);
    }
    return weeks;
  }, [pickerNav]);

  // 年份网格（年模式）
  const yearGridBase = useMemo(() => Math.floor(pickerNav.getFullYear() / 12) * 12, [pickerNav]);

  const selectDay = (day: number) => { setCurrentDate(new Date(calendarData.year, calendarData.month, day)); setShowPicker(false); };
  const selectWeek = (start: Date) => { setCurrentDate(new Date(start)); setShowPicker(false); };
  const selectMonth = (month: number) => { setCurrentDate(new Date(pickerNav.getFullYear(), month, 1)); setShowPicker(false); };
  const selectYear = (year: number) => { setCurrentDate(new Date(year, 0, 1)); setShowPicker(false); };

  const navHeader = (label: string) => (
    <div className="flex items-center justify-between mb-3">
      <button onClick={() => navPicker(-1)} className="text-paper/40 hover:text-emerald-400 p-1 transition-colors rounded-lg hover:bg-emerald-500/10">
        <ChevronLeft size={15} />
      </button>
      <span className="text-sm text-paper/80 font-serif">{label}</span>
      <button onClick={() => navPicker(1)} className="text-paper/40 hover:text-emerald-400 p-1 transition-colors rounded-lg hover:bg-emerald-500/10">
        <ChevronRight size={15} />
      </button>
    </div>
  );

  const renderPicker = () => {
    // 日模式：完整日历面板
    if (viewMode === 'day') {
      const selectedStr = toDateStr(currentDate);
      const todayStr = toDateStr(new Date());
      return (
        <div className="w-64">
          {navHeader(`${calendarData.year}年${calendarData.month + 1}月`)}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEK_DAYS_SHORT.map(d => (
              <div key={d} className="text-center text-xs text-paper/25 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {calendarData.days.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const ds = toDateStr(new Date(calendarData.year, calendarData.month, day));
              const isSel = ds === selectedStr;
              const isToday = ds === todayStr;
              return (
                <button key={day} onClick={() => selectDay(day)}
                  className={`text-center text-xs py-1.5 rounded-lg transition-all ${
                    isSel ? 'font-medium' :
                    isToday ? 'border' :
                    'text-paper/55 hover:text-paper/90'
                  }`}
                  style={isSel ? { background: 'rgba(16,185,129,0.25)', color: '#6ee7b7' }
                    : isToday ? { borderColor: 'rgba(16,185,129,0.3)', color: 'rgba(110,231,183,0.7)' }
                    : { }}
                  onMouseEnter={e => { if (!isSel && !isToday) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.1)'; }}
                  onMouseLeave={e => { if (!isSel && !isToday) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // 周模式：年份导航 + 周列表
    if (viewMode === 'week') {
      const selStart = toDateStr(getWeekStart(currentDate));
      return (
        <div className="w-68">
          {navHeader(`${pickerNav.getFullYear()}年`)}
          <div className="space-y-0.5 max-h-60 overflow-y-auto pr-0.5"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(212,175,55,0.2) transparent' }}>
            {weekList.map(({ n, start, end }) => {
              const isSel = toDateStr(start) === selStart;
              return (
                <button key={n} onClick={() => selectWeek(start)}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs transition-all`}
                  style={isSel ? { background: 'rgba(16,185,129,0.18)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' } : { color: 'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.08)'; }}
                  onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                <span className={`shrink-0`} style={{ color: isSel ? 'rgba(110,231,183,0.7)' : 'rgba(255,255,255,0.25)' }}>第{n}周</span>
                  <span>{start.getMonth()+1}月{start.getDate()}日 ~ {end.getMonth()+1}月{end.getDate()}日</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // 月模式：年份导航 + 12个月格子
    if (viewMode === 'month') {
      return (
        <div className="w-52">
          {navHeader(`${pickerNav.getFullYear()}年`)}
          <div className="grid grid-cols-4 gap-1.5">
            {MONTHS.map((label, i) => {
              const isSel = currentDate.getFullYear() === pickerNav.getFullYear() && currentDate.getMonth() === i;
              return (
                <button key={i} onClick={() => selectMonth(i)}
                  className={`py-2 rounded-xl text-sm transition-all`}
                  style={isSel ? { background: 'rgba(16,185,129,0.22)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.35)', fontWeight: 500 } : { color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.1)'; }}
                  onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // 年模式：12年一组的年份网格
    const years = Array.from({ length: 12 }, (_, i) => yearGridBase + i);
    return (
      <div className="w-52">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setPickerNav(p => new Date(p.getFullYear() - 12, 0, 1))}
            className="text-paper/40 hover:text-emerald-400 p-1 transition-colors rounded-lg hover:bg-emerald-500/10">
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm text-paper/80 font-serif">{yearGridBase} – {yearGridBase + 11}</span>
          <button onClick={() => setPickerNav(p => new Date(p.getFullYear() + 12, 0, 1))}
            className="text-paper/40 hover:text-emerald-400 p-1 transition-colors rounded-lg hover:bg-emerald-500/10">
            <ChevronRight size={15} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {years.map(year => {
            const isSel = currentDate.getFullYear() === year;
            return (
              <button key={year} onClick={() => selectYear(year)}
                className="py-2 rounded-xl text-sm transition-all"
                style={isSel ? { background: 'rgba(16,185,129,0.22)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.35)', fontWeight: 500 } : { color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.1)'; }}
                onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                {year}
              </button>
            );
          })}
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
          <BarChart2 size={18} style={{ color: '#34d399' }} />
          <h3 className="text-lg font-serif" style={{ color: '#6ee7b7' }}>时间分配</h3>
          {scheduleRecords.length > 0 && (
            <span className="text-xs text-paper/30 ml-1">{scheduleRecords.length} 条</span>
          )}
        </div>
        <button
          onClick={() => fileRef.current?.click()}
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



      {scheduleRecords.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center h-48 gap-3 rounded-xl cursor-pointer transition-all"
          style={{ border: '2px dashed rgba(16,185,129,0.12)' }}
          onClick={() => fileRef.current?.click()}
          onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(16,185,129,0.28)')}
          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(16,185,129,0.12)')}
        >
          <Upload size={28} className="text-paper/20" />
          <p className="text-sm text-paper/30">点击上传时间分配记录 .xlsx</p>
          <p className="text-xs text-paper/20">列：开始时间 / 持续时间 / 事件类别</p>
        </div>
      ) : (
        <>
          {/* View mode tabs */}
          <div className="flex gap-1 mb-4 rounded-xl p-1 w-fit" style={{
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)'
          }}>
            {(['day', 'week', 'month', 'year'] as ViewMode[]).map(mode => (
              <button key={mode}
                onClick={() => { setViewMode(mode); setShowPicker(false); }}
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

          {/* Period navigation + custom picker */}
          <div className="relative flex items-center justify-center gap-4 mb-5" ref={pickerRef}>
            <button onClick={() => navigate(-1)} disabled={!canNavPrev} className={`transition-colors p-1 ${canNavPrev ? 'hover:text-emerald-400' : 'text-paper/15 cursor-not-allowed'}`} style={{ color: canNavPrev ? 'rgba(255,255,255,0.4)' : undefined }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={openPicker} className="text-sm font-serif min-w-40 text-center transition-colors hover:text-emerald-400" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {periodLabel}
            </button>
            <button onClick={() => navigate(1)} disabled={!canNavNext} className={`transition-colors p-1 ${canNavNext ? 'hover:text-emerald-400' : 'text-paper/15 cursor-not-allowed'}`} style={{ color: canNavNext ? 'rgba(255,255,255,0.4)' : undefined }}>
              <ChevronRight size={18} />
            </button>

            {/* 自定义选择弹窗 */}
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

          {/* Category horizontal bars */}
          {categoryTotals.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-paper/25 text-sm">该时段暂无数据</div>
          ) : (
            <div className="space-y-3">
              {categoryTotals.map(({ name, value }) => {
                const barPct = (value / maxValue) * 100;
                const perDay = viewMode === 'day' ? null : Math.round(value / distinctDays);
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-paper/80">{name}</span>
                      <span className="text-xs text-paper/50 text-right">
                        <span className="text-paper/70 font-medium">{formatDuration(value)}</span>
                        {perDay !== null && perDay > 0 && (
                          <span className="text-paper/35 ml-1">, {formatDuration(perDay)}/天</span>
                        )}
                      </span>
                    </div>
                    <div className="relative h-3 bg-ink/60 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                        style={{ width: `${barPct}%`, background: categoryColors[name] || '#6b7280' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
