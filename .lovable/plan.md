

## 计划：产品分类管理统一保存

### 问题

当前重命名和图标修改通过 Dialog 直接保存到数据库，而排序修改需要点击"保存排序"按钮。用户希望所有分类配置变更（重命名、图标、排序）统一由一个保存按钮控制。

### 方案

**`src/pages/Admin.tsx`**：

1. **重命名改为本地修改**：`handleSaveCatEdit`（重命名模式）不再直接调用 `supabase.update`，而是更新本地 `catOrderList` 的 `label` 和 `icon` 字段
2. **统一保存函数**：将 `handleSaveCategoryOrder` 扩展为 `handleSaveCategories`，同时保存 `sort_order`、`label`、`icon` 三个字段
3. **按钮文案**：从"保存排序"改为"保存分类"
4. **新增和删除**：这两个操作涉及数据库行的增删，仍保持即时生效（新增需要先入库才能分配产品，删除需要先迁移产品）

单文件改动，无数据库变更。

