import { Workout, FitnessTest, Book, YearSummary, Article, Skill, Hobby, ScheduleRecord, HappinessRecord, Trait, ReadingSlotObject } from '../types';

export interface AnalysisBlock {
  label: string;
  value: string;
}

export interface AnalysisResult {
  stats: AnalysisBlock[];
  status: string;
  weakness: string;
  suggestions: string[];
}

/** 智慧藏书专属 — 5板块纯数据结构 */
export interface WisdomAnalysisResult {
  rawData: AnalysisBlock[];     // 原始阅读数据陈列
  peerComparison: string;       // 同龄普通人阅读量横向档位对标
  growthRate: string;           // 自身历史阅读增速对比
  categoryBalance: string;      // 书籍类目结构均衡判定
  periodSummary: string;        // 周期整体数据总结
}

/** 体魄力量专属 — 5板块纯数据结构 */
export interface FitnessAnalysisResult {
  rawData: AnalysisBlock[];     // 原始数据展示
  peerComparison: string;       // 同龄普通人横向档位对标
  growthRate: string;           // 自身历史纵向增速对比
  balanceJudge: string;         // 强弱项均衡判定
  periodSummary: string;        // 周期整体数据总结
}

/** 精神意识专属 — 5板块纯数据结构（无天赋/特质） */
export interface SpiritAnalysisResult {
  rawData: AnalysisBlock[];     // 客观统计：篇数/字数/密度
  themeFreq: string;            // 高频主题提炼
  emotionTone: string;          // 整体情绪底色
  longitudinal: string;         // 纵向对比：思考节奏/心智变化
  periodSummary: string;        // 周期整体数据总结
}

// ─── 力量板块 ──────────────────────────────────────────────────────────────────

