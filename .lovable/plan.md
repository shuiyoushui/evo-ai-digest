

## 计划：4 项优化

### 变更概览

1. **编辑表单增加团队与公司信息** — 编辑 Tab 中已有团队公司字段（line 784-797 缺失部分字段）。需补齐：创始人/负责人、职位、公司名称、成立年份、所在地、融资阶段（与提交表单一致）。

2. **编辑后重新进入审核** — `handleSaveEdit` 保存时额外设置 `status: "pending"`，使产品编辑后自动回到待审核状态，首页不再展示直到管理员重新审核通过。

3. **Admin 页面权限守卫** — 在 `Admin.tsx` 渲染前增加权限判断：未登录提示登录，非 Admin 提示无权限并引导返回首页。

4. **"删除"改为"下线"** — 产品管理中将删除按钮改为"下线"，点击后将产品 status 设为 `"offline"`，而非真正删除。同步更新 `statusMap` 增加 `offline: "已下线"` 状态。首页本身已只展示 `status='approved'` 的产品，无需额外处理。

### 文件变更

**`src/pages/MakerStudio.tsx`**
- 编辑 Tab（line 784-797）：在链接区块后、skills 区块前，增加"团队与公司"Card，包含创始人姓名、职位、公司名称、成立年份、所在地、融资阶段 6 个字段（与提交表单 Section 4 结构一致）
- `handleSaveEdit`（line 225-251）：新增 `status: "pending"` 到 update 调用中
- 保存成功 toast 改为 "产品信息已更新，需重新审核后展示"
- `statusMap`（line 68）：增加 `offline: "已下线"`
- 删除按钮（line 713-727）：图标改为下线图标，文案改为"下线"，确认对话框内容改为下线提示
- `handleDeleteProject` 改为 `handleOfflineProject`：调用 `updateProduct.mutateAsync({ id, status: "offline" })` 而非 `deleteProduct.mutateAsync(id)`

**`src/pages/Admin.tsx`**
- 在 return 前增加权限守卫：
  - `loading` 时显示加载中
  - `!isLoggedIn` 时提示请先登录
  - `!isAdmin` 时提示无权限
- `statusMap`（line 41）：增加 `offline: "已下线"`
- 审核列表的操作列：对 `offline` 状态产品支持"重新上线"（改为 approved）

