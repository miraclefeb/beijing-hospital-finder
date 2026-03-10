# 腾讯云 CloudBase 学习笔记 - HTTP 访问服务

## 📚 官方文档学习

**文档地址：** https://cloud.tencent.com/document/product/876/122894

---

## 🔑 关键信息

### 1. HTTP 访问服务概述

**CloudBase 提供统一的 HTTP 访问服务，让开发者通过标准 HTTP 协议访问云资源**

**支持的资源：**
- 云函数（CloudFunction）
- 云托管（CloudRun）
- 静态网站托管（Hosting）
- 企业工作台
- 自定义应用

---

### 2. 域名类型

#### 默认域名
- CloudBase 为每个环境提供免费域名
- **仅适用于开发测试阶段**
- 存在限制：
  - 访问频率限制
  - 使用有效期限制
  - 部分高级功能不可用
  - 可能存在稳定性风险

#### 自定义域名
- 生产环境建议绑定已备案的自定义域名
- 获得完整服务能力和稳定性保障

---

### 3. 高级配置选项

- **触发路径选择**：自定义资源访问路径
- **身份认证**：为敏感资源启用访问控制
- **路径透传**：将完整请求路径传递给后端
- **请求参数配置**：自定义参数处理规则
- **响应头管理**：配置自定义响应头

---

## 🎯 我们的问题分析

### 问题1：我们用的是默认域名

**当前域名：**
```
https://hospital-search-7gnfne58d97018a9-1404181085.ap-shanghai.app.tcloudbase.com
```

**这是默认域名，存在限制！**

可能的问题：
- 访问频率限制（我们测试时可能触发了）
- 功能限制（某些配置可能不生效）

---

### 问题2：路径配置

**我们创建的触发器路径：** `/aiTriage1`

**完整 URL：**
```
https://hospital-search-7gnfne58d97018a9-1404181085.ap-shanghai.app.tcloudbase.com/aiTriage1
```

**但这个域名同时也是静态网站托管的域名！**

**冲突：**
- 静态网站托管：`/hospital_search/`
- 云函数：`/aiTriage1`

**可能的问题：**
- 路由优先级不明确
- 静态托管可能拦截了请求

---

## 💡 明天需要确认的

### 1. 查看 HTTP 访问服务配置

**位置：** CloudBase 控制台 → 环境配置 → HTTP 访问服务

**需要确认：**
- 云函数是否正确关联到域名
- 路径配置是否正确
- 是否有路由冲突

### 2. 查看云函数触发器配置

**需要确认：**
- 触发器类型（HTTP 触发）
- 路径是否正确
- 是否开启了路径透传

### 3. 测试不同的调用方式

**方式1：直接访问云函数 URL**
```
GET https://xxx.ap-shanghai.app.tcloudbase.com/aiTriage1?symptom=头疼
```

**方式2：POST 请求**
```javascript
fetch('https://xxx.ap-shanghai.app.tcloudbase.com/aiTriage1', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({symptom: '头疼'})
})
```

**方式3：使用 CloudBase SDK**
```javascript
app.callFunction({
  name: 'aiTriage',
  data: {symptom: '头疼'}
})
```

---

## 📋 明天的行动计划（基于文档）

### 第1步：检查 HTTP 访问服务配置（10分钟）

1. 进入 CloudBase 控制台
2. 环境配置 → HTTP 访问服务
3. 查看域名关联的资源
4. 确认云函数是否正确配置
5. 截图记录当前配置

### 第2步：查看云函数日志（5分钟）

1. 云函数 → aiTriage → 日志查询
2. 查看是否有调用记录
3. 如果有，查看 event 结构
4. 截图记录

### 第3步：根据日志调整（15分钟）

**如果日志为空：**
- 问题在前端或路由配置
- 检查 HTTP 访问服务配置
- 尝试不同的 URL 格式

**如果有日志但参数错误：**
- 根据 event 结构调整代码
- 参数可能在 event.body / event.queryString 等

### 第4步：备选方案（如果还不行）

**考虑使用 CloudBase SDK 直接调用**
- 不通过 HTTP 触发器
- 直接用 `app.callFunction()`
- 参数传递更简单

---

## 🔍 需要明确的问题

1. **HTTP 访问服务的域名和静态托管的域名是同一个吗？**
   - 如果是，如何区分路由？

2. **云函数的 HTTP 触发器，参数到底在 event 的哪里？**
   - 需要看官方示例代码

3. **默认域名的限制具体是什么？**
   - 是否影响我们的测试？

---

## 📝 总结

**今天的问题根源：**
- 没有认真看官方文档
- 不了解 CloudBase 的架构
- 不知道 HTTP 访问服务的配置方式
- 盲目尝试，浪费时间

**明天的改进：**
- 先看配置，再写代码
- 先看日志，再调试
- 基于官方文档，不要猜测
- 每一步都要确认

---

**明天第一件事：进入 CloudBase 控制台，查看 HTTP 访问服务的完整配置！** 🎯
