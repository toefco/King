import { create } from 'zustand';
import { Talent, FitnessTest, Workout, Book, YearSummary, Article, Skill, Hobby, Schedule, ScheduleRecord, HappinessRecord, Happiness, Trait } from './types';

/* ─── 主人模式：仅本机 localhost 生效 ────────────────────────────────────── */

const OWNER_DATA_KEY = 'talent-showcase-owner-data';

export function isOwnerMode(): boolean {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function loadOwnerData(): Partial<AppStateData> | null {
  try {
    const raw = localStorage.getItem(OWNER_DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as Partial<AppStateData>;
    }
    return null;
  } catch (e) {
    console.error('[数据加载失败]', e);
    return null;
  }
}

let _saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleOwnerSave(data: AppStateData): void {
  if (!isOwnerMode()) return;
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(OWNER_DATA_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[保存失败]', e);
    }
  }, 500);
}

function saveOwnerDataNow(data: AppStateData): void {
  if (!isOwnerMode()) return;
  try {
    localStorage.setItem(OWNER_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[立即保存失败]', e);
  }
}

/* ─── 数据类型 ───────────────────────────────────────────────────────────── */

interface AppStateData {
  talents: Talent[];
  fitnessTests: FitnessTest[];
  workouts: Workout[];
  books: Book[];
  yearSummaries: YearSummary[];
  articles: Article[];
  skills: Skill[];
  hobbies: Hobby[];
  schedules: Schedule[];
  happiness: Happiness[];
  scheduleRecords: ScheduleRecord[];
  happinessRecords: HappinessRecord[];
  traits: Trait[];
  readingSlots: (string | null)[];
  brokenSlots: number[];
}

export interface AppDataSnapshot extends AppStateData {
  version: number;
  exportedAt: string;
}

/* ─── 默认空状态（访客模式或无数据时） ──────────────────────────────────── */

const defaultEmptyData: AppStateData = {
  talents: [],
  fitnessTests: [],
  workouts: [],
  books: [],
  yearSummaries: [],
  articles: [],
  skills: [],
  hobbies: [],
  schedules: [],
  happiness: [],
  scheduleRecords: [],
  happinessRecords: [],
  traits: [],
  readingSlots: Array(10).fill(null),
  brokenSlots: [],
};

function getInitialState(): AppStateData {
  if (isOwnerMode()) {
    const saved = loadOwnerData();
    if (saved) {
      console.log('[主人模式] 加载本地数据');
      return { ...defaultEmptyData, ...saved };
    }
    console.log('[主人模式] 无历史数据');
  } else {
    console.log('[访客模式] 空状态');
  }
  return { ...defaultEmptyData };
}

/* ─── State 接口 ─────────────────────────────────────────────────────────── */

interface AppState extends AppStateData {
  ownerMode: boolean;

  addWorkout: (workout: Workout) => void;
  updateWorkout: (id: string, patch: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  addFitnessTest: (test: FitnessTest) => void;
  updateFitnessTest: (id: string, patch: Partial<FitnessTest>) => void;
  deleteFitnessTest: (id: string) => void;

  addBook: (book: Book) => void;
  updateBook: (id: string, patch: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  updateBookThoughts: (id: string, thoughts: string) => void;
  addYearSummary: (summary: YearSummary) => void;
  updateYearSummary: (id: string, patch: Partial<YearSummary>) => void;
  deleteYearSummary: (id: string) => void;

  addArticle: (article: Article) => void;
  updateArticle: (id: string, patch: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  addTrait: (trait: Trait) => void;
  updateTrait: (id: string, patch: Partial<Trait>) => void;
  deleteTrait: (id: string) => void;

  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, patch: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;

  addHobby: (hobby: Hobby) => void;
  updateHobby: (id: string, patch: Partial<Hobby>) => void;
  deleteHobby: (id: string) => void;

  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, patch: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  addHappiness: (happiness: Happiness) => void;
  updateHappiness: (id: string, patch: Partial<Happiness>) => void;
  deleteHappiness: (id: string) => void;
  setScheduleRecords: (records: ScheduleRecord[]) => void;
  addScheduleRecord: (record: ScheduleRecord) => void;
  updateScheduleRecord: (id: string, patch: Partial<ScheduleRecord>) => void;
  deleteScheduleRecord: (id: string) => void;
  setHappinessRecords: (records: HappinessRecord[]) => void;
  addHappinessRecord: (record: HappinessRecord) => void;
  updateHappinessRecord: (id: string, patch: Partial<HappinessRecord>) => void;
  deleteHappinessRecord: (id: string) => void;

  updateTalentScore: (id: string, score: number) => void;
  setOwnerModeInStore: (on: boolean) => void;

  setReadingSlots: (slots: (string | null)[]) => void;
  setBrokenSlots: (slots: number[]) => void;

  exportData: () => AppDataSnapshot;
  importData: (snapshot: AppDataSnapshot) => { success: boolean; message: string };
  clearAllData: () => void;
}

/* ─── 工具函数 ───────────────────────────────────────────────────────────── */

function updateInArray<T extends { id: string }>(arr: T[], id: string, patch: Partial<T>): T[] {
  return arr.map(item => (item.id === id ? { ...item, ...patch } : item));
}

/* ─── Store ──────────────────────────────────────────────────────────────── */

export const useStore = create<AppState>()((set, get) => ({
  ...getInitialState(),
  ownerMode: isOwnerMode(),

  /* ── 体魄 ── */
  addWorkout: (workout) => set((s) => {
    const newState = { workouts: [workout, ...s.workouts] };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  updateWorkout: (id, patch) => set((s) => {
    const newState = { workouts: updateInArray(s.workouts, id, patch) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  deleteWorkout: (id) => set((s) => {
    const newState = { workouts: s.workouts.filter(w => w.id !== id) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  addFitnessTest: (test) => set((s) => {
    const newState = { fitnessTests: [test, ...s.fitnessTests] };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  updateFitnessTest: (id, patch) => set((s) => {
    const newState = { fitnessTests: updateInArray(s.fitnessTests, id, patch) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  deleteFitnessTest: (id) => set((s) => {
    const newState = { fitnessTests: s.fitnessTests.filter(t => t.id !== id) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),

  /* ── 智慧 ── */
  addBook: (book) => set((s) => {
    const newState = { books: [book, ...s.books] };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  updateBook: (id, patch) => set((s) => {
    const newState = { books: updateInArray(s.books, id, patch) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  deleteBook: (id) => set((s) => {
    const newState = { books: s.books.filter(b => b.id !== id) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  updateBookThoughts: (id, thoughts) => set((s) => {
    const newState = { books: s.books.map(b => b.id === id ? { ...b, thoughts } : b) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  addYearSummary: (summary) => set((s) => {
    const newState = { yearSummaries: [summary, ...s.yearSummaries] };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  updateYearSummary: (id, patch) => set((s) => {
    const newState = { yearSummaries: updateInArray(s.yearSummaries, id, patch) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  deleteYearSummary: (id) => set((s) => {
    const newState = { yearSummaries: s.yearSummaries.filter(x => x.id !== id) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),

  /* ── 精神 ── */
  addArticle: (article) => set((s) => {
    const newState = { articles: [article, ...s.articles] };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  updateArticle: (id, patch) => set((s) => {
    const newState = { articles: updateInArray(s.articles, id, patch) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  deleteArticle: (id) => set((s) => {
    const newState = { articles: s.articles.filter(a => a.id !== id) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  addTrait: (trait) => set((s) => {
    const newState = { traits: [trait, ...s.traits] };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  updateTrait: (id, patch) => set((s) => {
    const newState = { traits: updateInArray(s.traits, id, patch) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  deleteTrait: (id) => set((s) => {
    const newState = { traits: s.traits.filter(t => t.id !== id) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),

  /* ── 技艺 ── */
  addSkill: (skill) => set((s) => {
    const newState = { skills: [skill, ...s.skills] };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  updateSkill: (id, patch) => set((s) => {
    const newState = { skills: updateInArray(s.skills, id, patch) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  deleteSkill: (id) => set((s) => {
    const newState = { skills: s.skills.filter(x => x.id !== id) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),

  /* ── 爱好 ── */
  addHobby: (hobby) => set((s) => {
    const newState = { hobbies: [hobby, ...s.hobbies] };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  updateHobby: (id, patch) => set((s) => {
    const newState = { hobbies: updateInArray(s.hobbies, id, patch) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  deleteHobby: (id) => set((s) => {
    const newState = { hobbies: s.hobbies.filter(h => h.id !== id) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),

  /* ── 时间 ── */
  addSchedule: (schedule) => set((s) => {
    const newState = { schedules: [schedule, ...s.schedules] };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  updateSchedule: (id, patch) => set((s) => {
    const newState = { schedules: updateInArray(s.schedules, id, patch) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  deleteSchedule: (id) => set((s) => {
    const newState = { schedules: s.schedules.filter(x => x.id !== id) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  addHappiness: (happiness) => set((s) => {
    const newState = { happiness: [happiness, ...s.happiness] };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  updateHappiness: (id, patch) => set((s) => {
    const newState = { happiness: updateInArray(s.happiness, id, patch) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  deleteHappiness: (id) => set((s) => {
    const newState = { happiness: s.happiness.filter(h => h.id !== id) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  setScheduleRecords: (records) => set((s) => {
    const newState = { scheduleRecords: records };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  addScheduleRecord: (record) => set((s) => {
    const newState = { scheduleRecords: [record, ...s.scheduleRecords] };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  updateScheduleRecord: (id, patch) => set((s) => {
    const newState = { scheduleRecords: updateInArray(s.scheduleRecords, id, patch) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  deleteScheduleRecord: (id) => set((s) => {
    const newState = { scheduleRecords: s.scheduleRecords.filter(r => r.id !== id) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  setHappinessRecords: (records) => set((s) => {
    const newState = { happinessRecords: records };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  addHappinessRecord: (record) => set((s) => {
    const newState = { happinessRecords: [record, ...s.happinessRecords] };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  updateHappinessRecord: (id, patch) => set((s) => {
    const newState = { happinessRecords: updateInArray(s.happinessRecords, id, patch) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  deleteHappinessRecord: (id) => set((s) => {
    const newState = { happinessRecords: s.happinessRecords.filter(r => r.id !== id) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),

  /* ── 天赋 & 模式 ── */
  updateTalentScore: (id, score) => set((s) => {
    const newState = { talents: s.talents.map(t => t.id === id ? { ...t, score } : t) };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),

  setOwnerModeInStore: (on: boolean) => set({ ownerMode: on }),

  /* ── 慧府10格 ── */
  setReadingSlots: (slots) => set((s) => {
    const newState = { readingSlots: slots };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),
  setBrokenSlots: (slots) => set((s) => {
    const newState = { brokenSlots: slots };
    if (s.ownerMode) saveOwnerDataNow({ ...s, ...newState });
    return newState;
  }),

  /* ── 数据管理 ── */
  exportData: () => {
    const s = get();
    return {
      version: 6,
      exportedAt: new Date().toISOString(),
      talents: s.talents,
      fitnessTests: s.fitnessTests,
      workouts: s.workouts,
      books: s.books,
      yearSummaries: s.yearSummaries,
      articles: s.articles,
      skills: s.skills,
      hobbies: s.hobbies,
      schedules: s.schedules,
      happiness: s.happiness,
      scheduleRecords: s.scheduleRecords,
      happinessRecords: s.happinessRecords,
      traits: s.traits,
      readingSlots: s.readingSlots,
      brokenSlots: s.brokenSlots,
    };
  },

  importData: (snapshot) => {
    try {
      if (!snapshot || typeof snapshot !== 'object') {
        return { success: false, message: '导入数据格式错误' };
      }
      const keys = ['talents', 'fitnessTests', 'workouts', 'books', 'yearSummaries', 'articles', 'skills', 'hobbies', 'schedules', 'happiness', 'scheduleRecords', 'happinessRecords', 'traits'];
      for (const k of keys) {
        if (!Array.isArray((snapshot as any)[k])) {
          return { success: false, message: `字段 ${k} 缺失` };
        }
      }
      set({
        talents: snapshot.talents,
        fitnessTests: snapshot.fitnessTests,
        workouts: snapshot.workouts,
        books: snapshot.books,
        yearSummaries: snapshot.yearSummaries,
        articles: snapshot.articles,
        skills: snapshot.skills,
        hobbies: snapshot.hobbies,
        schedules: snapshot.schedules,
        happiness: snapshot.happiness,
        scheduleRecords: snapshot.scheduleRecords,
        happinessRecords: snapshot.happinessRecords,
        traits: snapshot.traits,
        readingSlots: (snapshot as any).readingSlots || Array(10).fill(null),
        brokenSlots: (snapshot as any).brokenSlots || [],
      });
      const s = get();
      saveOwnerDataNow({
        talents: s.talents,
        fitnessTests: s.fitnessTests,
        workouts: s.workouts,
        books: s.books,
        yearSummaries: s.yearSummaries,
        articles: s.articles,
        skills: s.skills,
        hobbies: s.hobbies,
        schedules: s.schedules,
        happiness: s.happiness,
        scheduleRecords: s.scheduleRecords,
        happinessRecords: s.happinessRecords,
        traits: s.traits,
        readingSlots: s.readingSlots,
        brokenSlots: s.brokenSlots,
      });
      return { success: true, message: '导入成功' };
    } catch (e) {
      return { success: false, message: `导入失败: ${String(e)}` };
    }
  },

  clearAllData: () => {
    set({ ...defaultEmptyData, ownerMode: isOwnerMode() });
  },

}));

/* ─── 自动保存（主人模式） ────────────────────────────────────────────────── */

let _prevOwnerMode = isOwnerMode();
let _initialSaveDone = false;

useStore.subscribe((state) => {
  if (state.ownerMode !== _prevOwnerMode) {
    _prevOwnerMode = state.ownerMode;
    if (!state.ownerMode) {
      try { localStorage.removeItem(OWNER_DATA_KEY); } catch { /* ignore */ }
    }
    return;
  }

  if (!state.ownerMode) return;
  
  if (!_initialSaveDone) {
    _initialSaveDone = true;
    saveOwnerDataNow({
      talents: state.talents,
      fitnessTests: state.fitnessTests,
      workouts: state.workouts,
      books: state.books,
      yearSummaries: state.yearSummaries,
      articles: state.articles,
      skills: state.skills,
      hobbies: state.hobbies,
      schedules: state.schedules,
      happiness: state.happiness,
      scheduleRecords: state.scheduleRecords,
      happinessRecords: state.happinessRecords,
      traits: state.traits,
      readingSlots: state.readingSlots,
      brokenSlots: state.brokenSlots,
    });
    return;
  }
  
  scheduleOwnerSave({
    talents: state.talents,
    fitnessTests: state.fitnessTests,
    workouts: state.workouts,
    books: state.books,
    yearSummaries: state.yearSummaries,
    articles: state.articles,
    skills: state.skills,
    hobbies: state.hobbies,
    schedules: state.schedules,
    happiness: state.happiness,
    scheduleRecords: state.scheduleRecords,
    happinessRecords: state.happinessRecords,
    traits: state.traits,
    readingSlots: state.readingSlots,
    brokenSlots: state.brokenSlots,
  });
});
