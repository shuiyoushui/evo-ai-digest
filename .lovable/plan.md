

## 计划：产品分类管理 — 重命名 / 新增 / 删除

### 当前状态

产品分类排序区域仅支持调整排序值和上下移动，不支持重命名、新增或删除分类。`categories` 表使用 text 类型的 `id` 作为主键，`products.category_id` 外键关联。

### 变更内容

#### `src/pages/Admin.tsx` — 扩展分类管理功能

**1. 重命名分类**
- 操作列增加"重命名"按钮（Pencil 图标）
- 点击后弹出 Dialog，输入新名称，保存时 `update categories set label = ? where id = ?`
- 产品的 `category_id` 不变，无需迁移产品

**2. 新增分类**
- 表格上方增加"新增分类"按钮
- Dialog 中输入：分类 ID（唯一标识，英文）、分类名称、图标 emoji、排序值
- 保存后弹出可选的产品分配 Dialog：显示所有产品列表（带 checkbox），勾选后批量 `update products set category_id = newCatId where id in (...)`

**3. 删除分类**
- 操作列增加"删除"按钮（Trash2 图标）
- 点击后弹出 AlertDialog：
  - 显示该分类下有多少产品
  - 提供 Select 选择目标分类（排除当前分类）
  - 确认后先 `update products set category_id = targetCatId where category_id = deletingCatId`，再 `delete from categories where id = ?`

**4. 现有排序操作保持不变**

#### 新增状态变量
- `catEditOpen` / `catEditId` / `catEditLabel` / `catEditIcon` — 重命名/新增 Dialog
- `catDeleteOpen` / `catDeleteId` / `catDeleteTarget` — 删除确认 Dialog
- `catAssignOpen` / `catAssignId` / `catAssignProducts` — 新增后产品分配 Dialog

#### 文件变更

| 文件 | 操作 |
|---|---|
| `src/pages/Admin.tsx` | 分类表格增加重命名/删除按钮；新增分类 Dialog；删除确认+产品迁移 Dialog；新增后产品分配 Dialog |

无数据库迁移，所有操作通过现有表结构完成。

