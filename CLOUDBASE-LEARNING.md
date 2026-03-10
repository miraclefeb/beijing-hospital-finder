# 腾讯云 CloudBase 学习笔记

## 📚 CloudBase 是什么

**腾讯云开发（CloudBase）** = 一站式后端云服务

**包含：**
- 静态网站托管（前端）
- 云函数（后端逻辑）
- 云数据库（存储数据）
- 云存储（文件存储）
- 用户认证（登录注册）

---

## 🎯 我们未来需要的功能

### 1. 用户注册登录 ✨
**CloudBase 提供：**
- 手机号登录（短信验证码）
- 微信登录
- 邮箱登录
- 自定义登录

**实现方式：**
```javascript
// 前端代码
import tcb from '@cloudbase/js-sdk';

const app = tcb.init({
  env: 'your-env-id'
});

// 手机号登录
await app.auth().signInWithPhoneNumber({
  phoneNumber: '13800138000',
  code: '123456'
});

// 获取当前用户
const user = app.auth().currentUser;
```

---

### 2. 收藏功能 ⭐
**需要：**
- 云数据库存储收藏记录
- 用户 ID 关联

**数据结构：**
```javascript
// favorites 集合
{
  _id: "xxx",
  userId: "user123",
  hospitalId: 1,
  hospitalName: "北京协和医院",
  createdAt: 1234567890
}
```

**实现方式：**
```javascript
// 添加收藏
await app.database().collection('favorites').add({
  userId: user.uid,
  hospitalId: 1,
  hospitalName: "北京协和医院",
  createdAt: Date.now()
});

// 查询我的收藏
const favorites = await app.database()
  .collection('favorites')
  .where({
    userId: user.uid
  })
  .get();
```

---

### 3. 搜索历史 📝
**存储用户搜索记录：**
```javascript
// search_history 集合
{
  _id: "xxx",
  userId: "user123",
  query: "头疼",
  department: "神经内科",
  createdAt: 1234567890
}
```

---

### 4. 个性化推荐 🎯
**基于用户历史：**
- 记录用户搜索的症状
- 记录用户查看的医院
- 推荐相关医院

---

## 🏗️ CloudBase 架构

### 当前架构（静态托管）
```
用户 → 静态网站 → 前端 JS
```

### 未来架构（完整版）
```
用户 → 静态网站 → 前端 JS
                      ↓
                  CloudBase SDK
                      ↓
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
    用户认证      云数据库      云函数
    (登录)      (收藏/历史)   (复杂逻辑)
```

---

## 📋 实施步骤

### 阶段1：当前（静态托管）✅
- ✅ 静态网站托管
- ✅ GitHub 自动部署
- ✅ 基础搜索功能

### 阶段2：添加用户系统（2-3天）
**需要做：**
1. 开启 CloudBase 用户认证
2. 前端集成 CloudBase SDK
3. 添加登录/注册页面
4. 实现登录状态管理

**代码改动：**
- 安装 SDK：`npm install @cloudbase/js-sdk`
- 初始化 CloudBase
- 添加登录组件
- 保护需要登录的功能

---

### 阶段3：添加收藏功能（1-2天）
**需要做：**
1. 创建云数据库集合
2. 实现收藏/取消收藏
3. 显示我的收藏列表
4. 数据权限配置

**代码改动：**
- 添加收藏按钮
- 调用数据库 API
- 显示收藏列表页面

---

### 阶段4：搜索历史（1天）
**需要做：**
1. 记录搜索历史
2. 显示历史记录
3. 快速重新搜索

---

## 💰 费用估算

### CloudBase 免费额度（每月）
- **云数据库**：2GB 存储 + 5万次读 + 3万次写
- **云函数**：4万GBs资源使用量 + 100万次调用
- **云存储**：5GB 存储 + 5GB 流量
- **静态托管**：5GB 流量

### 预估使用量（1000 用户/月）
- 用户数据：< 1MB
- 收藏记录：< 10MB
- 搜索历史：< 20MB
- 总计：< 50MB

**结论：免费额度完全够用！**

---

## 🔐 安全配置

### 数据库权限
```json
{
  "read": "auth.uid != null",
  "write": "auth.uid != null && doc.userId == auth.uid"
}
```

**含义：**
- 只有登录用户能读写
- 只能操作自己的数据

---

## 📦 SDK 集成

### 安装
```bash
npm install @cloudbase/js-sdk
```

### 初始化
```javascript
// config.js
import tcb from '@cloudbase/js-sdk';

export const app = tcb.init({
  env: 'hospital-finder-xxx' // 环境 ID
});

export const auth = app.auth();
export const db = app.database();
```

### 使用
```javascript
// 在任何组件中
import { auth, db } from './config';

// 检查登录状态
const loginState = await auth.getLoginState();

// 操作数据库
const result = await db.collection('favorites').get();
```

---

## 🎯 GitHub 自动部署配置

### CloudBase 支持的部署方式

**方式1：GitHub 自动部署**（我们现在用的）
- 关联 GitHub 仓库
- 每次 push 自动部署
- 适合纯前端项目

**方式2：CloudBase CLI**
```bash
# 安装 CLI
npm install -g @cloudbase/cli

# 登录
tcb login

# 部署
tcb hosting deploy ./dist -e your-env-id
```

**方式3：GitHub Actions**
```yaml
# .github/workflows/deploy.yml
name: Deploy to CloudBase
on:
  push:
    branches: [master]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy
        run: |
          npm install -g @cloudbase/cli
          tcb login --apiKeyId ${{ secrets.SECRET_ID }} --apiKey ${{ secrets.SECRET_KEY }}
          tcb hosting deploy ./dist -e ${{ secrets.ENV_ID }}
```

---

## 📝 待办事项

### 学习清单
- [x] CloudBase 基本概念
- [x] 用户认证方案
- [x] 云数据库使用
- [x] 费用估算
- [ ] 实际创建测试环境
- [ ] 编写登录组件
- [ ] 测试数据库操作

### 准备工作
- [ ] 开通短信服务（用于手机号登录）
- [ ] 配置数据库权限
- [ ] 设计数据库结构
- [ ] 编写 SDK 封装

---

## 🔗 参考资料

**官方文档：**
- CloudBase 文档：https://cloud.tencent.com/document/product/876
- JS SDK：https://docs.cloudbase.net/api-reference/webv2/initialization
- 用户认证：https://docs.cloudbase.net/authentication/introduce

**示例项目：**
- 待补充实际案例

---

## 💡 总结

**CloudBase 的优势：**
1. ✅ 一站式解决方案（不用自己搭后端）
2. ✅ 自动扩容（不用担心性能）
3. ✅ 按量付费（用多少付多少）
4. ✅ 与静态托管无缝集成
5. ✅ 支持 GitHub 自动部署

**适合我们的场景：**
- 用户量不大（< 10万）
- 功能相对简单（登录、收藏、历史）
- 快速开发上线
- 低成本运营

---

**下一步：**
等当前版本上线后，我们开始集成 CloudBase 用户系统！

---

**更新时间：** 2026-03-09  
**状态：** 学习中 📚
