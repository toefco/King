const fs = require('fs');

// 读取原始文件
const raw = fs.readFileSync('server/data/userData.json', 'utf-8');

// 提取所有coverUrl和dataUrl
const coverUrls = [];
const dataUrls = [];

// 提取coverUrl
const coverPattern = /"coverUrl":\s*"([^"]*?)"(?=\s*,|\s*})/g;
let coverMatch;
while ((coverMatch = coverPattern.exec(raw)) !== null) {
    if (coverMatch[1] && coverMatch[1].startsWith('data:image')) {
        coverUrls.push(coverMatch[1]);
    }
}

// 提取dataUrl
const dataPattern = /"dataUrl":\s*"([^"]*?)"(?=\s*,|\s*})/g;
let dataMatch;
while ((dataMatch = dataPattern.exec(raw)) !== null) {
    if (dataMatch[1] && dataMatch[1].startsWith('data:image')) {
        dataUrls.push(dataMatch[1]);
    }
}

console.log('=== 图片统计 ===');
console.log('封面图:', coverUrls.length);
console.log('数据图:', dataUrls.length);

// 提取user_mp3sb595owl3pyqqx9o的数据
const userKey = 'user_mp3sb595owl3pyqqx9o';
const userStart = raw.indexOf(`"${userKey}"`);
const nextUser = raw.indexOf('"user_mp', userStart + userKey.length + 5);

if (userStart === -1) {
    console.log('❌ 未找到用户数据');
    process.exit(1);
}

const userRaw = raw.substring(userStart, nextUser > 0 ? nextUser : raw.length);
console.log('\n=== 用户数据长度 ===');
console.log('原始长度:', userRaw.length);

// 找到books数组
const booksMatch = userRaw.match(/"books":\s*\[([\s\S]*?)\]\s*,\s*"yearSummaries"/);
if (booksMatch) {
    let booksContent = booksMatch[1];
    
    // 提取所有书籍对象
    const books = [];
    let current = '';
    let braceCount = 0;
    let inObject = false;
    
    for (let i = 0; i < booksContent.length; i++) {
        const char = booksContent[i];
        
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
                try {
                    const book = JSON.parse(current);
                    
                    // 提取原始JSON中的coverUrl和dataUrl
                    const coverMatch = current.match(/"coverUrl":\s*"([^"]*?)"/);
                    const dataMatch = current.match(/"dataUrl":\s*"([^"]*?)"/);
                    
                    if (coverMatch && coverMatch[1] && coverMatch[1].startsWith('data:image')) {
                        book.coverUrl = coverMatch[1];
                    }
                    if (dataMatch && dataMatch[1] && dataMatch[1].startsWith('data:image')) {
                        book.dataUrl = dataMatch[1];
                    }
                    
                    books.push(book);
                } catch(e) {}
                current = '';
                inObject = false;
            }
        }
    }
    
    console.log('\n=== 解析结果 ===');
    console.log('书籍数量:', books.length);
    
    const withCover = books.filter(b => b.coverUrl && b.coverUrl.length > 100).length;
    const withData = books.filter(b => b.dataUrl && b.dataUrl.length > 100).length;
    console.log('有封面图:', withCover);
    console.log('有数据图:', withData);
    
    // 替换原数据中的books数组
    let newUserRaw = userRaw.replace(/"books":\s*\[([\s\S]*?)\]\s*,\s*"yearSummaries"/, 
        `"books": ${JSON.stringify(books, null, 8)},\n      "yearSummaries"`);
    
    // 保存
    const result = JSON.parse(raw);
    const fixedData = JSON.parse(newUserRaw);
    result[userKey] = fixedData;
    
    fs.writeFileSync('userData-fixed.json', JSON.stringify(result, null, 2), 'utf-8');
    console.log('\n✅ 修复后的数据已保存到 userData-fixed.json');
    console.log('文件大小:', (fs.statSync('userData-fixed.json').size / 1024 / 1024).toFixed(2), 'MB');
}
