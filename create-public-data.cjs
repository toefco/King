
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'restore-data.json'), 'utf8'));

// 创建 data.js
const jsContent = `
window.restoreDataObj = ${JSON.stringify(data)};

console.log('🚀 恢复数据已加载！');
console.log('  书籍数量:', window.restoreDataObj.books?.length || 0);
console.log('  运动记录:', window.restoreDataObj.workouts?.length || 0);
console.log('  第一本书:', window.restoreDataObj.books?.[0]?.title || '无');
console.log('  第一本书状态:', window.restoreDataObj.books?.[0]?.status || '无');

document.getElementById('bookCount').textContent = ${data.books?.length || 0};
document.getElementById('workoutCount').textContent = ${data.workouts?.length || 0};

function restoreData() {
  const OWNER_DATA_KEY = 'talent-showcase-owner-data';
  
  try {
    console.log('📝 正在设置 localStorage...');
    localStorage.setItem(OWNER_DATA_KEY, JSON.stringify(window.restoreDataObj));
    console.log('✅ localStorage 设置成功！');
    
    const verifyData = localStorage.getItem(OWNER_DATA_KEY);
    if (verifyData) {
      const parsed = JSON.parse(verifyData);
      console.log('📊 验证数据:');
      console.log('  书籍数量:', parsed.books?.length || 0);
      console.log('  运动记录:', parsed.workouts?.length || 0);
    }
    
    const statusEl = document.getElementById('status');
    statusEl.style.display = 'block';
    statusEl.innerHTML = \`
      <div style="color: #22c55e; font-size: 18px; font-weight: bold;">
        ✅ 数据恢复成功！
      </div>
      <div style="margin-top: 12px;">
        <a href="./" style="color: #60a5fa; font-size: 16px; text-decoration: underline;">
          👉 点击这里去应用首页查看
        </a>
      </div>
    \`;
    
    console.log('数据恢复成功！');
    console.log('书籍:', window.restoreDataObj.books?.length);
    console.log('运动:', window.restoreDataObj.workouts?.length);
  } catch (e) {
    console.error('❌ 恢复失败:', e);
    alert('恢复失败: ' + e.message);
  }
}
`;

fs.writeFileSync(path.join(__dirname, 'public', 'restore-data.js'), jsContent);

// 现在更新 restore-data.html
let html = fs.readFileSync(path.join(__dirname, 'public', 'restore-data.html'), 'utf8');
html = html.replace(
  '<script src="restore-data.js"></script>',
  '<script src="restore-data.js"></script>'
);

fs.writeFileSync(path.join(__dirname, 'public', 'restore-data.html'), html);

console.log('✅ 文件已创建在 public/restore-data.html 和 public/restore-data.js');
console.log('请访问 http://localhost:5186/restore-data.html 来恢复数据！');
