// 应用逻辑
const container = document.getElementById('hospitalContainer');
const searchInput = document.getElementById('searchInput');
const aiBox = document.getElementById('aiAnalysis');
const aiResultText = document.getElementById('aiResultText');
const recommendedDept = document.getElementById('recommendedDept');
const listTitle = document.getElementById('listTitle');

// 渲染医院列表
function renderHospitals(list) {
    container.innerHTML = '';
    
    list.forEach((h, index) => {
        const card = document.createElement('div');
        card.className = "hospital-card bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col gap-4";
        
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
                    ${h.topDepts.map(d => `
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
                <div class="flex gap-2">
                    ${h.features.slice(0, 2).map(f => `
                        <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            # ${f}
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

// 处理搜索
function handleSearch() {
    const val = searchInput.value.trim();
    
    if (!val) {
        aiBox.classList.add('hidden');
        listTitle.innerText = "推荐医院";
        renderHospitals(hospitals);
        return;
    }
    
    // 显示 AI 分析框
    aiBox.classList.remove('hidden');
    aiBox.classList.add('loading-pulse');
    aiResultText.innerText = "AI 正在分析您的症状...";
    recommendedDept.innerText = "...";
    
    // 模拟 AI 分析延迟
    setTimeout(() => {
        aiBox.classList.remove('loading-pulse');
        
        // 查找匹配的症状
        let foundKey = Object.keys(aiKnowledge).find(k => val.includes(k));
        
        if (foundKey) {
            const info = aiKnowledge[foundKey];
            aiResultText.innerText = info.analysis;
            recommendedDept.innerText = info.dept;
            listTitle.innerText = `针对"${info.dept}"的优势医院`;
            
            // 筛选相关医院
            const filtered = hospitals.filter(h => 
                h.topDepts.some(d => d.name.includes(info.dept)) || 
                h.keywords.some(k => val.includes(k))
            ).sort((a, b) => {
                const rA = a.topDepts.find(d => d.name.includes(info.dept))?.rank || 99;
                const rB = b.topDepts.find(d => d.name.includes(info.dept))?.rank || 99;
                return rA - rB;
            });
            
            renderHospitals(filtered);
        } else {
            // 未找到精确匹配，尝试关键词匹配
            aiResultText.innerText = "AI 暂时无法精确识别该症状。建议您输入更具体的描述，或前往综合内科预检。";
            recommendedDept.innerText = "综合内科";
            
            const filtered = hospitals.filter(h => 
                h.keywords.some(k => val.includes(k)) || 
                h.name.includes(val)
            );
            
            renderHospitals(filtered.length > 0 ? filtered : hospitals);
        }
    }, 600);
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
