export interface Trait {
  id: string;
  text: string;       // 特质描述
  createdAt: string;  // YYYY-MM-DD
}

export interface Talent {
  id: string;
  name: string;
  score: number;
  icon: string;
  description: string;
}

export interface FitnessTest {
  id: string;
  date: string;
  type: 'balance' | 'flexibility' | 'core' | 'cardio' | 'breathing';
  value: number;
  value2?: number;
  unit: string;
}

export interface Workout {
  id: string;
  date: string;
  exercise: string;
  weight: number;
  sets: number;
  reps: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  coverLink?: string;
  dataUrl?: string;
  dataLink?: string;
  status: 'reading' | 'completed' | 'planned';
  readDate?: string;
  thoughts?: string;
  totalHours?: number;
  totalMinutes?: number;
  readingDays?: number;
  maxDailyHours?: number;
  maxDailyMinutes?: number;
}

export interface ReadingSlotObject {
  id: string;
  imageUrl: string;
  imageLink?: string;
  totalYears?: number;
  totalHours?: number;
  totalMinutes?: number;
  totalBooks?: number;
  readingDays?: number;
}

export type ReadingSlot = ReadingSlotObject | string;

export interface YearSummary {
  id: string;
  year: string;
  imageUrl: string;
  imageLink?: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  publishDate: string;
}

export interface Skill {
  id: string;
  type: 'sword' | 'boxing' | 'nunchaku' | 'calligraphy';
  title: string;
  videoUrl: string;
  coverUrl: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  date?: string;  // YYYY-MM-DD 成品归档日期（可选，历史记录无此字段）
}

export interface Hobby {
  id: string;
  type: 'music' | 'tea' | 'building' | 'gaming';
  title: string;
  content: string;
  date: string;
  milestone: boolean;
  imageUrl?: string;
  mediaType?: 'image' | 'video';
  coverUrl?: string;
}

export interface Schedule {
  id: string;
  date: string;
  timeSlot: string;
  activity: string;
}

export interface ScheduleRecord {
  id: string;
  date: string;     // YYYY-MM-DD
  duration: number; // minutes
  category: string;
}

export interface HappinessRecord {
  id: string;
  date: string;     // YYYY-MM-DD
  event: string;    // 事件描述
  sensory: number;  // 感官感觉度 1-10
  memory: number;   // 记忆留存度 1-10
  soul: number;     // 灵魂触动度 1-10
  growth: number;   // 自我成长度 1-10
  social: number;   // 人际连接度 1-10
}

export interface Happiness {
  id: string;
  date: string;
  event: string;
  level: number;
}
