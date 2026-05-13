const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'staticData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 找到 readingSlots 数组
const readingSlotsMatch = content.match(/readingSlots:\s*\[([\s\S]*?)\](\s*,\s*brokenSlots:)/);

if (readingSlotsMatch) {
    const oldSlotsContent = readingSlotsMatch[1];
    const beforeContent = content.slice(0, readingSlotsMatch.index + 'readingSlots: '.length);
    const afterContent = content.slice(readingSlotsMatch.index + 'readingSlots: ['.length + oldSlotsContent.length);
    
    // 解析旧的 slot 数组（字符串数组）
    const oldSlotsStr = '[' + oldSlotsContent + ']';
    let oldSlots;
    try {
        oldSlots = eval(oldSlotsStr);
    } catch (e) {
        console.log('直接解析失败，尝试简化处理...');
        // 简化处理：提取每个字符串元素
        const slotStrings = [];
        let current = '';
        let inString = false;
        let escapeNext = false;
        for (let i = 0; i < oldSlotsContent.length; i++) {
            const char = oldSlotsContent[i];
            if (escapeNext) {
                current += char;
                escapeNext = false;
            } else if (char === '\\') {
                current += char;
                escapeNext = true;
            } else if (char === '"') {
                if (inString) {
                    slotStrings.push(current);
                    current = '';
                }
                inString = !inString;
            } else if (inString) {
                current += char;
            }
        }
        oldSlots = slotStrings;
    }
    
    // 转换为新的格式
    const newSlots = oldSlots.map((slot, index) => {
        if (slot === null || slot === undefined || slot === '') {
            return 'null';
        }
        // 简单地转义引号
        const escapedSlot = slot.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return `{"id":"slot-${index}","imageUrl":"${escapedSlot}"}`;
    });
    
    const newSlotsContent = newSlots.join(',\n  ');
    const newReadingSlotsLine = `readingSlots: [\n  ${newSlotsContent}\n]`;
    
    // 替换内容
    const newContent = beforeContent + newSlotsContent + afterContent;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('✅ readingSlots 数据格式转换成功！');
    console.log(`共转换了 ${oldSlots.length} 个槽位`);
} else {
    console.log('❌ 未找到 readingSlots 数组');
}
