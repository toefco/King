const fs = require('fs');

const raw = fs.readFileSync('server/data/userData.json', 'utf-8');

// 统计data:image的位置
const dataImages = [];
let pos = 0;
while ((pos = raw.indexOf('data:image', pos)) !== -1) {
    const context = raw.substring(Math.max(0, pos - 150), pos + 50);
    dataImages.push({
        pos,
        context
    });
    pos += 10;
}

console.log('=== 找到data:image数量 ===');
console.log('总数:', dataImages.length);

// 检查前3个
console.log('\n=== 前3个data:image ===');
dataImages.slice(0, 3).forEach((item, i) => {
    console.log(`\n${i + 1}. 位置: ${item.pos}`);
    console.log('上下文:', item.context);
});

// 查找books的位置
const booksStart = raw.indexOf('"books":');
console.log('\n=== books位置 ===');
console.log('books开始:', booksStart);
console.log('附近内容:', raw.substring(booksStart, booksStart + 2000));
