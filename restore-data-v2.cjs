const http = require('http');
const fs = require('fs');
const path = require('path');

const API_PORT = 3001;

const BACKUP_DATA_KEY = 'talent-showcase-backup-restored';

const htmlPage = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>数据恢复工具 v2</title>
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
        .status-box.loading { background: #fff3cd; border-color: #ffc107; }
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
        .spinner {
            display: inline-block; width: 20px; height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%; border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
            margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔄 数据恢复工具 v2</h1>
        <p class="subtitle">从服务器备份恢复数据</p>
        
        <div id="status" class="status-box">
            <p>准备从服务器获取备份数据...</p>
        </div>
        
        <button id="restoreBtn" disabled>
            <span class="spinner"></span>正在加载备份数据...
        </button>
        
        <a href="http://localhost:5185/" class="link" id="gotoLink" style="display: none;">
            ✨ 数据恢复成功！点击这里前往应用
        </a>
    </div>

    <script>
        const KEY = 'talent-showcase-owner-data';
        const statusDiv = document.getElementById('status');
        const restoreBtn = document.getElementById('restoreBtn');
        const gotoLink = document.getElementById('gotoLink');
        
        async function fetchBackupData() {
            try {
                statusDiv.innerHTML = '<p><span class="spinner"></span>正在从服务器获取备份数据...</p>';
                restoreBtn.disabled = true;
                
                // 从API获取数据
                const response = await fetch('http://localhost:3001/api/data/user_mp3sb595owl3pyqqx9o');
                const result = await response.json();
                
                if (result.success && result.data) {
                    const appData = result.data;
                    
                    // 显示数据信息
                    statusDiv.className = 'status-box loading';
                    statusDiv.innerHTML = \`
                        <p>找到备份数据！</p>
                        <div class="data-info">
                            <div class="data-item">
                                <span class="data-label">📚 书籍数量</span>
                                <span class="data-value">\${appData.books?.length || 0} 本</span>
                            </div>
                            <div class="data-item">
                                <span class="data-label">🏋️ 运动记录</span>
                                <span class="data-value">\${appData.workouts?.length || 0} 条</span>
                            </div>
                            <div class="data-item">
                                <span class="data-label">📅 导出时间</span>
                                <span class="data-value">\${appData.exportedAt || '未知'}</span>
                            </div>
                        </div>
                    \`;
                    
                    restoreBtn.disabled = false;
                    restoreBtn.innerHTML = '🔄 立即恢复数据';
                    
                    restoreBtn.onclick = function() {
                        try {
                            restoreBtn.disabled = true;
                            restoreBtn.innerHTML = '<span class="spinner"></span>正在恢复数据...';
                            
                            // 保存到 localStorage
                            localStorage.setItem(KEY, JSON.stringify(appData));
                            
                            // 显示成功
                            statusDiv.className = 'status-box success';
                            statusDiv.innerHTML = \`
                                <p><strong>🎉 数据恢复成功！</strong></p>
                                <p style="margin-top: 10px; color: #666;">
                                    已成功恢复 \${appData.books?.length || 0} 本书籍和 \${appData.workouts?.length || 0} 条运动记录！
                                </p>
                            \`;
                            
                            restoreBtn.innerHTML = '✅ 已恢复';
                            gotoLink.style.display = 'block';
                            
                        } catch (error) {
                            statusDiv.className = 'status-box error';
                            statusDiv.innerHTML = \`<p><strong>❌ 恢复失败</strong></p><p>\${error.message}</p>\`;
                            restoreBtn.disabled = false;
                            restoreBtn.innerHTML = '🔄 重试恢复';
                        }
                    };
                } else {
                    throw new Error(result.message || '获取数据失败');
                }
            } catch (error) {
                statusDiv.className = 'status-box error';
                statusDiv.innerHTML = \`<p><strong>❌ 获取备份失败</strong></p><p>\${error.message}</p><p style="margin-top: 10px; font-size: 12px;">请确保服务器正在运行</p>\`;
                restoreBtn.innerHTML = '🔄 重试';
                restoreBtn.disabled = false;
                restoreBtn.onclick = fetchBackupData;
            }
        }
        
        // 自动获取数据
        fetchBackupData();
    </script>
</body>
</html>`;

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    if (req.url === '/restore-v2.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(htmlPage);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(3002, () => {
    console.log('✅ 数据恢复工具 v2 已启动！');
    console.log('🌐 访问地址: http://localhost:3002/restore-v2.html');
    console.log('\n请在浏览器中打开上面的地址来恢复数据！\n');
});
