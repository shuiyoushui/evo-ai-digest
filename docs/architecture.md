# Agent Hunt — 架构文档

## 1. 用户角色判断逻辑

### 角色存储

角色存储在独立的 `user_roles` 表中（非 profiles 表），避免权限提升攻击：

```sql
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,  -- enum: 'admin' | 'moderator' | 'user'
  UNIQUE (user_id, role)
);
```

### 服务端判断（RLS 策略）

所有 RLS 策略通过 `SECURITY DEFINER` 函数 `has_role()` 判断：

```sql
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
```

此函数绕过 RLS 递归问题，在策略中直接使用：
```sql
USING (public.has_role(auth.uid(), 'admin'))
```

### 客户端判断

在 `src/contexts/AuthContext.tsx` 中，登录后异步查询 `user_roles` 表：

```typescript
const checkAdmin = async (userId: string) => {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  setIsAdmin(!!data);
};
```

- **不依赖 JWT claims**，不依赖 localStorage
- 每次 `onAuthStateChange` 时重新查询数据库
- 前端 `isAdmin` 仅用于 UI 显示（如显示管理后台入口），真正的权限由 RLS 保障

---

## 2. API 封装审计

### ✅ 已正确封装到 Hooks 的数据操作

| Hook 文件 | 封装内容 |
|---|---|
| `useProducts.ts` | products 表 CRUD + RPC 查询 |
| `useUpvotes.ts` | 投票的查询、切换 |
| `useCategories.ts` | 分类列表查询 |
| `useBannerSlides.ts` | Banner 幻灯片查询 |
| `useDisplayModules.ts` | 显示模块查询 |
| `useRecommendations.ts` | LLM 推荐列表 CRUD |
| `useServiceCategories.ts` | 服务分类 CRUD |

### ✅ 已封装到 Context 的操作

| 文件 | 封装内容 |
|---|---|
| `AuthContext.tsx` | 认证（登录/注册/OTP）、Profile CRUD、角色检查 |

### ⚠️ 直接调用 Supabase 的组件（需优化）

| 文件 | 操作 | 建议 |
|---|---|---|
| `Admin.tsx` | ranking_weights 读写、categories CRUD、banner_slides upsert、display_modules 更新、banner-images 上传 | 提取为 `useAdminSettings.ts` hook |
| `OverviewTab.tsx` | products/profiles 统计查询 | 提取为 `useOverviewStats.ts` hook |
| `Profile.tsx` | avatars storage 上传 | 提取为 `useAvatarUpload.ts` hook |
| `MakerStudio.tsx` | Edge Function 调用 `analyze-url` | 提取为 `useAnalyzeUrl.ts` hook |

---

## 3. Edge Function 兼容性

### 当前 Edge Function: `analyze-url`

- 运行时: Deno (Supabase Edge Functions)
- 功能: 网页抓取 + AI 结构化分析
- 特点: **无硬编码地址**，所有配置从 `ai_config` 表动态读取

### 迁移到阿里云函数计算 (FC) 的要点

1. 将 Deno 语法改写为 Node.js（替换 `Deno.env.get` → `process.env`，`serve` → 标准 HTTP handler）
2. `@supabase/supabase-js` 可直接在 Node.js 使用
3. AI/抓取端点已通过数据库配置解耦，切换云服务商只需更新 `ai_config` 表
4. CORS headers 保持不变

---

## 4. 配置管理原则

- ❌ 无硬编码 API Key（全部通过环境变量或数据库 `ai_config` 表）
- ❌ 无硬编码 API 端点（默认值仅作 fallback，生产由数据库驱动）
- ✅ `mockData.ts` 中的 URL 仅为前端展示用 mock 数据，不涉及真实 API 调用
