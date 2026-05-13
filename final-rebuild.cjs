const fs = require('fs');

// 读取原始文件
const raw = fs.readFileSync('server/data/userData.json', 'utf-8');

// 提取所有图片
const allImages = {};
let match;

// 提取coverUrl
const coverPattern = /"coverUrl":\s*"([^"]*?)"(?=\s*,|\s*})/g;
while ((match = coverPattern.exec(raw)) !== null) {
    if (match[1] && match[1].startsWith('data:image')) {
        allImages[`cover_${Object.keys(allImages).filter(k => k.startsWith('cover_')).length}`] = match[1];
    }
}

// 提取dataUrl
const dataPattern = /"dataUrl":\s*"([^"]*?)"(?=\s*,|\s*})/g;
while ((match = dataPattern.exec(raw)) !== null) {
    if (match[1] && match[1].startsWith('data:image')) {
        allImages[`data_${Object.keys(allImages).filter(k => k.startsWith('data_')).length}`] = match[1];
    }
}

console.log('=== 提取的图片 ===');
const coverKeys = Object.keys(allImages).filter(k => k.startsWith('cover_'));
const dataKeys = Object.keys(allImages).filter(k => k.startsWith('data_'));
console.log('封面图:', coverKeys.length);
console.log('数据图:', dataKeys.length);

// 解析JSON
let data;
try {
    data = JSON.parse(raw);
} catch(e) {
    console.log('❌ JSON解析失败:', e.message);
    process.exit(1);
}

// 获取用户数据
const userKey = 'user_mp3sb595owl3pyqqx9o';
const userData = data[userKey];

if (!userData) {
    console.log('❌ 未找到用户数据');
    process.exit(1);
}

// 检查原始books
console.log('\n=== 原始books ===');
console.log('书籍数量:', userData.data.books.length);
console.log('books[0].coverUrl:', userData.data.books[0]?.coverUrl?.length || 0);

// 手动从原始文本提取books
const booksStart = raw.indexOf('"books": [') + 9;
const booksEnd = raw.indexOf(']', booksStart);
const booksRaw = raw.substring(booksStart, booksEnd);

console.log('\n=== 重新解析books ===');
const books = [];
let current = '';
let braceCount = 0;
let inObject = false;

for (let i = 0; i < booksRaw.length; i++) {
    const char = booksRaw[i];
    
    if (char === '{') {
        braceCount++;
        inObject = true;
    }
    
    if (inObject) {
        current += char;
    }
    
    if (char === '}') {
        braceCount--;
        if (braceCount === 0 && inObject) {
            // 从原始字符串提取图片
            const coverMatch = current.match(/"coverUrl":\s*"(data:image[^"]*)"/);
            const dataMatch = current.match(/"dataUrl":\s*"(data:image[^"]*)"/);
            
            // 解析基本数据
            const bookBasic = JSON.parse(current);
            
            // 添加图片
            if (coverMatch) {
                bookBasic.coverUrl = coverMatch[1];
            }
            if (dataMatch) {
                bookBasic.dataUrl = dataMatch[1];
            }
            
            books.push(bookBasic);
            current = '';
            inObject = false;
        }
    }
}

console.log('重新解析书籍:', books.length);
const withCover = books.filter(b => b.coverUrl && b.coverUrl.length > 100).length;
const withData = books.filter(b => b.dataUrl && b.dataUrl.length > 100).length;
console.log('有封面图:', withCover);
console.log('有数据图:', withData);

// 替换books
userData.data.books = books;

// 保存
fs.writeFileSync('userData-complete.json', JSON.stringify(data, null, 2), 'utf-8');
console.log('\n✅ 完整数据已保存到 userData-complete.json');
console.log('文件大小:', (fs.statSync('userData-complete.json').size / 1024 / 1024).toFixed(2), 'MB');
