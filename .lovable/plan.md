

## 计划：产品审核列表增强 — 详情查看、分类调整、审核操作

### 当前状态

产品审核列表（`submissions` tab）仅显示产品名称、提交者、日期、状态，操作列只有通过/拒绝按钮（仅 pending 状态可见），已处理的显示"已处理"文字。不支持查看产品详情或调整分类。

### 变更内容

**`src/pages/Admin.tsx`** — 单文件改动：

**1. 产品详情 Dialog**
- 产品名称改为可点击链接样式，点击后弹出 Dialog 展示产品完整信息
- Dialog 内容包括：Logo、名称、Slogan、描述、分类、标签、网站、制作者信息、公司信息、Benefits、Skills、Prompts 等
- Dialog 底部放置审核操作按钮（通过/拒绝），仅 pending 状态显示

**2. 分类调整**
- Dialog 内分类字段改为 Select 下拉框，可直接修改产品分类
- 修改后即时保存到数据库（`updateProduct.mutate`）

**3. 审核操作优化**
- 列表操作列：所有状态都显示"查看"按钮（Eye 图标），pending 状态额外显示通过/拒绝
- Dialog 内：pending 显示通过/拒绝按钮；已通过/已拒绝状态显示当前状态 Badge + 可重新审核（改为通过或拒绝）
- 审核操作后自动关闭 Dialog，列表状态实时更新（已有 `invalidateQueries`）

**新增状态变量**
- `reviewDetailOpen` / `reviewDetailProduct` — 控制详情 Dialog 的打开和当前查看的产品数据

无数据库变更。

