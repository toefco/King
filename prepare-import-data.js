
const fs = require('fs');
const path = require('path');

try {
  const backupPath = path.join(__dirname, 'server/data/userData.json');
  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  
  const userKey = Object.keys(backupData)[0];
  const appData = backupData[userKey].data;
  
  console.log('=== 备份数据信息 ===');
  console.log('导出时间:', appData.exportedAt);
  console.log('书籍数量:', appData.books?.length || 0);
  console.log('运动记录:', appData.workouts?.length || 0);
  console.log('===================');
  
  const outputPath = path.join(__dirname, 'import-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(appData, null, 2));
  console.log('\n✅ 数据已准备好，保存在: import-data.json');
  console.log('你可以通过应用的数据导入功能导入这个文件');
  
} catch (err) {
  console.error('错误:', err);
}
