const fs = require('fs');

// 读取原始文件
const raw = fs.readFileSync('server/data/userData.json');
console.log('原始文件大小:', raw.length);

// 尝试解析
try {
    const data = JSON.parse(raw);
    const userData = data['user_mp3sb595owl3pyqqx9o'].data;
    
    // 检查books的coverUrl
    console.log('\n=== books数据 ===');
    console.log('books数量:', userData.books.length);
    console.log('books[0].coverUrl长度:', userData.books[0].coverUrl ? userData.books[0].coverUrl.length : 0);
    
    // 如果coverUrl为空，直接从文件中提取
    if (!userData.books[0].coverUrl) {
        console.log('\n⚠️ JSON解析丢失了图片数据！');
        console.log('直接从文件中提取图片...');
        
        // 提取books数组的原始内容
        const rawStr = raw.toString('utf-8');
        const booksMatch = rawStr.match(/"books":\s*\[([\s\S]*?)\]\s*,\s*"yearSummaries"/);
        
        if (booksMatch) {
            console.log('\n✅ 找到了books原始内容，长度:', booksMatch[1].length);
            
            // 提取第一本书的coverUrl和dataUrl
            const bookMatch = booksMatch[1].match(/"coverUrl":\s*"([^"]+)"/);
            const dataUrlMatch = booksMatch[1].match(/"dataUrl":\s*"([^"]+)"/);
            
            console.log('第一本书coverUrl:', bookMatch ? bookMatch[1].substring(0, 100) + '...' : '未找到');
            console.log('第一本书dataUrl:', dataUrlMatch ? dataUrlMatch[1].substring(0, 100) + '...' : '未找到');
        }
    }
} catch(e) {
    console.log('JSON解析错误:', e.message);
}
