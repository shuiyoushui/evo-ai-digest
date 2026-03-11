
-- Fix RESTRICTIVE -> PERMISSIVE for banner_slides
DROP POLICY IF EXISTS "Anyone can view banner_slides" ON banner_slides;
DROP POLICY IF EXISTS "Admins can manage banner_slides" ON banner_slides;
CREATE POLICY "Anyone can view banner_slides" ON banner_slides FOR SELECT USING (true);
CREATE POLICY "Admins can manage banner_slides" ON banner_slides FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Fix RESTRICTIVE -> PERMISSIVE for categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Fix RESTRICTIVE -> PERMISSIVE for service_categories
DROP POLICY IF EXISTS "Anyone can view service_categories" ON service_categories;
DROP POLICY IF EXISTS "Admins can manage service_categories" ON service_categories;
CREATE POLICY "Anyone can view service_categories" ON service_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage service_categories" ON service_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Fix RESTRICTIVE -> PERMISSIVE for display_modules
DROP POLICY IF EXISTS "Anyone can view display_modules" ON display_modules;
DROP POLICY IF EXISTS "Admins can manage display_modules" ON display_modules;
CREATE POLICY "Anyone can view display_modules" ON display_modules FOR SELECT USING (true);
CREATE POLICY "Admins can manage display_modules" ON display_modules FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Fix RESTRICTIVE -> PERMISSIVE for ranking_weights
DROP POLICY IF EXISTS "Anyone can view ranking_weights" ON ranking_weights;
DROP POLICY IF EXISTS "Admins can manage ranking_weights" ON ranking_weights;
CREATE POLICY "Anyone can view ranking_weights" ON ranking_weights FOR SELECT USING (true);
CREATE POLICY "Admins can manage ranking_weights" ON ranking_weights FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
