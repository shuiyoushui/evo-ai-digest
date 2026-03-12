# Agent Hunt — 发现最好的 AI 工具

Agent Hunt 是中国首选的 AI 产品首发与增长加速平台，帮助开发者和团队展示、发现和推广最前沿的 AI 工具与服务。

🌐 **在线访问**: [evo-ai-digest.lovable.app](https://evo-ai-digest.lovable.app)

---

## ✨ 核心功能

- **产品发现** — 按分类浏览已审核的 AI 产品，支持投票排名
- **智能提交** — 输入网址即可通过 AI 自动解析并填充产品信息（支持 OpenAI / DeepSeek / 通义千问）
- **发布者中心 (Maker Studio)** — 提交、编辑、管理你的 AI 产品
- **管理后台** — 产品审核、分类管理、Banner 配置、AI 解析配置、排名权重调整
- **用户系统** — 邮箱/手机号注册登录、OTP 验证码登录、个人资料管理
- **投票系统** — 登录用户可为喜爱的产品投票

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript + Vite |
| UI 组件 | shadcn/ui + Tailwind CSS |
| 状态管理 | TanStack React Query |
| 路由 | React Router v6 |
| 后端 | Supabase (数据库 / Auth / Edge Functions / Storage) |
| AI 解析 | 兼容 OpenAI 标准协议 & 阿里云百炼协议 |

## 📁 项目结构

```
src/
├── components/        # UI 组件
│   ├── admin/         # 管理后台组件
│   ├── home/          # 首页组件 (Banner, ProductCard)
│   ├── layout/        # 布局组件 (TopNav, CategorySidebar)
│   ├── product/       # 产品详情组件
│   └── ui/            # shadcn/ui 基础组件
├── contexts/          # React Context (AuthContext)
├── hooks/             # 自定义 Hooks
│   ├── useProducts.ts       # 产品 CRUD
│   ├── useUpvotes.ts        # 投票逻辑
│   ├── useCategories.ts     # 分类查询
│   └── useRecommendations.ts # LLM 推荐管理
├── pages/             # 页面路由
│   ├── Index.tsx      # 首页
│   ├── MakerStudio.tsx # 发布者中心
│   ├── Admin.tsx      # 管理后台
│   └── Profile.tsx    # 个人中心
├── integrations/      # Supabase 客户端 & 类型 (自动生成)
└── data/              # Mock 数据

supabase/
├── functions/         # Edge Functions
│   └── analyze-url/   # AI 网页解析函数
└── config.toml        # Supabase 配置

docs/
├── architecture.md    # 架构文档
└── rls-policies.sql   # RLS 策略参考
```

## 🚀 本地开发

```bash
# 克隆仓库
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 🧪 测试

```bash
npm test            # 运行测试
npm run test:watch  # 监听模式
```

## 🔐 安全设计

- **角色管理** — 独立 `user_roles` 表存储角色，避免权限提升攻击
- **RLS 策略** — 所有表启用行级安全，通过 `SECURITY DEFINER` 函数 `has_role()` 判断权限
- **客户端角色仅用于 UI** — 前端 `isAdmin` 仅控制界面展示，真正权限由数据库 RLS 保障

## 📄 License

MIT
