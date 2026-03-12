

## 计划：数据总览改为真实数据 + 趋势图表

### 当前状态

数据总览使用硬编码假数据（"1,284"、"23"、"45.2K"、"¥89,200"），趋势图表为占位符。

### 变更内容

**`src/pages/Admin.tsx`**：

**1. 四个指标卡片改为真实数据查询**
- **总产品数**：`products` 表 `status = 'approved'` 的 count
- **昨日提交产品数**：`products` 表 `created_at` 在昨日自然日范围内的 count（不限状态）
- **待审核产品数**：`products` 表 `status = 'pending'` 的 count
- **总用户数**：`profiles` 表总 count

使用 `useEffect` 在 overview tab 激活时通过 `supabase.from(...).select('id', { count: 'exact', head: true })` 查询，存入 state。

**2. 移除无关指标**
- 删除"本月收入"卡片，改为 3 列或保留 4 列（待审核填补）

**3. 趋势图表：近 7 日审核通过产品数**
- 查询 `products` 表 `status = 'approved'`，`created_at` 在近 7 天内
- 按日分组统计，使用已有的 `BarChart` + `recharts` 渲染
- X 轴显示日期（MM-DD），Y 轴显示数量

**4. 清理**
- 删除 `categoryInquiryData`、`serviceTypeData`、`PIE_COLORS` 等未使用的 mock 常量（如果仅 overview 使用）

单文件改动，无数据库变更。RLS 已有 admin 读取权限。

