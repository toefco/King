
# 数据恢复步骤

## 方法一：使用浏览器控制台（推荐）

1. 在浏览器中打开你的网站（http://localhost:5183）
2. 按 F12 打开开发者工具，点击 "Console" 标签
3. 复制下面的代码并在控制台中粘贴，按回车执行：

```javascript
// 请将完整的备份数据JSON内容粘贴到下面的变量中
const backupData = {
  "user_mp3sb595owl3pyqqx9o": {
    // 这里需要粘贴完整的备份数据内容
  }
};

// 恢复数据
const KEY = 'talent-showcase-owner-data';
const userKey = Object.keys(backupData)[0];
const appData = backupData[userKey].data;
localStorage.setItem(KEY, JSON.stringify(appData));

// 显示恢复结果
console.log('✅ 数据恢复成功！');
console.log('📚 书籍:', appData.books?.length || 0, '本');
console.log('💪 运动记录:', appData.workouts?.length || 0, '条');
console.log('📊 健身测试:', appData.fitnessTests?.length || 0, '条');
console.log('⏰ 导出时间:', appData.exportedAt);
console.log('');
console.log('👉 请刷新页面查看恢复的数据');
```

## 方法二：使用数据导入功能

1. 打开网站
2. 找到数据管理/导入功能
3. 使用导入功能导入 server/data/userData.json 文件中的数据

---

注意：由于备份数据文件很大，方法一更可靠。
