const fs = require('fs');

// 以二进制方式读取
const buffer = fs.readFileSync('server/data/userData.json');
const raw = buffer.toString('utf-8');

console.log('文件大小:', raw.length);

// 找到books数组
const booksMatch = raw.match(/"books":\s*\[([\s\S]*?)\]\s*,\s*"yearSummaries"/);

if (booksMatch) {
    const booksContent = booksMatch[1];
    console.log('Books内容长度:', booksContent.length);
    
    // 提取每本书的数据
    const bookMatches = booksContent.match(/\{[^}]+\}/g);
    
    if (bookMatches) {
        console.log('找到', bookMatches.length, '本书');
        
        // 重新构建books数组，保留完整的图片数据
        let booksJson = '[';
        let braceCount = 0;
        let inBook = false;
        let currentBook = '';
        
        for (let i = 0; i < booksContent.length; i++) {
            const char = booksContent[i];
            currentBook += char;
            
            if (char === '{') {
                braceCount++;
                inBook = true;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0 && inBook) {
                    // 一本书结束
                    if (booksJson !== '[') booksJson += ',';
                    booksJson += currentBook;
                    currentBook = '';
                    inBook = false;
                }
            }
        }
        
        booksJson += ']';
        
        try {
            const books = JSON.parse(booksJson);
            console.log('\n成功解析', books.length, '本书');
            console.log('books[0].coverUrl长度:', books[0].coverUrl ? books[0].coverUrl.length : 0);
            
            // 统计有图片的书籍
            const withCover = books.filter(b => b.coverUrl && b.coverUrl.length > 100).length;
            const withData = books.filter(b => b.dataUrl && b.dataUrl.length > 100).length;
            console.log('有封面图:', withCover);
            console.log('有数据图:', withData);
            
            // 保存完整数据
            const fullData = JSON.parse(raw);
            fullData['user_mp3sb595owl3pyqqx9o'].data.books = books;
            
            fs.writeFileSync('complete-backup-fixed.json', JSON.stringify(fullData, null, 2), 'utf-8');
            console.log('\n✅ 完整备份已保存到 complete-backup-fixed.json');
            console.log('文件大小:', (fs.statSync('complete-backup-fixed.json').size / 1024 / 1024).toFixed(2), 'MB');
            
        } catch(e) {
            console.log('解析books失败:', e.message);
        }
    }
}
