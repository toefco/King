const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 保存数据
  if (req.method === 'POST' && req.url === '/api/save-static-data') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { content } = data;
        
        if (!content) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: '内容为空' }));
          return;
        }
        
        const filePath = path.join(__dirname, 'src/data/staticData.ts');
        fs.writeFileSync(filePath, content);
        console.log('✅ staticData.ts 已更新');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: '数据保存成功' }));
      } catch (error) {
        console.error('保存失败:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '保存失败: ' + error.message }));
      }
    });
    return;
  }
  
  // 获取数据统计
  if (req.method === 'GET' && req.url === '/api/data-stats') {
    try {
      const filePath = path.join(__dirname, 'src/data/staticData.ts');
      const content = fs.readFileSync(filePath, 'utf8');
      const match = content.match(/export const staticData = (\{[\s\S]+\});/);
      
      if (!match) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '无法解析' }));
        return;
      }
      
      const data = JSON.parse(match[1]);
      const stats = {
        talents: data.talents?.length || 0,
        fitnessTests: data.fitnessTests?.length || 0,
        workouts: data.workouts?.length || 0,
        books: data.books?.length || 0,
        yearSummaries: data.yearSummaries?.length || 0,
        articles: data.articles?.length || 0,
        skills: data.skills?.length || 0,
        hobbies: data.hobbies?.length || 0,
        schedules: data.schedules?.length || 0,
        happiness: data.happiness?.length || 0,
        scheduleRecords: data.scheduleRecords?.length || 0,
        happinessRecords: data.happinessRecords?.length || 0,
        traits: data.traits?.length || 0,
        readingSlots: data.readingSlots?.length || 0,
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, stats }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: error.message }));
    }
    return;
  }
  
  // Git 推送
  if (req.method === 'POST' && req.url === '/api/git-push') {
    const { exec } = require('child_process');
    
    exec(`cd ${__dirname} && git add src/data/staticData.ts && git commit -m "更新个人最新台账数据" && git push`, (error, stdout, stderr) => {
      if (error) {
        console.error('Git 命令失败:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Git push 失败: ' + error.message }));
        return;
      }
      
      console.log('Git 输出:', stdout);
      if (stderr) console.log('Git 错误:', stderr);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: '推送成功', stdout, stderr }));
    });
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

const PORT = 8765;
server.listen(PORT, () => {
  console.log(`数据保存服务运行在 http://localhost:${PORT}`);
});
