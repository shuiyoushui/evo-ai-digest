CREATE TABLE public.llm_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tag text DEFAULT '',
  sort_order int DEFAULT 0,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.llm_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view llm_recommendations" ON public.llm_recommendations FOR SELECT USING (true);

CREATE POLICY "Admins can manage llm_recommendations" ON public.llm_recommendations FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));