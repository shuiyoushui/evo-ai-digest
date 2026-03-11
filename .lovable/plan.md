

## 实施计划：模块化 AI 与爬虫服务 + 可配置后端

### 现状分析

当前 `analyze-url` Edge Function 存在以下问题：
- AI 网关地址 `https://ai.gateway.lovable.dev/v1/chat/completions` 硬编码
- Firecrawl 地址 `https://api.firecrawl.dev/v1/scrape` 硬编码
- API Key 名称（`LOVABLE_API_KEY`、`FIRECRAWL_API_KEY`）硬编码
- 所有逻辑耦合在一个函数体内，无法灵活切换 AI 或爬虫提供商
- Admin 后台 AI 模型只能从固定下拉列表选择，不支持自定义模型 ID

### 变更内容

#### 1. 数据库迁移 — 扩展 `ai_config` 表

新增 4 个字段，存储服务端点和环境变量名称（不存储密钥本身）：

```sql
ALTER TABLE ai_config
  ADD COLUMN ai_endpoint text NOT NULL DEFAULT 'https://ai.gateway.lovable.dev/v1/chat/completions',
  ADD COLUMN scraper_endpoint text NOT NULL DEFAULT 'https://api.firecrawl.dev/v1/scrape',
  ADD COLUMN ai_api_key_name text NOT NULL DEFAULT 'LOVABLE_API_KEY',
  ADD COLUMN scraper_api_key_name text NOT NULL DEFAULT 'FIRECRAWL_API_KEY';
```

#### 2. 重构 `supabase/functions/analyze-url/index.ts`

将单一函数拆分为三个模块化函数：

```text
index.ts
  ├─ scrapeUrl(config)         — 从 config 读取 endpoint + apiKeyName，调用爬虫
  ├─ callAI(config, messages)  — 从 config 读取 endpoint + apiKeyName + model，调用 AI
  └─ handler                   — 从数据库读取配置，串联 scraper → AI
```

关键改动：
- 所有 URL 和 Key 名称从数据库 `ai_config` 读取，零硬编码
- `scrapeUrl()` 接收 `{ endpoint, apiKeyName, url }` 参数
- `callAI()` 接收 `{ endpoint, apiKeyName, model, systemPrompt }` 参数
- 未来切换到火山引擎方舟或阿里云只需在 Admin 后台改配置，无需改代码

#### 3. 更新 `src/pages/Admin.tsx` — AI 配置面板

在"AI 智能解析配置"卡片中增加：
- **AI Endpoint** 输入框（placeholder 显示默认值）
- **AI API Key 环境变量名** 输入框（默认 `LOVABLE_API_KEY`）
- **爬虫 Endpoint** 输入框（默认 Firecrawl 地址）
- **爬虫 API Key 环境变量名** 输入框（默认 `FIRECRAWL_API_KEY`）
- AI 模型字段改为**可编辑下拉框**：保留预设选项，同时支持手动输入自定义模型 ID
- `handleSaveConfig` 函数同步保存新增字段

#### 4. 文件变更清单

| 文件 | 操作 |
|---|---|
| `supabase/migrations/...` | 新增迁移，添加 4 列 |
| `supabase/functions/analyze-url/index.ts` | 重构为模块化架构 |
| `src/pages/Admin.tsx` | 增加 endpoint/key 配置项，模型支持自由输入 |

#### 安全说明

- 数据库只存储环境变量的**名称**（如 `LOVABLE_API_KEY`），不存储密钥值
- 密钥值始终通过 `Deno.env.get()` 从安全环境变量读取
- `ai_config` 表已有 admin-only RLS 策略保护

