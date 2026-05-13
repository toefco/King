
const fs = require('fs');
const path = require('path');

// 读取完整数据
const restoreDataPath = path.join(__dirname, 'restore-data.json');
const restoreData = JSON.parse(fs.readFileSync(restoreDataPath, 'utf8'));

// 读取当前的 staticData.ts 模板
const templatePath = path.join(__dirname, 'src', 'data', 'staticData.ts');
let templateContent = fs.readFileSync(templatePath, 'utf8');

// 构建完整的数据内容
const staticDataContent = `
import {
  Talent,
  FitnessTest,
  Workout,
  Book,
  YearSummary,
  Article,
  Skill,
  Hobby,
  Schedule,
  ScheduleRecord,
  HappinessRecord,
  Happiness,
  Trait
} from '../types';

// 完整的静态数据
export const staticData = {
  talents: [
    { id: '1', name: '体魄', score: 85, icon: 'BicepsFlexed', description: '强健的体魄是人生的基石' },
    { id: '2', name: '智慧', score: 78, icon: 'Brain', description: '知识是心灵的光明' },
    { id: '3', name: '精神', score: 82, icon: 'Sparkles', description: '精神的富足超越物质' },
    { id: '4', name: '技艺', score: 90, icon: 'Sword', description: '技艺精湛，炉火纯青' },
    { id: '5', name: '爱好', score: 88, icon: 'Heart', description: '热爱生活，享受当下' },
    { id: '6', name: '时间', score: 75, icon: 'Clock', description: '珍惜每分每秒' },
  ],
  fitnessTests: ${JSON.stringify(restoreData.fitnessTests || [])},
  workouts: ${JSON.stringify(restoreData.workouts || [])},
  books: ${JSON.stringify(restoreData.books || [], null, 2)},
  yearSummaries: ${JSON.stringify(restoreData.yearSummaries || [])},
  articles: ${JSON.stringify(restoreData.articles || [])},
  skills: ${JSON.stringify(restoreData.skills || [])},
  hobbies: ${JSON.stringify(restoreData.hobbies || [])},
  schedules: ${JSON.stringify(restoreData.schedules || [])},
  happiness: ${JSON.stringify(restoreData.happiness || [])},
  scheduleRecords: ${JSON.stringify(restoreData.scheduleRecords || [])},
  happinessRecords: ${JSON.stringify(restoreData.happinessRecords || [])},
  traits: ${JSON.stringify(restoreData.traits || [])},
  readingSlots: ${JSON.stringify(restoreData.readingSlots || Array(10).fill(null))},
  brokenSlots: ${JSON.stringify(restoreData.brokenSlots || [])}
};
`;

// 写入文件
fs.writeFileSync(templatePath, staticDataContent);

console.log('✅ 完整的静态数据已生成！');
console.log('📦 数据包含：');
console.log(`   - ${(restoreData.books || []).length} 本书籍（含完整图片）`);
console.log(`   - ${(restoreData.workouts || []).length} 条运动记录`);
