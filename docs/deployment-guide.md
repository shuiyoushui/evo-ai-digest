# Agent Hunt — 阿里云部署后迭代与更新指南

> 本文档面向开发与运维团队，提供项目在阿里云环境下的日常迭代、发布与维护操作指引。

---

## 目录

1. [部署架构概览](#1-部署架构概览)
2. [前端迭代流程](#2-前端迭代流程)
3. [后端函数（FC）迭代流程](#3-后端函数fc迭代流程)
4. [数据库迭代流程](#4-数据库迭代流程)
5. [AI 服务商切换](#5-ai-服务商切换)
6. [常见迭代场景速查](#6-常见迭代场景速查)
7. [回滚策略](#7-回滚策略)
8. [注意事项与最佳实践](#8-注意事项与最佳实践)

---

## 1. 部署架构概览

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  用户浏览器   │────▶│  阿里云 CDN       │────▶│  OSS Bucket     │
│              │     │  (加速 + HTTPS)   │     │  (前端静态资源)  │
└──────────────┘     └──────────────────┘     └─────────────────┘
       │
       │ API 请求
       ▼
┌──────────────────┐     ┌─────────────────────┐
│  函数计算 FC      │────▶│  Supabase / RDS      │
│  (后端逻辑)       │     │  (PostgreSQL 数据库)  │
└──────────────────┘     └─────────────────────┘
```

| 层级 | 服务 | 用途 |
|------|------|------|
| 前端 | OSS + CDN | 托管 React SPA 静态资源 |
| 后端 | 函数计算 FC | 运行 `server/` 目录下的 Node.js 函数 |
| 数据库 | Supabase Cloud 或 阿里云 RDS PostgreSQL | 数据持久化、认证、RLS |

---

## 2. 前端迭代流程

### 2.1 构建

```bash
# 设置环境变量（构建时注入）
export VITE_SUPABASE_URL=https://your-project.supabase.co
export VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# 构建生产包
npm run build
```

构建产物输出到 `dist/` 目录。

### 2.2 上传到 OSS

**方式一：ossutil 命令行**

```bash
# 安装 ossutil（首次）
# https://help.aliyun.com/document_detail/120075.html

# 同步 dist 到 OSS Bucket
ossutil sync dist/ oss://your-bucket-name/ \
  --delete \
  --update \
  -e oss-cn-shanghai.aliyuncs.com \
  -i YOUR_ACCESS_KEY_ID \
  -k YOUR_ACCESS_KEY_SECRET
```

**方式二：阿里云控制台**

1. 登录 [OSS 控制台](https://oss.console.aliyun.com/)
2. 进入对应 Bucket → 文件管理
3. 清空旧文件，上传 `dist/` 下所有内容

### 2.3 刷新 CDN 缓存

```bash
# 刷新全站缓存
aliyun cdn RefreshObjectCaches \
  --ObjectPath "https://your-domain.com/" \
  --ObjectType Directory

# 或刷新特定文件
aliyun cdn RefreshObjectCaches \
  --ObjectPath "https://your-domain.com/index.html"
```

> **提示**：`index.html` 建议设置较短的 CDN 缓存时间（如 60s），JS/CSS 文件因含 hash 可设置长缓存。

### 2.4 环境变量清单（前端构建时）

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_SUPABASE_URL` | 数据库服务地址 | `https://xxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | 数据库匿名公钥 | `eyJ...` |

---

## 3. 后端函数（FC）迭代流程

### 3.1 代码位置

后端函数代码位于 `server/` 目录：

```
server/
└── analyze-url/
    └── index.js      # AI 网页解析函数（Node.js 18）
```

### 3.2 部署方式

**方式一：Serverless Devs（推荐）**

```bash
# 安装 Serverless Devs（首次）
npm install -g @serverless-devs/s

# 配置阿里云凭证（首次）
s config add

# 部署函数
cd server/analyze-url
s deploy
```

需在项目中创建 `s.yaml` 配置文件（参考阿里云 FC 文档）。

**方式二：控制台上传**

1. 登录 [函数计算控制台](https://fcnext.console.aliyun.com/)
2. 找到对应函数 → 代码 → 上传 ZIP 包或在线编辑
3. 保存并部署

### 3.3 环境变量配置（FC 控制台）

在函数计算控制台的 **函数配置 → 环境变量** 中设置：

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `SUPABASE_URL` | 数据库服务地址 | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | 数据库管理密钥（**勿泄露**） | ✅ |
| `LOVABLE_API_KEY` | AI Gateway 密钥 | 视 ai_config 配置 |
| `FIRECRAWL_API_KEY` | 网页抓取服务密钥 | 视 ai_config 配置 |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` 拥有最高权限，务必仅在服务端使用，切勿暴露给前端。

### 3.4 新增后端函数

1. 在 `server/` 下创建新目录，例如 `server/new-function/index.js`
2. 在 FC 控制台创建新函数，配置 HTTP 触发器
3. 部署代码并设置所需环境变量

---

## 4. 数据库迭代流程

### 4.1 Schema 变更

所有数据库变更通过 SQL 迁移脚本管理，存放在 `supabase/migrations/` 目录：

```bash
# 命名规范：时间戳_描述.sql
supabase/migrations/
├── 20250101000000_initial_schema.sql
├── 20250115000000_add_products_views.sql
└── ...
```

### 4.2 编写迁移脚本

```sql
-- supabase/migrations/20250320000000_add_comments_table.sql

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 所有人可读
CREATE POLICY "Anyone can read comments"
  ON public.comments FOR SELECT
  USING (true);

-- 登录用户可创建
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

### 4.3 执行迁移

**Supabase 项目：**
```bash
# 使用 Supabase CLI
supabase db push
```

**阿里云 RDS：**
```bash
# 通过 psql 连接并执行
psql -h your-rds-host -U postgres -d postgres \
  -f supabase/migrations/20250320000000_add_comments_table.sql
```

### 4.4 注意事项

- ✅ 先在测试环境验证 SQL 脚本
- ✅ 涉及删除操作时先备份数据
- ✅ RLS 策略变更需同步更新 `docs/rls-policies.sql`
- ❌ 不要直接修改 `auth` / `storage` 等系统 schema

---

## 5. AI 服务商切换

### 5.1 通过管理后台切换（推荐，无需改代码）

路径：**管理后台 → 系统配置 → AI 智能解析配置**

可修改字段：

| 字段 | 说明 |
|------|------|
| `ai_endpoint` | AI API 端点地址 |
| `model` | 模型标识 |
| `ai_api_key_name` | 读取的环境变量名 |
| `scraper_endpoint` | 网页抓取端点 |
| `scraper_api_key_name` | 抓取服务密钥变量名 |
| `enabled` | 是否启用 AI 解析 |

### 5.2 常用 AI 服务商配置示例

| 服务商 | `ai_endpoint` | `model` | `ai_api_key_name` |
|--------|---------------|---------|-------------------|
| Lovable AI Gateway | `https://ai.gateway.lovable.dev/v1/chat/completions` | `google/gemini-3-flash-preview` | `LOVABLE_API_KEY` |
| 阿里云百炼（通义千问） | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` | `qwen-plus` | `DASHSCOPE_API_KEY` |
| DeepSeek | `https://api.deepseek.com/v1/chat/completions` | `deepseek-chat` | `DEEPSEEK_API_KEY` |
| 火山云方舟（豆包） | `https://ark.cn-beijing.volces.com/api/v3/chat/completions` | `your-endpoint-id` | `ARK_API_KEY` |

### 5.3 切换步骤

1. 在 FC 控制台添加新服务商的 API Key 到环境变量
2. 在管理后台修改 `ai_config` 表对应字段
3. 测试：在发布者中心提交一个 URL，验证 AI 解析是否正常
4. 完成——无需重新部署任何代码

---

## 6. 常见迭代场景速查

| 场景 | 需要改什么 | 操作步骤 |
|------|-----------|---------|
| 修改前端 UI / 功能 | `src/` 目录 | 改代码 → `npm run build` → 上传 OSS → 刷新 CDN |
| 修改 AI 解析逻辑 | `server/analyze-url/index.js` | 改代码 → 部署到 FC |
| 切换 AI 模型/服务商 | `ai_config` 表 + FC 环境变量 | 管理后台修改配置 + FC 添加 Key |
| 新增数据库表/字段 | `supabase/migrations/` | 写 SQL → 在数据库执行 → 更新前端类型 |
| 新增后端 API | `server/` 新目录 | 写函数 → 创建 FC 函数 → 配置触发器 |
| 更新环境变量 | FC 控制台 / 构建脚本 | 在对应位置修改 |
| 修改 RLS 安全策略 | SQL 脚本 | 编写迁移 → 在数据库执行 |
| 添加新用户角色 | `user_roles` 表 + RLS | 修改 `app_role` 枚举 → 更新策略 |

---

## 7. 回滚策略

### 7.1 前端回滚

- **OSS 版本管理**：启用 Bucket 版本控制，可回滚到任意历史版本
- **手动回滚**：保留上一次 `dist/` 构建产物，需要时重新上传
- 回滚后记得刷新 CDN 缓存

### 7.2 后端函数回滚

- **FC 版本管理**：每次部署自动生成版本号
- **别名机制**：生产流量指向别名（如 `LATEST`），回滚时切换别名指向旧版本
- 操作：FC 控制台 → 函数 → 版本管理 → 切换别名

### 7.3 数据库回滚

- **备份**：定期通过 `pg_dump` 或 RDS 自动备份
- **逆向迁移**：为每个迁移脚本编写对应的回滚 SQL
- **示例**：
  ```sql
  -- rollback: 20250320000000_add_comments_table.sql
  DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;
  DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
  DROP TABLE IF EXISTS public.comments;
  ```

---

## 8. 注意事项与最佳实践

### 安全

- ❌ 永远不要将 `SERVICE_ROLE_KEY` 暴露给前端
- ✅ 所有表启用 RLS，新表也不例外
- ✅ 角色判断通过 `has_role()` 函数，不依赖客户端存储

### 性能

- ✅ `index.html` CDN 缓存时间设短（60s），带 hash 的资源设长缓存（30d+）
- ✅ 图片资源使用 OSS 图片处理服务压缩
- ✅ FC 函数设置合理的超时时间（AI 解析建议 30-60s）

### 开发规范

- ✅ 每次数据库变更都写迁移脚本，禁止直接在生产库手动改表
- ✅ 迁移脚本命名统一：`YYYYMMDDHHMMSS_description.sql`
- ✅ 更新 `docs/rls-policies.sql` 保持策略文档同步
- ✅ 重要变更在 `docs/architecture.md` 中记录

### 监控

- 配置 FC 函数的日志服务（SLS），监控错误率和响应时间
- 配置 CDN 的实时日志，监控访问异常
- 定期检查数据库连接数和慢查询
