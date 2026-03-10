# AI 导诊升级部署指南

## 📦 升级内容

### 架构变化
**升级前：**
```
前端 → aiKnowledge 关键词匹配 → 显示医院
```

**升级后：**
```
前端 → CloudBase 云函数 → DeepSeek API → 返回科室 → 显示医院
```

### 优势
1. ✅ AI 智能分析，更准确
2. ✅ API Key 安全（在云函数里）
3. ✅ 支持复杂症状描述
4. ✅ 保留降级方案（关键词匹配）

---

## 🚀 部署步骤

### 第1步：部署云函数

1. **进入腾讯云控制台**
   - CloudBase → 你的环境
   - 左侧：云函数

2. **创建云函数**
   - 点击"新建云函数"
   - 函数名称：`aiTriage`
   - 运行环境：Node.js 18
   - 创建方式：空白函数

3. **上传代码**
   - 方式A：在线编辑
     - 复制 `/cloudbase/functions/aiTriage/index.js` 内容
     - 粘贴到在线编辑器
   
   - 方式B：本地上传
     - 打包 `aiTriage` 文件夹为 zip
     - 上传 zip 文件

4. **配置依赖**
   - 点击"函数配置"
   - 添加依赖：`axios@^1.6.0`
   - 或者上传 package.json

5. **配置 API Key**
   - 在代码中找到：`const DEEPSEEK_API_KEY = 'YOUR_DEEPSEEK_API_KEY';`
   - 替换为你的 DeepSeek API Key
   - 保存

6. **部署函数**
   - 点击"部署"
   - 等待部署完成

---

### 第2步：配置 HTTP 访问

1. **开启 HTTP 访问**
   - 云函数详情 → HTTP 访问服务
   - 开启"HTTP 访问"
   - 记录访问路径（可选）

2. **配置权限**
   - 访问权限：允许匿名访问
   - 或者：需要登录访问（如果已有用户系统）

---

### 第3步：更新前端代码

1. **修改环境 ID**
   - 打开 `app.js`
   - 找到：`env: 'hospital-search-7gnfne58d97018a9-1404181085'`
   - 确认是你的环境 ID

2. **推送到 GitHub**
   ```bash
   cd frontend
   git add .
   git commit -m "升级：接入 DeepSeek AI 导诊"
   git push
   ```

3. **等待自动部署**
   - GitHub 推送后
   - 腾讯云自动部署
   - 等待 2-3 分钟

---

### 第4步：测试

1. **访问网站**
   - https://hospital-search-7gnfne58d97018a9-1404181085.tcloudbaseapp.com/hospital_search/

2. **测试搜索**
   - 输入："我最近总是头疼，还有点恶心"
   - 应该返回：神经内科 + 分析
   - 显示相关医院

3. **测试降级**
   - 如果 AI 失败，自动降级到关键词匹配
   - 保证功能可用

---

## 🔑 获取 DeepSeek API Key

### 方法1：官网注册
1. 访问：https://platform.deepseek.com
2. 注册账号
3. 创建 API Key
4. 复制 Key

### 方法2：使用其他 AI API
如果没有 DeepSeek，可以替换为：
- OpenAI API
- 通义千问 API
- 文心一言 API

只需修改云函数中的 API 调用部分。

---

## 💰 费用估算

### DeepSeek API
- 价格：约 ¥0.001/次
- 1000 次搜索 = ¥1
- 10000 次搜索 = ¥10

### CloudBase 云函数
- 免费额度：4万GBs + 100万次调用/月
- 基本免费

---

## 🐛 故障排查

### 问题1：云函数调用失败
**检查：**
- 云函数是否部署成功
- HTTP 访问是否开启
- 环境 ID 是否正确

### 问题2：AI 返回错误
**检查：**
- DeepSeek API Key 是否正确
- API 额度是否用完
- 网络是否正常

### 问题3：前端报错
**检查：**
- CloudBase SDK 是否加载
- 浏览器控制台错误信息
- 环境 ID 是否匹配

---

## 📊 监控

### 查看云函数日志
1. CloudBase → 云函数 → aiTriage
2. 点击"日志"标签
3. 查看调用记录和错误

### 查看 API 使用量
1. DeepSeek 控制台
2. 查看 API 调用次数
3. 监控费用

---

## 🔄 回滚方案

如果升级后有问题，可以快速回滚：

1. **回滚前端代码**
   ```bash
   git revert HEAD
   git push
   ```

2. **或者禁用云函数**
   - 前端会自动降级到关键词匹配
   - 功能仍然可用

---

## 📝 待办事项

- [ ] 获取 DeepSeek API Key
- [ ] 部署云函数
- [ ] 配置 API Key
- [ ] 更新前端代码
- [ ] 测试功能
- [ ] 监控运行状态

---

**部署时间：30-60 分钟**  
**难度：⭐⭐⭐（中等）**

需要帮助随时问我！🚀
