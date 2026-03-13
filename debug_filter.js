const fs = require('fs');
const content = fs.readFileSync('dist/data.js', 'utf8');
const hospitals = eval(content.replace('const hospitals = ', ''));

function filterHospitalsByDept(deptName, symptom = '') {
    let coreKeyword = deptName;
    if (deptName.endsWith('内科')) {
        coreKeyword = deptName.slice(0, -2);
    }
    
    console.log(`\n=== 搜索: "${symptom}" → 科室: "${deptName}" ===`);
    
    // 第1层：有该科室的医院
    const withDept = hospitals.filter(h => 
        h.topDepts.some(d => 
            d.name.includes(deptName) || 
            d.name.includes(coreKeyword)
        )
    );
    
    console.log(`第1层（有${deptName}数据）: ${withDept.length}家`);
    withDept.forEach(h => console.log(`  - ${h.name}`));
    
    // 第2层：关键词匹配
    const withKeyword = hospitals.filter(h => 
        !h.topDepts.some(d => d.name.includes(deptName) || d.name.includes(coreKeyword)) &&
        symptom && h.keywords.some(k => symptom.includes(k))
    );
    
    console.log(`第2层（关键词匹配）: ${withKeyword.length}家`);
    withKeyword.forEach(h => console.log(`  - ${h.name} (keywords: ${h.keywords.filter(k => symptom.includes(k)).join(', ')})`));
    
    // 第3层：综合医院降级
    const commonDepts = ['呼吸内科', '皮肤科', '消化内科', '心血管内科', '神经内科', '内分泌科', '泌尿外科', '普外科'];
    let withGeneral = [];
    
    if (commonDepts.includes(deptName)) {
        withGeneral = hospitals.filter(h => 
            h.type === '综合医院' &&
            !h.topDepts.some(d => d.name.includes(deptName) || d.name.includes(coreKeyword)) &&
            !(symptom && h.keywords.some(k => symptom.includes(k)))
        ).slice(0, 10);
    }
    
    console.log(`第3层（综合医院降级）: ${withGeneral.length}家`);
    withGeneral.forEach(h => console.log(`  - ${h.name}`));
    
    const total = [...withDept, ...withKeyword, ...withGeneral];
    console.log(`\n总计: ${total.length}家`);
    
    return total;
}

// 情境一
filterHospitalsByDept('呼吸内科', '嗓子疼发烧');

// 情境二
filterHospitalsByDept('呼吸内科', '嗓子疼');
