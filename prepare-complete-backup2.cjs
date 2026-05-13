const fs = require('fs');

// 读取备份数据
const backupContent = fs.readFileSync('server/data/userData.json', 'utf-8');
const backupData = JSON.parse(backupContent);

// 获取用户数据
const userData = backupData['user_mp3sb595owl3pyqqx9o'].data;

// 检查书籍图片
console.log('=== 检查书籍数据 ===');
const books = userData.books;
books.forEach((book, i) => {
    console.log(`${i+1}. ${book.title}`);
    console.log(`   封面图: ${book.coverUrl ? book.coverUrl.substring(0, 50) + '...' : '无'}`);
    console.log(`   数据图: ${book.dataUrl ? book.dataUrl.substring(0, 50) + '...' : '无'}`);
});

// 将完整数据保存为单独的文件
const outputPath = 'complete-backup-with-images.json';
const completeBackup = JSON.stringify(userData, null, 2);
fs.writeFileSync(outputPath, completeBackup, 'utf-8');
console.log('\n📄 完整备份已保存到:', outputPath);
console.log('文件大小:', (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2), 'MB');

// 统计图片
const imageCount = (completeBackup.match(/data:image/g) || []).length;
console.log('文件中的图片数量:', imageCount);
