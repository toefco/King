const fs = require('fs');
const c = fs.readFileSync('server/data/userData.json', 'utf-8');

// 找出data:image都在哪些字段
const fields = ['talents', 'fitnessTests', 'workouts', 'books', 'articles', 'skills', 'hobbies', 'schedules', 'happiness'];

fields.forEach(field => {
    const regex = new RegExp(`"${field}":\\s*\\[([\\s\\S]*?)\\]\\s*,"`, 'g');
    const match = regex.exec(c);
    if (match) {
        const content = match[1];
        const count = (content.match(/data:image/g) || []).length;
        if (count > 0) {
            console.log(`✅ ${field}: 包含 ${count} 个图片`);
        }
    }
});

console.log('\n=== 搜索articles ===');
const articlesMatch = c.match(/"articles":\s*\[([\s\S]*?)\]\s*,"skills"/);
if (articlesMatch) {
    console.log('articles内容前500字符:');
    console.log(articlesMatch[1].substring(0, 500));
}
