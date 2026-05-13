const fs = require('fs');

// 直接读取原始文件
const backupContent = fs.readFileSync('server/data/userData.json', 'utf-8');
const backupData = JSON.parse(backupContent);

// 直接提取data字段
const userData = backupData['user_mp3sb595owl3pyqqx9o'].data;

// 直接保存，不使用JSON.stringify
const outputPath = 'complete-backup-full.json';
// 重新构建格式
const newFormat = {
    'user_mp3sb595owl3pyqqx9o': {
        data: userData,
        lastSyncTime: Date.now()
    }
};

fs.writeFileSync(outputPath, JSON.stringify(newFormat, null, 2), 'utf-8');
console.log('📄 完整备份已保存到:', outputPath);
console.log('文件大小:', (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2), 'MB');

// 检查图片
const content = fs.readFileSync(outputPath, 'utf-8');
const imageCount = (content.match(/data:image/g) || []).length;
console.log('图片数量:', imageCount);
