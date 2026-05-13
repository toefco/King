const fs = require('fs');
const path = require('path');

console.log('📦 准备最终恢复数据...\n');

// 读取正确的数据
const correctDataPath = path.join(__dirname, 'final-correct-data.json');
const correctRaw = fs.readFileSync(correctDataPath, 'utf8');
const correctData = JSON.parse(correctRaw);

// 提取数据内容
const originalUserId = Object.keys(correctData)[0];
const data = correctData[originalUserId].data;

console.log('✅ 读取到完整数据');
console.log(`   书籍: ${data.books.length} 本 (都有图片)`);
console.log(`   运动记录: ${data.workouts.length} 条`);

// 1. 更新 server/data/userData.json，使用正确的用户ID
const targetUserId = 'user_mp3sb595owl3pyqqx9o';
const serverData = {
  [targetUserId]: {
    data: data
  }
};

fs.writeFileSync(
  path.join(__dirname, 'server', 'data', 'userData.json'),
  JSON.stringify(serverData, null, 2)
);
console.log('\n✅ server/data/userData.json 已更新!');

// 2. 同时保存一个直接格式的数据到 restore-data.json，方便恢复
const directData = data;
fs.writeFileSync(
  path.join(__dirname, 'restore-data.json'),
  JSON.stringify(directData, null, 2)
);
console.log('✅ restore-data.json 已创建 (直接格式)!');

// 3. 创建一个简单的一键恢复HTML页面
const restoreHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>一键恢复数据</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      min-height: 100vh;
    }
    .container {
      background: rgba(30, 41, 59, 0.8);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    h1 {
      text-align: center;
      font-size: 2rem;
      margin-bottom: 20px;
    }
    .info {
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.4);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .success {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.4);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      display: none;
    }
    .error {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      display: none;
    }
    button {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      padding: 16px 40px;
      font-size: 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
      font-weight: 600;
      transition: all 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }
    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #60a5fa;
    }
    .stat-label {
      color: rgba(255, 255, 255, 0.7);
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>✨ 一键恢复数据</h1>
    
    <div class="info">
      <strong>说明：</strong>点击下方按钮将完整恢复你的所有数据（包括 20 本书籍的封面图和数据图，18 条运动记录）到浏览器本地存储中。恢复完成后，请刷新你的应用页面查看数据。
    </div>
    
    <div class="success" id="successBox">
      <strong>✅ 恢复成功！</strong> 数据已恢复，请<a href="http://localhost:5173" target="_blank" style="color: #60a5fa; text-decoration: underline;">点击这里</a>或手动刷新应用页面查看。
    </div>
    
    <div class="error" id="errorBox">
      <strong>❌ 恢复失败！</strong> <span id="errorMsg"></span>
    </div>
    
    <button id="restoreBtn" onclick="restoreData()">
      🚀 立即恢复数据
    </button>
    
    <div class="stats" id="statsBox" style="display: none;">
      <div class="stat-card">
        <div class="stat-number" id="statBooks">0</div>
        <div class="stat-label">本书籍</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" id="statWorkouts">0</div>
        <div class="stat-label">条运动记录</div>
      </div>
    </div>
  </div>

  <script>
    // 完整的恢复数据
    const restoreDataObj = ${JSON.stringify(directData)};
    
    async function restoreData() {
      const btn = document.getElementById('restoreBtn');
      const successBox = document.getElementById('successBox');
      const errorBox = document.getElementById('errorBox');
      const statsBox = document.getElementById('statsBox');
      
      btn.disabled = true;
      btn.textContent = '⏳ 正在恢复...';
      successBox.style.display = 'none';
      errorBox.style.display = 'none';
      
      try {
        const OWNER_DATA_KEY = 'talent-showcase-owner-data';
        
        // 保存到 localStorage
        localStorage.setItem(OWNER_DATA_KEY, JSON.stringify(restoreDataObj));
        
        // 显示成功信息
        successBox.style.display = 'block';
        statsBox.style.display = 'grid';
        document.getElementById('statBooks').textContent = restoreDataObj.books?.length || 0;
        document.getElementById('statWorkouts').textContent = restoreDataObj.workouts?.length || 0;
        
        btn.textContent = '✅ 恢复完成！';
        
        console.log('🎉 数据恢复成功！');
        console.log('📚 书籍数量:', restoreDataObj.books?.length);
        console.log('🏃 运动记录:', restoreDataObj.workouts?.length);
        
      } catch (e) {
        console.error('恢复失败:', e);
        errorBox.style.display = 'block';
        document.getElementById('errorMsg').textContent = e.message;
        btn.textContent = '❌ 恢复失败，请重试';
        btn.disabled = false;
      }
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(
  path.join(__dirname, 'one-click-final-restore.html'),
  restoreHtml
);
console.log('\n✅ one-click-final-restore.html 已创建!');
console.log('\n🎉 全部完成！请在浏览器中打开 one-click-final-restore.html 进行恢复！');
