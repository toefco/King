const fs = require('fs');

// 读取原始文件
const raw = fs.readFileSync('server/data/userData.json').toString('utf-8');

// 找到books数组的开始和结束
const booksStart = raw.indexOf('"books": [');
const yearSummariesPos = raw.indexOf('"yearSummaries"');

// 提取books部分
const booksRaw = raw.substring(booksStart + 9, yearSummariesPos);
console.log('books内容长度:', booksRaw.length);
console.log('books内容前2000字符:');
console.log(booksRaw.substring(0, 2000));

// 统计data:image
const dataImageCount = (booksRaw.match(/data:image/g) || []).length;
console.log('\nbooks中的data:image数量:', dataImageCount);
