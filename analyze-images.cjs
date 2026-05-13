const fs = require('fs');
const c = fs.readFileSync('server/data/userData.json', 'utf-8');

const dataImagePositions = [];
let pos = 0;
while ((pos = c.indexOf('data:image', pos)) !== -1) {
    dataImagePositions.push(pos);
    pos += 10;
}

console.log(`找到 ${dataImagePositions.length} 个 data:image\n`);

// 显示前3个的位置和上下文
dataImagePositions.slice(0, 3).forEach((pos, i) => {
    console.log(`=== 第${i+1}个 data:image (位置: ${pos}) ===`);
    console.log('前200字符:');
    console.log(c.substring(pos - 200, pos));
    console.log('\n后100字符:');
    console.log(c.substring(pos, pos + 100));
    console.log('\n');
});
