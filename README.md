# BohaoGroup 独立站 — 部署说明

## 项目简介

BohaoGroup 企业展示站 | 深蓝+金色 | 纯静态 HTML/CSS/JS | 响应式 | SEO 友好

服务：欧美整柜订舱 / 专业清关 / 门到门物流

---

## 本地预览

双击 `index.html` 直接在浏览器打开即可。

或者用任意 HTTP 服务器：

```bash
# Python 3
python -m http.server 8000

# Node
npx serve .
```

打开 http://localhost:8000

---

## 上线部署（三选一）

### 方案一：Cloudflare Pages（推荐 ⭐）

免费 | 全球 CDN | 自动 HTTPS | GitHub 自动部署

1. 把项目文件夹推送到 GitHub 仓库
2. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Workers & Pages → Pages → Connect to Git
4. 选择你的仓库 → 构建设置留空（纯静态无需构建）→ 部署
5. 部署完成后：Custom domains → 添加你的域名 → 按提示修改 DNS
6. DNS 生效后自动获得 SSL 证书

### 方案二：GitHub Pages

免费 | 简单直接

1. 把项目推送到 GitHub 仓库
2. Settings → Pages → Source: Deploy from a branch → 选 main 分支 → Save
3. Custom domain 填你的域名 → 勾选 Enforce HTTPS
4. DNS 添加 CNAME 记录指向 `你的用户名.github.io`
5. 等待 DNS 生效（1-48 小时）

### 方案三：Netlify

免费 | 拖拽部署 | 内置表单

1. 打开 [Netlify](https://app.netlify.com/)
2. 直接把 `bohaogroup-website` 整个文件夹拖到浏览器窗口
3. 自动部署 → Site settings → Domain management → Add custom domain
4. DNS 添加 CNAME 指向 Netlify 提供的地址
5. 自动获得 Let's Encrypt 证书

---

## 上线后必做

1. **替换占位图片**：`images/` 目录中的图片替换为真实图片
2. **修改 `sitemap.xml`**：将 `https://bohaogroup.com` 替换为实际域名
3. **修改 `index.html` 中的 `<meta>` 标签和 JSON-LD**：更新域名
4. **Google Search Console**：提交 `sitemap.xml`
5. **Bing Webmaster**：同步提交站点地图
6. **Google Analytics**：加入统计代码（如需要）

---

## 文件结构

```
bohaogroup-website/
├── index.html        # 主页面
├── css/
│   └── style.css     # 样式
├── js/
│   └── main.js       # 交互逻辑
├── images/           # 图片资源
├── robots.txt        # SEO 爬虫配置
├── sitemap.xml       # 站点地图
└── README.md         # 本文件
```
