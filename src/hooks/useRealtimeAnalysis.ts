import { useMemo } from 'react';
import { useStore } from '../store';
import type { ReadingSlotObject } from '../types';
import {
  analyzeFitness, analyzeWisdom, analyzeSpirit,
  analyzeSkills, analyzeHobbies, analyzeTime, analyzeGlobalPortrait,
  FitnessAnalysisResult, WisdomAnalysisResult, SpiritAnalysisResult,
  SkillsAnalysisResult, HobbiesAnalysisResult, TimeAnalysisResult,
  GlobalPortraitResult,
} from '../utils/aiAnalysis';

export type PageType = 'fitness' | 'wisdom' | 'spirit' | 'skills' | 'hobbies' | 'time' | 'global';
export type RangeMode = 'all' | 'period' | 'month' | 'year';

export interface FilterParams {
  periodPreset: number;
  selectedMonth: string;
  selectedYear: string;
}

export type AnalysisResultUnion =
  | { type: 'fitness'; data: FitnessAnalysisResult }
  | { type: 'wisdom'; data: WisdomAnalysisResult }
  | { type: 'spirit'; data: SpiritAnalysisResult }
  | { type: 'skills'; data: SkillsAnalysisResult }
  | { type: 'hobbies'; data: HobbiesAnalysisResult }
  | { type: 'time'; data: TimeAnalysisResult }
  | { type: 'global'; data: GlobalPortraitResult };

/* ─── 日期过滤工具（与 AiSprite.tsx 保持一致）───────────────────────────────── */

function filterByDate(date: string, rangeMode: RangeMode, params: FilterParams): boolean {
  if (rangeMode === 'all') return true;
  if (rangeMode === 'period') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - params.periodPreset);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return date >= cutoffStr;
  }
  if (rangeMode === 'month') return params.selectedMonth ? date.startsWith(params.selectedMonth) : true;
  if (rangeMode === 'year') return params.selectedYear ? date.startsWith(params.selectedYear) : true;
  return true;
}

function buildPeriodLabel(rangeMode: RangeMode, params: FilterParams): string {
  if (rangeMode === 'all') return '全历史';
  if (rangeMode === 'period') return `近${params.periodPreset}天`;
  if (rangeMode === 'month') return params.selectedMonth || '—';
  if (rangeMode === 'year') return params.selectedYear ? `${params.selectedYear}年` : '—';
  return '全历史';
}

/* ─── Hook ─────────────────────────────────────────────────────────────────── */

export function useRealtimeAnalysis(
  pageType: PageType,
  rangeMode: RangeMode,
  params: FilterParams
): {
  result: AnalysisResultUnion | null;
  lastUpdated: number;
  periodLabel: string;
} {
  // ── 订阅全部 Store 数据（按页面类型精确选取，减少无效重渲染）──────────────
  const workouts = useStore(s => s.workouts);
  const fitnessTests = useStore(s => s.fitnessTests);
  const books = useStore(s => s.books);
  const yearSummaries = useStore(s => s.yearSummaries);
  const articles = useStore(s => s.articles);
  const skills = useStore(s => s.skills);
  const hobbies = useStore(s => s.hobbies);
  const scheduleRecords = useStore(s => s.scheduleRecords);
  const happinessRecords = useStore(s => s.happinessRecords);
  const traits = useStore(s => s.traits);
  const readingSlots = useStore(s => s.readingSlots);

  const periodLabel = buildPeriodLabel(rangeMode, params);

  // ── 过滤后的数据（useMemo 避免每次渲染重复过滤）────────────────────────────
  const filtered = useMemo(() => {
    // readingSlots 没有日期，所以不需要过滤
    return {
      articles: articles.filter(a => filterByDate(a.publishDate, rangeMode, params)),
      skills: rangeMode === 'all' ? skills : skills.filter(s => s.date && filterByDate(s.date, rangeMode, params)),
      hobbies: hobbies.filter(h => filterByDate(h.date, rangeMode, params)),
      scheduleRecords: scheduleRecords.filter(r => filterByDate(r.date, rangeMode, params)),
      happinessRecords: happinessRecords.filter(r => filterByDate(r.date, rangeMode, params)),
      books: rangeMode === 'all' ? books : books.filter(b => b.readDate && filterByDate(b.readDate, rangeMode, params)),
      workouts: workouts.filter(w => filterByDate(w.date, rangeMode, params)),
      traits: traits.filter(t => filterByDate(t.createdAt, rangeMode, params)),
    };
  }, [articles, skills, hobbies, scheduleRecords, happinessRecords, books, workouts, traits, rangeMode, params.periodPreset, params.selectedMonth, params.selectedYear]);

  // ── 实时分析计算（纯函数，useMemo 自动缓存）────────────────────────────────
  const result = useMemo<AnalysisResultUnion | null>(() => {
    try {
      switch (pageType) {
        case 'fitness':
          return { type: 'fitness', data: analyzeFitness(workouts, fitnessTests) };
        case 'wisdom':
          return { type: 'wisdom', data: analyzeWisdom(books, yearSummaries) };
        case 'spirit':
          return { type: 'spirit', data: analyzeSpirit(filtered.articles, articles, periodLabel) };
        case 'skills':
          return { type: 'skills', data: analyzeSkills(filtered.skills, skills, periodLabel) };
        case 'hobbies':
          return { type: 'hobbies', data: analyzeHobbies(filtered.hobbies, hobbies, periodLabel) };
        case 'time':
          return { type: 'time', data: analyzeTime(filtered.scheduleRecords, scheduleRecords, filtered.happinessRecords, happinessRecords, periodLabel) };
        case 'global':
          return { type: 'global', data: analyzeGlobalPortrait({
            periodWorkouts: filtered.workouts, allWorkouts: workouts,
            periodBooks: filtered.books, allBooks: books,
            periodArticles: filtered.articles, allArticles: articles,
            periodSkills: filtered.skills, allSkills: skills,
            periodHobbies: filtered.hobbies, allHobbies: hobbies,
            periodSchedule: filtered.scheduleRecords, allSchedule: scheduleRecords,
            periodHappiness: filtered.happinessRecords, allHappiness: happinessRecords,
            periodTraits: filtered.traits, allTraits: traits,
            // readingSlots 没有日期，所以 periodReadingSlots 和 allReadingSlots 一样
            periodReadingSlots: readingSlots.filter(s => s !== null) as (ReadingSlotObject | string)[],
            allReadingSlots: readingSlots.filter(s => s !== null) as (ReadingSlotObject | string)[],
            periodLabel,
          }) };
        default:
          return null;
      }
    } catch (e) {
      console.error('[useRealtimeAnalysis] 分析计算异常:', e);
      return null;
    }
  }, [
    pageType,
    workouts, fitnessTests,
    books, yearSummaries,
    articles, skills, hobbies,
    scheduleRecords, happinessRecords, traits, readingSlots,
    filtered.articles, filtered.skills, filtered.hobbies,
    filtered.scheduleRecords, filtered.happinessRecords,
    filtered.books, filtered.workouts, filtered.traits,
    periodLabel,
  ]);

  const lastUpdated = useMemo(() => Date.now(), [result]);

  return { result, lastUpdated, periodLabel };
}
