
// 从服务器备份中读取数据并导入到 localStorage
// 使用方法：在浏览器控制台中执行或在页面中加载此脚本

// 读取服务器备份数据
import fs from 'fs';
import path from 'path';

try {
  const userDataPath = path.join(process.cwd(), 'server/data/userData.json');
  const userDataRaw = fs.readFileSync(userDataPath, 'utf8');
  const userData = JSON.parse(userDataRaw);
  
  // 获取第一个用户的数据
  const userKey = Object.keys(userData)[0];
  const data = userData[userKey].data;
  
  console.log('=== 备份数据 ===');
  console.log('导出时间:', data.exportedAt);
  console.log('书籍数量:', data.books?.length || 0);
  console.log('运动记录:', data.workouts?.length || 0);
  console.log('================');
  
  // 生成可以直接在浏览器控制台粘贴的脚本
  const localStorageData = {
    'kingou-persist': JSON.stringify(data),
    'kingou-persist-version': '1',
    'kingou-persist-timestamp': Date.now()
  };
  
  console.log('');
  console.log('=== 在浏览器控制台粘贴以下代码 ===');
  console.log('');
  console.log('(function() {');
  console.log('  try {');
  for (const [key, value] of Object.entries(localStorageData)) {
    console.log(`    localStorage.setItem('${key}', ${JSON.stringify(value).replace(/'/g, "\\'")});`);
  }
  console.log('    console.log("✅ 数据导入成功！请刷新页面。");');
  console.log('  } catch(e) {');
  console.log('    console.error("❌ 数据导入失败:", e);');
  console.log('  }');
  console.log('})();');
  console.log('');
  
} catch (err) {
  console.error('读取数据失败:', err);
}
