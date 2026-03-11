const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// 在文件开头声明 isWeChat
const header = `// 全局变量
const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

`;

// 删除所有重复的声明
content = content.replace(/\s*(const|let) isWeChat = \/MicroMessenger\/i\.test\(navigator\.userAgent\);?\n?/g, '');

// 添加到文件开头
content = header + content;

fs.writeFileSync('app.js', content);
console.log('✅ 已修复 isWeChat 重复声明');
