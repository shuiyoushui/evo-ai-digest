

## 计划：模块独立保存 + 功能开关驱动产品详情 + 配置前端生效

### 问题分析

1. **全局保存按钮**：当前底部只有一个"保存配置"按钮，实际只保存 AI 配置。Banner、排名权重、功能开关等模块的修改无法持久化或保存逻辑混乱。
2. **功能开关未连接数据库**：Admin 的功能开关是硬编码的 `defaultChecked`，未读取 `display_modules` 表数据，也无法保存。
3. **配置未在前端生效**：
   - `HomeBanner` 使用硬编码的 `defaultBannerSlides`，未从 `banner_slides` 表读取
   - `ProductDetail` 未读取 `display_modules` 表来控制模块显隐（视频、核心优势、社区评价等）
   - 排名权重未从 `ranking_weights` 表初始化

### 变更内容

#### 1. `src/pages/Admin.tsx` — 每个模块独立保存

- **移除底部全局保存栏**（lines 688-698）
- 每个 Card 内部增加独立的"保存"按钮：
  - **Banner 配置**：保存到 `banner_slides` 表（upsert）
  - **功能开关**：从 `display_modules` 表加载初始状态，每个 Switch 变更时直接更新数据库
  - **排名权重**：从 `ranking_weights` 表加载初始值，Card 内加"保存权重"按钮
  - **AI 配置**：保留现有 `handleSaveConfig`，Card 内加"保存"按钮
  - **产品分类排序**：已有独立保存按钮，保留不变

#### 2. `src/pages/Admin.tsx` — 功能开关连接 `display_modules` 表

替换硬编码的开关列表，改为从 `display_modules` 表读取：
- `useEffect` 加载 `display_modules` 数据
- 每个 Switch 的 `checked` 绑定到数据库状态
- `onCheckedChange` 直接调用 `supabase.from("display_modules").update({ enabled }).eq("id", id)`
- 保留额外的平台级开关（如"最新上线模块"、"评论功能"）与 `display_modules` 中的产品详情页模块合并展示

#### 3. `src/components/home/HomeBanner.tsx` — 从数据库读取 Banner

- 移除硬编码的 `defaultBannerSlides` 作为默认数据源
- 组件内部使用 `useEffect` + `supabase.from("banner_slides")` 获取数据
- 仅显示 `active = true` 的 slide，按 `sort_order` 排序

#### 4. `src/components/product/ProductDetail.tsx` — 读取 `display_modules` 控制模块显隐

- 组件内查询 `display_modules` 表获取各模块的 `enabled` 状态
- 根据配置控制以下模块的显示/隐藏：
  - `video`（演示视频）→ 控制视频区域
  - `benefits`（核心优势）→ 控制优势列表
  - `skills`（技能 & Prompts）→ 控制 Tab 是否出现
  - `community`（社区评价）→ 控制评论 Tab
  - `company`（公司信息）→ 控制公司信息卡片
  - `founder`（创始人）→ 控制创始人卡片

#### 5. `src/pages/Admin.tsx` — 排名权重从数据库加载

- `useEffect` 从 `ranking_weights` 表加载初始值（当前已有数据 `{upvotes:40, views:25, comments:20, decay:15}`）
- 排名权重 Card 内添加"保存权重"按钮，保存到 `ranking_weights` 表

#### 6. 文件变更清单

| 文件 | 操作 |
|---|---|
| `src/pages/Admin.tsx` | 移除全局保存栏；各模块独立保存；功能开关连接 display_modules；排名权重从 DB 加载 |
| `src/components/home/HomeBanner.tsx` | 从 banner_slides 表读取数据替代硬编码 |
| `src/components/product/ProductDetail.tsx` | 读取 display_modules 控制模块显隐 |

无数据库迁移，所有表和数据已就绪。

