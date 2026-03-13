// 应用逻辑 - 等待 DOM 加载完成
function initApp() {
    console.log('开始初始化应用');
    const container = document.getElementById('hospitalContainer');
    const searchInput = document.getElementById('searchInput');
    const aiBox = document.getElementById('aiAnalysis');
    const aiResultText = document.getElementById('aiResultText');
    const listTitle = document.getElementById('listTitle');
    const listSubtitle = document.getElementById('listSubtitle');
    
    // 检查元素是否存在
    if (!container || !searchInput || !aiBox || !aiResultText || !listTitle || !listSubtitle) {
        console.error('页面元素未找到！');
        console.log('container:', container);
        console.log('searchInput:', searchInput);
        console.log('aiBox:', aiBox);
        console.log('aiResultText:', aiResultText);
        console.log('listTitle:', listTitle);
        console.log('listSubtitle:', listSubtitle);
        return;
    }
    
    console.log('所有元素已找到，初始化完成');
    
    // 将变量设为全局，供其他函数使用
    window.container = container;
    window.searchInput = searchInput;
    window.aiBox = aiBox;
    window.aiResultText = aiResultText;
    window.listTitle = listTitle;
    window.listSubtitle = listSubtitle;

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
function renderHospitals(list, highlightDept = null) {
    window.container.innerHTML = '';
    
    if (list.length === 0) {
        window.container.innerHTML = `
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
        
        // 决定显示哪些科室
        let deptsToShow = [];
        if (highlightDept) {
            // 如果指定了科室，优先显示该科室
            const targetDept = h.topDepts.find(d => d.name.includes(highlightDept) || highlightDept.includes(d.name));
            if (targetDept) {
                deptsToShow.push(targetDept);
                // 再添加其他科室，最多3个
                const otherDepts = h.topDepts.filter(d => d !== targetDept).slice(0, 2);
                deptsToShow = [...deptsToShow, ...otherDepts];
            } else {
                // 如果没找到，显示前3个
                deptsToShow = h.topDepts.slice(0, 3);
            }
        } else {
            // 没有指定科室，显示前3个
            deptsToShow = h.topDepts.slice(0, 3);
        }
        
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
                    ${deptsToShow.map(d => `
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
        
        window.container.appendChild(card);
    });
    
    // 重新初始化图标
    lucide.createIcons();
}

