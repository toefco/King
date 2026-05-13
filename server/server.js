const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const USER_DATA_FILE = path.join(DATA_DIR, 'userData.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadUserData() {
  if (fs.existsSync(USER_DATA_FILE)) {
    try {
      const data = fs.readFileSync(USER_DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('加载用户数据失败:', e);
    }
  }
  return {};
}

function saveUserData(data) {
  fs.writeFileSync(USER_DATA_FILE, JSON.stringify(data, null, 2));
}

let userData = loadUserData();

app.get('/api/data/:userId', (req, res) => {
  const { userId } = req.params;
  const data = userData[userId] || null;
  res.json({ success: true, data });
});

app.post('/api/data/:userId', (req, res) => {
  const { userId } = req.params;
  const { data } = req.body;
  
  if (!userId || !data) {
    return res.json({ success: false, message: '缺少参数' });
  }
  
  userData[userId] = data;
  saveUserData(userData);
  res.json({ success: true, message: '数据保存成功' });
});

app.delete('/api/data/:userId', (req, res) => {
  const { userId } = req.params;
  
  if (!userData[userId]) {
    return res.json({ success: false, message: '用户不存在' });
  }
  
  delete userData[userId];
  saveUserData(userData);
  res.json({ success: true, message: '数据已删除' });
});

app.post('/api/sync/:userId', (req, res) => {
  const { userId } = req.params;
  const { localData, lastSyncTime } = req.body;
  
  const serverData = userData[userId];
  
  if (!serverData) {
    userData[userId] = { data: localData, lastSyncTime: Date.now() };
    saveUserData(userData);
    return res.json({ success: true, data: localData, lastSyncTime: Date.now() });
  }
  
  if (!lastSyncTime || serverData.lastSyncTime > lastSyncTime) {
    res.json({ success: true, data: serverData.data, lastSyncTime: serverData.lastSyncTime });
  } else {
    userData[userId] = { data: localData, lastSyncTime: Date.now() };
    saveUserData(userData);
    res.json({ success: true, data: localData, lastSyncTime: Date.now() });
  }
});

app.post('/api/clear/:userId', (req, res) => {
  const { userId } = req.params;
  
  if (userData[userId]) {
    delete userData[userId];
    saveUserData(userData);
  }
  
  res.json({ success: true, message: '数据已清空' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});