export function analyzeFitness(workouts: Workout[], fitnessTests: FitnessTest[]): FitnessAnalysisResult {

  // 按类型分组测试记录
  const testsByType = {
    balance:     fitnessTests.filter(t => t.type === 'balance'),
    flexibility: fitnessTests.filter(t => t.type === 'flexibility'),
    core:        fitnessTests.filter(t => t.type === 'core'),
    cardio:      fitnessTests.filter(t => t.type === 'cardio'),
  };
  // 各类型最新一条
  const latest = {
    balance:     [...testsByType.balance].sort((a, b) => b.date.localeCompare(a.date))[0],
    flexibility: [...testsByType.flexibility].sort((a, b) => b.date.localeCompare(a.date))[0],
    core:        [...testsByType.core].sort((a, b) => b.date.localeCompare(a.date))[0],
    cardio:      [...testsByType.cardio].sort((a, b) => b.date.localeCompare(a.date))[0],
  };
  const exercises    = [...new Set(workouts.map(w => w.exercise))];
  const totalVolume  = workouts.reduce((s, w) => s + w.weight * w.sets * w.reps, 0);
  const recentCount  = getRecentDays(workouts.map(w => w.date), 30);

  // ── 板块一：原始数据展示 ─────────────────────────────────────────────────
  const rawData: AnalysisBlock[] = [
    { label: '训练总次数', value: `${workouts.length} 次` },
    { label: '运动种类',   value: `${exercises.length} 种` },
    { label: '训练总容量', value: totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}k kg` : '—' },
    { label: '平衡测试',   value: latest.balance     ? `${latest.balance.value} 秒`    : '—' },
    { label: '柔韧测试',   value: latest.flexibility ? `${latest.flexibility.value} cm` : '—' },
    { label: '核心测试',   value: latest.core        ? `${latest.core.value} 秒`        : '—' },
    { label: '有氧测试',   value: latest.cardio      ? `${latest.cardio.value} 分钟`    : '—' },
  ];

  // ── 板块二：同龄普通人横向档位对标 ─────────────────────────────────────
  // 有氧统一对标：商用爬楼机8级高阻力持续分钟数（成年人体能常模 20-40岁）
  function rankTier(val: number | undefined, bp: number[], lbs: string[]): string {
    if (val === undefined) return '无数据';
    for (let i = 0; i < bp.length; i++) if (val >= bp[i]) return lbs[i];
    return lbs[lbs.length - 1];
  }

  const tBalance  = rankTier(latest.balance?.value,     [61, 46, 36, 25, 15], ['A · 优秀 top5%', 'B · 良好 top20%', 'C · 中高 top35%', 'D · 均值 50%', 'E · 中低', 'F · 偏弱']);
  const tFlex     = rankTier(latest.flexibility?.value, [31, 21, 16, 10, 5],  ['A · 优秀 top5%', 'B · 良好 top20%', 'C · 中高 top35%', 'D · 均值 50%', 'E · 中低', 'F · 偏弱']);
  const tCore     = rankTier(latest.core?.value,        [240, 180, 120, 60, 30], ['A · 优秀 top5%', 'B · 良好 top20%', 'C · 中高 top35%', 'D · 均值 50%', 'E · 中低', 'F · 偏弱']);
  const tCardio   = rankTier(latest.cardio?.value,      [36, 25, 15, 8, 3],   ['A · 优秀 top5%', 'B · 良好 top20%', 'C · 中高 top35%', 'D · 均值 50%', 'E · 中低', 'F · 偏弱']);
  const tFreq     = rankTier(recentCount,               [20, 14, 8, 4, 2],    ['A · 极高频 top5%', 'B · 高频 top20%', 'C · 中高频 top40%', 'D · 均值', 'E · 低频', 'F · 极低频']);

  const peerComparison =
    `训练频率（近30天 ${recentCount} 次）：${tFreq}\n` +
    `平衡能力（${latest.balance?.value ?? '—'} 秒）：${tBalance}\n` +
    `柔韧性（${latest.flexibility?.value ?? '—'} cm）：${tFlex}\n` +
    `核心耐力（${latest.core?.value ?? '—'} 秒）：${tCore}\n` +
    `有氧耐力·爬楼机8级高阻力（${latest.cardio?.value ?? '—'} 分钟）：${tCardio}`;

  // ── 板块三：自身历史纵向增速对比 ─────────────────────────────────────────
  function progression(tests: FitnessTest[], unit: string): string {
    if (tests.length === 0) return '无测试记录';
    if (tests.length === 1) return `仅1条（${tests[0].date}：${tests[0].value} ${unit}），无法计算增速`;
    const sorted = [...tests].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0];
    const last  = sorted[sorted.length - 1];
    const delta = last.value - first.value;
    const pct   = first.value > 0 ? ((delta / first.value) * 100).toFixed(0) : '—';
    const trend = delta > 0 ? `↑ +${delta}（+${pct}%）` : delta < 0 ? `↓ ${delta}（${pct}%）` : '→ 0变化';
    const days  = Math.round((new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000);
    return `${first.date} ${first.value}${unit} → ${last.date} ${last.value}${unit}，${trend}，跨度${days}天，${tests.length}条记录`;
  }

  let volTrend: string;
  if (workouts.length < 4) {
    volTrend = `训练记录仅${workouts.length}条，不足以计算阶段容量增速`;
  } else {
    const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
    const half   = Math.floor(sorted.length / 2);
    const vol1   = sorted.slice(0, half).reduce((s, w) => s + w.weight * w.sets * w.reps, 0);
    const vol2   = sorted.slice(half).reduce((s, w) => s + w.weight * w.sets * w.reps, 0);
    const delta  = vol2 - vol1;
    const pct    = vol1 > 0 ? ((delta / vol1) * 100).toFixed(0) : '—';
    const trend  = delta > 0 ? `↑ +${pct}%` : delta < 0 ? `↓ ${pct}%` : '→ 持平';
    volTrend = `前${half}次容量${(vol1 / 1000).toFixed(1)}k kg → 后${sorted.length - half}次${(vol2 / 1000).toFixed(1)}k kg，${trend}`;
  }

  const growthRate =
    `平衡：${progression(testsByType.balance, '秒')}\n` +
    `柔韧：${progression(testsByType.flexibility, 'cm')}\n` +
    `核心：${progression(testsByType.core, '秒')}\n` +
    `有氧（爬楼机8级）：${progression(testsByType.cardio, '分钟')}\n` +
    `训练总容量：${volTrend}`;

  // ── 板块四：强弱项均衡判定 ─────────────────────────────────────────────
  function tierScore(t: string): number {
    if (t.startsWith('A')) return 90; if (t.startsWith('B')) return 75;
    if (t.startsWith('C')) return 60; if (t.startsWith('D')) return 45;
    if (t.startsWith('E')) return 30; return 10;
  }

  const dims = [
    { name: '平衡', score: tierScore(tBalance),  tier: tBalance,  has: !!latest.balance },
    { name: '柔韧', score: tierScore(tFlex),      tier: tFlex,     has: !!latest.flexibility },
    { name: '核心', score: tierScore(tCore),      tier: tCore,     has: !!latest.core },
    { name: '有氧', score: tierScore(tCardio),    tier: tCardio,   has: !!latest.cardio },
  ].filter(d => d.has).sort((a, b) => b.score - a.score);

  let balanceJudge: string;
  if (dims.length === 0) {
    balanceJudge = '无体能测试数据，强弱项无法判定。';
  } else {
    const top    = dims[0];
    const bot    = dims[dims.length - 1];
    const spread = top.score - bot.score;
    const level  = spread <= 15 ? '均衡' : spread <= 30 ? '轻度失衡' : spread <= 50 ? '中度失衡' : '严重失衡';
    const scores = dims.map(d => `${d.name}${d.score}分（${d.tier.split('·')[0].trim()}）`).join(' / ');
    balanceJudge =
      `标准化得分（0-100）：${scores}\n` +
      `最强项：${top.name}（${top.score}分）；最弱项：${bot.name}（${bot.score}分）\n` +
      `强弱差值：${spread}分，体能均衡度：${level}\n` +
      `训练动作：${exercises.slice(0, 5).join('、')}${exercises.length > 5 ? ` 等${exercises.length}种` : `，共${exercises.length}种`}`;
  }

  // ── 板块五：周期整体数据总结 ─────────────────────────────────────────────
  const bestDim  = dims[0];
  const periodSummary =
    `训练${workouts.length}次，${exercises.length}种动作，总容量${totalVolume > 0 ? (totalVolume / 1000).toFixed(1) + 'k' : '—'} kg。` +
    `近30天${recentCount}次（${tFreq.split('·')[0].trim()}档）。` +
    `最新体能：平衡${latest.balance?.value ?? '—'}秒 / 柔韧${latest.flexibility?.value ?? '—'}cm / 核心${latest.core?.value ?? '—'}秒 / 爬楼机8级${latest.cardio?.value ?? '—'}分钟。` +
    (bestDim ? `体能最强项${bestDim.name}（${bestDim.tier.split('·')[0].trim()}），最弱项${dims[dims.length - 1]?.name ?? '—'}，均衡度：${dims[0].score - (dims[dims.length - 1]?.score ?? 0) <= 30 ? '基本均衡' : '存在失衡'}。` : '');

  return { rawData, peerComparison, growthRate, balanceJudge, periodSummary };
}

// ─── 智慧板块 ──────────────────────────────────────────────────────────────────

export function analyzeWisdom(books: Book[], yearSummaries: YearSummary[]): WisdomAnalysisResult {
  const completed = books.filter(b => b.status === 'completed');
  const reading   = books.filter(b => b.status === 'reading');
  const planned   = books.filter(b => b.status === 'planned');
  const withThoughts = books.filter(b => b.thoughts && b.thoughts.trim().length > 20);
  const withCover = books.filter(b => b.coverUrl && b.coverUrl.trim().length > 0);
  const withDataImage = books.filter(b => b.dataUrl && b.dataUrl.trim().length > 0);
  const withYearImages = yearSummaries.filter(y => y.imageUrl && y.imageUrl.trim().length > 0);

  // ── 板块一：原始阅读数据陈列 ─────────────────────────────────────────────
  const rawData: AnalysisBlock[] = [
    { label: '总库存',   value: `${books.length} 本` },
    { label: '已完成',   value: `${completed.length} 本` },
    { label: '阅读中',   value: `${reading.length} 本` },
    { label: '计划中',   value: `${planned.length} 本` },
    { label: '留有感悟', value: `${withThoughts.length} 本` },
    { label: '有封面图', value: `${withCover.length} 本` },
    { label: '有内容图', value: `${withDataImage.length} 本` },
    { label: '年度复盘', value: `${yearSummaries.length} 份` },
    { label: '复盘有图', value: `${withYearImages.length} 份` },
  ];

  // ── 板块二：同龄人阅读量横向档位对标 ─────────────────────────────────────
  // 基准：中国成年人年均阅读量约 4.58 本（2023 年全国国民阅读调查）
  const currentYear = new Date().getFullYear();
  const byYear: Record<string, number> = {};
  completed.forEach(b => {
    if (b.readDate) {
      const y = b.readDate.split('-')[0];
      byYear[y] = (byYear[y] || 0) + 1;
    }
  });
  const recordedYears = Object.keys(byYear).sort();
  const thisYearCount = byYear[String(currentYear)] || 0;
  const yearSpan = recordedYears.length;
  const annualAvg = yearSpan > 0
    ? parseFloat((completed.filter(b => b.readDate).length / yearSpan).toFixed(1))
    : null;

  // 档位划分（年均完成量）
  const rateBase = annualAvg ?? thisYearCount;
  let tier: string;
  let percentile: string;
  if (rateBase >= 40)       { tier = 'S · 极高频';   percentile = '超越约 99% 同龄成年人'; }
  else if (rateBase >= 18)  { tier = 'A · 高频';     percentile = '超越约 95% 同龄成年人'; }
  else if (rateBase >= 12)  { tier = 'B · 中高频';   percentile = '超越约 85% 同龄成年人'; }
  else if (rateBase >= 8)   { tier = 'C · 中频';     percentile = '超越约 70% 同龄成年人'; }
  else if (rateBase >= 4.5) { tier = 'D · 接近均值'; percentile = '达到全国均值水平'; }
  else if (rateBase >= 2)   { tier = 'E · 低于均值'; percentile = '低于全国均值（4.58 本/年）'; }
  else                      { tier = 'F · 极低频';   percentile = '显著低于全国均值'; }

  const vsNational = rateBase >= 4.58
    ? `高于全国均值 ${(rateBase - 4.58).toFixed(1)} 本/年`
    : `低于全国均值 ${(4.58 - rateBase).toFixed(1)} 本/年`;

  const peerComparison =
    `全国成年人年均阅读量基准：4.58 本/年（2023 年国民阅读调查）。` +
    `当前年均完成量约 ${annualAvg ?? '—'} 本，${vsNational}。` +
    `档位定位：${tier}，${percentile}。` +
    `${currentYear} 年度已完成 ${thisYearCount} 本。`;

  // ── 板块三：自身历史阅读增速对比 ─────────────────────────────────────────
  const lastYearCount = byYear[String(currentYear - 1)] || 0;
  const twoYearsAgoCount = byYear[String(currentYear - 2)] || 0;

  let growthRate: string;
  if (yearSpan === 0) {
    growthRate = `有效 readDate 记录为 0，无法计算年度增速。库存总计 ${books.length} 本，含完成 ${completed.length} 本。`;
  } else {
    const yoy = lastYearCount > 0
      ? ((thisYearCount - lastYearCount) / lastYearCount * 100).toFixed(0)
      : null;
    const yoy2 = twoYearsAgoCount > 0
      ? ((lastYearCount - twoYearsAgoCount) / twoYearsAgoCount * 100).toFixed(0)
      : null;

    const trend1 = yoy !== null
      ? (Number(yoy) > 0 ? `↑ +${yoy}%` : Number(yoy) < 0 ? `↓ ${yoy}%` : `→ 持平`)
      : '（去年无记录）';

    const trend2 = yoy2 !== null
      ? (Number(yoy2) > 0 ? `↑ +${yoy2}%` : Number(yoy2) < 0 ? `↓ ${yoy2}%` : `→ 持平`)
      : '（前年无记录）';

    const yearRows = recordedYears.map(y => `${y} 年 ${byYear[y]} 本`).join('、');
    growthRate =
      `历年完成量：${yearRows}。` +
      `${currentYear - 1}→${currentYear} 同比：${trend1}（${lastYearCount} 本→${thisYearCount} 本）。` +
      `${currentYear - 2}→${currentYear - 1} 同比：${trend2}（${twoYearsAgoCount} 本→${lastYearCount} 本）。` +
      `多年均值：${annualAvg} 本/年，有记录年份跨度 ${yearSpan} 年。`;
  }

  // ── 板块四：书籍类目结构均衡判定 ─────────────────────────────────────────
  const completionRate = books.length > 0 ? Math.round(completed.length / books.length * 100) : 0;
  const thoughtsRate   = completed.length > 0 ? Math.round(withThoughts.length / completed.length * 100) : 0;
  const pipelineRatio  = `${completed.length} : ${reading.length} : ${planned.length}`;

  // 管道健康度
  let pipelineStatus: string;
  if (completed.length === 0) {
    pipelineStatus = '书库无完成记录，管道状态不可评估。';
  } else if (planned.length === 0 && reading.length === 0) {
    pipelineStatus = '待读队列（阅读中+计划中）为 0，书库进入存量消耗终态。';
  } else if (completionRate >= 60 && planned.length >= 2) {
    pipelineStatus = '完成率 ≥60%，待读队列充足（≥2 本），管道流转正常。';
  } else if (completionRate < 20) {
    pipelineStatus = '完成率 <20%，大量书目长期未完成，管道积压。';
  } else {
    pipelineStatus = '完成率中等，管道处于正常积累状态。';
  }

  // 深度阅读结构
  let depthStatus: string;
  if (thoughtsRate >= 70)      { depthStatus = '深度阅读率 ≥70%，绝大多数完成书目有感悟记录。'; }
  else if (thoughtsRate >= 40) { depthStatus = '深度阅读率 40–70%，感悟记录覆盖中等。'; }
  else if (thoughtsRate > 0)   { depthStatus = `深度阅读率 ${thoughtsRate}%，感悟记录偏少。`; }
  else                         { depthStatus = '深度阅读率 0%，无感悟记录。'; }

  const categoryBalance =
    `完成:阅读中:计划中 = ${pipelineRatio}，完成率 ${completionRate}%。` +
    `${pipelineStatus}` +
    `深度阅读率（有感悟/已完成）：${thoughtsRate}%。${depthStatus}` +
    `年度复盘覆盖率：${yearSummaries.length} 份 / ${yearSpan || '—'} 年。`;

  // ── 板块五：周期整体数据总结 ─────────────────────────────────────────────
  const yearRange = recordedYears.length >= 2
    ? `${recordedYears[0]}—${recordedYears[recordedYears.length - 1]}`
    : recordedYears[0] ?? '—';

  const periodSummary =
    `总库存 ${books.length} 本，已完成 ${completed.length} 本（跨度 ${yearRange}），在读 ${reading.length} 本，计划 ${planned.length} 本。` +
    `年均完成 ${annualAvg ?? '—'} 本，${currentYear} 年已完成 ${thisYearCount} 本。` +
    `深度阅读率 ${thoughtsRate}%，年度复盘 ${yearSummaries.length} 份。` +
    `同龄档位：${tier}（${percentile}）。`;

  return { rawData, peerComparison, growthRate, categoryBalance, periodSummary };
}

// ─── 精神板块 ──────────────────────────────────────────────────────────────────

/**
 * @param periodArticles  当前选定时段的文章
 * @param allArticles     全历史文章（用于纵向对比基准）
 * @param periodLabel     时段描述标签，如"全历史"/"2024-03"/"近90天"
 */
export function analyzeSpirit(
  periodArticles: Article[],
  allArticles: Article[],
  periodLabel: string
): SpiritAnalysisResult {

  const count      = periodArticles.length;
  const totalChars = periodArticles.reduce((s, a) => s + a.content.length, 0);
  const avgChars   = count > 0 ? Math.round(totalChars / count) : 0;

  // 时段天数 & 更新密度
  const pDates = periodArticles.map(a => a.publishDate).sort();
  const spanDays = count >= 2
    ? Math.max(1, Math.round((new Date(pDates[pDates.length - 1]).getTime() - new Date(pDates[0]).getTime()) / 86400000) + 1)
    : (count === 1 ? 1 : 0);
  const density = spanDays > 0 ? parseFloat((count / spanDays * 30).toFixed(1)) : 0; // 篇/月

  // ── 板块一：客观统计 ──────────────────────────────────────────────────────
  const rawData: AnalysisBlock[] = [
    { label: '时段篇数',  value: count > 0 ? `${count} 篇` : '—' },
    { label: '总字数',    value: totalChars > 0 ? `${(totalChars / 1000).toFixed(1)}k 字` : '—' },
    { label: '篇均字数',  value: avgChars > 0 ? `${avgChars} 字` : '—' },
    { label: '更新密度',  value: density > 0 ? `${density} 篇/月` : '—' },
    { label: '分析时段',  value: periodLabel },
    { label: '历史总篇',  value: `${allArticles.length} 篇` },
  ];

  // ── 板块二：高频主题提炼 ─────────────────────────────────────────────────
  let themeFreq: string;
  if (count === 0) {
    themeFreq = `时段"${periodLabel}"无意识记录，无法提炼主题。`;
  } else {
    // 分类分布
    const catMap: Record<string, number> = {};
    periodArticles.forEach(a => {
      if (a.category) catMap[a.category] = (catMap[a.category] || 0) + 1;
    });
    const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const catStr = sortedCats.length > 0
      ? sortedCats.slice(0, 5).map(([k, v]) => `${k}（${v}篇）`).join('、')
      : '无分类标签';

    // 标题高频词（≥2字，出现≥2次）
    const wordMap: Record<string, number> = {};
    periodArticles.forEach(a => {
      a.title.split(/[\s、，。·「」【】《》""：:；;！!？?]+/).filter(w => w.length >= 2).forEach(w => {
        wordMap[w] = (wordMap[w] || 0) + 1;
      });
    });
    const freqWords = Object.entries(wordMap).filter(([, v]) => v >= 2).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const wordStr = freqWords.length > 0
      ? freqWords.map(([k, v]) => `"${k}" ×${v}`).join('、')
      : '标题无重复词汇';

    themeFreq = `分类分布：${catStr}\n标题高频词：${wordStr}`;
  }

  // ── 板块三：整体情绪底色 ─────────────────────────────────────────────────
  let emotionTone: string;
  if (count === 0) {
    emotionTone = '无记录，情绪底色不可判定。';
  } else {
    const fullText = periodArticles.map(a => a.title + a.content).join('');
    const positiveKw = ['成长', '突破', '发现', '喜悦', '平静', '感悟', '收获', '清晰', '坚定', '自由', '释然', '满足', '明朗', '开阔', '欣然'];
    const heavyKw    = ['困惑', '迷茫', '压力', '痛苦', '疲惫', '焦虑', '挣扎', '沉重', '空洞', '颓靡', '无力', '绝望', '压抑', '撕裂'];
    const neutralKw  = ['思考', '记录', '观察', '分析', '梳理', '整理', '探索', '审视', '回顾', '追问', '反思', '推演'];

    const posHit     = positiveKw.filter(w => fullText.includes(w));
    const heavyHit   = heavyKw.filter(w => fullText.includes(w));
    const neutralHit = neutralKw.filter(w => fullText.includes(w));
    const total      = posHit.length + heavyHit.length + neutralHit.length;

    let dominant: string;
    if (total === 0)                                          { dominant = '关键词命中为零，底色不可判定'; }
    else if (posHit.length >= heavyHit.length * 2)            { dominant = '正向底色为主'; }
    else if (heavyHit.length >= posHit.length * 1.5)          { dominant = '沉郁/压力底色偏重'; }
    else if (neutralHit.length > posHit.length && neutralHit.length > heavyHit.length) { dominant = '中性客观底色为主'; }
    else                                                       { dominant = '混合底色，无单一主导'; }

    const posRatio   = total > 0 ? Math.round(posHit.length / total * 100) : 0;
    const heavyRatio = total > 0 ? Math.round(heavyHit.length / total * 100) : 0;
    const neuRatio   = total > 0 ? Math.round(neutralHit.length / total * 100) : 0;

    emotionTone =
      `关键词命中：正向 ${posHit.length} 个（${posRatio}%）/ 沉郁 ${heavyHit.length} 个（${heavyRatio}%）/ 中性 ${neutralHit.length} 个（${neuRatio}%）\n` +
      `整体情绪底色：${dominant}\n` +
      `正向词：${posHit.length > 0 ? posHit.slice(0, 4).join('、') : '无命中'}\n` +
      `沉郁词：${heavyHit.length > 0 ? heavyHit.slice(0, 4).join('、') : '无命中'}`;
  }

  // ── 板块四：纵向对比（思考节奏 / 心智变化速度）───────────────────────────
  const allCount    = allArticles.length;
  const allChars    = allArticles.reduce((s, a) => s + a.content.length, 0);
  const allAvgChars = allCount > 0 ? Math.round(allChars / allCount) : 0;

  let allDensity: number | null = null;
  if (allCount >= 2) {
    const allDates  = allArticles.map(a => a.publishDate).sort();
    const allSpan   = Math.max(1, Math.round((new Date(allDates[allDates.length - 1]).getTime() - new Date(allDates[0]).getTime()) / 86400000) + 1);
    allDensity = parseFloat((allCount / allSpan * 30).toFixed(1));
  }

  let longitudinal: string;
  if (count === 0) {
    longitudinal = `时段"${periodLabel}"无记录。\n全历史基准：${allCount}篇，均篇${allAvgChars}字，密度${allDensity ? allDensity + '篇/月' : '—'}。`;
  } else {
    const densityDelta = allDensity !== null && density > 0
      ? (density > allDensity * 1.1 ? `↑ 高于历史均值（${density} vs ${allDensity} 篇/月）`
        : density < allDensity * 0.9 ? `↓ 低于历史均值（${density} vs ${allDensity} 篇/月）`
        : `→ 持平历史均值（${density} vs ${allDensity} 篇/月）`)
      : '历史数据不足以对比';

    const charsDelta = allAvgChars > 0
      ? (avgChars > allAvgChars * 1.1 ? `↑ 高于历史均篇（${avgChars} vs ${allAvgChars} 字）`
        : avgChars < allAvgChars * 0.9 ? `↓ 低于历史均篇（${avgChars} vs ${allAvgChars} 字）`
        : `→ 持平历史均篇（${avgChars} vs ${allAvgChars} 字）`)
      : '历史数据不足以对比';

    longitudinal =
      `全历史基准：${allCount}篇，均篇${allAvgChars}字，密度${allDensity ? allDensity + ' 篇/月' : '—'}\n` +
      `当前时段（${periodLabel}）：${count}篇，均篇${avgChars}字，密度${density > 0 ? density + ' 篇/月' : '—'}\n` +
      `更新节奏：${densityDelta}\n` +
      `篇幅变化：${charsDelta}`;
  }

  // ── 板块五：周期整体数据总结 ─────────────────────────────────────────────
  const periodSummary = count === 0
    ? `时段"${periodLabel}"无意识记录。全历史累计${allCount}篇，${(allChars / 1000).toFixed(1)}k字。`
    : `"${periodLabel}"共${count}篇，${(totalChars / 1000).toFixed(1)}k字，均篇${avgChars}字，密度${density > 0 ? density + ' 篇/月' : '—'}。` +
      `全历史基准${allCount}篇，均篇${allAvgChars}字，密度${allDensity ? allDensity + ' 篇/月' : '—'}。`;

  return { rawData, themeFreq, emotionTone, longitudinal, periodSummary };
}

// ─── 技艺板块 ──────────────────────────────────────────────────────────────────

/** 技艺板块专属 — 成品归档脉络陈述，禁止技术点评 */
export interface SkillsAnalysisResult {
  rawList: AnalysisBlock[];   // 时段成品归档清单
  archivePattern: string;     // 该时段归档重心
  lineage: string;            // 各技艺留存脉络（时序还原）
  rhythmShift: string;        // 长期归档节奏迁移
  periodSummary: string;      // 周期整体陈述
}

const SKILL_TYPE_LABEL: Record<string, string> = {
  sword:       '剑花',
  boxing:      '拳击反应球',
  nunchaku:    '双节棍',
  calligraphy: '毛笔字',
};

/**
 * @param periodSkills  当前选定时段的技艺成品（已按日期过滤）
 * @param allSkills     全历史技艺成品（用于节奏迁移对比基准）
 * @param periodLabel   时段描述标签
 */
export function analyzeSkills(
  periodSkills: Skill[],
  allSkills: Skill[],
  periodLabel: string
): SkillsAnalysisResult {

  const total = periodSkills.length;

  // 按类型分组（时段）
  const byType: Record<string, Skill[]> = {};
  periodSkills.forEach(s => {
    if (!byType[s.type]) byType[s.type] = [];
    byType[s.type].push(s);
  });
  const sortedTypes = Object.entries(byType).sort((a, b) => b[1].length - a[1].length);

  // 统计图片数据
  const withCover = periodSkills.filter(s => s.coverUrl && s.coverUrl.trim().length > 0);
  const allWithCover = allSkills.filter(s => s.coverUrl && s.coverUrl.trim().length > 0);
  const withVideo = periodSkills.filter(s => s.videoUrl && s.videoUrl.trim().length > 0);

  // ── 板块一：时段成品归档清单 ─────────────────────────────────────────────
  const rawList: AnalysisBlock[] = [
    { label: '时段归档', value: total > 0 ? `${total} 件` : '—' },
    { label: '有封面图', value: `${withCover.length} 件` },
    { label: '有视频', value: `${withVideo.length} 件` },
    { label: '分析时段', value: periodLabel },
    { label: '历史总归档', value: `${allSkills.length} 件` },
    { label: '历史有图', value: `${allWithCover.length} 件` },
    ...sortedTypes.map(([type, list]) => ({
      label: SKILL_TYPE_LABEL[type] ?? type,
      value: `${list.length} 件`,
    })),
  ];

  // ── 板块二：该时段归档重心 ────────────────────────────────────────────────
  let archivePattern: string;
  if (total === 0) {
    archivePattern = `时段"${periodLabel}"无成品归档记录。`;
  } else {
    const topType    = sortedTypes[0];
    const topLabel   = SKILL_TYPE_LABEL[topType[0]] ?? topType[0];
    const topPct     = Math.round(topType[1].length / total * 100);

    const typeLines = sortedTypes.map(([t, list]) => {
      const lbl = SKILL_TYPE_LABEL[t] ?? t;
      const pct = Math.round(list.length / total * 100);
      const titles = list.slice(0, 3).map(s => `「${s.title}」`).join('、');
      const more = list.length > 3 ? ` 等 ${list.length} 件` : `，共 ${list.length} 件`;
      return `${lbl}（${pct}%）：${titles}${more}`;
    }).join('\n');

    archivePattern =
      `该时段归档重心：${topLabel}，占全部成品的 ${topPct}%。\n` + typeLines;
  }

  // ── 板块三：各技艺留存脉络（时序还原）───────────────────────────────────
  let lineage: string;
  if (total === 0) {
    lineage = '无成品记录，留存脉络不可还原。';
  } else {
    // 检查有多少成品带有日期
    const withDate    = periodSkills.filter(s => s.date);
    const withoutDate = periodSkills.filter(s => !s.date);

    const typeLineage = (Object.keys(SKILL_TYPE_LABEL) as Skill['type'][]).map(t => {
      const list = byType[t];
      if (!list || list.length === 0) return null;
      const lbl  = SKILL_TYPE_LABEL[t];
      const sorted = [...list].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
      if (sorted[0].date) {
        const dateRange = sorted.length >= 2
          ? `${sorted[0].date} — ${sorted[sorted.length - 1].date}`
          : sorted[0].date;
        return `${lbl}（${sorted.length} 件，${dateRange}）：${sorted.map(s => `「${s.title}」`).join('、')}`;
      } else {
        return `${lbl}（${list.length} 件，日期未记录）：${list.map(s => `「${s.title}」`).join('、')}`;
      }
    }).filter(Boolean);

    const dateStat = withDate.length > 0
      ? `${withDate.length} 件有归档日期，${withoutDate.length} 件日期未记录`
      : '全部成品日期未记录（新增时可填写归档日期）';

    lineage = `${dateStat}\n` + typeLineage.join('\n');
  }

  // ── 板块四：长期归档节奏迁移 ────────────────────────────────────────────
  let rhythmShift: string;
  if (allSkills.length === 0) {
    rhythmShift = '全历史无成品归档，节奏迁移不可判定。';
  } else {
    // 全历史各类型占比
    const allByType: Record<string, number> = {};
    allSkills.forEach(s => { allByType[s.type] = (allByType[s.type] || 0) + 1; });

    const shiftLines = Object.keys(SKILL_TYPE_LABEL).map(t => {
      const lbl       = SKILL_TYPE_LABEL[t];
      const allCnt    = allByType[t] ?? 0;
      const periodCnt = byType[t]?.length ?? 0;
      const allPct    = Math.round(allCnt / allSkills.length * 100);
      const periodPct = total > 0 ? Math.round(periodCnt / total * 100) : 0;
      const arrow     = periodPct > allPct + 10 ? '↑' : periodPct < allPct - 10 ? '↓' : '→';
      return `${lbl}：历史${allPct}%（${allCnt}件） ${arrow} 时段${periodPct}%（${periodCnt}件）`;
    });

    // 带日期的全历史归档密度
    const allWithDate = allSkills.filter(s => s.date);
    let allDensityStr = '—（无日期数据）';
    if (allWithDate.length >= 2) {
      const allDates = allWithDate.map(s => s.date!).sort();
      const allSpan  = Math.max(1, Math.round(
        (new Date(allDates[allDates.length - 1]).getTime() - new Date(allDates[0]).getTime()) / 86400000
      ) + 1);
      const allDensity = parseFloat((allWithDate.length / allSpan * 30).toFixed(1));
      allDensityStr = `${allDensity} 件/月（基于 ${allWithDate.length} 件有效日期）`;
    }

    rhythmShift =
      `全历史基准：${allSkills.length} 件，归档密度 ${allDensityStr}\n` +
      `各技艺占比迁移（历史 vs 时段）：\n` +
      shiftLines.join('\n');
  }

  // ── 板块五：周期整体陈述 ─────────────────────────────────────────────────
  const periodSummary = total === 0
    ? `时段"${periodLabel}"无成品归档记录。全历史累计 ${allSkills.length} 件。`
    : `"${periodLabel}"共归档成品 ${total} 件，涵盖 ${sortedTypes.length} 种技艺。` +
      `归档重心：${SKILL_TYPE_LABEL[sortedTypes[0][0]] ?? sortedTypes[0][0]}（${sortedTypes[0][1].length}件，占${Math.round(sortedTypes[0][1].length / total * 100)}%）。` +
      `全历史累计 ${allSkills.length} 件，覆盖 ${Object.keys(allSkills.reduce((acc, s) => ({ ...acc, [s.type]: 1 }), {} as Record<string, number>)).length} 种技艺。`;

  return { rawList, archivePattern, lineage, rhythmShift, periodSummary };
}

// ─── 爱好板块 ──────────────────────────────────────────────────────────────────

/** 爱好板块专属 — 叙事型事实陈述，无数据化评判 */
export interface HobbiesAnalysisResult {
  rawList: AnalysisBlock[];   // 时段留存清单（类型 + 数量）
  focus: string;              // 该时期爱好重心
  relaxState: string;         // 日常松弛状态 & 心境氛围
  rhythmShift: string;        // 长期节奏迁移变化（纵向对比）
  periodSummary: string;      // 周期整体陈述
}

const HOBBY_TYPE_LABEL: Record<string, string> = {
  music:    '听歌·音乐',
  tea:      '饮茶·茶具',
  building: '积木',
  gaming:   '游戏',
};

/**
 * @param periodHobbies  当前选定时段的爱好记录
 * @param allHobbies     全历史爱好记录（用于节奏迁移对比基准）
 * @param periodLabel    时段描述标签
 */
export function analyzeHobbies(
  periodHobbies: Hobby[],
  allHobbies: Hobby[],
  periodLabel: string
): HobbiesAnalysisResult {

  const total = periodHobbies.length;

  // 按类型分组
  const byType: Record<string, Hobby[]> = {};
  periodHobbies.forEach(h => {
    if (!byType[h.type]) byType[h.type] = [];
    byType[h.type].push(h);
  });
  const sortedTypes = Object.entries(byType).sort((a, b) => b[1].length - a[1].length);

  // 里程碑
  const milestones = periodHobbies.filter(h => h.milestone);

  // 统计图片数据
  const withImage = periodHobbies.filter(h => h.imageUrl && h.imageUrl.trim().length > 0);
  const withCover = periodHobbies.filter(h => h.coverUrl && h.coverUrl.trim().length > 0);
  const withMedia = periodHobbies.filter(h => h.mediaType && h.mediaType.trim().length > 0);
  const allWithImage = allHobbies.filter(h => h.imageUrl && h.imageUrl.trim().length > 0);

  // ── 板块一：时段留存清单 ──────────────────────────────────────────────────
  const rawList: AnalysisBlock[] = [
    { label: '时段记录',   value: total > 0 ? `${total} 条` : '—' },
    { label: '有配图',     value: `${withImage.length} 条` },
    { label: '有封面',     value: `${withCover.length} 条` },
    { label: '有媒体',     value: `${withMedia.length} 条` },
    { label: '分析时段',   value: periodLabel },
    { label: '历史总计',   value: `${allHobbies.length} 条` },
    { label: '历史有图',   value: `${allWithImage.length} 条` },
    { label: '里程碑',     value: milestones.length > 0 ? `${milestones.length} 个` : '无' },
    ...sortedTypes.map(([type, list]) => ({
      label: HOBBY_TYPE_LABEL[type] ?? type,
      value: `${list.length} 条`,
    })),
  ];

  // ── 板块二：爱好重心 ──────────────────────────────────────────────────────
  let focus: string;
  if (total === 0) {
    focus = `时段"${periodLabel}"无爱好记录留存。`;
  } else {
    const topType = sortedTypes[0];
    const topLabel = HOBBY_TYPE_LABEL[topType[0]] ?? topType[0];
    const topPct   = Math.round(topType[1].length / total * 100);
    const typeLines = sortedTypes.map(([t, list]) => {
      const lbl = HOBBY_TYPE_LABEL[t] ?? t;
      const pct = Math.round(list.length / total * 100);
      return `${lbl}：${list.length} 条（${pct}%）`;
    }).join('\n');

    const msLines = milestones.length > 0
      ? `\n里程碑事件：${milestones.map(h => `「${h.title}」`).join('、')}`
      : '\n该时段无里程碑记录。';

    focus =
      `该时段爱好重心集中于 ${topLabel}，占全部记录的 ${topPct}%。\n` +
      typeLines + msLines;
  }

  // ── 板块三：日常松弛状态 & 心境氛围 ────────────────────────────────────────
  let relaxState: string;
  if (total === 0) {
    relaxState = '无记录，状态不可判定。';
  } else {
    // 从标题 + 内容提取氛围词
    const fullText = periodHobbies.map(h => h.title + ' ' + h.content).join(' ');
    const atmosphereKw = [
      ['夜晚', '深夜', '凌晨'],
      ['安静', '宁静', '静谧', '独处'],
      ['慵懒', '随意', '放空', '休憩'],
      ['专注', '沉浸', '入神', '认真'],
      ['惬意', '舒适', '温暖', '闲适'],
      ['热闹', '聚会', '分享', '交流'],
    ];
    const hitGroups: string[] = [];
    atmosphereKw.forEach(group => {
      const hit = group.filter(w => fullText.includes(w));
      if (hit.length > 0) hitGroups.push(hit[0]);
    });

    // 记录日期分布（是否集中在周末或固定时段）
    const dates = periodHobbies.map(h => h.date).sort();
    const earliest = dates[0];
    const latest   = dates[dates.length - 1];
    const spanDays = total >= 2
      ? Math.max(1, Math.round((new Date(latest).getTime() - new Date(earliest).getTime()) / 86400000) + 1)
      : 1;
    const densityStr = total >= 2
      ? `${parseFloat((total / spanDays * 30).toFixed(1))} 条/月`
      : '单次记录';

    const atmStr = hitGroups.length > 0
      ? `氛围词命中：${hitGroups.join('、')}`
      : '正文无氛围词命中';

    // 哪种类型的记录内容最长（深度投入代理）
    const avgLens = sortedTypes.map(([t, list]) => ({
      label: HOBBY_TYPE_LABEL[t] ?? t,
      avg: Math.round(list.reduce((s, h) => s + h.content.length, 0) / list.length),
    })).sort((a, b) => b.avg - a.avg);
    const deepestType = avgLens[0];

    relaxState =
      `记录时段跨度：${earliest}—${latest}，共 ${spanDays} 天，密度 ${densityStr}\n` +
      `${atmStr}\n` +
      `单条内容篇幅最深：${deepestType.label}（均 ${deepestType.avg} 字），` +
      `${avgLens.length > 1 ? `其次 ${avgLens.slice(1).map(x => `${x.label}（均${x.avg}字）`).join('、')}`  : '仅一种类型有记录'}`;
  }

  // ── 板块四：长期节奏迁移变化（纵向对比）────────────────────────────────────
  let rhythmShift: string;
  if (allHobbies.length === 0) {
    rhythmShift = '全历史无记录，节奏迁移不可判定。';
  } else {
    // 全历史各类型分布
    const allByType: Record<string, number> = {};
    allHobbies.forEach(h => { allByType[h.type] = (allByType[h.type] || 0) + 1; });

    // 当前时段各类型占比 vs 全历史占比
    const shiftLines = Object.keys({ ...allByType, ...byType }).map(t => {
      const lbl         = HOBBY_TYPE_LABEL[t] ?? t;
      const allCnt      = allByType[t] ?? 0;
      const periodCnt   = byType[t]?.length ?? 0;
      const allPct      = allHobbies.length > 0 ? Math.round(allCnt / allHobbies.length * 100) : 0;
      const periodPct   = total > 0 ? Math.round(periodCnt / total * 100) : 0;
      const arrow       = periodPct > allPct + 10 ? '↑' : periodPct < allPct - 10 ? '↓' : '→';
      return `${lbl}：历史${allPct}% ${arrow} 时段${periodPct}%（${periodCnt}条）`;
    });

    // 全历史密度
    let allDensityStr = '—';
    if (allHobbies.length >= 2) {
      const allDates = allHobbies.map(h => h.date).sort();
      const allSpan = Math.max(1, Math.round(
        (new Date(allDates[allDates.length - 1]).getTime() - new Date(allDates[0]).getTime()) / 86400000
      ) + 1);
      const allDensity = parseFloat((allHobbies.length / allSpan * 30).toFixed(1));
      allDensityStr = `${allDensity} 条/月`;
    }

    rhythmShift =
      `全历史基准：${allHobbies.length} 条，密度 ${allDensityStr}\n` +
      `时段（${periodLabel}）各类型占比迁移：\n` +
      shiftLines.join('\n');
  }

  // ── 板块五：周期整体陈述 ──────────────────────────────────────────────────
  const periodSummary = total === 0
    ? `时段"${periodLabel}"无爱好记录留存。全历史累计 ${allHobbies.length} 条。`
    : `"${periodLabel}"共留存 ${total} 条爱好记录，涵盖 ${sortedTypes.length} 种类型。` +
      `${milestones.length > 0 ? `里程碑事件 ${milestones.length} 个。` : ''}` +
      `重心类型：${HOBBY_TYPE_LABEL[sortedTypes[0][0]] ?? sortedTypes[0][0]}（${sortedTypes[0][1].length}条）。` +
      `全历史基准 ${allHobbies.length} 条。`;

  return { rawList, focus, relaxState, rhythmShift, periodSummary };
}

// ─── 时间板块 ──────────────────────────────────────────────────────────────────

// ─── 时间板块 ──────────────────────────────────────────────────────────────────

/** 时间板块专属 — 生活时间线归档陈述，禁止效率分析与规划建议 */
export interface TimeAnalysisResult {
  rawList: AnalysisBlock[];   // 时段留存清单
  scheduleTrace: string;      // 作息脉络（各类别时间分布陈列）
  eventTrace: string;         // 关键事件留存（幸福事件时序列举）
  longitudinal: string;       // 纵向对比（时段 vs 全历史阶段变化）
  periodSummary: string;      // 周期整体陈述
}

/**
 * @param periodSchedule   当前时段的作息记录
 * @param allSchedule      全历史作息记录（纵向基准）
 * @param periodHappiness  当前时段的幸福事件记录
 * @param allHappiness     全历史幸福事件记录（纵向基准）
 * @param periodLabel      时段描述标签
 */
export function analyzeTime(
  periodSchedule: ScheduleRecord[],
  allSchedule: ScheduleRecord[],
  periodHappiness: HappinessRecord[],
  allHappiness: HappinessRecord[],
  periodLabel: string
): TimeAnalysisResult {

  // 时段基础数据
  const scheduleDays   = [...new Set(periodSchedule.map(r => r.date))].sort();
  const happinessDates = [...new Set(periodHappiness.map(r => r.date))].sort();
  const allDates       = [...new Set([...scheduleDays, ...happinessDates])].sort();

  const earliest = allDates[0] ?? '—';
  const latest   = allDates[allDates.length - 1] ?? '—';

  // 各类别时长汇总（时段）
  const catMap: Record<string, number> = {};
  periodSchedule.forEach(r => { catMap[r.category] = (catMap[r.category] || 0) + r.duration; });
  const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const totalMinutes = periodSchedule.reduce((s, r) => s + r.duration, 0);

  // ── 板块一：时段留存清单 ──────────────────────────────────────────────────
  const rawList: AnalysisBlock[] = [
    { label: '分析时段',   value: periodLabel },
    { label: '记录跨度',   value: allDates.length >= 2 ? `${earliest} — ${latest}` : (earliest !== '—' ? earliest : '—') },
    { label: '作息记录天', value: scheduleDays.length > 0 ? `${scheduleDays.length} 天` : '—' },
    { label: '作息条目',   value: periodSchedule.length > 0 ? `${periodSchedule.length} 条` : '—' },
    { label: '关键事件',   value: periodHappiness.length > 0 ? `${periodHappiness.length} 条` : '—' },
    { label: '历史总事件', value: `${allHappiness.length} 条` },
  ];

  // ── 板块二：作息脉络 ──────────────────────────────────────────────────────
  let scheduleTrace: string;
  if (periodSchedule.length === 0) {
    scheduleTrace = `时段"${periodLabel}"无作息记录留存。`;
  } else {
    const span = scheduleDays.length >= 2
      ? `${scheduleDays[0]} — ${scheduleDays[scheduleDays.length - 1]}，跨度 ${scheduleDays.length} 天`
      : `${scheduleDays[0]}，单日记录`;

    const catLines = sortedCats.map(([cat, min]) => {
      const hrs = min >= 60 ? `${(min / 60).toFixed(1)} 小时` : `${min} 分钟`;
      const pct = Math.round(min / totalMinutes * 100);
      return `${cat}：${hrs}（${pct}%）`;
    }).join('\n');

    scheduleTrace =
      `记录时段：${span}\n` +
      `各类别时间分布：\n${catLines}`;
  }

  // ── 板块三：关键事件留存（幸福事件时序列举）──────────────────────────────
  let eventTrace: string;
  if (periodHappiness.length === 0) {
    eventTrace = `时段"${periodLabel}"无关键事件留存记录。`;
  } else {
    const sorted = [...periodHappiness].sort((a, b) => a.date.localeCompare(b.date));
    const eventLines = sorted.map(e => `${e.date}　${e.event}`).join('\n');
    eventTrace =
      `共留存 ${sorted.length} 条关键事件，时序如下：\n` + eventLines;
  }

  // ── 板块四：纵向对比（时段 vs 全历史阶段变化）──────────────────────────
  let longitudinal: string;
  if (allSchedule.length === 0 && allHappiness.length === 0) {
    longitudinal = '全历史无记录，阶段变化不可对比。';
  } else {
    // 全历史各类别占比
    const allCatMap: Record<string, number> = {};
    allSchedule.forEach(r => { allCatMap[r.category] = (allCatMap[r.category] || 0) + r.duration; });
    const allTotal = allSchedule.reduce((s, r) => s + r.duration, 0);

    const shiftLines = sortedCats.map(([cat, min]) => {
      const allMin  = allCatMap[cat] ?? 0;
      const allPct  = allTotal > 0 ? Math.round(allMin / allTotal * 100) : 0;
      const nowPct  = Math.round(min / totalMinutes * 100);
      const arrow   = nowPct > allPct + 10 ? '↑' : nowPct < allPct - 10 ? '↓' : '→';
      return `${cat}：历史${allPct}% ${arrow} 时段${nowPct}%`;
    });

    // 全历史事件密度 vs 时段事件密度
    const allHappinessDays = [...new Set(allHappiness.map(r => r.date))].sort();
    const allEventDensity = allHappinessDays.length >= 2
      ? parseFloat((allHappiness.length / Math.max(1,
          Math.round((new Date(allHappinessDays[allHappinessDays.length - 1]).getTime() - new Date(allHappinessDays[0]).getTime()) / 86400000) + 1
        ) * 30).toFixed(1))
      : null;

    const nowEventDensity = happinessDates.length >= 2
      ? parseFloat((periodHappiness.length / Math.max(1,
          Math.round((new Date(happinessDates[happinessDates.length - 1]).getTime() - new Date(happinessDates[0]).getTime()) / 86400000) + 1
        ) * 30).toFixed(1))
      : null;

    const densityLine = (allEventDensity !== null && nowEventDensity !== null)
      ? `关键事件留存密度：全历史 ${allEventDensity} 条/月 → 时段 ${nowEventDensity} 条/月`
      : `关键事件：全历史 ${allHappiness.length} 条，时段 ${periodHappiness.length} 条`;

    longitudinal =
      (shiftLines.length > 0
        ? `作息类别占比迁移（历史 vs 时段）：\n${shiftLines.join('\n')}\n`
        : `时段无作息记录，无法进行类别迁移对比。\n`) +
      densityLine;
  }

  // ── 板块五：周期整体陈述 ──────────────────────────────────────────────────
  const topCat = sortedCats[0];
  const periodSummary =
    periodSchedule.length === 0 && periodHappiness.length === 0
      ? `时段"${periodLabel}"无任何留存记录。全历史作息 ${allSchedule.length} 条，关键事件 ${allHappiness.length} 条。`
      : `"${periodLabel}"：` +
        (scheduleDays.length > 0 ? `作息记录 ${scheduleDays.length} 天（${scheduleDays[0]} — ${scheduleDays[scheduleDays.length - 1]}），` : '') +
        (topCat ? `主要类别"${topCat[0]}"（${Math.round(topCat[1] / totalMinutes * 100)}%），` : '') +
        (periodHappiness.length > 0 ? `关键事件 ${periodHappiness.length} 条。` : '无关键事件留存。') +
        `全历史基准：作息 ${[...new Set(allSchedule.map(r => r.date))].length} 天，事件 ${allHappiness.length} 条。`;

  return { rawList, scheduleTrace, eventTrace, longitudinal, periodSummary };
}

// ─── 工具函数 ──────────────────────────────────────────────────────────────────

function getRecentDays(dates: string[], days: number): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  return dates.filter(d => d >= cutoffStr).length;
}

// ─── 首页全局板块 ──────────────────────────────────────────────────────────────

/** 全局人格画像专属 — 汇总六大子系统，凝练自我身份，禁止好坏评判与人生指导 */
export interface GlobalPortraitResult {
  rawList: AnalysisBlock[];   // 各系统存档数量总览
  mindset: string;            // 心性
  behavioralStyle: string;    // 行事风格
  solitaryMode: string;       // 独处模式
  persistentHabits: string;   // 坚持习惯
  lifePref: string;           // 生活偏好
  spiritualCore: string;      // 精神内核
  whoAmI: string;             // 我是谁（综合身份陈述）
}

export function analyzeGlobalPortrait(params: {
  periodWorkouts: Workout[];
  allWorkouts: Workout[];
  periodBooks: Book[];
  allBooks: Book[];
  periodArticles: Article[];
  allArticles: Article[];
  periodSkills: Skill[];
  allSkills: Skill[];
  periodHobbies: Hobby[];
  allHobbies: Hobby[];
  periodSchedule: ScheduleRecord[];
  allSchedule: ScheduleRecord[];
  periodHappiness: HappinessRecord[];
  allHappiness: HappinessRecord[];
  periodTraits: Trait[];
  allTraits: Trait[];
  periodReadingSlots: (ReadingSlotObject | string)[];
  allReadingSlots: (ReadingSlotObject | string)[];
  periodLabel: string;
}): GlobalPortraitResult {
  const {
    periodWorkouts, allWorkouts,
    periodBooks, allBooks,
    periodArticles, allArticles,
    periodSkills, allSkills,
    periodHobbies, allHobbies,
    periodSchedule, allSchedule,
    periodHappiness, allHappiness,
    periodTraits, allTraits,
    periodReadingSlots, allReadingSlots,
    periodLabel,
  } = params;

  const completedBooks    = periodBooks.filter(b => b.status === 'completed');
  const allCompletedBooks = allBooks.filter(b => b.status === 'completed');

  // 统计各系统的图片数据
  const periodBooksWithCover = periodBooks.filter(b => b.coverUrl && b.coverUrl.trim().length > 0);
  const periodSkillsWithCover = periodSkills.filter(s => s.coverUrl && s.coverUrl.trim().length > 0);
  const periodSkillsWithVideo = periodSkills.filter(s => s.videoUrl && s.videoUrl.trim().length > 0);
  const periodHobbiesWithImg = periodHobbies.filter(h => h.imageUrl && h.imageUrl.trim().length > 0);

  const allBooksWithCover = allBooks.filter(b => b.coverUrl && b.coverUrl.trim().length > 0);
  const allSkillsWithCover = allSkills.filter(s => s.coverUrl && s.coverUrl.trim().length > 0);
  const allHobbiesWithImg = allHobbies.filter(h => h.imageUrl && h.imageUrl.trim().length > 0);

  // 统计慧府（增寰）数据
  const extractSlotData = (slot: ReadingSlotObject | string): { image?: boolean; years?: number; books?: number; hours?: number; minutes?: number; days?: number } => {
    if (typeof slot === 'string') {
      return { image: slot.trim().length > 0 };
    }
    return {
      image: !!(slot.imageUrl && slot.imageUrl.trim().length > 0),
      years: slot.totalYears,
      books: slot.totalBooks,
      hours: slot.totalHours,
      minutes: slot.totalMinutes,
      days: slot.readingDays
    };
  };
  const periodSlotData = periodReadingSlots.map(extractSlotData);
  const allSlotData = allReadingSlots.map(extractSlotData);
  
  const periodSlotsWithImage = periodSlotData.filter(s => s.image).length;
  const allSlotsWithImage = allSlotData.filter(s => s.image).length;
  
  const periodTotalBooks = periodSlotData.reduce((sum, s) => sum + (s.books || 0), 0);
  const allTotalBooks = allSlotData.reduce((sum, s) => sum + (s.books || 0), 0);
  
  const periodTotalHours = periodSlotData.reduce((sum, s) => sum + (s.hours || 0) + (s.minutes || 0) / 60, 0);
  const allTotalHours = allSlotData.reduce((sum, s) => sum + (s.hours || 0) + (s.minutes || 0) / 60, 0);
  
  const allTotalDays = allSlotData.reduce((sum, s) => sum + (s.days || 0), 0);
  
  const allTotalYears = allSlotData.reduce((sum, s) => sum + (s.years || 0), 0);

  // ── 板块一：各系统存档数量总览 ────────────────────────────────────────────
  const rawList: AnalysisBlock[] = [
    { label: '分析时段', value: periodLabel },
    { label: '体魄训练', value: periodWorkouts.length > 0 ? `${periodWorkouts.length} 次` : '—' },
    { label: '阅读完成', value: completedBooks.length > 0 ? `${completedBooks.length} 本` : '—' },
    { label: '阅读有图', value: periodBooksWithCover.length > 0 ? `${periodBooksWithCover.length} 本` : '—' },
    { label: '意识记录', value: periodArticles.length > 0 ? `${periodArticles.length} 篇` : '—' },
    { label: '技艺归档', value: periodSkills.length > 0 ? `${periodSkills.length} 件` : '—' },
    { label: '技艺有图', value: periodSkillsWithCover.length > 0 ? `${periodSkillsWithCover.length} 件` : '—' },
    { label: '技艺有视频', value: periodSkillsWithVideo.length > 0 ? `${periodSkillsWithVideo.length} 件` : '—' },
    { label: '爱好留存', value: periodHobbies.length > 0 ? `${periodHobbies.length} 条` : '—' },
    { label: '爱好有图', value: periodHobbiesWithImg.length > 0 ? `${periodHobbiesWithImg.length} 条` : '—' },
    { label: '慧府有图', value: periodSlotsWithImage > 0 ? `${periodSlotsWithImage} 张` : '—' },
    { label: '慧府书籍', value: periodTotalBooks > 0 ? `${periodTotalBooks} 本` : '—' },
    { label: '慧府时长', value: periodTotalHours > 0 ? `${periodTotalHours.toFixed(1)} 小时` : '—' },
    { label: '关键事件', value: periodHappiness.length > 0 ? `${periodHappiness.length} 条` : '—' },
    { label: '特质记录', value: periodTraits.length > 0 ? `${periodTraits.length} 条` : '—' },
    { label: '全历史有图', value: `${allBooksWithCover.length + allSkillsWithCover.length + allHobbiesWithImg.length + allSlotsWithImage} 张` },
  ];

  // ── 板块二：心性 ──────────────────────────────────────────────────────────
  let mindset: string;
  {
    const lines: string[] = [];
    if (periodArticles.length > 0) {
      const fullText = periodArticles.map(a => a.title + a.content).join('');
      const posKw  = ['成长', '突破', '发现', '喜悦', '平静', '感悟', '收获', '清晰', '坚定', '自由', '释然', '满足'];
      const hvyKw  = ['困惑', '迷茫', '压力', '痛苦', '疲惫', '焦虑', '挣扎', '沉重', '空洞'];
      const neuKw  = ['思考', '记录', '观察', '分析', '梳理', '整理', '探索', '审视', '反思'];
      const p = posKw.filter(w => fullText.includes(w)).length;
      const h = hvyKw.filter(w => fullText.includes(w)).length;
      const n = neuKw.filter(w => fullText.includes(w)).length;
      const total = p + h + n;
      let tone = '无法判定';
      if (total > 0) {
        if (p >= h * 2)          tone = '正向底色为主';
        else if (h >= p * 1.5)   tone = '沉郁/压力底色偏重';
        else if (n > p && n > h) tone = '中性客观底色为主';
        else                     tone = '混合底色';
      }
      lines.push(`意识记录情绪底色：${tone}（${periodArticles.length}篇，正向${p}个 / 沉郁${h}个 / 中性${n}个关键词命中）`);
    }
    if (periodHappiness.length > 0) {
      const avg = (arr: number[]) => (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1);
      const s  = avg(periodHappiness.map(h => h.sensory));
      const m  = avg(periodHappiness.map(h => h.memory));
      const so = avg(periodHappiness.map(h => h.soul));
      const g  = avg(periodHappiness.map(h => h.growth));
      const sc = avg(periodHappiness.map(h => h.social));
      lines.push(`关键事件各维度均值（满分10）：感官${s} / 记忆${m} / 灵魂${so} / 成长${g} / 人际${sc}`);
    }
    if (periodTraits.length > 0) {
      const excerpts = periodTraits.slice(0, 3).map(t => `"${t.text.slice(0, 18)}${t.text.length > 18 ? '…' : ''}"`).join('、');
      lines.push(`自我特质记录：${periodTraits.length} 条，如 ${excerpts}`);
    } else if (allTraits.length > 0) {
      lines.push(`自我特质记录：时段无新增，全历史累计 ${allTraits.length} 条`);
    }
    mindset = lines.length > 0 ? lines.join('\n') : `时段"${periodLabel}"无足够数据凝练心性。`;
  }

  // ── 板块三：行事风格 ──────────────────────────────────────────────────────
  let behavioralStyle: string;
  {
    const lines: string[] = [];
    if (periodSkills.length > 0) {
      const byType: Record<string, number> = {};
      periodSkills.forEach(s => { byType[s.type] = (byType[s.type] || 0) + 1; });
      const sorted = Object.entries(byType).sort((a, b) => b[1] - a[1]);
      lines.push(`技艺成品归档：${sorted.map(([t, c]) => `${SKILL_TYPE_LABEL[t] ?? t}（${c}件）`).join('、')}`);
    }
    if (periodWorkouts.length > 0) {
      const exercises = [...new Set(periodWorkouts.map(w => w.exercise))];
      const exStr = exercises.slice(0, 5).join('、') + (exercises.length > 5 ? ` 等${exercises.length}种` : '');
      lines.push(`体魄训练：${exStr}，共${periodWorkouts.length}次`);
    }
    if (periodSchedule.length > 0) {
      const catMap: Record<string, number> = {};
      periodSchedule.forEach(r => { catMap[r.category] = (catMap[r.category] || 0) + r.duration; });
      const sorted  = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
      const totalMin = periodSchedule.reduce((s, r) => s + r.duration, 0);
      const top3 = sorted.slice(0, 3).map(([cat, min]) => `${cat}（${Math.round(min / totalMin * 100)}%）`).join('、');
      lines.push(`作息时间主要类别：${top3}`);
    }
    behavioralStyle = lines.length > 0 ? lines.join('\n') : `时段"${periodLabel}"无足够行为记录。`;
  }

  // ── 板块四：独处模式 ──────────────────────────────────────────────────────
  let solitaryMode: string;
  {
    const lines: string[] = [];
    if (periodHobbies.length > 0) {
      const soloTypes   = ['music', 'tea', 'building'];
      const soloCount   = periodHobbies.filter(h => soloTypes.includes(h.type)).length;
      const socialCount = periodHobbies.filter(h => h.type === 'gaming').length;
      const soloPct     = Math.round(soloCount / periodHobbies.length * 100);
      const socialPct   = Math.round(socialCount / periodHobbies.length * 100);
      lines.push(`爱好记录${periodHobbies.length}条，独处型（听歌/饮茶/积木）${soloCount}条（${soloPct}%），互动型（游戏）${socialCount}条（${socialPct}%）`);
    }
    if (periodArticles.length > 0) {
      const dates    = periodArticles.map(a => a.publishDate).sort();
      const spanDays = dates.length >= 2
        ? Math.max(1, Math.round((new Date(dates[dates.length - 1]).getTime() - new Date(dates[0]).getTime()) / 86400000) + 1)
        : 1;
      const density = parseFloat((periodArticles.length / spanDays * 30).toFixed(1));
      lines.push(`意识写作频率：${density} 篇/月（${periodArticles.length}篇）`);
    }
    solitaryMode = lines.length > 0 ? lines.join('\n') : `时段"${periodLabel}"无足够记录判断独处模式。`;
  }

  // ── 板块五：坚持习惯 ──────────────────────────────────────────────────────
  let persistentHabits: string;
  {
    const lines: string[] = [];
    if (allWorkouts.length > 0) {
      const wDates = allWorkouts.map(w => w.date).sort();
      const wSpan  = wDates.length >= 2
        ? Math.round((new Date(wDates[wDates.length - 1]).getTime() - new Date(wDates[0]).getTime()) / 86400000) + 1
        : 1;
      lines.push(`体魄训练：历史累计${allWorkouts.length}次，记录跨度约${(wSpan / 30).toFixed(1)}个月`);
    }
    if (allArticles.length > 0) {
      const aDates = allArticles.map(a => a.publishDate).sort();
      const aSpan  = aDates.length >= 2
        ? Math.round((new Date(aDates[aDates.length - 1]).getTime() - new Date(aDates[0]).getTime()) / 86400000) + 1
        : 1;
      lines.push(`意识写作：历史累计${allArticles.length}篇，记录跨度约${(aSpan / 30).toFixed(1)}个月`);
    }
    if (allSkills.length > 0)        lines.push(`技艺归档：历史累计${allSkills.length}件成品`);
    if (allCompletedBooks.length > 0) lines.push(`阅读完成：历史累计${allCompletedBooks.length}本`);
    if (allHobbies.length > 0)        lines.push(`爱好留存：历史累计${allHobbies.length}条记录`);
    if (allSchedule.length > 0) {
      const sDays = [...new Set(allSchedule.map(r => r.date))].sort();
      lines.push(`作息记录：历史累计${sDays.length}天记录`);
    }
    if (allHappiness.length > 0)      lines.push(`关键事件：历史累计${allHappiness.length}条留存`);
    // 慧府数据
    if (allTotalYears > 0)        lines.push(`慧府记录：阅读历史跨度约${allTotalYears}年`);
    if (allTotalBooks > 0)        lines.push(`慧府书籍：记录阅读${allTotalBooks}本书籍`);
    if (allTotalHours > 0)        lines.push(`慧府时长：累计阅读${allTotalHours.toFixed(1)}小时`);
    if (allTotalDays > 0)         lines.push(`慧府天数：有效阅读${allTotalDays}天`);
    persistentHabits = lines.length > 0 ? lines.join('\n') : '全历史无足够记录判断坚持习惯。';
  }

  // ── 板块六：生活偏好 ──────────────────────────────────────────────────────
  let lifePref: string;
  {
    const lines: string[] = [];
    if (periodHobbies.length > 0) {
      const byType: Record<string, number> = {};
      periodHobbies.forEach(h => { byType[h.type] = (byType[h.type] || 0) + 1; });
      const sorted = Object.entries(byType).sort((a, b) => b[1] - a[1]);
      const top    = sorted[0];
      lines.push(`爱好主导类型：${HOBBY_TYPE_LABEL[top[0]] ?? top[0]}（${top[1]}条，占${Math.round(top[1] / periodHobbies.length * 100)}%）`);
    }
    if (periodSchedule.length > 0) {
      const catMap: Record<string, number> = {};
      periodSchedule.forEach(r => { catMap[r.category] = (catMap[r.category] || 0) + r.duration; });
      const sorted   = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
      const totalMin = periodSchedule.reduce((s, r) => s + r.duration, 0);
      if (sorted.length > 0) {
        const top = sorted[0];
        lines.push(`作息主要时间投入：${top[0]}（${Math.round(top[1] / totalMin * 100)}%，${(top[1] / 60).toFixed(1)}小时）`);
      }
    }
    if (periodHappiness.length > 0) {
      const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
      const dims = [
        { name: '感官', val: avg(periodHappiness.map(h => h.sensory)) },
        { name: '记忆', val: avg(periodHappiness.map(h => h.memory)) },
        { name: '灵魂', val: avg(periodHappiness.map(h => h.soul)) },
        { name: '成长', val: avg(periodHappiness.map(h => h.growth)) },
        { name: '人际', val: avg(periodHappiness.map(h => h.social)) },
      ].sort((a, b) => b.val - a.val);
      lines.push(`关键事件主要触发维度：${dims[0].name}（均值${dims[0].val.toFixed(1)}/10）、${dims[1].name}（${dims[1].val.toFixed(1)}）`);
    }
    // 图片数据统计分析
    const totalImages = periodBooksWithCover.length + periodSkillsWithCover.length + periodHobbiesWithImg.length;
    if (totalImages > 0) {
      lines.push(`视觉化记录倾向：时段有${totalImages}张图片/封面记录`);
      if (periodBooksWithCover.length > 0) {
        lines.push(`  - 阅读有图${periodBooksWithCover.length}本`);
      }
      if (periodSkillsWithCover.length > 0) {
        lines.push(`  - 技艺有图${periodSkillsWithCover.length}件`);
      }
      if (periodHobbiesWithImg.length > 0) {
        lines.push(`  - 爱好有图${periodHobbiesWithImg.length}条`);
      }
      if (periodSkillsWithVideo.length > 0) {
        lines.push(`  - 技艺有视频${periodSkillsWithVideo.length}件`);
      }
    }
    lifePref = lines.length > 0 ? lines.join('\n') : `时段"${periodLabel}"无足够记录描述生活偏好。`;
  }

  // ── 板块七：精神内核 ──────────────────────────────────────────────────────
  let spiritualCore: string;
  {
    const lines: string[] = [];
    if (periodArticles.length > 0) {
      const catMap: Record<string, number> = {};
      periodArticles.forEach(a => { if (a.category) catMap[a.category] = (catMap[a.category] || 0) + 1; });
      const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        lines.push(`意识记录文章类目：${sorted.slice(0, 4).map(([k, v]) => `${k}（${v}篇）`).join('、')}`);
      }
    }
    if (allCompletedBooks.length > 0) {
      const withThoughts = allCompletedBooks.filter(b => b.thoughts && b.thoughts.trim().length > 20);
      const rate = Math.round(withThoughts.length / allCompletedBooks.length * 100);
      lines.push(`阅读深度：历史完成${allCompletedBooks.length}本，感悟记录率${rate}%`);
    }
    if (allTraits.length > 0) {
      lines.push(`自我认知留存：历史累计${allTraits.length}条特质记录`);
    }
    if (allHappiness.length > 0) {
      const sorted = [...allHappiness].sort((a, b) => {
        const sa = (a.sensory + a.memory + a.soul + a.growth + a.social);
        const sb = (b.sensory + b.memory + b.soul + b.growth + b.social);
        return sb - sa;
      });
      const top = sorted[0];
      if (top) lines.push(`全历史评分最高的关键事件：${top.date}「${top.event.slice(0, 25)}${top.event.length > 25 ? '…' : ''}」`);
    }
    spiritualCore = lines.length > 0 ? lines.join('\n') : `时段"${periodLabel}"无足够记录描述精神内核。`;
  }

  // ── 板块八：我是谁（综合身份陈述）────────────────────────────────────────
  let whoAmI: string;
  {
    const parts: string[] = [];
    // 活跃系统
    const activeSystems: string[] = [];
    if (periodWorkouts.length > 0)  activeSystems.push('体魄训练');
    if (completedBooks.length > 0)  activeSystems.push('阅读');
    if (periodArticles.length > 0)  activeSystems.push('意识写作');
    if (periodSkills.length > 0)    activeSystems.push('技艺归档');
    if (periodHobbies.length > 0)   activeSystems.push('爱好');
    if (periodHappiness.length > 0) activeSystems.push('生命事件记录');
    if (activeSystems.length > 0) {
      parts.push(`时段"${periodLabel}"留存记录所覆盖的生活域：${activeSystems.join('、')}`);
    }
    // 独处/互动倾向
    if (periodHobbies.length > 0) {
      const soloTypes = ['music', 'tea', 'building'];
      const soloPct   = Math.round(periodHobbies.filter(h => soloTypes.includes(h.type)).length / periodHobbies.length * 100);
      parts.push(`爱好留存以${soloPct >= 70 ? '独处型为主' : soloPct <= 30 ? '互动型为主' : '独处/互动混合'}（独处型占${soloPct}%）`);
    }
    // 技艺主类
    if (periodSkills.length > 0) {
      const byType: Record<string, number> = {};
      periodSkills.forEach(s => { byType[s.type] = (byType[s.type] || 0) + 1; });
      const top = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
      parts.push(`技艺归档主要类型为${SKILL_TYPE_LABEL[top[0]] ?? top[0]}`);
    }
    // 写作底色
    if (periodArticles.length > 0) {
      const fullText = periodArticles.map(a => a.title + a.content).join('');
      const p = ['成长', '突破', '发现', '喜悦', '平静', '感悟', '收获', '清晰', '坚定'].filter(w => fullText.includes(w)).length;
      const h = ['困惑', '迷茫', '压力', '痛苦', '疲惫', '焦虑', '挣扎', '沉重'].filter(w => fullText.includes(w)).length;
      const tone = p >= h * 2 ? '正向底色' : h >= p * 1.5 ? '沉郁底色' : '混合底色';
      parts.push(`意识写作呈${tone}（${periodArticles.length}篇）`);
    }
    // 长期坚持域
    const longTerm: string[] = [];
    if (allWorkouts.length >= 10)        longTerm.push(`体魄训练（${allWorkouts.length}次）`);
    if (allArticles.length >= 5)         longTerm.push(`意识写作（${allArticles.length}篇）`);
    if (allSkills.length >= 3)           longTerm.push(`技艺归档（${allSkills.length}件）`);
    if (allCompletedBooks.length >= 5)   longTerm.push(`阅读（${allCompletedBooks.length}本）`);
    if (longTerm.length > 0) {
      parts.push(`全历史留存显示的长期坚持域：${longTerm.join('、')}`);
    }
    whoAmI = parts.length > 0
      ? parts.join('；\n')
      : `时段"${periodLabel}"存档记录不足，无法凝练身份陈述。`;
  }

  return { rawList, mindset, behavioralStyle, solitaryMode, persistentHabits, lifePref, spiritualCore, whoAmI };
}
