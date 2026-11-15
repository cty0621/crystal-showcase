# Yoliya 水晶珠宝品牌网站（web-crystal-showcase）

Yoliya 是一个专注于天然水晶珠宝设计的工作室品牌官网。项目包含品牌展示、3D 作品集、**摄像头手势塔罗抽卡（MediaPipe Hands）**、**AI 八字运势小助手（本地规则引擎）**、水晶 DIY 串珠设计器（含灵感广场）等模块，全部 AI 能力本地运行、零 API 成本。

> 🌐 **线上地址（GitHub Pages）**：<https://cty0621.github.io/crystal-showcase/> · 源码仓库：<https://github.com/cty0621/crystal-showcase>

## 技术栈

React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · Framer Motion · lucide-react · Three.js（glTF + DRACO）· MediaPipe Hands · lunar-typescript · react-router-dom

## 技术架构

```
浏览器（纯前端 SPA，无后端）
├─ 表现层   React 页面与组件（Framer Motion 动效 · 深色玻璃拟态 UI）
├─ 交互层   React Router 路由 · 手势交互协议 · 推荐-购买联动
├─ AI 能力层 MediaPipe Hands 手势推理（21 关键点）
│          八字规则引擎（lunar-typescript 排盘 + 五行生克评分）
├─ 3D 展示层 Three.js（glTF + DRACO 解码 · 品类自适应相机位姿）
└─ 数据层   静态数据模块（site/works/tarot/fortune）· localStorage
```

- **AI 双引擎**：手势识别与八字运势均本地运行，零 API 调用成本、离线可用、隐私数据不出本机
- **构建链**：`tsc -b`（类型检查）→ `vite build`（打包）→ `copy-assets.mjs`（assets/ 合入 dist/assets/）
- **路由**：`/`（首页）、`/gallery`（作品集）、`/tarot`（今日运势）、`/tarot-cards`（塔罗牌图鉴，占位）、`/diy`（水晶DIY）、`/about`、`/contact`；外层使用 Hash 路由（`/#/gallery`），DIY 内嵌应用强制 hashbang 模式，静态托管无需服务端回退

## 目录结构

```
web-crystal-showcase/
├─ src/                  # React + TS 源码（页面 / 组件 / 数据 / AI 引擎）
├─ assets/               # 独立资产目录（构建后合入 dist/assets/）
│  ├─ textures/          #   贴图：gallery / about / tarot / products / crystals / icons / ui
│  ├─ models/            #   3D 模型：8 个 glb（DRACO 压缩）
│  ├─ fonts/             #   字体目录（当前为空，见「已知问题」）
│  └─ legacy/            #   旧 DIY 页的打包资源与扁平副本（保留兼容，可清理）
├─ public/               # Vite 静态根（原样复制进 dist）
│  ├─ mediapipe/         #   MediaPipe Hands 模型与脚本（本地部署，离线可用）
│  ├─ draco/             #   DRACO 解码器
│  ├─ js/  data/         #   DIY 应用依赖与珠子数据（crystals.json）
│  ├─ diy.html           #   DIY 设计器（iframe 嵌入）
│  └─ tarot-hand.html / envelope.html   # 独立演示页
├─ dist/                 # 构建产物（npm run build 生成）
├─ scripts/
│  ├─ verify-fortune.mjs #   AI 引擎纯函数断言脚本
│  └─ copy-assets.mjs    #   构建后把 assets/ 合入 dist/assets/
└─ index.html            # Vite 入口
```

## 启动方式

```bash
# 1. 安装依赖（国内镜像）
npm install --registry=https://registry.npmmirror.com

# 2. 开发模式（端口 5174）
npm run dev
# 浏览器访问 http://localhost:5174

# 3. 引擎回归验证
npm run verify

# 4. 生产构建（tsc 类型检查 → vite 打包 → assets 合入 dist）
npm run build

# 5. 本地预览构建产物（默认端口 4173）
npm run preview
```

## 环境配置

| 项目 | 要求 |
|---|---|
| Node.js | ≥ 18（建议 20 LTS 及以上，Vite 5 要求） |
| npm | 随 Node 自带，建议 10+ |
| 环境变量 | **无必填环境变量**（纯前端项目，见 `.env.example`） |
| 依赖安装源 | 国内网络建议：`npm install --registry=https://registry.npmmirror.com` |

### 依赖清单

**生产依赖**

| 包 | 用途 |
|---|---|
| react / react-dom | UI 框架 |
| react-router-dom | SPA 路由 |
| framer-motion | 页面动效（翻转、弹窗、滚动显现） |
| lucide-react | 图标 |
| three | 3D 模型渲染（glTF + DRACO） |
| lunar-typescript | 农历 / 四柱八字 / 干支计算 |
| @mediapipe/hands 等 | 手势识别（运行时使用 `public/mediapipe/` 本地模型，离线可用） |

