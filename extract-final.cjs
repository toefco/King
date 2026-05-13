const fs = require('fs');

const raw = fs.readFileSync('server/data/userData.json', 'utf-8');

// 找到books数组内容
const booksStart = raw.indexOf('"books": [') + 9;
const booksEnd = raw.indexOf(']', booksStart);

// 手动解析每本书
let content = raw.substring(booksStart, booksEnd);
console.log('Books内容:', content.substring(0, 500));

// 提取每本书
const books = [];
let current = '';
let braceCount = 0;
let inObject = false;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
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
            // 一本书结束
            try {
                const book = JSON.parse(current);
                
                // 如果coverUrl为空，从字符串中提取
                if (!book.coverUrl) {
                    const coverMatch = current.match(/"coverUrl":\s*"([^"]+)"/);
                    if (coverMatch) {
                        book.coverUrl = coverMatch[1];
                    }
                }
                if (!book.dataUrl) {
                    const dataMatch = current.match(/"dataUrl":\s*"([^"]+)"/);
                    if (dataMatch) {
                        book.dataUrl = dataMatch[1];
                    }
                }
                
                books.push(book);
            } catch(e) {}
            current = '';
            inObject = false;
        }
    }
}

console.log('\n解析完成，共', books.length, '本书');
console.log('books[0].coverUrl长度:', books[0]?.coverUrl?.length || 0);
console.log('books[0].dataUrl长度:', books[0]?.dataUrl?.length || 0);

// 统计
const withCover = books.filter(b => b.coverUrl && b.coverUrl.length > 100).length;
const withData = books.filter(b => b.dataUrl && b.dataUrl.length > 100).length;
console.log('有封面图:', withCover);
console.log('有数据图:', withData);

// 重建完整数据
const fullData = JSON.parse(raw);
fullData['user_mp3sb595owl3pyqqx9o'].data.books = books;

// 保存
fs.writeFileSync('complete-backup-fixed.json', JSON.stringify(fullData, null, 2), 'utf-8');
console.log('\n✅ 保存到 complete-backup-fixed.json');
console.log('大小:', (fs.statSync('complete-backup-fixed.json').size / 1024 / 1024).toFixed(2), 'MB');
