

## 计划：修复技能/Prompts 展示逻辑 + 拆分功能开关

### 问题分析

1. **Fallback 问题**：当产品的 `skills` 或 `prompts` 字段为 `null` 时，代码使用硬编码的 fallback 数据展示，而非显示空状态。应改为：null 时不展示，仅展示用户实际填写的数据。

2. **开关合并问题**：当前 `display_modules` 表中 `skills` 是一个合并开关，同时控制"技能"和"Prompts"两个区块。需拆为两个独立开关。

### 变更内容

**1. 数据库：拆分 display_modules 记录**

- 将现有 `skills` 记录改为仅控制"Agent 技能"
- 新增 `prompts` 记录控制"Prompt 库"
- SQL：`UPDATE display_modules SET label='Agent 技能', description='...' WHERE id='skills'; INSERT INTO display_modules (id, label, description, enabled, sort_order) VALUES ('prompts', 'Prompt 库', '产品详情页显示最佳 Prompt 库', true, 4);` 并调整后续 sort_order。

**2. `ProductDetail.tsx`**

- 移除 `fallbackSkills` 和 `fallbackPrompts` 常量
- `skills` 和 `prompts` 为 null/空数组时直接不展示，不再 fallback
- 将 `showSkills` 拆为 `showSkills`（读 `moduleEnabled("skills")` + skills 非空）和 `showPrompts`（读 `moduleEnabled("prompts")` + prompts 非空）
- Tab 页标签根据两者是否都可见动态调整文案
- 技能区块和 Prompts 区块各自独立受开关控制

**3. `Admin.tsx`（展示配置-功能开关）**

- 无需改动：功能开关列表已从 `display_modules` 表动态渲染，新增的 `prompts` 记录会自动出现为独立开关项

### 影响范围

- 1 个数据库迁移（拆分 display_modules 记录）
- 1 个文件改动：`ProductDetail.tsx`

