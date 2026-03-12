-- ============================================================
-- Agent Hunt — 全量 RLS 策略导出
-- 生成时间: 2026-03-12
-- 用途: 迁移至阿里云 RDS 或其他 PostgreSQL 实例时使用
-- ============================================================

-- ─── 前置: 角色权限检查函数 ─────────────────────────────────────
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- ─── 注册触发器函数 ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, email, phone)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', '用户'),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  RETURN new;
END;
$$;

-- ─── 产品列表 RPC ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_products_with_upvotes(
  filter_status text DEFAULT 'approved',
  filter_category text DEFAULT NULL
)
RETURNS TABLE(
  id uuid, name text, slogan text, description text, logo_url text,
  category_id text, tags text[], website text, video_url text,
  verified boolean, featured boolean, status text,
  maker_name text, maker_title text, maker_avatar text,
  company_name text, company_founded text, company_location text, company_funding text,
  benefits text[], views integer, user_id uuid, launch_date date,
  created_at timestamptz, updated_at timestamptz,
  upvote_count bigint, skills jsonb, prompts jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT p.*, coalesce(u.cnt, 0) AS upvote_count, p.skills, p.prompts
  FROM public.products p
  LEFT JOIN (SELECT product_id, count(*) AS cnt FROM public.upvotes GROUP BY product_id) u
    ON p.id = u.product_id
  WHERE p.status = filter_status
    AND (filter_category IS NULL OR p.category_id = filter_category)
  ORDER BY upvote_count DESC, p.created_at DESC;
$$;


-- ═══════════════════════════════════════════════════════════════
-- TABLE: products
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Users can view own products"
  ON public.products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON public.products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- ═══════════════════════════════════════════════════════════════
-- TABLE: profiles
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);


-- ═══════════════════════════════════════════════════════════════
-- TABLE: upvotes
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view upvotes"
  ON public.upvotes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own upvotes"
  ON public.upvotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own upvotes"
  ON public.upvotes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════
-- TABLE: user_roles
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════
-- TABLE: categories
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ═══════════════════════════════════════════════════════════════
-- TABLE: banner_slides
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.banner_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view banner_slides"
  ON public.banner_slides FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage banner_slides"
  ON public.banner_slides FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ═══════════════════════════════════════════════════════════════
-- TABLE: ranking_weights
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.ranking_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ranking_weights"
  ON public.ranking_weights FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage ranking_weights"
  ON public.ranking_weights FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ═══════════════════════════════════════════════════════════════
-- TABLE: display_modules
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.display_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view display_modules"
  ON public.display_modules FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage display_modules"
  ON public.display_modules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ═══════════════════════════════════════════════════════════════
-- TABLE: llm_recommendations
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.llm_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view llm_recommendations"
  ON public.llm_recommendations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage llm_recommendations"
  ON public.llm_recommendations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ═══════════════════════════════════════════════════════════════
-- TABLE: service_categories
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service_categories"
  ON public.service_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage service_categories"
  ON public.service_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ═══════════════════════════════════════════════════════════════
-- TABLE: ai_config
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ai_config"
  ON public.ai_config FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
