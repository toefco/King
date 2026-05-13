const fs = require('fs');

const raw = fs.readFileSync('server/data/userData.json', 'utf-8');

console.log('=== 正在提取完整数据 ===');

// 1. 找到所有数据
const booksMatch = raw.match(/"books":\s*\[([\s\S]*?)\]\s*,\s*"yearSummaries"/);

if (booksMatch) {
    const booksRaw = booksMatch[1];
    console.log('books原始内容长度:', booksRaw.length);
    
    // 手动提取每一本书
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
                // 找到一本书
                try {
                    // 直接从current字符串提取coverUrl和dataUrl
                    let coverUrl = '';
                    const coverMatch = current.match(/"coverUrl":\s*"([^"]*?)"/);
                    if (coverMatch && coverMatch[1]) {
                        coverUrl = coverMatch[1];
                    }
                    
                    let dataUrl = '';
                    const dataMatch = current.match(/"dataUrl":\s*"([^"]*?)"/);
                    if (dataMatch && dataMatch[1]) {
                        dataUrl = dataMatch[1];
                    }
                    
                    // 解析基础数据
                    const bookBasic = JSON.parse(current);
                    
                    // 替换coverUrl和dataUrl
                    if (coverUrl) bookBasic.coverUrl = coverUrl;
                    if (dataUrl) bookBasic.dataUrl = dataUrl;
                    
                    books.push(bookBasic);
                } catch (e) {
                    console.error('解析书籍失败:', e.message);
                }
                
                current = '';
                inObject = false;
            }
        }
    }
    
    console.log('\n=== 书籍提取结果 ===');
    console.log('书籍总数:', books.length);
    
    let coverCount = 0;
    let dataCount = 0;
    
    books.forEach((book, i) => {
        if (book.coverUrl && book.coverUrl.length > 100) coverCount++;
        if (book.dataUrl && book.dataUrl.length > 100) dataCount++;
        console.log(`${i + 1}. ${book.title} | cover: ${book.coverUrl?.length || 0} | data: ${book.dataUrl?.length || 0}`);
    });
    
    console.log('\n✅ 封面图:', coverCount);
    console.log('✅ 数据图:', dataCount);
    console.log('✅ 总图片:', coverCount + dataCount);
    
    // 重新构建完整数据
    const fullData = JSON.parse(raw);
    fullData['user_mp3sb595owl3pyqqx9o'].data.books = books;
    
    fs.writeFileSync('userData-complete-with-images.json', JSON.stringify(fullData, null, 2), 'utf-8');
    
    console.log('\n✅ 完整数据已保存到 userData-complete-with-images.json');
    console.log('📦 文件大小:', (fs.statSync('userData-complete-with-images.json').size / 1024 / 1024).toFixed(2), 'MB');
    
    // 创建HTML恢复页面
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>完整数据恢复</title>
</head>
<body style="font-family: Arial; padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
    <div style="background: white; border-radius: 20px; padding: 40px; max-width: 600px; margin: 0 auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        <h1 style="color: #333;">🎯 完整数据恢复</h1>
        <p style="color: #666; margin: 20px 0;">恢复所有书籍、图片、运动记录！</p>
        
        <div style="background: #e8f5e9; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: left;">
            <h3 style="color: #2e7d32;">恢复内容：</h3>
            <p>📚 书籍：${books.length} 本</p>
            <p>🖼️ 封面图：${coverCount} 张</p>
            <p>📊 数据图：${dataCount} 张</p>
            <p>🏋️ 运动记录：${fullData['user_mp3sb595owl3pyqqx9o'].data.workouts?.length || 0} 条</p>
            <p>📦 文件大小：约11MB</p>
        </div>
        
        <button onclick="restore()" id="restoreBtn" style="padding: 20px 40px; font-size: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; cursor: pointer;">
            🚀 一键恢复完整数据
        </button>
        
        <p id="status" style="margin-top: 20px; color: #666;">点击开始恢复</p>
    </div>

    <script>
        const fullData = ${JSON.stringify(fullData['user_mp3sb595owl3pyqqx9o'].data)};
        
        function restore() {
            const btn = document.getElementById('restoreBtn');
            const status = document.getElementById('status');
            
            btn.disabled = true;
            status.textContent = '正在保存数据到浏览器...';
            
            try {
                localStorage.setItem('talent-showcase-owner-data', JSON.stringify(fullData));
                status.innerHTML = '<span style="color: #2e7d32; font-weight: bold;">✅ 成功！所有数据（含图片）已恢复！</span>';
                
                setTimeout(() => {
                    window.location.href = 'http://localhost:5185/';
                }, 1500);
            } catch (e) {
                status.innerHTML = '<span style="color: red;">❌ 失败: ' + e.message + '</span>';
                btn.disabled = false;
            }
        }
        
        window.onload = function() {
            setTimeout(restore, 500);
        };
    </script>
</body>
</html>`;

    fs.writeFileSync('restore-full-data.html', htmlContent, 'utf-8');
    console.log('\n✅ 恢复页面已创建: restore-full-data.html');
    console.log('请在浏览器打开: file:///D:/kingou/restore-full-data.html');
}
