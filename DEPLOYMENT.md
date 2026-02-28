# 部署指南 - 英语成神之路

本文档详细说明如何将"英语成神之路"应用部署到 GitHub Pages。

## 部署前准备

### 1. 创建 GitHub 仓库
1. 访问 https://github.com/new
2. 输入仓库名称：`english-mastery`（或其他你喜欢的名字）
3. 选择公开（Public）仓库
4. 不要初始化 README、.gitignore 或 license
5. 点击 "Create repository"

### 2. 本地 Git 配置
```bash
# 进入项目目录
cd ~/.openclaw/workspace/english-mastery

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "初始提交：英语成神之路 v1.0.0"

# 连接到GitHub仓库
git remote add origin https://github.com/[你的用户名]/english-mastery.git

# 推送代码
git branch -M main
git push -u origin main
```

## GitHub Pages 部署

### 方法一：自动部署（推荐）
1. 代码推送到 GitHub 后，GitHub Actions 会自动运行
2. 等待约1分钟，Actions 完成部署
3. 访问：`https://[你的用户名].github.io/english-mastery/`

### 方法二：手动配置
1. 进入仓库的 **Settings** 页面
2. 点击左侧的 **Pages**
3. 在 **Source** 部分：
   - 选择 **Deploy from a branch**
   - 分支选择 **main**
   - 文件夹选择 **/ (root)**
4. 点击 **Save**
5. 等待几分钟，页面会显示部署链接

## 验证部署

### 1. 检查部署状态
- 访问仓库的 **Actions** 标签页，查看部署状态
- 绿色勾号表示部署成功

### 2. 测试应用
访问部署地址，测试以下功能：
- [ ] 页面正常加载
- [ ] 添加单词功能
- [ ] 闪卡复习功能
- [ ] 数据保存功能
- [ ] 响应式设计

### 3. PWA 安装测试
- 在 Chrome 中，点击地址栏右侧的安装图标
- 或在菜单中找到"安装应用"选项
- 确认应用可以安装到桌面

## 自定义配置

### 1. 自定义域名
1. 购买域名（如：`english.yourdomain.com`）
2. 在域名服务商添加 CNAME 记录：
   ```
   english CNAME [你的用户名].github.io
   ```
3. 在仓库 Settings → Pages 中添加自定义域名
4. 在项目根目录创建 `CNAME` 文件：
   ```bash
   echo "english.yourdomain.com" > CNAME
   git add CNAME
   git commit -m "添加自定义域名"
   git push
   ```

### 2. 启用 HTTPS
- GitHub Pages 自动提供 HTTPS
- 自定义域名需要等待证书自动签发（约24小时）

### 3. 配置 SEO
应用已包含基本的 SEO 优化：
- 语义化 HTML 结构
- PWA manifest
- Open Graph 标签
- 响应式设计

## 故障排除

### 常见问题

#### 1. 页面显示 404
- 检查 GitHub Pages 源设置是否正确
- 确认 `src` 文件夹存在且包含 `index.html`
- 等待几分钟让 CDN 刷新缓存

#### 2. 应用功能不正常
- 检查浏览器控制台错误信息
- 确认 JavaScript 文件正确加载
- 测试本地存储是否被浏览器阻止

#### 3. PWA 无法安装
- 确认 `manifest.json` 文件存在
- 检查 Service Worker 是否注册成功
- 使用 HTTPS 访问（GitHub Pages 自动提供）

#### 4. 数据丢失
- 应用使用本地存储，清除浏览器数据会丢失
- 定期使用导出功能备份数据
- 不同浏览器之间的数据不共享

### 调试工具
1. 浏览器开发者工具（F12）
2. Application 标签页检查存储
3. Lighthouse 测试 PWA 评分

## 更新应用

### 1. 本地更新
```bash
# 修改代码后
git add .
git commit -m "更新描述"
git push origin main
```

### 2. 自动部署
- 推送代码后，GitHub Actions 会自动重新部署
- 部署完成后，用户访问的是最新版本
- Service Worker 会提示用户刷新以获取更新

### 3. 版本管理
建议使用语义化版本：
- `v1.0.0`：初始版本
- `v1.1.0`：新增功能
- `v1.0.1`：bug修复

## 性能优化

### 已实施的优化
- ✅ 代码分割（模块化）
- ✅ 资源缓存（Service Worker）
- ✅ 图片优化（SVG图标）
- ✅ 延迟加载（按需加载图表库）
- ✅ 最小化请求（合并CSS/JS）

### 进一步优化建议
1. 使用 CDN 加速静态资源
2. 实现代码压缩（生产环境）
3. 添加资源预加载
4. 优化首次加载时间

## 安全考虑

### 数据安全
- 所有数据存储在用户浏览器本地
- 无服务器端数据存储
- 无用户认证需求
- 数据导出为明文 JSON（用户需妥善保管）

### 代码安全
- 无第三方敏感依赖
- 使用内容安全策略（CSP）
- 输入验证和转义
- 错误处理和安全日志

## 监控和分析

### 基本监控
- GitHub Pages 提供基本访问统计
- 浏览器控制台错误日志
- 用户反馈收集

### 高级分析（可选）
如需用户行为分析，可添加：
- Google Analytics（匿名）
- 自定义事件追踪
- 性能监控

## 支持与维护

### 用户支持
1. 在 README 中添加使用指南
2. 创建 FAQ 文档
3. 提供反馈渠道

### 技术维护
1. 定期更新依赖
2. 修复安全漏洞
3. 优化性能
4. 添加新功能

## 成功部署的标志

✅ 应用可正常访问  
✅ 所有功能正常工作  
✅ PWA 可安装  
✅ 数据持久化正常  
✅ 响应式设计适配  
✅ 离线使用支持  

---

**部署完成后，你可以将应用链接分享给朋友，开始你的英语成神之路！** 🚀

如果有任何部署问题，请参考：
1. GitHub Pages 官方文档
2. 项目 README 中的使用指南
3. 测试页面 (`test.html`) 中的诊断信息