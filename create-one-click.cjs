const fs = require('fs');

// 读取备份文件
const raw = fs.readFileSync('server/data/userData.json', 'utf-8');
const data = JSON.parse(raw);

// 获取用户数据
const userData = data['user_mp3sb595owl3pyqqx9o']?.data;

if (!userData) {
    console.error('未找到用户数据');
    process.exit(1);
}

console.log('=== 数据统计 ===');
console.log('书籍:', userData.books?.length || 0);
console.log('运动:', userData.workouts?.length || 0);

// 创建HTML文件，把数据直接嵌入进去
const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>一键恢复所有数据</title>
</head>
<body style="font-family: Arial; padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
    <div style="background: white; border-radius: 20px; padding: 40px; max-width: 600px; margin: 0 auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        <h1 style="color: #333;">✨ 一键恢复</h1>
        <p style="color: #666; margin: 20px 0;">恢复你的完整数据！</p>
        
        <div style="background: #e8f5e9; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: left;">
            <h3 style="color: #2e7d32;">数据统计：</h3>
            <p>📚 书籍：${userData.books?.length || 0} 本</p>
            <p>🏋️ 运动：${userData.workouts?.length || 0} 条</p>
            <p>📦 完整恢复，包括图片！</p>
        </div>
        
        <button onclick="restore()" id="restoreBtn" style="padding: 20px 40px; font-size: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; cursor: pointer;">
            🚀 一键恢复所有数据
        </button>
        
        <p id="status" style="margin-top: 20px; color: #666;">点击恢复按钮开始</p>
    </div>

    <script>
        // 数据直接嵌入在这里
        const fullData = ${JSON.stringify(userData)};
        
        function restore() {
            const btn = document.getElementById('restoreBtn');
            const status = document.getElementById('status');
            
            btn.disabled = true;
            status.textContent = '正在恢复数据...';
            
            try {
                localStorage.setItem('talent-showcase-owner-data', JSON.stringify(fullData));
                status.innerHTML = '<span style="color: #2e7d32; font-weight: bold;">✅ 成功！正在跳转...</span>';
                
                setTimeout(() => {
                    window.location.href = 'http://localhost:5185/';
                }, 1000);
            } catch (e) {
                status.innerHTML = '<span style="color: red;">❌ 失败: ' + e.message + '</span>';
                btn.disabled = false;
            }
        }
        
        // 自动执行
        window.onload = function() {
            setTimeout(restore, 500);
        };
    </script>
</body>
</html>`;

fs.writeFileSync('one-click-restore.html', htmlContent, 'utf-8');
console.log('\n✅ 已创建: one-click-restore.html');
console.log('请在浏览器中打开: file:///D:/kingou/one-click-restore.html');
