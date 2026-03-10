# 北京医院导诊系统 - 部署指南

## 项目概述
- **功能**：用户输入症状 → AI 推荐科室 → 显示优质医院
- **技术栈**：纯静态前端 + 腾讯云 CloudBase + DeepSeek AI
- **部署平台**：腾讯云 CloudBase
- **GitHub**：https://github.com/miraclefeb/beijing-hospital-finder

---

## 核心配置（关键！）

### 1. 云函数配置（aiTriage）

**环境变量：**
```
DEEPSEEK_API_KEY = sk-fd83ad6009b54cac90e4fbf465845fc0
```

**HTTP 触发器：**
- 路径：`/aiTriage1`
- 方法：POST
- 完整 URL：`https://hospital-search-7gnfne58d97018a9-1404181085.ap-shanghai.app.tcloudbase.com/aiTriage1`

**关键代码结构：**
```javascript
exports.main = async (event, context) => {
  // 1. 解析参数（HTTP 触发器需要解析 event.body）
  let symptom;
  if (event.body) {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    symptom = body.symptom;
  }
  
  // 2. 调用 DeepSeek API
  const response = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.deepseek.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.write(postData);
    req.end();
  });
  
  // 3. 返回结果（必须包含 CORS 头）
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      code: 0,
      data: { department, analysis, symptom }
    })
  };
};
```

---

### 2. 前端调用方式

**使用 fetch（不用 CloudBase SDK）：**
```javascript
const response = await fetch('https://hospital-search-7gnfne58d97018a9-1404181085.ap-shanghai.app.tcloudbase.com/aiTriage1', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ symptom: '头疼' })
});

const result = await response.json();
if (result.code === 0) {
  const { department, analysis } = result.data;
  // 显示推荐结果
}
```

---

### 3. AI Prompt 设计（核心）

**要求：**
- 支持多科室推荐（主推 + 次选）
- 返回匹配度（百分比）
- 提供推荐理由
- 基于症状-科室映射表

**返回格式：**
```
主推：神经内科（匹配度：95%）头疼是神经系统的典型症状
次选：眼科（70%）、耳鼻喉科（65%）
```

**解析逻辑：**
```javascript
const primaryMatch = content.match(/主推[：:]\s*([^（(]+)[（(]匹配度[：:]\s*(\d+)%[）)]\s*(.+?)(?=次选|$)/s);
const secondaryMatch = content.match(/次选[：:]\s*(.+?)$/s);
```

---

## 部署流程

### 方式1：GitHub 自动部署（推荐）
1. 代码推送到 GitHub
2. CloudBase 自动拉取部署
3. **注意**：有时需要手动触发"更新服务"

### 方式2：手动上传
1. 从 GitHub 下载 `dist/` 目录下的文件
2. 上传到 CloudBase 静态网站托管
3. 覆盖旧文件

---

## 医院数据结构

**当前：20家医院**

```javascript
{
  name: "北京协和医院",
  rank: "三甲",
  type: "综合医院",
  founded: "1921年",
  desc: "详细介绍（3-4行）",
  topDepts: [
    { name: "病理科", rank: 1 },
    { name: "风湿免疫科", rank: 1 }
    // 3-5个优势科室
  ],
  features: ["罕见病诊疗", "多学科协作"],
  address: "东城区帅府园1号",
  phone: "010-69156114",
  keywords: ["疑难杂症", "罕见病"]
}
```

---

## 常见问题

### 1. 云函数调用失败
**原因**：AI 返回格式不符合预期  
**解决**：增加降级处理，正则提取科室名

### 2. 前端代码不更新
**原因**：CloudBase 未拉取最新代码  
**解决**：手动上传文件到静态网站托管

### 3. CORS 错误
**原因**：云函数未返回 CORS 头  
**解决**：返回时添加 `'Access-Control-Allow-Origin': '*'`

---

## 下一步优化

1. **扩充医院数据**：从20家到50家
2. **优化 AI prompt**：提高匹配准确率
3. **添加用户反馈**：收集真实使用数据
4. **性能优化**：缓存常见症状的推荐结果

---

## 访问地址

- **线上地址**：https://hospital-search-7gnfne58d97018a9-1404181085.tcloudbaseapp.com/hospital_search/
- **GitHub**：https://github.com/miraclefeb/beijing-hospital-finder
- **云函数 URL**：https://hospital-search-7gnfne58d97018a9-1404181085.ap-shanghai.app.tcloudbase.com/aiTriage1
