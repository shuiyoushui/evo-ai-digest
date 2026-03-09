

## 优化计划

### 优化点 1: 新增 "Claw" 分类并插入示例产品

**现状**: 数据库有 6 个分类（开发与编程、智能体与自动化等），无 Claw 相关分类。

**改动**:
1. **插入新分类** — 在 `categories` 表插入 `{ id: "claw", label: "Claw", icon: "🦞", sort_order: 7 }`
2. **插入示例产品** — 插入 OpenClaw、KimiClaw 等 Claw 类产品，`category_id = "claw"`，`status = "approved"`，填充 name/slogan/description/logo_url/tags/skills/prompts 等字段

无需改动前端代码，分类导航和产品列表都是从数据库动态读取的。

---

### 优化点 2: 大模型接入 — 高性价比优选推荐模块

**现状**: 技术服务 → 大模型接入，点击后弹出通用咨询对话框，没有优选推荐功能。

**改动**:

#### 2a. 新建数据库表 `llm_recommendations`
```sql
CREATE TABLE public.llm_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,          -- 大模型名称，如 "DeepSeek V3"
  tag text DEFAULT '',         -- 优选推荐标签，如 "性价比之王"、"最强推理"
  sort_order int DEFAULT 0,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.llm_recommendations ENABLE ROW LEVEL SECURITY;
-- 所有人可读
CREATE POLICY "Anyone can view llm_recommendations" ON public.llm_recommendations FOR SELECT USING (true);
-- 管理员可管理
CREATE POLICY "Admins can manage llm_recommendations" ON public.llm_recommendations FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
```

插入初始数据：DeepSeek V3（性价比之王）、GPT-5 Mini（均衡之选）、Claude Sonnet（代码利器）、Gemini Flash（极速响应）等。

#### 2b. 前端 hook `useRecommendations`
新建 `src/hooks/useRecommendations.ts`，查询 `llm_recommendations` 表并按 `sort_order` 排序。

#### 2c. MakerStudio 技术服务 — 大模型接入卡片改造
点击"大模型接入"卡片后，不再直接弹通用咨询框，而是展开一个内嵌区域或弹窗：
- 顶部：下拉选择器 `<Select>`，列出所有大模型，默认选中第一个有优选标签的模型
- 选中后显示该模型的推荐标签（Badge）
- 下方保留咨询表单（联系人、电话、需求描述）

#### 2d. Admin 后台 — 新增优选推荐管理
在系统配置 tab 下新增"大模型优选推荐"管理卡片：
- 表格展示所有推荐模型（名称、标签、排序、启用状态）
- 支持编辑名称和标签（inline 编辑或弹窗）
- 支持启用/禁用开关

---

### 涉及文件

| 改动项 | 文件 |
|--------|------|
| 插入分类和产品数据 | 数据库 INSERT（无前端改动） |
| 新建表 + 初始数据 | 数据库迁移 + INSERT |
| 新 hook | `src/hooks/useRecommendations.ts`（新建） |
| 大模型接入 UI | `src/pages/MakerStudio.tsx` |
| Admin 管理 | `src/pages/Admin.tsx` |
| 测试用例 | 新增对应测试文件 |

