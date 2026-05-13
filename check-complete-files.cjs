const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'userData-complete-with-images.json',
  'complete-backup-with-images.json',
  'complete-backup-full.json',
  'complete-backup.json',
];

console.log('📋 检查完整数据文件...\n');

filesToCheck.forEach((filename) => {
  const filePath = path.join(__dirname, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${filename} - 文件不存在`);
    return;
  }
  
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    console.log(`✅ ${filename}`);
    console.log(`   文件大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   字符长度: ${raw.length}`);
    
    const parsed = JSON.parse(raw);
    
    // 检查是否是嵌套结构（像userData.json那样）
    let data;
    const keys = Object.keys(parsed);
    if (keys.length === 1 && parsed[keys[0]].data) {
      data = parsed[keys[0]].data;
      console.log(`   格式: 嵌套格式 (user_xxx)`);
    } else {
      data = parsed;
      console.log(`   格式: 直接格式`);
    }
    
    console.log(`   书籍: ${data.books?.length || 0}`);
    console.log(`   运动: ${data.workouts?.length || 0}`);
    console.log(`   技能: ${data.skills?.length || 0}`);
    console.log(`   爱好: ${data.hobbies?.length || 0}`);
    console.log(`   年度总结: ${data.yearSummaries?.length || 0}`);
    
    // 检查书籍图片
    let booksWithImages = 0;
    data.books?.forEach((book) => {
      if (book.coverUrl && book.coverUrl.length > 0) booksWithImages++;
    });
    console.log(`   有封面图片的书籍: ${booksWithImages}`);
    
    console.log();
  } catch (e) {
    console.log(`❌ ${filename} - 解析失败: ${e.message}`);
    console.log();
  }
});
