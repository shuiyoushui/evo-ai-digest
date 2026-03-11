

## 实施计划：Banner 轮播图 + 排名权重持久化到数据库

### 变更内容

#### 1. 数据库迁移 — 新建两张表

**`banner_slides` 表** — 首页轮播图配置：

```sql
CREATE TABLE banner_slides (
  id text PRIMARY KEY,
  title text NOT NULL,
  cta text NOT NULL DEFAULT '立即体验',
  link text NOT NULL DEFAULT '#',
  active boolean NOT NULL DEFAULT true,
  gradient text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);
-- RLS: 公开可读，Admin 全权管理
```

预填当前 3 条默认 Banner 数据。

**`ranking_weights` 表** — 排名算法权重（单行配置）：

```sql
CREATE TABLE ranking_weights (
  id text PRIMARY KEY DEFAULT 'default',
  upvotes int NOT NULL DEFAULT 40,
  views int NOT NULL DEFAULT 25,
  comments int NOT NULL DEFAULT 20,
  decay int NOT NULL DEFAULT 15,
  updated_at timestamptz DEFAULT now()
);
-- RLS: 公开可读，Admin 可更新
```

预填默认权重值。

#### 2. 新建模块化 Hooks

| 文件 | 功能 |
|---|---|
| `src/hooks/useBannerSlides.ts` | `useBannerSlides()` 读取、`useCreateBannerSlide()`、`useUpdateBannerSlide()`、`useDeleteBannerSlide()` |
| `src/hooks/useRankingWeights.ts` | `useRankingWeights()` 读取、`useUpdateRankingWeights()` 更新 |

#### 3. 文件改动

| 文件 | 改动 |
|---|---|
| `src/pages/Admin.tsx` | Banner 配置区改为读写 `useBannerSlides()`；排名权重区改为读写 `useRankingWeights()`；移除本地 `useState` |
| `src/components/home/HomeBanner.tsx` | 移除硬编码 `defaultBannerSlides`，改为接收来自数据库的 slides 数据 |
| `src/pages/Index.tsx` | 调用 `useBannerSlides()` 获取数据传入 `HomeBanner` |

#### 4. 模块化设计

- 所有数据读写封装在独立 hooks，后续迁移阿里云只需替换 hook 内部实现
- Banner 支持 Admin 端新增/删除/编辑/启用禁用/排序
- 排名权重保存后即时持久化，刷新不丢失

