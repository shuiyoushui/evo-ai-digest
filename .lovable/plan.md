

## 计划：修复 Banner 配置保存、图片上传、链接跳转、至少保留一个

### 问题分析

#### 1. RLS 策略导致保存失败
所有管理表（`banner_slides`、`categories`、`ranking_weights`、`display_modules` 等）的 RLS 策略均为 **RESTRICTIVE**（`Permissive: No`）。PostgreSQL 中 RESTRICTIVE 策略是在 PERMISSIVE 策略基础上进一步限制的，若没有任何 PERMISSIVE 策略，则所有写操作都会被拒绝。这就是 `banner_slides` upsert 报 RLS 错误的根因，同样影响其他管理表的写操作。

**修复**：将管理表的 RLS 策略从 RESTRICTIVE 改为 PERMISSIVE。涉及表：`banner_slides`、`categories`、`display_modules`、`ranking_weights`、`service_categories`、`llm_recommendations`、`ai_config`。

#### 2. 图片上传不可用
当前"点击上传图片"只是一个静态的 UI 占位，没有绑定文件选择和上传逻辑。需要：
- 创建 Storage bucket `banner-images`
- 添加隐藏的 `<input type="file">` 并绑定点击事件
- 上传图片到 Storage，获取公开 URL
- 在 `banner_slides` 表增加 `image_url` 字段存储图片地址
- 首页 `HomeBanner` 组件在有 `image_url` 时显示图片背景

#### 3. Banner 链接跳转
当前 `HomeBanner` 的 CTA 按钮没有链接跳转逻辑。需要将按钮包裹在 `<a href={slide.link} target="_blank">` 中，或整个 banner 区域可点击跳转。

#### 4. 至少保留一个 Banner
在管理后台关闭 Banner 的 `active` 开关时，需检查是否是最后一个启用的 Banner，若是则阻止关闭并提示用户。

### 变更内容

#### 1. 数据库迁移 — 修复 RLS 策略 + 新增字段 + Storage

```sql
-- 修复所有管理表的 RLS 策略：DROP RESTRICTIVE → CREATE PERMISSIVE
-- 涉及 7 张表的 admin 管理策略和公开 SELECT 策略

-- banner_slides 新增 image_url 列
ALTER TABLE banner_slides ADD COLUMN image_url text DEFAULT '';

-- 创建 banner-images storage bucket（公开读取）
```

#### 2. `src/pages/Admin.tsx` — Banner 区域增加图片上传 + 至少保留一个校验

- 图片上传区域绑定 `<input type="file" accept="image/*">`，上传到 Storage 并将 URL 写入 `image_url`
- `updateBanner(i, "active", false)` 时检查其他 active 的数量，若 <= 1 则阻止并 toast 提示
- 显示已上传图片的缩略图

#### 3. `src/components/home/HomeBanner.tsx` — 链接跳转 + 图片背景

- 整个 banner 区域或 CTA 按钮添加 `onClick={() => window.open(slide.link, '_blank')}`
- 若 `slide.image_url` 存在，显示为背景图片替代纯渐变色

#### 4. 文件变更清单

| 文件 | 操作 |
|---|---|
| 数据库迁移 | 修复 7 张表 RLS 策略为 PERMISSIVE；banner_slides 新增 image_url；创建 Storage bucket |
| `src/pages/Admin.tsx` | Banner 图片上传功能；至少保留一个 Banner 校验 |
| `src/components/home/HomeBanner.tsx` | CTA 按钮新开 tab 跳转；支持图片背景 |
| `src/hooks/useBannerSlides.ts` | 类型中增加 `image_url` 字段 |

