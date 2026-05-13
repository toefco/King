const fs = require('fs');
const readline = require('readline');

// 读取文件
const raw = fs.readFileSync('server/data/userData.json', 'utf-8');

// 直接从原始文本中提取所有data:image
const dataImagePattern = /"data:image[^"]*"/g;
const matches = raw.match(dataImagePattern);

console.log('=== 找到的图片 ===');
console.log('总数:', matches.length);

// 显示前几个
matches.slice(0, 3).forEach((m, i) => {
    console.log(`\n图片${i+1}:`, m.substring(0, 80) + '...');
});

// 提取完整的coverUrl和dataUrl
const coverUrls = [];
const dataUrls = [];

// 用正则提取所有coverUrl
const coverPattern = /"coverUrl":\s*"([^"]*?)"(?=\s*,|\s*})/g;
let coverMatch;
while ((coverMatch = coverPattern.exec(raw)) !== null) {
    if (coverMatch[1] && coverMatch[1].startsWith('data:image')) {
        coverUrls.push(coverMatch[1]);
    }
}

// 用正则提取所有dataUrl
const dataPattern = /"dataUrl":\s*"([^"]*?)"(?=\s*,|\s*})/g;
let dataMatch;
while ((dataMatch = dataPattern.exec(raw)) !== null) {
    if (dataMatch[1] && dataMatch[1].startsWith('data:image')) {
        dataUrls.push(dataMatch[1]);
    }
}

console.log('\n=== 提取结果 ===');
console.log('封面图:', coverUrls.length);
console.log('数据图:', dataUrls.length);

// 显示第一本书的封面图
if (coverUrls.length > 0) {
    console.log('\n第一张封面图长度:', coverUrls[0].length);
    console.log('前100字符:', coverUrls[0].substring(0, 100));
}

if (dataUrls.length > 0) {
    console.log('\n第一张数据图长度:', dataUrls[0].length);
    console.log('前100字符:', dataUrls[0].substring(0, 100));
}
