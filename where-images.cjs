const fs = require('fs');

const raw = fs.readFileSync('server/data/userData.json').toString('utf-8');

// 统计所有data:image的位置和上下文
const positions = [];
let pos = 0;
while ((pos = raw.indexOf('data:image', pos)) !== -1) {
    // 找到这个data:image所属的字段
    const before = raw.substring(Math.max(0, pos - 500), pos);
    
    // 找最近的字段名
    let field = 'unknown';
    const fieldNames = ['talents', 'fitnessTests', 'workouts', 'books', 'articles', 'skills', 'hobbies', 'schedules', 'happiness', 'scheduleRecords', 'happinessRecords', 'traits', 'readingSlots'];
    
    fieldNames.forEach(name => {
        if (before.lastIndexOf('"' + name + '"') > before.lastIndexOf('{')) {
            field = name;
        }
    });
    
    positions.push({ pos, field, context: before.substring(before.length - 100) });
    pos += 10;
}

console.log('找到的data:image位置和所属字段:');
positions.forEach((p, i) => {
    console.log(`${i+1}. 位置 ${p.pos}, 字段: ${p.field}`);
    console.log(`   上下文: ...${p.context}`);
    console.log();
});
