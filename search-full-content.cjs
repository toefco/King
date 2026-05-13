const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'userData-complete-with-images.json');

console.log('🔍 搜索完整文件内容...\n');

const raw = fs.readFileSync(filePath, 'utf8');

// 搜索所有 "books" 出现位置
let index = 0;
let count = 0;
while ((index = raw.indexOf('"books"', index)) !== -1) {
  console.log(`✅ 找到 "books" 在位置 ${index}`);
  // 查看这个位置附近的内容
  const snippet = raw.substring(Math.max(0, index - 100), index + 1000);
  console.log(`   片段: ${snippet}\n`);
  index += '"books"'.length;
  count++;
}
console.log(`\n📊 总共找到 ${count} 个 "books" 出现位置`);

// 搜索 data:image 附近的内容，看看它们在什么位置
console.log('\n🔍 查找 data:image 附近的结构...');
const dataImageIndex = raw.indexOf('"data:image');
if (dataImageIndex !== -1) {
  console.log(`✅ 第一个 data:image 在位置 ${dataImageIndex}`);
  const context = raw.substring(Math.max(0, dataImageIndex - 500), dataImageIndex + 200);
  console.log(`   上下文: ${context}`);
}
