// 应用逻辑
const container = document.getElementById('hospitalContainer');
const searchInput = document.getElementById('searchInput');
const aiBox = document.getElementById('aiAnalysis');
const aiResultText = document.getElementById('aiResultText');
const listTitle = document.getElementById('listTitle');
const listSubtitle = document.getElementById('listSubtitle');

// 生成医院标签
function generateHospitalTags(hospital) {
    const tags = [];
    
    // 三甲综合
    if (hospital.type === '综合医院') {
        tags.push('三甲综合');
    } else if (hospital.type === '专科医院') {
        tags.push('专科强院');
    }
    
    // 百年老院（成立年份≤1926年，即≥100年）
    if (hospital.founded) {
        const year = parseInt(hospital.founded);
        if (year <= 1926) {
            tags.push('百年老院');
        }
    }
    
    // 高校附属
    if (hospital.name.includes('大学') || hospital.name.includes('医科大学') || hospital.name.includes('首都医科')) {
        tags.push('高校附属');
    }
    
    // 医保定点（默认三甲都是）
    tags.push('医保定点');
    
    return tags.slice(0, 3); // 最多显示3个
}

// 渲染医院列表
function renderHospitals(list) {
    container.innerHTML = '';
    
    if (list.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <p class="text-slate-400 text-sm">暂无相关医院</p>
            </div>
        `;
        return;
    }
    
    list.forEach((h, index) => {
        const card = document.createElement('div');
        card.className = "hospital-card bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col gap-4";
        
        const tags = generateHospitalTags(h);
        
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <h2 class="text-lg font-extrabold text-slate-800">${h.name}</h2>
                        <span class="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-md font-black">${h.rank}</span>
                    </div>
                    <p class="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <i data-lucide="map-pin" class="w-3 h-3"></i> ${h.address}
                    </p>
                </div>
            </div>
            
            <p class="text-sm text-slate-500 line-clamp-2 leading-relaxed">${h.desc}</p>
            
            <div class="bg-slate-50/50 rounded-2xl p-4">
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 block">优势专科排名</span>
                <div class="space-y-3">
                    ${h.topDepts.slice(0, 3).map(d => `
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-bold text-slate-700">${d.name}</span>
                            <span class="bg-amber-100 text-amber-700 text-[10px] px-3 py-1 rounded-full font-black italic">
                                No.${d.rank} 全国排名
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="flex items-center justify-between pt-2">
                <div class="flex gap-2 flex-wrap">
                    ${tags.map(tag => `
                        <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                            # ${tag}
                        </span>
                    `).join('')}
                </div>
                <a href="tel:${h.phone}" class="bg-slate-800 text-white p-2.5 rounded-full shadow-lg shadow-slate-200">
                    <i data-lucide="phone" class="w-4 h-4"></i>
                </a>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // 重新初始化图标
    lucide.createIcons();
}

// 处理搜索 - 调用云函数
async function handleSearch() {
    const val = searchInput.value.trim();
    
    if (!val) {
        aiBox.classList.add('hidden');
        document.getElementById('deptTabsSection').classList.add('hidden');
        listTitle.innerText = "推荐医院";
        listSubtitle.innerText = "为您精选北京 TOP 医院";
        renderHospitals(hospitals);
        return;
    }
    
    // 显示 AI 分析框
    aiBox.classList.remove('hidden');
    aiBox.classList.add('loading-pulse');
    aiResultText.innerText = "AI 正在分析您的症状...";
    
    try {
        // 直接 HTTP 调用云函数
        console.log('开始调用云函数，症状:', val);
        const response = await fetch('https://hospital-search-7gnfne58d97018a9-1404181085.ap-shanghai.app.tcloudbase.com/aiTriage1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                symptom: val
            })
        });
        
        const result = await response.json();
        console.log('云函数返回:', result);
        
        aiBox.classList.remove('loading-pulse');
        
        if (result.code === 0) {
            const { department, analysis } = result.data;
            
            aiResultText.innerText = analysis;
            
            // 提取多个科室
            const departments = extractDepartments(analysis, department);
            
            // 如果有多个科室，显示 Tab
            if (departments.length > 1) {
                renderDeptTabs(departments);
                document.getElementById('deptTabsSection').classList.remove('hidden');
            } else {
                document.getElementById('deptTabsSection').classList.add('hidden');
            }
            
            // 默认显示第一个科室的医院
            filterHospitalsByDept(departments[0] || department, val);
        } else {
            // AI 分析失败，降级到关键词匹配
            console.error('AI 分析失败:', result);
            fallbackSearch(val);
        }
        
    } catch (error) {
        console.error('调用云函数失败:', error);
        aiBox.classList.remove('loading-pulse');
        
        // 降级到关键词匹配
        fallbackSearch(val);
    }
}

