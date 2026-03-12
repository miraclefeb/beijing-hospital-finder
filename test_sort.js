// 模拟数据
const hospitals = [
    { name: "协和", topDepts: [{ name: "神经内科", rank: 7 }] },
    { name: "天坛", topDepts: [{ name: "神经内科", rank: 1 }] },
    { name: "宣武", topDepts: [{ name: "神经内科", rank: 3 }] }
];

const deptName = "神经内科";

// 当前的排序逻辑
const sorted = hospitals.sort((a, b) => {
    const rA = a.topDepts.find(d => d.name.includes(deptName))?.rank || 99;
    const rB = b.topDepts.find(d => d.name.includes(deptName))?.rank || 99;
    console.log(`比较: ${a.name}(${rA}) vs ${b.name}(${rB}) => ${rA - rB}`);
    return rA - rB;
});

console.log("\n排序结果:");
sorted.forEach((h, i) => {
    const rank = h.topDepts.find(d => d.name.includes(deptName))?.rank;
    console.log(`${i+1}. ${h.name} - rank: ${rank}`);
});
