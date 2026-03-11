

## 计划：重构管理后台系统配置为分类子页面

### 当前结构
系统配置（`config` tab）下所有卡片平铺：Banner、功能开关、排名权重、AI配置、产品分类排序、大模型优选推荐、推广服务类型管理。

### 目标结构

```text
系统配置
  ├─ 展示配置（子Tab）
  │   ├─ 首页 Banner 配置
  │   ├─ 功能开关
  │   ├─ 排名算法权重
  │   └─ 产品分类排序
  │
  └─ 服务中心配置（子Tab）
      └─ 服务分类树形管理（基于 service_categories 表）
          ├─ 自助推广（分类）
          │   ├─ 种子用户获取（服务）
          │   ├─ 体验评测用户获取（服务）
          │   └─ 用户规模增长（服务）
          ├─ 技术服务（分类）
          │   ├─ 大模型接入（服务）→ 展开后显示「大模型优选推荐」管理
          │   ├─ MCP 开发服务（服务）
          │   └─ 其他模型/云服务（服务）
          └─ [新增分类...]
```

### 变更内容

#### 1. `src/pages/Admin.tsx` — 重构系统配置区域

- 在 `activeTab === "config"` 内部增加子 Tab（使用 Radix Tabs），分为**展示配置**和**服务中心配置**
- **展示配置**：将 Banner、功能开关、排名权重、产品分类排序 4 个 Card 原样保留
- **服务中心配置**：移除硬编码的推广服务类型表格，改为从 `service_categories` 表读取的树形结构管理界面

#### 2. 服务中心配置 — 树形管理界面

基于已有的 `service_categories` 表（支持 `parent_id` 层级关系），构建：

- **一级分类**（parent_id = null）：显示为可折叠的分组，支持重命名、新增、删除、排序、启用/禁用开关
- **二级服务**（parent_id 指向一级）：在对应分类下展示，同样支持 CRUD + 排序 + 开关
- 当二级服务的 label 为「大模型接入」时，展开后额外显示**大模型优选推荐**管理区域（复用现有 `llm_recommendations` 逻辑）
- 新增/编辑使用 Dialog 弹窗（label、icon、description、sort_order）
- 删除带确认提示

#### 3. 新增 hooks — `useServiceCategories.ts`

创建 `src/hooks/useServiceCategories.ts`，封装 `service_categories` 表的 CRUD 操作：
- `useServiceCategories()` — 查询全部，按 sort_order 排序
- `useCreateServiceCategory()` — 新增
- `useUpdateServiceCategory()` — 更新（重命名、排序、启用/禁用）
- `useDeleteServiceCategory()` — 删除

#### 4. 文件变更清单

| 文件 | 操作 |
|---|---|
| `src/hooks/useServiceCategories.ts` | 新建，封装 service_categories CRUD |
| `src/pages/Admin.tsx` | 重构 config 区域为子 Tab 结构；服务中心配置改为树形管理 |

无数据库变更，`service_categories` 表已具备 `parent_id`、`enabled`、`sort_order` 等字段。

