

## 修复方案：Skills & Prompts 数据流完整性

### 问题根因分析

1. **提交时 skills/prompts 未保存到数据库**：`handleSubmitProduct`（MakerStudio.tsx 第297行）和 `useSubmitProduct`（useProducts.ts）的 mutation 中都没有包含 `skills` 和 `prompts` 字段，导致用户填写的数据丢失。

2. **编辑表单缺少 skills/prompts**：`handleEditProject` 加载产品数据时未读取 skills/prompts，编辑页面也没有 skills/prompts 的编辑 UI，`handleSaveEdit` 保存时也未提交这两个字段。

3. **首页详情不展示 prompts**：根本原因同 #1——数据库中从未写入 prompts 数据，所以即使开关开了也无数据可展示。

### 变更内容

**1. `src/hooks/useProducts.ts` — useSubmitProduct 添加 skills/prompts 参数**

- 在 mutationFn 的入参类型中增加 `skills` 和 `prompts` 可选字段
- insert 时传入这两个字段

**2. `src/pages/MakerStudio.tsx` — 三处修复**

- **提交逻辑**：`handleSubmitProduct` 中将 `formData.skills` 和 `formData.prompts` 传入 mutation
- **编辑加载**：`handleEditProject` 中从产品数据读取 skills/prompts 填充到 `editFormData`
- **编辑保存**：`handleSaveEdit` 中将 `editFormData.skills` 和 `editFormData.prompts` 传入 update mutation
- **编辑 UI**：在编辑表单（edit tab）中添加与提交表单相同的 skills/prompts 编辑区块（技能添加/删除、Prompt 添加/删除）

**3. 无需改动的部分**

- Admin 审核详情（已有 skills/prompts 展示代码，数据修复后自然生效）
- ProductDetail（已有展示逻辑，数据修复后自然生效）
- display_modules 表（上轮已拆分 prompts 开关）

### 影响范围

- 2 个文件改动：`useProducts.ts`、`MakerStudio.tsx`
- 无数据库变更

