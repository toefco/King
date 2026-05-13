const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'userData-complete-with-images.json');

console.log('🔍 详细检查 userData-complete-with-images.json...\n');

const raw = fs.readFileSync(filePath, 'utf8');
console.log('✅ 文件读取成功');

try {
  const parsed = JSON.parse(raw);
  console.log('✅ JSON 解析成功');
  
  const userId = Object.keys(parsed)[0];
  console.log('   用户ID:', userId);
  
  const data = parsed[userId].data;
  console.log('\n📊 数据内容:');
  
  // 列出所有键
  console.log('   所有键:', Object.keys(data));
  
  // 检查每个数组的长度
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (Array.isArray(value)) {
      console.log(`   ${key}: ${value.length} 项`);
    } else if (typeof value === 'string') {
      console.log(`   ${key}: "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`);
    } else {
      console.log(`   ${key}: ${typeof value}`);
    }
  });
  
  // 检查 data 是否在正确的位置
  console.log('\n🔍 查找 books 数组...');
  console.log('   data.books:', data.books);
  console.log('   data.books 类型:', typeof data.books);
  console.log('   data.books 是否是数组:', Array.isArray(data.books));
  
  // 搜索整个原始字符串，看看有没有 "books" 后面跟着数组
  console.log('\n🔍 搜索原始字符串中的 "books":');
  const booksIndex = raw.indexOf('"books"');
  if (booksIndex !== -1) {
    const snippet = raw.substring(booksIndex, booksIndex + 500);
    console.log('   找到 "books" 在位置', booksIndex);
    console.log('   片段:', snippet);
  }
  
} catch (e) {
  console.error('❌ 错误:', e.message);
  console.error(e.stack);
}
