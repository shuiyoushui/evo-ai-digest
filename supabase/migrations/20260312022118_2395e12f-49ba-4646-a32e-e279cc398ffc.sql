
-- =============================================
-- 1. Fix RLS: Drop RESTRICTIVE, recreate as PERMISSIVE for all admin-managed tables
-- =============================================

-- banner_slides
DROP POLICY IF EXISTS "Admins can manage banner_slides" ON public.banner_slides;
DROP POLICY IF EXISTS "Anyone can view banner_slides" ON public.banner_slides;
CREATE POLICY "Anyone can view banner_slides" ON public.banner_slides FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage banner_slides" ON public.banner_slides FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- display_modules
DROP POLICY IF EXISTS "Admins can manage display_modules" ON public.display_modules;
DROP POLICY IF EXISTS "Anyone can view display_modules" ON public.display_modules;
CREATE POLICY "Anyone can view display_modules" ON public.display_modules FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage display_modules" ON public.display_modules FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ranking_weights
DROP POLICY IF EXISTS "Admins can manage ranking_weights" ON public.ranking_weights;
DROP POLICY IF EXISTS "Anyone can view ranking_weights" ON public.ranking_weights;
CREATE POLICY "Anyone can view ranking_weights" ON public.ranking_weights FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage ranking_weights" ON public.ranking_weights FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- service_categories
DROP POLICY IF EXISTS "Admins can manage service_categories" ON public.service_categories;
DROP POLICY IF EXISTS "Anyone can view service_categories" ON public.service_categories;
CREATE POLICY "Anyone can view service_categories" ON public.service_categories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage service_categories" ON public.service_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- llm_recommendations
DROP POLICY IF EXISTS "Admins can manage llm_recommendations" ON public.llm_recommendations;
DROP POLICY IF EXISTS "Anyone can view llm_recommendations" ON public.llm_recommendations;
CREATE POLICY "Anyone can view llm_recommendations" ON public.llm_recommendations FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage llm_recommendations" ON public.llm_recommendations FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ai_config
DROP POLICY IF EXISTS "Admins can manage ai_config" ON public.ai_config;
CREATE POLICY "Admins can manage ai_config" ON public.ai_config FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- 2. Add image_url column to banner_slides
-- =============================================
ALTER TABLE public.banner_slides ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';

-- =============================================
-- 3. Create banner-images storage bucket
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('banner-images', 'banner-images', true) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: anyone can read, admins can upload/delete
CREATE POLICY "Anyone can view banner images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'banner-images');
CREATE POLICY "Admins can upload banner images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banner-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update banner images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'banner-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete banner images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'banner-images' AND has_role(auth.uid(), 'admin'::app_role));
