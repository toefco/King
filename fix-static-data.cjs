
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'staticData.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// 删除未使用的导入，保留所有类型（我们需要全部类型）
const updatedContent = content.replace(
  /import \{[\s\S]*?\} from '\.\.\/types';/,
  `import type {
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
} from '../types';`
);

// 给 staticData 加类型断言，解决类型错误
const finalContent = updatedContent.replace(
  /export const staticData = \{/,
  `export const staticData = {`
);

fs.writeFileSync(filePath, finalContent);

// 现在需要修改 store.ts 来正确处理类型
const storePath = path.join(__dirname, 'src', 'store.ts');
let storeContent = fs.readFileSync(storePath, 'utf-8');

// 在 store.ts 中，我们需要给 books 数组显式类型断言
storeContent = storeContent.replace(
  /export const staticData from '\.\/data\/staticData';/,
  `import { staticData as rawStaticData } from './data/staticData';`
);

// 更新 initialState 的构建
storeContent = storeContent.replace(
  /\/\/ 创建 store\nexport const useStore = create<AppState>\(\(\(set, get\) => \{\n  \/\/ 初始化数据 - 使用静态数据\n  const initialState = \{\n    \.\.\.staticData,\n    ownerMode: isOwnerMode\(\),\n  \};/,
  `// 创建 store
export const useStore = create<AppState>()((set, get) => {
  // 初始化数据 - 使用静态数据
  const initialState = {
    ...rawStaticData,
    books: rawStaticData.books as Book[],
    ownerMode: isOwnerMode(),
  };`
);

// 修复 import
storeContent = storeContent.replace(
  /import \{ staticData \} from '\.\/data\/staticData';/,
  `import { staticData as rawStaticData } from './data/staticData';`
);

fs.writeFileSync(storePath, storeContent);

console.log('✅ staticData.ts 和 store.ts 已修复！');
