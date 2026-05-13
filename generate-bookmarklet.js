import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取备份数据
const backupPath = path.join(__dirname, 'server/data/userData.json');
const backupContent = fs.readFileSync(backupPath, 'utf-8');
const backupData = JSON.parse(backupContent);

// 获取用户数据
const userData = backupData['user_mp3sb595owl3pyqqx9o'].data;

// 输出信息
console.log('=== 数据恢复方案 ===\n');
console.log(`📚 书籍数量: ${userData.books.length}`);
console.log(`🏋️ 运动记录: ${userData.workouts.length}`);
console.log('\n请在浏览器中打开以下地址：\n');
console.log('http://localhost:3002/');
console.log('\n然后在浏览器控制台（F12）中执行以下代码：\n');

const jsCode = `
// 从服务器获取数据并恢复
fetch('http://localhost:3002/api/data/user_mp3sb595owl3pyqqx9o')
  .then(r => r.json())
  .then(data => {
    localStorage.setItem('talent-showcase-owner-data', JSON.stringify(data.data));
    alert('✅ 数据恢复成功！请刷新页面');
    location.reload();
  })
  .catch(err => alert('❌ 失败: ' + err));
`.trim();

console.log(jsCode);
