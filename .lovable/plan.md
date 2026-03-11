

## Bug 修复计划

### 根因分析

三个问题共享同一个根本原因，外加一个前端 bug：

**根因：所有 RLS 策略都设为了 RESTRICTIVE（限制性）而非 PERMISSIVE（宽容性）**

PostgreSQL RLS 规则：RESTRICTIVE 策略只能**缩小**由 PERMISSIVE 策略授予的访问范围。如果没有任何 PERMISSIVE 策略，则默认拒绝所有访问。当前 `banner_slides`、`categories`、`service_categories`、`display_modules`、`ranking_weights` 五张表的所有策略全部是 RESTRICTIVE，导致即使是 admin 也无法写入。

**Bug 2 — Banner 输入框不可编辑**：`Admin.tsx` 第 399 行的 `<Input>` 同时设置了 `value={slide.title}` 和空的 `onChange`，形成受控组件但无法修改。

### 修复方案

#### 1. 数据库迁移 — 重建 RLS 策略为 PERMISSIVE

对以下 5 张表执行 DROP + CREATE，将所有策略改为 PERMISSIVE（默认值）：
- `banner_slides`
- `categories`
- `service_categories`
- `display_modules`
- `ranking_weights`

```sql
-- 示例（每张表类似）
DROP POLICY "Anyone can view banner_slides" ON banner_slides;
DROP POLICY "Admins can manage banner_slides" ON banner_slides;
CREATE POLICY "Anyone can view banner_slides" ON banner_slides FOR SELECT USING (true);
CREATE POLICY "Admins can manage banner_slides" ON banner_slides FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
```

#### 2. 前端修复 — Banner 标题输入框

将 `Admin.tsx` 第 399 行的 Banner 标题 Input 改为非受控模式（仅用 `defaultValue` + `onBlur`），去掉冲突的 `value` 和空 `onChange`。

### 文件变更

| 文件 | 改动 |
|---|---|
| `supabase/migrations/...` | 重建 5 张表的 RLS 策略为 PERMISSIVE |
| `src/pages/Admin.tsx` | 修复 Banner 标题 Input 的受控/非受控冲突 |

