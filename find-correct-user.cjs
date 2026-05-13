const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'userData-complete-with-images.json');

console.log('🔍 查找包含完整图片的用户数据...\n');

const raw = fs.readFileSync(filePath, 'utf8');

// 查找有 data:image 的那个用户，应该在位置 13140 附近
const searchPos = 13140;
// 往前查找前面最近的 "user_mp" 开头的字符串
const userStartPos = raw.lastIndexOf('"user_mp', searchPos);
console.log(`✅ 找到用户数据起始位置: ${userStartPos}`);

// 查找这个用户数据的结束位置
// 我们需要找到对应的闭合括号，让我们先看看前面的结构
const snippet = raw.substring(userStartPos, userStartPos + 300);
console.log(`\n📋 用户片段: ${snippet}`);

// 让我们从这个位置开始解析一个完整的用户对象！
// 我们需要找到对应的闭合的 } 和 } 来结束这个用户对象

// 让我们使用括号计数器的方式来找到正确的结束位置
let pos = userStartPos;
let braceCount = 0;
let inString = false;
let escapeNext = false;
while (pos < raw.length) {
  const char = raw[pos];
  
  if (escapeNext) {
    escapeNext = false;
  } else if (char === '\\') {
    escapeNext = true;
  } else if (char === '"') {
    inString = !inString;
  } else if (!inString && char === '{') {
    braceCount++;
  } else if (!inString && char === '}') {
    braceCount--;
    if (braceCount === 0) {
      // 找到了闭合位置！
      break;
    }
  }
  pos++;
}

const endPos = pos + 1;
console.log(`\n✅ 找到用户数据结束位置: ${endPos}`);

const userDataRaw = raw.substring(userStartPos, endPos);
console.log(`✅ 提取的用户数据长度: ${userDataRaw.length} 字符`);

// 现在解析这个用户数据！
try {
  // 我们需要把它变成一个完整的 JSON 对象来解析
  const toParse = `{${userDataRaw}}`;
  const parsed = JSON.parse(toParse);
  const userId = Object.keys(parsed)[0];
  const data = parsed[userId].data;
  
  console.log(`\n🎉 成功解析！用户ID: ${userId}`);
  
  console.log(`\n📊 数据内容:`);
  console.log(`   书籍: ${data.books?.length || 0}`);
  console.log(`   运动: ${data.workouts?.length || 0}`);
  console.log(`   技能: ${data.skills?.length || 0}`);
  console.log(`   爱好: ${data.hobbies?.length || 0}`);
  console.log(`   年度总结: ${data.yearSummaries?.length || 0}`);
  
  // 检查书籍图片
  let booksWithCover = 0;
  let booksWithData = 0;
  data.books?.forEach((book, i) => {
    if (book.coverUrl && book.coverUrl.length > 0) booksWithCover++;
    if (book.dataUrl && book.dataUrl.length > 0) booksWithData++;
  });
  console.log(`   有封面图的书籍: ${booksWithCover}`);
  console.log(`   有数据图的书籍: ${booksWithData}`);
  
  // 保存这个正确的数据到一个单独的文件！
  const correctData = {
    [userId]: {
      data: data
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'final-correct-data.json'),
    JSON.stringify(correctData, null, 2)
  );
  console.log(`\n✅ 正确的完整数据已保存到 final-correct-data.json!`);
  
} catch (e) {
  console.error(`\n❌ 解析失败:`, e.message);
  console.error(e.stack);
}