**开发依赖**

| 包 | 用途 |
|---|---|
| vite / @vitejs/plugin-react | 构建与开发服务器 |
| typescript | 静态类型检查 |
| tailwindcss / postcss / autoprefixer | 样式方案 |
| tsx | 直接运行 TypeScript 脚本（验证脚本运行器） |
| @types/* | 类型声明 |

## 部署注意事项

- **支持站点根与任意子目录部署**：项目使用相对 `base`（`./`）+ 外层 Hash 路由（`/#/gallery`）+ `BASE_URL` 资源前缀；DIY 内嵌应用强制 hashbang 模式（文档路径始终保持 `diy.html`，避免子目录部署下相对资源 404）。`dist/` 目录放到哪里都能跑，无需服务端配置。
- 静态部署无需 Node 环境。

### GitHub Pages 部署（推荐）

**方式一：GitHub Actions 自动部署（推荐）**

在仓库根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: 安装依赖（国内镜像）
        run: npm install --registry=https://registry.npmmirror.com
      - name: 构建（tsc 类型检查 → vite 打包 → assets 合入）
        run: npm run build
      - name: 部署到 pages 分支
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          publish_branch: pages
```

首次配置：仓库 → **Settings** → **Pages** → **Source** 选择 `Deploy from a branch` → 分支选 `pages`、目录选 `/ (root)` → Save。之后每次 `git push` 到 `main` 都会自动构建并部署。

**方式二：手动推送 pages 分支**

1. `npm run build` 生成 `dist/`；
2. 把 `dist/` 内容推到 `pages` 分支：

   ```bash
   git checkout pages && git rm -rf . && cp -r dist/* . && git add -A && git commit -m "deploy" && git push github pages && git checkout main
   ```

3. 仓库 → **Settings** → **Pages** → 部署分支选 `pages` → 访问 `https://cty0621.github.io/crystal-showcase/`。

> GitHub Pages 免费托管要求仓库为公开仓库（私有仓库需付费计划）。

### Gitee Pages 部署（备选，国内直连）

1. `npm run build` 生成 `dist/`；
2. 同样方式把 `dist/` 内容推到 `pages` 分支（推到 Gitee：`git push origin pages`）；
3. Gitee 仓库 →「服务」→「Gitee Pages」→ 部署分支选 `pages` → 启动；
4. 访问 `https://<用户名>.gitee.io/<仓库名>/`（需账号完成实名认证）。

### 自建服务器

Apache / Nginx 指向 `dist/` 即可；Hash 路由无需回退配置。

## 资源路径映射

| 代码引用 | 实际位置 |
|---|---|
| `/assets/textures/gallery/…` | `assets/textures/gallery/…`（作品集图片） |
| `/assets/textures/products/…` | `assets/textures/products/…`（23 类水晶商品图） |
| `/assets/models/…` | `assets/models/…`（glb 模型） |
| `/mediapipe/…` | `public/mediapipe/…`（手势识别模型） |
| `/draco/…` | `public/draco/…`（DRACO 解码器） |
| `/diy.html` | `public/diy.html`（DIY 设计器） |
| `/data/crystals.json` | `public/data/crystals.json`（DIY 珠子与水晶分类数据） |

## 已知问题

1. `/fonts/prata-latin-400.woff2` 缺失（`public/diy.html` 预加载的字体文件不存在，`assets/fonts/` 目录已预留）；
2. `tarot-hand.html` 与 `envelope.html` 两个独立演示页使用 Google Fonts 外链，离线环境下字体回退为系统字体；
3. `assets/legacy/` 是旧 DIY 页构建链路的扁平副本，保留以维持 `/diy` 功能兼容，确认无引用后可整体删除（约 3.5 MB）；
4. 手势抽卡依赖摄像头权限，拒绝授权会自动降级为鼠标模式；
5. `/tarot-cards` 路由已注册，但页面为空占位（返回 `null`），塔罗牌图鉴内容待后续填充。

## 团队信息

| 姓名 | 分工 |
|---|---|
| 陈婷宇 | 项目选题与方案设计；Vite 前端工程搭建与目录架构规划；Three.js 三维场景、水晶 PBR 材质与交互逻辑开发；3D 模型预处理、材质提取与 Draco 模型压缩；资源整合迁移与自动化校验脚本编写；多轮测试、打包交付、README 与全套项目文档撰写 |
| 张倩 | 视觉体验优化、页面细节调整与交互动效润色；素材审阅，对画廊展品卡片、图标视觉效果提出优化方案并协助微调 |

## 原项目

本项目由 `crystal-jewelry`（原 Yoliya 官网工程）整体复制、重组而来，原项目文件未做任何改动。
