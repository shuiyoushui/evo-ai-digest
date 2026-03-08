

## 测试用例设计与 Bug 修复计划

### 今日新增功能清单

1. **用户认证** — 注册、登录、登出、会话持久化
2. **产品提交** — 手动填写 + AI 智能导入（analyze-url Edge Function）
3. **产品审核** — Admin 后台审批/拒绝
4. **投票系统** — 登录用户可投票/取消投票
5. **标签展示** — ProductCard 和 ProductDetail 中展示 tags
6. **AI 配置管理** — Admin 后台配置模型和 Prompt
7. **分类导航** — 从数据库读取分类

### 已发现的 Bug

**Bug 1: 编辑产品时 tags 丢失**
- `handleEditProject`（行 198-215）未将 `proj.tags` 加载到 `editFormData`
- `handleSaveEdit`（行 217-240）未将 tags 保存到数据库
- 影响：用户编辑产品后标签被清空

**Bug 2: 编辑产品时 benefits 丢失**
- 同上，`benefits` 字段也未在编辑流程中处理

### 测试用例设计

将编写以下前端单元/集成测试：

#### 1. `useProducts` Hook 测试
- 验证 `useSubmitProduct` 提交产品时包含必要字段（name, tags, category_id）
- 验证 `useUpdateProduct` 能正确传递更新字段

#### 2. `useUpvotes` Hook 测试  
- 验证 `useToggleUpvote` 投票切换逻辑（已投票时 delete，未投票时 insert）

#### 3. `ProductCard` 组件测试
- 验证 tags 正确渲染（最多 3 个）
- 验证未登录时点击投票按钮显示提示
- 验证 upvote_count 显示

#### 4. `AuthContext` 测试
- 验证初始状态（未登录）
- 验证 login/register 函数调用 supabase auth

#### 5. AI 分析功能测试
- 验证 `handleAIAnalyze` 空 URL 不触发调用
- 验证 AI 返回数据正确映射到 formData

### 修复计划

1. **修复 `handleEditProject`** — 添加 `tags: proj.tags || []` 和 `benefits: proj.benefits || []`
2. **修复 `handleSaveEdit`** — 在 update 调用中添加 `tags` 和 `benefits` 字段
3. 编写 5 组测试文件覆盖上述用例

### 涉及文件

- `src/pages/MakerStudio.tsx` — 修复 edit 流程中 tags/benefits 丢失
- `src/hooks/__tests__/useProducts.test.ts` — 新建
- `src/components/home/__tests__/ProductCard.test.tsx` — 新建
- `src/contexts/__tests__/AuthContext.test.tsx` — 新建
- `src/pages/__tests__/MakerStudio.test.tsx` — 新建（AI 分析逻辑）

