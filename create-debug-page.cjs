
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'restore-data.json'), 'utf8'));

const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>调试和恢复数据</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
    }
    .container {
      background: rgba(30, 41, 59, 0.9);
      border-radius: 16px;
      padding: 30px;
    }
    h1 { margin-top: 0; }
    .box {
      background: rgba(0,0,0,0.3);
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }
    .success { border-left: 4px solid #22c55e; }
    .warning { border-left: 4px solid #eab308; }
    .error { border-left: 4px solid #ef4444; }
    pre {
      background: rgba(0,0,0,0.3);
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      max-height: 300px;
      overflow-y: auto;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      margin: 4px;
      font-size: 16px;
    }
    button.danger { background: #ef4444; }
    button.success { background: #22c55e; font-weight: bold; font-size: 18px; padding: 16px 32px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px; }
    .stat { background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; text-align: center; }
    .stat-num { font-size: 28px; font-weight: bold; color: #60a5fa; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 调试和恢复数据</h1>
    
    <div id="status"></div>
    
    <div class="box">
      <h3>我们要恢复的数据</h3>
      <div class="stats">
        <div class="stat">
          <div class="stat-num">${data.books?.length || 0}</div>
          <div>本书籍</div>
        </div>
        <div class="stat">
          <div class="stat-num">${data.workouts?.length || 0}</div>
          <div>条运动记录</div>
        </div>
      </div>
    </div>
    
    <div class="box">
      <h3>当前 localStorage 状态</h3>
      <div id="currentStatus"></div>
    </div>
    
    <div style="margin-top:24px; text-align: center;">
      <button class="success" onclick="restoreData()">🚀 恢复正确数据</button>
      <button onclick="checkLocalStorage()">检查当前状态</button>
      <button class="danger" onclick="clearData()">清空数据</button>
    </div>
    
    <div class="box" style="margin-top: 24px;">
      <h3>完整数据预览</h3>
      <pre>${JSON.stringify(data, null, 2).substring(0, 8000)}...</pre>
    </div>
  </div>

  <script>
    const correctData = ${JSON.stringify(data)};
    
    function checkLocalStorage() {
      const statusEl = document.getElementById('currentStatus');
      const allKeys = Object.keys(localStorage);
      
      const ownerData = localStorage.getItem('talent-showcase-owner-data');
      
      if (ownerData) {
        try {
          const parsed = JSON.parse(ownerData);
          statusEl.innerHTML = \`
            <div style="color:#22c55e;">✅ 有数据！</div>
            <div>书籍: \${parsed.books?.length || 0} 本</div>
            <div>运动: \${parsed.workouts?.length || 0} 条</div>
            <br>
            <div style="font-size:12px; opacity:0.7;">Keys: \${JSON.stringify(allKeys)}</div>
          \`;
        } catch(e) {
          statusEl.innerHTML = '<div style="color:#ef4444;">❌ 数据损坏: ' + e.message + '</div>';
        }
      } else {
        statusEl.innerHTML = '<div style="color:#eab308;">⚠️ 无数据</div><div style="font-size:12px; opacity:0.7;">Keys: ' + JSON.stringify(allKeys) + '</div>';
      }
    }
    
    function restoreData() {
      localStorage.setItem('talent-showcase-owner-data', JSON.stringify(correctData));
      alert('✅ 数据已恢复！请刷新你的应用页面！');
      checkLocalStorage();
    }
    
    function clearData() {
      if (confirm('确定要清空数据吗？')) {
        localStorage.removeItem('talent-showcase-owner-data');
        checkLocalStorage();
      }
    }
    
    // 页面加载时检查
    checkLocalStorage();
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'debug-and-restore.html'), html);
console.log('✅ debug-and-restore.html 已创建！');
console.log('请在浏览器中访问 http://localhost:8080/debug-and-restore.html');
