const fs = require('fs');
const content = fs.readFileSync('dist/data.js', 'utf8');
const hospitals = eval(content.replace('const hospitals = ', ''));

const withResp = hospitals.filter(h => 
  h.topDepts.some(d => d.name.includes('呼吸'))
);

console.log('有呼吸内科数据的医院：');
withResp.forEach(h => {
  const dept = h.topDepts.find(d => d.name.includes('呼吸'));
  console.log(`- ${h.name}: 呼吸内科 rank ${dept.rank}`);
});

console.log(`\n总共：${withResp.length} 家`);
