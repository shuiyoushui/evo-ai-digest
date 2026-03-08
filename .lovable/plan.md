

## AI 智能解析产品 URL 预填写功能规划

### 当前状态

`handleAIAnalyze` 目前使用 `mockAIData` 硬编码 + `setTimeout` 模拟，无真实 AI 调用。项目无 Edge Functions。

### 架构设计

```text
┌──────────┐     ┌─────────────────────┐     ┌──────────────┐     ┌─────────────┐
│ Frontend │────▶│ Edge Fn: analyze-url │────▶│ Firecrawl    │────▶│ 抓取网页内容 │
│ (submit) │     │                     │────▶│ Lovable AI   │────▶│ 结构化提取   │
│          │◀────│ 返回预填字段          │     └──────────────┘     └─────────────┘
└──────────┘     │                     │
                 │ 读取 ai_config 表    │
                 │ (model + prompt)    │
                 └─────────────────────┘
```

### 实现计划

#### 1. 创建 `ai_config` 数据库表（后台可配置模型和 Prompt）

| 列 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| config_key | text UNIQUE | 如 `analyze_url` |
| model | text | 如 `google/gemini-3-flash-preview` |
| system_prompt | text | 系统提示词 |
| enabled | boolean | 开关 |
| updated_at | timestamptz | |

- RLS: 仅 admin 可读写，Edge Function 通过 service_role 访问
- 管理员可在 Admin 页面编辑 model 和 prompt

#### 2. 连接 Firecrawl Connector（抓取网页内容）

- 使用 Firecrawl scrape API 抓取用户输入的 URL，获取 markdown 格式的页面内容
- 作为 AI 分析的输入素材

#### 3. 创建 Edge Function `analyze-url`

流程：
1. 接收前端传入的 `url` 参数
2. 从 `ai_config` 表读取 `analyze_url` 配置（model、prompt）
3. 调用 Firecrawl 抓取该 URL 的 markdown 内容
4. 将抓取内容 + 配置的 system_prompt 发给 Lovable AI Gateway
5. 使用 **tool calling** 提取结构化输出（name, slogan, description, category, tags, company info 等）
6. 返回 JSON 给前端

#### 4. 前端改造 `MakerStudio.tsx`

- `handleAIAnalyze` 改为调用 `supabase.functions.invoke('analyze-url', { body: { url } })`
- 解析返回的结构化数据，映射到 `formData` 各字段
- 添加错误处理和 loading 状态

#### 5. Admin 页面增加 AI 配置管理

- 在 Admin 页面新增 "AI 配置" Tab
- 可编辑 model（下拉选择支持的模型列表）和 system_prompt（文本域）
- 调用 `supabase.from('ai_config').update(...)` 保存

### 技术细节

- **默认模型**: `google/gemini-3-flash-preview`
- **结构化输出**: 使用 tool calling 而非让模型直接返回 JSON，确保输出格式稳定
- **Firecrawl**: 需要通过 connector 连接，用于抓取网页；如未连接则回退到仅使用 URL 让 AI 推理
- **config.toml**: 需添加 `[functions.analyze-url]` 配置，`verify_jwt = false`

