import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
    // 读取备份数据
    const backupPath = path.join(__dirname, 'server/data/userData.json');
    const backupContent = fs.readFileSync(backupPath, 'utf-8');
    const backupData = JSON.parse(backupContent);
    
    // 获取用户数据
    const userKey = Object.keys(backupData)[0];
    const appData = backupData[userKey].data;
    
    // 生成HTML模板
    const htmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>数据恢复工具</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #333; font-size: 28px; margin-bottom: 10px; text-align: center; }
        .subtitle { color: #666; text-align: center; margin-bottom: 30px; }
        .status-box {
            background: #f8f9fa; border-radius: 12px; padding: 20px;
            margin-bottom: 20px; border: 2px solid #e9ecef;
        }
        .status-box.success { background: #d4edda; border-color: #c3e6cb; }
        .status-box.error { background: #f8d7da; border-color: #f5c6cb; }
        .data-info { margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; }
        .data-item {
            display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;
        }
        .data-label { color: #666; }
        .data-value { font-weight: 600; color: #333; }
        button {
            width: 100%; padding: 16px; font-size: 18px; font-weight: 600;
            color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none; border-radius: 12px; cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102,126,234,0.4); }
        button:active { transform: translateY(0); }
        button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .link {
            display: block; text-align: center; margin-top: 20px;
            color: #667eea; text-decoration: none; font-weight: 600;
        }
        .link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📦 数据恢复工具</h1>
        <p class="subtitle">一键恢复你的个人数据</p>
        
        <div id="status" class="status-box">
            <p>准备就绪，请点击下方按钮恢复数据</p>
        </div>
        
        <button id="restoreBtn">🔄 恢复数据</button>
        
        <a href="http://localhost:5184" class="link" id="gotoLink" style="display: none;">
            ✨ 数据恢复成功！点击这里前往应用
        </a>
    </div>

    <script>
        // 完整的备份数据
        const appData = ${JSON.stringify(appData, null, 2)};
        
        const restoreBtn = document.getElementById('restoreBtn');
        const statusDiv = document.getElementById('status');
        const gotoLink = document.getElementById('gotoLink');
        
        restoreBtn.addEventListener('click', function() {
            try {
                restoreBtn.disabled = true;
                restoreBtn.textContent = '⏳ 正在恢复...';
                
                // 保存到 localStorage
                const KEY = 'talent-showcase-owner-data';
                localStorage.setItem(KEY, JSON.stringify(appData));
                
                // 显示成功
                statusDiv.className = 'status-box success';
                statusDiv.innerHTML = \`
                    <p><strong>🎉 数据恢复成功！</strong></p>
                    <div class="data-info">
                        <div class="data-item">
                            <span class="data-label">书籍数量</span>
                            <span class="data-value">\${appData.books?.length || 0} 本</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">运动记录</span>
                            <span class="data-value">\${appData.workouts?.length || 0} 条</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">导出时间</span>
                            <span class="data-value">\${appData.exportedAt}</span>
                        </div>
                    </div>
                \`;
                
                restoreBtn.textContent = '✅ 已恢复';
                gotoLink.style.display = 'block';
                
            } catch (error) {
                statusDiv.className = 'status-box error';
                statusDiv.innerHTML = \`<p><strong>❌ 恢复失败</strong></p><p>\${error.message}</p>\`;
                restoreBtn.disabled = false;
                restoreBtn.textContent = '🔄 恢复数据';
                console.error(error);
            }
        });
    </script>
</body>
</html>`;
    
    // 写入恢复页面
    const outputPath = path.join(__dirname, 'restore-data-full.html');
    fs.writeFileSync(outputPath, htmlTemplate, 'utf-8');
    
    console.log('✅ 数据恢复页面生成成功！');
    console.log('📄 文件位置:', outputPath);
    console.log('🌐 访问地址: http://localhost:5184/restore-data-full.html');
    console.log('\n现在请在浏览器中打开上面的地址来恢复数据！');
    
} catch (error) {
    console.error('❌ 生成页面失败:', error);
}
