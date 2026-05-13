const fs = require('fs');

const raw = fs.readFileSync('server/data/userData.json').toString('utf-8');

// 找到各个数组的位置
const workoutsEnd = raw.indexOf('"workouts": []');
const booksStart = raw.indexOf('"books": [');
const yearSummariesStart = raw.indexOf('"yearSummaries": []');
const articlesStart = raw.indexOf('"articles": [');
const skillsStart = raw.indexOf('"skills": []');

console.log('workouts结束位置:', workoutsEnd);
console.log('books开始位置:', booksStart);
console.log('yearSummaries开始位置:', yearSummariesStart);
console.log('articles开始位置:', articlesStart);
console.log('skills开始位置:', skillsStart);

// 检查articles内容
if (articlesStart > 0) {
    const articlesEnd = raw.indexOf(']', articlesStart);
    const articlesRaw = raw.substring(articlesStart, articlesEnd + 200);
    console.log('\n=== articles内容前500字符 ===');
    console.log(articlesRaw.substring(0, 500));
    
    const count = (articlesRaw.match(/data:image/g) || []).length;
    console.log('\narticles中的图片数量:', count);
}
