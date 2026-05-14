const fs = require('fs');
const path = require('path');

const STORAGE_KEY = 'talent-showcase-local-data';

// 读取 localStorage 数据（模拟浏览器中的 localStorage）
function loadLocalStorage() {
  const storagePath = path.join(__dirname, '.localstorage-backup.json');
  if (fs.existsSync(storagePath)) {
    try {
      const content = fs.readFileSync(storagePath, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      console.error('读取备份文件失败:', e);
      return null;
    }
  }
  return null;
}

// 从浏览器运行时获取数据的模拟方式
// 实际数据应该从浏览器 localStorage 获取
// 这里我们创建一个脚本来生成最新的 staticData.ts

// 读取当前的 staticData.ts 作为基础结构
const staticDataPath = path.join(__dirname, 'src/data/staticData.ts');
const staticDataContent = fs.readFileSync(staticDataPath, 'utf8');

// 提取现有的数据结构
const match = staticDataContent.match(/export const staticData = (\{[\s\S]+\});/);
if (!match) {
  console.error('无法解析 staticData.ts');
  process.exit(1);
}

const currentData = JSON.parse(match[1]);

// 打印当前数据统计
console.log('=== 当前 staticData.ts 数据统计 ===');
console.log('talents:', currentData.talents?.length || 0);
console.log('fitnessTests:', currentData.fitnessTests?.length || 0);
console.log('workouts:', currentData.workouts?.length || 0);
console.log('books:', currentData.books?.length || 0);
console.log('yearSummaries:', currentData.yearSummaries?.length || 0);
console.log('articles:', currentData.articles?.length || 0);
console.log('skills:', currentData.skills?.length || 0);
console.log('hobbies:', currentData.hobbies?.length || 0);
console.log('schedules:', currentData.schedules?.length || 0);
console.log('happiness:', currentData.happiness?.length || 0);
console.log('scheduleRecords:', currentData.scheduleRecords?.length || 0);
console.log('happinessRecords:', currentData.happinessRecords?.length || 0);
console.log('traits:', currentData.traits?.length || 0);
console.log('readingSlots:', currentData.readingSlots?.length || 0);

// 由于无法直接访问浏览器 localStorage，我们创建一个 HTML 页面让用户导出
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>导出 localStorage 数据</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .success { color: green; font-weight: bold; }
  </style>
</head>
<body>
  <h1>导出 localStorage 数据</h1>
  <button onclick="exportData()">导出数据到 staticData.ts</button>
  <div id="result"></div>
  <pre id="output"></pre>

  <script>
    async function exportData() {
      const storageKey = 'talent-showcase-local-data';
      const data = localStorage.getItem(storageKey);
      
      if (!data) {
        document.getElementById('result').innerHTML = '<p class="success">localStorage 中没有数据</p>';
        return;
      }
      
      const parsedData = JSON.parse(data);
      
      // 创建新的 staticData.ts 内容
      const newContent = \`// 完整的静态数据 - 自动导出于 \${new Date().toISOString()}
export const staticData = \${JSON.stringify(parsedData, null, 2)};\`;
      
      // 下载文件
      const blob = new Blob([newContent], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'staticData.ts';
      a.click();
      URL.revokeObjectURL(url);
      
      document.getElementById('result').innerHTML = '<p class="success">✅ 数据已导出！请将下载的文件替换 src/data/staticData.ts</p>';
      document.getElementById('output').textContent = JSON.stringify(parsedData, null, 2).slice(0, 5000) + '...';
      
      // 同时保存到服务器（如果有后端）
      fetch('/api/save-static-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      }).catch(() => {});
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'export-localstorage.html'), htmlContent);
console.log('已创建导出页面: export-localstorage.html');
console.log('请在浏览器中打开此页面并点击导出按钮');
