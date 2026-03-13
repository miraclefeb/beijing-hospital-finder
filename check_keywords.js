const fs = require('fs');
const content = fs.readFileSync('dist/data.js', 'utf8');
const hospitals = eval(content.replace('const hospitals = ', ''));

// 检查同仁医院
const tongren = hospitals.find(h => h.name.includes('同仁'));
console.log('同仁医院:');
console.log('- keywords:', tongren.keywords);
console.log('- 有呼吸内科数据:', tongren.topDepts.some(d => d.name.includes('呼吸')));

// 检查有"发烧"关键词的医院
console.log('\n有"发烧"关键词的医院:');
hospitals.filter(h => h.keywords.includes('发烧')).forEach(h => {
  console.log(`- ${h.name}`);
});
