const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, 'server', 'data', 'userData.json');

console.log('📊 开始分析备份文件...');

const raw = fs.readFileSync(backupPath, 'utf8');
console.log('✅ 文件读取成功，长度:', raw.length, '字符');

// 提取所有 data:image 字符串
const dataImageRegex = /"data:image[^"]+"/g;
const matches = raw.match(dataImageRegex) || [];
console.log(`✅ 找到 ${matches.length} 个 data:image 字符串`);

matches.forEach((m, i) => {
  console.log(`  [${i}] 长度: ${m.length}, 开头: ${m.substring(0, 50)}...`);
});

// 现在尝试正确解析文件
try {
  const parsed = JSON.parse(raw);
  const userId = Object.keys(parsed)[0];
  const data = parsed[userId].data;

  console.log('\n✅ JSON 解析成功');
  console.log('   - 书籍数量:', data.books?.length || 0);
  console.log('   - 运动记录:', data.workouts?.length || 0);
  
  // 检查书籍的图片
  console.log('\n📚 检查书籍图片:');
  data.books?.forEach((book, i) => {
    console.log(`  [${i}] ${book.title}`);
    console.log(`      coverUrl: ${book.coverUrl ? '有' : '空'} (长度: ${book.coverUrl?.length || 0})`);
    console.log(`      dataUrl: ${book.dataUrl ? '有' : '空'} (长度: ${book.dataUrl?.length || 0})`);
  });
  
  // 检查其他可能有图片的地方
  console.log('\n🎨 检查其他模块:');
  console.log('   - 技能:', data.skills?.length || 0);
  console.log('   - 爱好:', data.hobbies?.length || 0);
  console.log('   - 年度总结:', data.yearSummaries?.length || 0);
  
  data.skills?.forEach((skill, i) => {
    console.log(`  技能 [${i}] ${skill.title} - coverUrl: ${skill.coverUrl ? '有' : '空'}`);
  });
  
  data.hobbies?.forEach((hobby, i) => {
    console.log(`  爱好 [${i}] ${hobby.title} - imageUrl: ${hobby.imageUrl ? '有' : '空'}, coverUrl: ${hobby.coverUrl ? '有' : '空'}`);
  });
  
  data.yearSummaries?.forEach((summary, i) => {
    console.log(`  年度总结 [${i}] ${summary.year} - imageUrl: ${summary.imageUrl ? '有' : '空'}`);
  });

} catch (e) {
  console.error('❌ JSON 解析失败:', e.message);
}