// 提取科室列表
function extractDepartments(analysis, primaryDept) {
    const depts = [];
    
    // 提取首选科室
    const primaryMatch = analysis.match(/首选科室[：:]\s*([^\n]+)/);
    if (primaryMatch) {
        const dept = primaryMatch[1].replace(/[✅🏥💡🔄•\s]/g, '').split(/[，,、]/)[0];
        if (dept) depts.push(dept);
    }
    
    // 提取备选科室
    const secondaryMatch = analysis.match(/备选科室[：:]\s*([^\n]+)/);
    if (secondaryMatch) {
        const secondaryText = secondaryMatch[1];
        const secondaryDepts = secondaryText.split(/[、，,]/).map(s => {
            return s.trim().replace(/[•\s]/g, '').split(/[（(]/)[0];
        }).filter(s => s && s.includes('科'));
        depts.push(...secondaryDepts);
    }
    
    // 如果没提取到，使用主科室
    if (depts.length === 0 && primaryDept) {
        depts.push(primaryDept);
    }
    
    return [...new Set(depts)]; // 去重
}

// 渲染科室 Tab
function renderDeptTabs(depts) {
    const tabsHtml = depts.map((dept, index) => `
        <button 
            onclick="switchDept('${dept}', this)" 
            class="whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all ${
                index === 0 
                    ? 'tab-active' 
                    : 'bg-white text-slate-400 border border-slate-200'
            }"
        >
            ${dept}
        </button>
    `).join('');
    
    document.getElementById('deptTabs').innerHTML = tabsHtml;
    lucide.createIcons();
}

// 切换科室
function switchDept(deptName, btn) {
    // 更新 Tab 样式
    document.querySelectorAll('#deptTabs button').forEach(b => {
        b.className = "whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all bg-white text-slate-400 border border-slate-200";
    });
    btn.className = "whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all tab-active";
    
    // 筛选并显示医院
    filterHospitalsByDept(deptName, searchInput.value);
}

// 根据科室筛选医院
function filterHospitalsByDept(deptName, symptom = '') {
    const filtered = hospitals.filter(h => 
        h.topDepts.some(d => d.name.includes(deptName)) || 
        (symptom && h.keywords.some(k => symptom.includes(k)))
    ).sort((a, b) => {
        const rA = a.topDepts.find(d => d.name.includes(deptName))?.rank || 99;
        const rB = b.topDepts.find(d => d.name.includes(deptName))?.rank || 99;
        return rA - rB;
    });
    
    listTitle.innerText = `针对"${deptName}"的优势医院`;
    listSubtitle.innerText = `以下这些医院的${deptName}为优势科室，供您参考`;
    renderHospitals(filtered.length > 0 ? filtered : hospitals);
}

// 降级方案：关键词匹配
function fallbackSearch(val) {
    // 简单的关键词匹配
    const symptomMap = {
        '嗓子': '耳鼻咽喉科',
        '喉咙': '耳鼻咽喉科',
        '头疼': '神经内科',
        '头痛': '神经内科',
        '骨折': '骨科',
        '腰痛': '骨科',
        '咳嗽': '呼吸内科',
        '发烧': '感染科',
        '小孩': '儿科'
    };
    
    let foundDept = '综合内科';
    for (const [key, dept] of Object.entries(symptomMap)) {
        if (val.includes(key)) {
            foundDept = dept;
            break;
        }
    }
    
    aiResultText.innerText = `💡 导诊建议\n根据症状分析，建议就诊 ${foundDept}。`;
    listTitle.innerText = `针对"${foundDept}"的优势医院`;
    listSubtitle.innerText = `以下这些医院的${foundDept}为优势科室，供您参考`;
    
    // 筛选相关医院
    const filtered = hospitals.filter(h => 
        h.topDepts.some(d => d.name.includes(foundDept)) || 
        h.keywords.some(k => val.includes(k))
    ).sort((a, b) => {
        const rA = a.topDepts.find(d => d.name.includes(foundDept))?.rank || 99;
        const rB = b.topDepts.find(d => d.name.includes(foundDept))?.rank || 99;
        return rA - rB;
    });
    
    renderHospitals(filtered);
}

// 快速搜索
function quickSearch(tag) {
    searchInput.value = tag;
    handleSearch();
}

// 页面加载完成
window.onload = () => {
    renderHospitals(hospitals);
    lucide.createIcons();
    
    // 回车搜索
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
};
