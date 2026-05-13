
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
    ownerMode: isOwnerMode(),
  };

  // 辅助函数：无操作（线上只读）
  const noop = () => {
    console.log('线上模式：数据编辑功能仅在本地开发环境可用');
  };

  return {
    ...initialState,

    // 权限控制
    setOwnerModeInStore: (on: boolean) => set({ ownerMode: on }),

    // 所有修改操作都是无操作，保持只读
    addWorkout: noop,
    updateWorkout: noop,
    deleteWorkout: noop,
    addFitnessTest: noop,
    updateFitnessTest: noop,
    deleteFitnessTest: noop,
    addBook: noop,
    updateBook: noop,
    deleteBook: noop,
    updateBookThoughts: noop,
    addYearSummary: noop,
    updateYearSummary: noop,
    deleteYearSummary: noop,
    addArticle: noop,
    updateArticle: noop,
    deleteArticle: noop,
    addTrait: noop,
    updateTrait: noop,
    deleteTrait: noop,
    addSkill: noop,
    updateSkill: noop,
    deleteSkill: noop,
    addHobby: noop,
    updateHobby: noop,
    deleteHobby: noop,
    addSchedule: noop,
    updateSchedule: noop,
    deleteSchedule: noop,
    addHappiness: noop,
    updateHappiness: noop,
    deleteHappiness: noop,
    setScheduleRecords: noop,
    addScheduleRecord: noop,
    updateScheduleRecord: noop,
    deleteScheduleRecord: noop,
    setHappinessRecords: noop,
    addHappinessRecord: noop,
    updateHappinessRecord: noop,
    deleteHappinessRecord: noop,
    updateTalentScore: noop,
    setReadingSlots: noop,
    setBrokenSlots: noop,

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

    importData: (data) => {
      return { 
        success: false, 
        message: '线上模式：数据导入功能仅在本地开发环境可用，请编辑 staticData.ts 文件' 
      };
    },

    clearAllData: () => {
      console.log('线上模式：数据清空功能仅在本地开发环境可用');
    }
  };
});
