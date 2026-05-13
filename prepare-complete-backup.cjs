const fs = require('fs');

// 读取备份数据
const backupContent = fs.readFileSync('server/data/userData.json', 'utf-8');
const backupData = JSON.parse(backupContent);

// 获取用户数据
const userData = backupData['user_mp3sb595owl3pyqqx9o'].data;

// 输出给用户使用
console.log('=== 完整数据已准备好 ===');
console.log('📚 书籍数量:', userData.books.length);
console.log('🏋️ 运动记录:', userData.workouts.length);
console.log('\n✅ 数据可以直接使用！');

// 将数据保存为单独的文件，供用户下载
const outputPath = 'complete-backup.json';
fs.writeFileSync(outputPath, JSON.stringify(userData, null, 2), 'utf-8');
console.log('\n📄 完整备份已保存到:', outputPath);
console.log('文件大小:', (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2), 'MB');
