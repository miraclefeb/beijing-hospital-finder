# 多科室切换功能设计

## 功能说明

当 AI 推荐多个科室时（首选 + 备选），页面会显示科室切换 Tab，用户可以点击不同科室查看对应的优势医院。

## 实现方案

### 1. 前端 HTML 修改

在 AI 结果区域下方添加科室 Tab：

```html
<!-- 科室切换 Tab（多科室时显示）-->
<div id="deptTabsSection" class="hidden mx-4 mt-4">
    <p class="text-[11px] font-bold text-slate-400 mb-3 px-1 uppercase tracking-wider">
        切换查看科室优势医院
    </p>
    <div id="deptTabs" class="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <!-- 动态生成科室 Tab -->
    </div>
</div>
```

### 2. 前端 JavaScript 逻辑

```javascript
// 全局变量：存储推荐的科室列表
let recommendedDepartments = [];

// 处理 AI 返回结果
async function handleSearch() {
    const result = await fetch(cloudFunctionUrl, {
        method: 'POST',
        body: JSON.stringify({ symptom })
    });
    
    const data = await result.json();
    const { department, analysis } = data.data;
    
    // 解析多个科室
    recommendedDepartments = extractDepartments(analysis);
    
    // 显示 AI 结果
    aiResultText.innerText = analysis;
    
    // 如果有多个科室，显示 Tab
    if (recommendedDepartments.length > 1) {
        renderDeptTabs(recommendedDepartments);
        document.getElementById('deptTabsSection').classList.remove('hidden');
    } else {
        document.getElementById('deptTabsSection').classList.add('hidden');
    }
    
    // 默认显示第一个科室的医院
    filterHospitalsByDept(recommendedDepartments[0] || department);
}

// 提取科室列表
function extractDepartments(analysis) {
    const depts = [];
    
    // 提取首选科室
    const primaryMatch = analysis.match(/首选科室[：:]\s*([^\n]+)/);
    if (primaryMatch) {
        const dept = primaryMatch[1].replace(/[✅🏥💡🔄•\s]/g, '').split(/[，,、]/)[0];
        depts.push(dept);
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
    
    return [...new Set(depts)]; // 去重
}

// 渲染科室 Tab
function renderDeptTabs(depts) {
    const tabsHtml = depts.map((dept, index) => `
        <button 
            onclick="switchDept('${dept}', this)" 
            class="whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all ${
                index === 0 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-white text-slate-400 border border-slate-200'
            }"
        >
            ${dept}
        </button>
    `).join('');
    
    document.getElementById('deptTabs').innerHTML = tabsHtml;
}

// 切换科室
function switchDept(deptName, btn) {
    // 更新 Tab 样式
    document.querySelectorAll('#deptTabs button').forEach(b => {
        b.className = "whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all bg-white text-slate-400 border border-slate-200";
    });
    btn.className = "whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all bg-blue-600 text-white shadow-lg shadow-blue-200";
    
    // 筛选并显示医院
    filterHospitalsByDept(deptName);
}

// 根据科室筛选医院
function filterHospitalsByDept(deptName) {
    const filtered = hospitals.filter(h => 
        h.topDepts.some(d => d.name.includes(deptName))
    ).sort((a, b) => {
        const rA = a.topDepts.find(d => d.name.includes(deptName))?.rank || 99;
        const rB = b.topDepts.find(d => d.name.includes(deptName))?.rank || 99;
        return rA - rB;
    });
    
    // 更新标题
    document.getElementById('listTitle').innerText = `针对"${deptName}"的优势医院`;
    
    // 渲染医院列表
    renderHospitals(filtered.length > 0 ? filtered : hospitals);
}
```

### 3. CSS 样式

```css
/* Tab 激活状态 */
.tab-active {
    background: #2563eb;
    color: white;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

/* 隐藏滚动条 */
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}
```

## 效果演示

**单科室推荐：**
```
AI 推荐匹配科室
💡 导诊建议
建议就诊神经内科

[不显示 Tab，直接显示神经内科医院]
```

**多科室推荐：**
```
AI 推荐匹配科室
💡 导诊建议
...
🏥 挂号策略
✅ 首选科室：呼吸内科
...
🔄 备选科室：
• 耳鼻咽喉科（70%）
• 感染科（65%）

[显示 Tab]
┌─────────────────────────────────┐
│ [呼吸内科] [耳鼻咽喉科] [感染科] │
└─────────────────────────────────┘

[点击不同 Tab，下方医院列表动态切换]
```

## 下一步

1. 修改 `frontend/index.html` - 添加 Tab 区域
2. 修改 `frontend/app.js` - 添加科室提取和切换逻辑
3. 测试多科室场景
