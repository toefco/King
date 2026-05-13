import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3002;

const backupPath = path.join(__dirname, 'server/data/userData.json');
let backupData = {};

try {
    const backupContent = fs.readFileSync(backupPath, 'utf-8');
    backupData = JSON.parse(backupContent);
    console.log('✅ 备份数据已加载');
} catch (error) {
    console.error('❌ 读取备份数据失败:', error);
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // API路由
    if (req.url === '/api/data/user_mp3sb595owl3pyqqx9o' && req.method === 'GET') {
        const userData = backupData['user_mp3sb595owl3pyqqx9o'];
        if (userData) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: userData.data
            }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: '未找到用户数据'
            }));
        }
        return;
    }
    
    // 导出工具页面
    if (req.url === '/export') {
        const htmlPath = path.join(__dirname, 'export-data-tool.html');
        fs.readFile(htmlPath, 'utf-8', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('404 Not Found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
        return;
    }
    
    // 导入API
    if (req.url === '/api/import' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { data } = JSON.parse(body);
                fs.writeFileSync(
                    path.join(__dirname, 'server/data/userData.json'),
                    JSON.stringify({ 'user_mp3sb595owl3pyqqx9o': { data } }, null, 2),
                    'utf-8'
                );
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: '导入成功' }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: error.message }));
            }
        });
        return;
    }
    
    // 自动恢复页面
    const htmlPath = path.join(__dirname, 'auto-restore.html');
    fs.readFile(htmlPath, 'utf-8', (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`✅ 数据恢复服务器已启动！`);
    console.log(`\n📤 导出工具: http://localhost:${PORT}/export`);
    console.log(`🔄 恢复工具: http://localhost:${PORT}/`);
    console.log(`\n应用地址: http://localhost:5185/`);
});
