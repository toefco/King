const fs = require('fs');
const content = fs.readFileSync('server/data/userData.json', 'utf-8');

const data = JSON.parse(content);
const userData = data['user_mp3sb595owl3pyqqx9o'].data;

console.log('=== 数据统计 ===');
console.log('书籍数量:', userData.books.length);
console.log('运动记录:', userData.workouts.length);

const withCover = userData.books.filter(b => b.coverUrl && b.coverUrl.startsWith('data:image')).length;
const withData = userData.books.filter(b => b.dataUrl && b.dataUrl.startsWith('data:image')).length;

console.log('有封面图:', withCover);
console.log('有数据图:', withData);
console.log('总图片数:', withCover + withData);

// 检查articles
console.log('\n=== articles ===');
console.log('articles数量:', userData.articles.length);
if (userData.articles.length > 0) {
    console.log('第一个article:', JSON.stringify(userData.articles[0], null, 2).substring(0, 500));
}

// 检查文件中data:image出现的位置
const dataImageCount = (content.match(/data:image/g) || []).length;
console.log('\n=== 文件中data:image总数 ===');
console.log('总数:', dataImageCount);

// 检查图片在哪个字段
const articlesMatch = content.match(/"articles":\s*\[([\s\S]*?)\]\s*,"skills"/);
if (articlesMatch) {
    const articlesContent = articlesMatch[1];
    const articlesImageCount = (articlesContent.match(/data:image/g) || []).length;
    console.log('articles中的图片:', articlesImageCount);
}
