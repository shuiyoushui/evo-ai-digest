

## 实施计划：Admin 后台全面可配置化

### 现状分析

| 模块 | 当前状态 | 问题 |
|---|---|---|
| 产品分类 | 仅支持排序，不支持增删改名 | categories 表 RLS 缺少 INSERT/DELETE |
| 服务中心分类 | 硬编码在 `MakerStudio.tsx`（`selfServiceCards`、`techServiceCards`） | 无法动态管理 |
| 产品详情页模块 | Admin "功能开关"用硬编码 Switch，未持久化 | 开关状态刷新后丢失，也未联动到详情页 |
| 大模型推荐枚举 | 已实现完整 CRUD | 无需改动 |

### 变更方案

#### 1. 数据库迁移

**新建 `service_categories` 表** — 存储服务中心的分类和子服务：

```sql
CREATE TABLE service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES service_categories(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Cpu',
  sort_order int NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
-- 公开可读
CREATE POLICY "Anyone can view service_categories" ON service_categories FOR SELECT TO anon, authenticated USING (true);
-- Admin 全权
CREATE POLICY "Admins can manage service_categories" ON service_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
```

**新建 `display_modules` 表** — 产品详情页模块开关：

```sql
CREATE TABLE display_modules (
  id text PRIMARY KEY,  -- e.g. 'video', 'community', 'skills', 'benefits', 'company'
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE display_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view display_modules" ON display_modules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage display_modules" ON display_modules FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 预填默认模块
INSERT INTO display_modules (id, label, description, enabled, sort_order) VALUES
  ('video', '演示视频', '产品详情页显示演示视频', false, 1),
  ('benefits', '核心优势', '产品详情页显示核心优势列表', true, 2),
  ('skills', '技能 & Prompts', '产品详情页显示 Agent 技能与 Prompt 库', true, 3),
  ('community', '社区评价', '产品详情页显示评论区', false, 4),
  ('company', '公司信息', '产品详情页显示公司信息卡片', true, 5),
  ('founder', '创始人', '产品详情页显示创始人卡片', true, 6);
```

**修改 `categories` 表 RLS** — 允许 admin INSERT/DELETE：

```sql
CREATE POLICY "Admins can insert categories" ON categories FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON categories FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
```

#### 2. 新增 Hooks（模块化）

| 文件 | 功能 |
|---|---|
| `src/hooks/useServiceCategories.ts` | CRUD for `service_categories`，含 `useServiceCategories()`、`useCreateServiceCategory()`、`useUpdateServiceCategory()`、`useDeleteServiceCategory()` |
| `src/hooks/useDisplayModules.ts` | 读取 + 更新 `display_modules`，含 `useDisplayModules()`、`useUpdateDisplayModule()` |
| `src/hooks/useCategories.ts` | 扩展：新增 `useCreateCategory()`、`useUpdateCategory()`、`useDeleteCategory()` |

#### 3. Admin.tsx 改动

**产品分类管理**（替换现有排序卡片）：
- 表格增加"编辑"和"删除"按钮
- 新增"新增分类"按钮，弹窗填写 ID、名称、图标、排序值
- 编辑弹窗支持修改名称和图标

**服务中心分类管理**（替换现有硬编码服务类型表格）：
- 树形表格展示：一级分类（如"自助推广"、"技术服务"）+ 二级子服务
- 支持新增/编辑/删除/排序一级和二级分类
- 每项支持启用/禁用开关

**产品详情页模块配置**（替换现有功能开关）：
- 从 `display_modules` 表读取配置
- Switch 开关状态变更实时写入数据库
- 列表支持排序

#### 4. MakerStudio.tsx 改动

**服务中心 Tab**：
- 用 `useServiceCategories()` 替换硬编码的 `selfServiceCards` / `techServiceCards`
- 一级分类渲染为 TabsTrigger，二级服务渲染为卡片
- 点击卡片默认弹出通用咨询表单（特殊逻辑如 LLM 通过 `id` 判断保留）

#### 5. ProductDetail.tsx 改动

- 新增 `useDisplayModules()` 调用
- 根据模块 `enabled` 状态条件渲染各区块（视频、技能、社区评价、公司信息、创始人）
- 用户提交表单字段不变

#### 6. 文件变更清单

| 文件 | 操作 |
|---|---|
| `supabase/migrations/...` | 建 `service_categories`、`display_modules` 表 + categories RLS 补充 |
| `src/hooks/useServiceCategories.ts` | 新建 |
| `src/hooks/useDisplayModules.ts` | 新建 |
| `src/hooks/useCategories.ts` | 扩展 CRUD |
| `src/pages/Admin.tsx` | 重构分类管理、新增服务分类管理、详情页模块配置 |
| `src/pages/MakerStudio.tsx` | 服务中心改为数据库驱动 |
| `src/components/product/ProductDetail.tsx` | 模块条件渲染 |

### 模块化与可移植性

- 所有数据读写封装在独立 hooks 中，更换底层存储只需修改 hook 实现
- 服务分类采用 `parent_id` 自引用设计，支持任意层级扩展
- Admin 组件与前台展示组件通过 hooks 解耦，互不依赖

