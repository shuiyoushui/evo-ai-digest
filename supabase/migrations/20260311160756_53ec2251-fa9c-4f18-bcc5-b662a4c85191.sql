
-- service_categories table
CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.service_categories(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Cpu',
  sort_order int NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view service_categories" ON public.service_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage service_categories" ON public.service_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- display_modules table
CREATE TABLE public.display_modules (
  id text PRIMARY KEY,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.display_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view display_modules" ON public.display_modules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage display_modules" ON public.display_modules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed display_modules
INSERT INTO public.display_modules (id, label, description, enabled, sort_order) VALUES
  ('video', '演示视频', '产品详情页显示演示视频', false, 1),
  ('benefits', '核心优势', '产品详情页显示核心优势列表', true, 2),
  ('skills', '技能 & Prompts', '产品详情页显示 Agent 技能与 Prompt 库', true, 3),
  ('community', '社区评价', '产品详情页显示评论区', false, 4),
  ('company', '公司信息', '产品详情页显示公司信息卡片', true, 5),
  ('founder', '创始人', '产品详情页显示创始人卡片', true, 6);

-- Add missing RLS for categories
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