// 处理搜索 - 调用云函数
async function handleSearch() {
    // 确保全局变量已初始化，如果没有则尝试初始化
    if (!window.searchInput || !window.aiBox || !window.aiResultText) {
        console.warn('页面元素未初始化，尝试手动获取...');
        window.searchInput = window.searchInput || document.getElementById('searchInput');
        window.aiBox = window.aiBox || document.getElementById('aiAnalysis');
        window.aiResultText = window.aiResultText || document.getElementById('aiResultText');
        window.listTitle = window.listTitle || document.getElementById('listTitle');
        window.listSubtitle = window.listSubtitle || document.getElementById('listSubtitle');
        window.container = window.container || document.getElementById('hospitalContainer');
        
        // 再次检查
        if (!window.searchInput || !window.aiBox || !window.aiResultText) {
            console.error('页面元素未找到！');
            alert('页面加载失败，请刷新重试');
            return;
        }
    }
    
    const val = window.searchInput.value.trim();
    
    if (!val) {
        window.aiBox.classList.add('hidden');
        document.getElementById('deptTabsSection').classList.add('hidden');
        window.listTitle.innerText = "推荐医院";
        window.listSubtitle.innerText = "为您精选北京 TOP 医院";
        renderHospitals(hospitals);
        return;
    }
    
    // 显示 AI 分析框
    window.aiBox.classList.remove('hidden');
    window.aiBox.classList.add('loading-pulse');
    window.aiResultText.innerText = "AI 正在分析您的症状...";
    
    try {
        // 直接 HTTP 调用云函数
        console.log('开始调用云函数，症状:', val);
        console.log('请求 URL:', 'https://hospital-search-7gnfne58d97018a9-1404181085.ap-shanghai.app.tcloudbase.com/aiTriage1');
        console.log('User Agent:', navigator.userAgent);
        
        // 检测是否在微信浏览器中
        const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
        console.log('是否微信浏览器:', isWeChat);
        
        // 微信浏览器兼容方案：不使用 AbortController
        let response;
        if (isWeChat) {
            // 微信浏览器：简单的 fetch，不使用超时控制
            response = await fetch('https://hospital-search-7gnfne58d97018a9-1404181085.ap-shanghai.app.tcloudbase.com/aiTriage1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    symptom: val
                })
            });
        } else {
            // 普通浏览器：使用超时控制
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);
            
            response = await fetch('https://hospital-search-7gnfne58d97018a9-1404181085.ap-shanghai.app.tcloudbase.com/aiTriage1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    symptom: val
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
        }
        
        console.log('HTTP 状态码:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('云函数返回:', result);
        
        window.aiBox.classList.remove('loading-pulse');
        
        if (result.code === 0) {
            const { department, analysis } = result.data;
            
            window.aiResultText.innerText = analysis;
            
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
        console.error('错误详情:', error.message, error.stack);
        window.aiBox.classList.remove('loading-pulse');
        
        // 检测是否在微信浏览器中
        const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
        
        // 显示详细错误提示（帮助调试）
        let errorMsg = '⚠️ AI 分析暂时失败\n\n';
        errorMsg += '错误信息：' + error.message + '\n\n';
        errorMsg += '浏览器：' + (isWeChat ? '微信浏览器' : '普通浏览器') + '\n\n';
        errorMsg += '为您展示相关医院推荐。';
        
        window.aiResultText.innerText = errorMsg;
        
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
        const dept = primaryMatch[1].replace(/[✅🏥💡🔄•\s]/g, '').split(/[：:（(，,、]/)[0];
        if (dept) depts.push(dept);
    }
    
    // 提取备选科室（支持多行）
    const lines = analysis.split('\n');
    let inSecondary = false;
    
    for (const line of lines) {
        if (line.includes('备选科室')) {
            inSecondary = true;
            continue;
        }
        
        if (inSecondary) {
            // 如果遇到新的 emoji 标题，停止
            if (line.match(/^[💡🏥🔄]/)) {
                break;
            }
            
            // 提取科室名
            const cleaned = line.trim().replace(/^[•\s]+/, '');
            if (cleaned) {
                const dept = cleaned.split(/[：:（(]/)[0].trim();
                if (dept && dept.includes('科') && !depts.includes(dept)) {
                    depts.push(dept);
                }
            }
        }
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
    filterHospitalsByDept(deptName, window.searchInput.value);
}
    
    // 暴露到全局供 HTML onclick 使用
    window.switchDept = switchDept;

// 根据科室筛选医院（智能匹配 - 简化版）
function filterHospitalsByDept(deptName, symptom = '') {
    // 提取核心科室名（使用简单字符串方法）
    let coreKeyword = deptName;
    if (deptName.endsWith('内科')) {
        coreKeyword = deptName.slice(0, -2);
    } else if (deptName.endsWith('外科')) {
        coreKeyword = deptName.slice(0, -2);
    } else if (deptName.endsWith('学科')) {
        coreKeyword = deptName.slice(0, -2);
    }
    
    console.log('🔍 科室筛选:', deptName, '→', coreKeyword);
    
    // 第1层：有该科室的医院（按排名排序）
    const withDept = hospitals.filter(h => 
        h.topDepts.some(d => 
            d.name.includes(deptName) || 
            d.name.includes(coreKeyword)
        )
    ).sort((a, b) => {
        const rA = a.topDepts.find(d => d.name.includes(deptName) || d.name.includes(coreKeyword))?.rank || 99;
        const rB = b.topDepts.find(d => d.name.includes(deptName) || d.name.includes(coreKeyword))?.rank || 99;
        return rA - rB;
    });
    
    console.log('  第1层:', withDept.length, '家');
    
    // 第2层：关键词匹配但没有该科室的医院
    const withKeyword = hospitals.filter(h => 
        !h.topDepts.some(d => d.name.includes(deptName) || d.name.includes(coreKeyword)) &&
        symptom && h.keywords.some(k => symptom.includes(k))
    );
    
    console.log('  第2层:', withKeyword.length, '家');
    
    // 第3层：综合医院降级（常见科室如果数据不全，显示综合医院）
    const commonDepts = ['呼吸内科', '皮肤科', '消化内科', '心血管内科', '神经内科', '内分泌科', '泌尿外科', '普外科'];
    let withGeneral = [];
    
    if (commonDepts.includes(deptName)) {
        withGeneral = hospitals.filter(h => 
            h.type === '综合医院' &&
            !h.topDepts.some(d => d.name.includes(deptName) || d.name.includes(coreKeyword)) &&
            !(symptom && h.keywords.some(k => symptom.includes(k)))
        ).slice(0, 10); // 最多显示10家综合医院
    }
    
    console.log('  第3层（综合医院降级）:', withGeneral.length, '家');
    
    const filtered = [...withDept, ...withKeyword, ...withGeneral];
    
    console.log('  ✅ 最终:', filtered.length, '家');
    
    window.listTitle.innerText = `针对"${deptName}"的优势医院`;
    window.listSubtitle.innerText = `以下这些医院的${deptName}为优势科室，供您参考`;
    renderHospitals(filtered.length > 0 ? filtered : hospitals, deptName);
}
    
    // 暴露到全局
    window.filterHospitalsByDept = filterHospitalsByDept;

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
    
    window.aiResultText.innerText = `💡 导诊建议\n根据症状分析，建议就诊 ${foundDept}。`;
    window.listTitle.innerText = `针对"${foundDept}"的优势医院`;
    window.listSubtitle.innerText = `以下这些医院的${foundDept}为优势科室，供您参考`;
    
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
    // 确保元素已初始化
    const searchInput = window.searchInput || document.getElementById('searchInput');
    if (!searchInput) {
        console.error('搜索框未找到');
        return;
    }
    
    searchInput.value = tag;
    handleSearch();
}

// 页面加载完成
window.onload = () => {
    renderHospitals(hospitals);
    lucide.createIcons();
    
    // 回车搜索
    window.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
};

// 检查登录状态
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userPhone = localStorage.getItem('userPhone');
    
    const loginBtn = document.getElementById('loginBtn');
    const userInfo = document.getElementById('userInfo');
    const userPhoneEl = document.getElementById('userPhone');
    
    if (!loginBtn || !userInfo) return;
    
    if (isLoggedIn === 'true' && userPhone && userPhoneEl) {
        // 显示用户信息
        loginBtn.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userPhoneEl.innerText = userPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } else {
        // 显示登录按钮
        loginBtn.classList.remove('hidden');
        userInfo.classList.add('hidden');
    }
}

    // 初始化页面
    renderHospitals(hospitals);
    checkLoginStatus();
    
    // 绑定查询按钮事件
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            console.log('查询按钮被点击');
            handleSearch();
        });
    }
    
    // 初始化图标
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// 如果 DOM 已经加载完成，立即初始化
if (document.readyState === 'loading') {
    // DOM 还在加载中
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM 已经加载完成
    initApp();
}
