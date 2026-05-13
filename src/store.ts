
import { create } from 'zustand';
import { Talent, FitnessTest, Workout, Book, YearSummary, Article, Skill, Hobby, Schedule, ScheduleRecord, HappinessRecord, Happiness, Trait } from './types';
import { staticData } from './data/staticData';

// 主人模式检测
export function isOwnerMode(): boolean {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

// 状态类型定义
interface AppState {
  // 权限相关
  ownerMode: boolean;
  setOwnerModeInStore: (on: boolean) => void;
  
  // 数据 - 只读
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
  
  // 只读操作（所有编辑操作在本地完成，线上只展示）
  // 保留接口，但实际不改变静态数据
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
  setReadingSlots: (slots: (string | null)[]) => void;
  setBrokenSlots: (slots: number[]) => void;
  
  // 数据管理
  exportData: () => any;
  importData: (data: any) => { success: boolean; message: string };
  clearAllData: () => void;
}

// 创建 store
export const useStore = create<AppState>()((set, get) => {
  // 初始化数据 - 使用静态数据
  const initialState = {
    ...staticData,
    books: staticData.books as Book[],
    ownerMode: isOwnerMode(),
  };

  // 辅助函数：无操作（线上只读）
  const noop = () => {
    console.log('线上模式：数据编辑功能仅在本地开发环境可用');
  };

  // 检测是否是主人模式
  const isOwner = () => get().ownerMode;

  // 主人模式下的真实实现，线上模式为noop
  const createAction = <T extends (...args: any[]) => any>(ownerAction: T): T => {
    return ((...args: any[]) => {
      if (isOwner()) {
        return (ownerAction as any)(...args);
      } else {
        noop();
      }
    }) as T;
  };

  return {
    ...initialState,

    // 权限控制
    setOwnerModeInStore: (on: boolean) => set({ ownerMode: on }),

    // 健身模块
    addWorkout: createAction((workout: Workout) => 
      set((state) => ({ workouts: [...state.workouts, workout] }))
    ),
    updateWorkout: createAction((id: string, patch: Partial<Workout>) => 
      set((state) => ({ workouts: state.workouts.map(w => w.id === id ? { ...w, ...patch } : w) }))
    ),
    deleteWorkout: createAction((id: string) => 
      set((state) => ({ workouts: state.workouts.filter(w => w.id !== id) }))
    ),
    addFitnessTest: createAction((test: FitnessTest) => 
      set((state) => ({ fitnessTests: [...state.fitnessTests, test] }))
    ),
    updateFitnessTest: createAction((id: string, patch: Partial<FitnessTest>) => 
      set((state) => ({ fitnessTests: state.fitnessTests.map(t => t.id === id ? { ...t, ...patch } : t) }))
    ),
    deleteFitnessTest: createAction((id: string) => 
      set((state) => ({ fitnessTests: state.fitnessTests.filter(t => t.id !== id) }))
    ),

    // 智慧模块
    addBook: createAction((book: Book) => 
      set((state) => ({ books: [...state.books, book] }))
    ),
    updateBook: createAction((id: string, patch: Partial<Book>) => 
      set((state) => ({ books: state.books.map(b => b.id === id ? { ...b, ...patch } : b) }))
    ),
    deleteBook: createAction((id: string) => 
      set((state) => ({ books: state.books.filter(b => b.id !== id) }))
    ),
    updateBookThoughts: createAction((id: string, thoughts: string) => 
      set((state) => ({ books: state.books.map(b => b.id === id ? { ...b, thoughts } : b) }))
    ),

    // 其他模块（全部实现基本功能）
    addYearSummary: createAction((summary: YearSummary) => 
      set((state) => ({ yearSummaries: [...state.yearSummaries, summary] }))
    ),
    updateYearSummary: createAction((id: string, patch: Partial<YearSummary>) => 
      set((state) => ({ yearSummaries: state.yearSummaries.map(y => y.id === id ? { ...y, ...patch } : y) }))
    ),
    deleteYearSummary: createAction((id: string) => 
      set((state) => ({ yearSummaries: state.yearSummaries.filter(y => y.id !== id) }))
    ),
    addArticle: createAction((article: Article) => 
      set((state) => ({ articles: [...state.articles, article] }))
    ),
    updateArticle: createAction((id: string, patch: Partial<Article>) => 
      set((state) => ({ articles: state.articles.map(a => a.id === id ? { ...a, ...patch } : a) }))
    ),
    deleteArticle: createAction((id: string) => 
      set((state) => ({ articles: state.articles.filter(a => a.id !== id) }))
    ),
    addTrait: createAction((trait: Trait) => 
      set((state) => ({ traits: [...state.traits, trait] }))
    ),
    updateTrait: createAction((id: string, patch: Partial<Trait>) => 
      set((state) => ({ traits: state.traits.map(t => t.id === id ? { ...t, ...patch } : t) }))
    ),
    deleteTrait: createAction((id: string) => 
      set((state) => ({ traits: state.traits.filter(t => t.id !== id) }))
    ),
    addSkill: createAction((skill: Skill) => 
      set((state) => ({ skills: [...state.skills, skill] }))
    ),
    updateSkill: createAction((id: string, patch: Partial<Skill>) => 
      set((state) => ({ skills: state.skills.map(s => s.id === id ? { ...s, ...patch } : s) }))
    ),
    deleteSkill: createAction((id: string) => 
      set((state) => ({ skills: state.skills.filter(s => s.id !== id) }))
    ),
    addHobby: createAction((hobby: Hobby) => 
      set((state) => ({ hobbies: [...state.hobbies, hobby] }))
    ),
    updateHobby: createAction((id: string, patch: Partial<Hobby>) => 
      set((state) => ({ hobbies: state.hobbies.map(h => h.id === id ? { ...h, ...patch } : h) }))
    ),
    deleteHobby: createAction((id: string) => 
      set((state) => ({ hobbies: state.hobbies.filter(h => h.id !== id) }))
    ),
    addSchedule: createAction((schedule: Schedule) => 
      set((state) => ({ schedules: [...state.schedules, schedule] }))
    ),
    updateSchedule: createAction((id: string, patch: Partial<Schedule>) => 
      set((state) => ({ schedules: state.schedules.map(s => s.id === id ? { ...s, ...patch } : s) }))
    ),
    deleteSchedule: createAction((id: string) => 
      set((state) => ({ schedules: state.schedules.filter(s => s.id !== id) }))
    ),
    addHappiness: createAction((happiness: Happiness) => 
      set((state) => ({ happiness: [...state.happiness, happiness] }))
    ),
    updateHappiness: createAction((id: string, patch: Partial<Happiness>) => 
      set((state) => ({ happiness: state.happiness.map(h => h.id === id ? { ...h, ...patch } : h) }))
    ),
    deleteHappiness: createAction((id: string) => 
      set((state) => ({ happiness: state.happiness.filter(h => h.id !== id) }))
    ),
    setScheduleRecords: createAction((records: ScheduleRecord[]) => 
      set({ scheduleRecords: records })
    ),
    addScheduleRecord: createAction((record: ScheduleRecord) => 
      set((state) => ({ scheduleRecords: [...state.scheduleRecords, record] }))
    ),
    updateScheduleRecord: createAction((id: string, patch: Partial<ScheduleRecord>) => 
      set((state) => ({ scheduleRecords: state.scheduleRecords.map(r => r.id === id ? { ...r, ...patch } : r) }))
    ),
    deleteScheduleRecord: createAction((id: string) => 
      set((state) => ({ scheduleRecords: state.scheduleRecords.filter(r => r.id !== id) }))
    ),
    setHappinessRecords: createAction((records: HappinessRecord[]) => 
      set({ happinessRecords: records })
    ),
    addHappinessRecord: createAction((record: HappinessRecord) => 
      set((state) => ({ happinessRecords: [...state.happinessRecords, record] }))
    ),
    updateHappinessRecord: createAction((id: string, patch: Partial<HappinessRecord>) => 
      set((state) => ({ happinessRecords: state.happinessRecords.map(r => r.id === id ? { ...r, ...patch } : r) }))
    ),
    deleteHappinessRecord: createAction((id: string) => 
      set((state) => ({ happinessRecords: state.happinessRecords.filter(r => r.id !== id) }))
    ),
    updateTalentScore: createAction((id: string, score: number) => 
      set((state) => ({ talents: state.talents.map(t => t.id === id ? { ...t, score } : t) }))
    ),
    setReadingSlots: createAction((slots: (string | null)[]) => 
      set({ readingSlots: slots })
    ),
    setBrokenSlots: createAction((slots: number[]) => 
      set({ brokenSlots: slots })
    ),

    // 数据管理功能
    exportData: () => {
      const state = get();
      return {
        version: 6,
        exportedAt: new Date().toISOString(),
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
      };
    },

    importData: createAction((data: any) => {
      if (data.version && data.books) {
        set({
          talents: data.talents || [],
          fitnessTests: data.fitnessTests || [],
          workouts: data.workouts || [],
          books: data.books || [],
          yearSummaries: data.yearSummaries || [],
          articles: data.articles || [],
          skills: data.skills || [],
          hobbies: data.hobbies || [],
          schedules: data.schedules || [],
          happiness: data.happiness || [],
          scheduleRecords: data.scheduleRecords || [],
          happinessRecords: data.happinessRecords || [],
          traits: data.traits || [],
          readingSlots: data.readingSlots || [],
          brokenSlots: data.brokenSlots || [],
        });
        return { success: true, message: '数据导入成功！' };
      }
      return { success: false, message: '无效的数据格式' };
    }),

    clearAllData: createAction(() => {
      set({
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
      });
    })
  };
});
