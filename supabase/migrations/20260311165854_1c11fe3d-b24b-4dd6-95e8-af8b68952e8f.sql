-- Fix ALL policies to be explicitly PERMISSIVE (currently all are RESTRICTIVE)

-- banner_slides
DROP POLICY IF EXISTS "Anyone can view banner_slides" ON banner_slides;
DROP POLICY IF EXISTS "Admins can manage banner_slides" ON banner_slides;
CREATE POLICY "Anyone can view banner_slides" ON banner_slides FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage banner_slides" ON banner_slides FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- service_categories
DROP POLICY IF EXISTS "Anyone can view service_categories" ON service_categories;
DROP POLICY IF EXISTS "Admins can manage service_categories" ON service_categories;
CREATE POLICY "Anyone can view service_categories" ON service_categories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage service_categories" ON service_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- display_modules
DROP POLICY IF EXISTS "Anyone can view display_modules" ON display_modules;
DROP POLICY IF EXISTS "Admins can manage display_modules" ON display_modules;
CREATE POLICY "Anyone can view display_modules" ON display_modules FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage display_modules" ON display_modules FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ranking_weights
DROP POLICY IF EXISTS "Anyone can view ranking_weights" ON ranking_weights;
DROP POLICY IF EXISTS "Admins can manage ranking_weights" ON ranking_weights;
CREATE POLICY "Anyone can view ranking_weights" ON ranking_weights FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage ranking_weights" ON ranking_weights FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- llm_recommendations
DROP POLICY IF EXISTS "Anyone can view llm_recommendations" ON llm_recommendations;
DROP POLICY IF EXISTS "Admins can manage llm_recommendations" ON llm_recommendations;
CREATE POLICY "Anyone can view llm_recommendations" ON llm_recommendations FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage llm_recommendations" ON llm_recommendations FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ai_config
DROP POLICY IF EXISTS "Admins can manage ai_config" ON ai_config;
CREATE POLICY "Admins can manage ai_config" ON ai_config FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));