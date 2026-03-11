const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// 删除所有 const isWeChat 声明
content = content.replace(/\s*(const|let) isWeChat = \/MicroMessenger\/i\.test\(navigator\.userAgent\);?\n?/g, '');

// 删除所有 const errorMsg 声明，改为 let
content = content.replace(/const errorMsg =/g, 'let errorMsg =');

// 在文件开头添加全局变量
const header = `// 全局变量
const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

`;

content = header + content;

fs.writeFileSync('app.js', content);
console.log('✅ 已修复所有重复声明');
