

## 优化计划

### 优化点 1: 分享功能 — 仅保留微信海报和小红书海报，生成真实二维码

**现状**: ShareDialog 有 3 个 tab（微信海报、小红书卡片、竖版视频），二维码是占位符，布局文案较简单。

**改动**:
1. **移除"竖版视频" tab**，仅保留微信海报和小红书海报
2. **生成真实二维码** — 使用 `qrcode` npm 包（`qrcode.react`）根据 `product.website` 生成真实二维码图片
3. **微信海报优化** — 9:16 竖版布局，简洁大气风格：产品 Logo + 名称 + 一句话介绍 + 核心优势（2-3条）+ 底部二维码 + "长按识别二维码" 提示，配色以深色/渐变为主
4. **小红书海报优化** — 3:4 竖版布局，种草风格：顶部产品信息卡片 + "AI神器推荐" 标题 + 亮点列表用 emoji 标注 + 标签云 + 底部二维码，配色偏暖/活泼，文案用小红书口语化风格
5. **复制文案按钮** — 两个渠道都提供对应风格的文案复制

**涉及文件**: `src/components/product/ShareDialog.tsx`, 新增依赖 `qrcode.react`

### 优化点 2: 产品详情页 — 无 skills/prompts 数据时隐藏对应 Tab

**现状**: ProductDetail 始终显示"技能 & Prompts" tab，内容来自硬编码的 `mockSkills` 和 `mockPrompts`。数据库 `products` 表无 skills/prompts 字段。

**改动**:
1. **数据库迁移** — 在 `products` 表新增两个 JSONB 列：`skills jsonb default null` 和 `prompts jsonb default null`
2. **更新 `DbProduct` 类型** — 在 `useProducts.ts` 中添加 `skills` 和 `prompts` 字段
3. **更新 `MakerStudio` 提交逻辑** — 将表单中已有的 skills/prompts 数据写入数据库
4. **ProductDetail 条件渲染** — 移除 `mockSkills` 和 `mockPrompts`，改为读取产品实际数据。当 `skills` 和 `prompts` 都为空时，不渲染该 Tab；有数据时正常展示
5. **TabsList 动态生成** — 根据产品是否有 skills/prompts 数据决定是否显示 "技能 & Prompts" 选项

**涉及文件**: 数据库迁移 SQL, `src/hooks/useProducts.ts`, `src/pages/MakerStudio.tsx`, `src/components/product/ProductDetail.tsx`

