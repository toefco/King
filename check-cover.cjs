const fs = require('fs');
const c = fs.readFileSync('server/data/userData.json', 'utf-8');

const idx = c.indexOf('coverUrl');
console.log('coverUrl位置:', idx);
console.log('周围内容:', c.substring(idx, idx + 300));

// 检查是不是JSON解析时出了问题
try {
    const d = JSON.parse(c);
    const book0 = d['user_mp3sb595owl3pyqqx9o'].data.books[0];
    console.log('\n=== JSON解析后的数据 ===');
    console.log('book0.coverUrl:', JSON.stringify(book0.coverUrl));
    console.log('book0.coverUrl长度:', book0.coverUrl ? book0.coverUrl.length : 0);
} catch(e) {
    console.log('JSON解析错误:', e.message);
}
