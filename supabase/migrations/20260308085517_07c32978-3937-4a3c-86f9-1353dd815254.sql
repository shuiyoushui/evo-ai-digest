
CREATE TABLE public.ai_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  model text NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  system_prompt text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;

-- Admin can read/write
CREATE POLICY "Admins can manage ai_config" ON public.ai_config
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default config
INSERT INTO public.ai_config (config_key, model, system_prompt, enabled)
VALUES (
  'analyze_url',
  'google/gemini-3-flash-preview',
  '你是一个AI产品分析专家。根据提供的网页内容，分析产品的核心功能、目标用户、技术特点，并提取结构化的产品信息。请用中文回答。提取以下信息：产品名称、一句话介绍(slogan)、详细描述、分类、标签(包括平台和定价模式)、创始人信息、公司信息等。',
  true
);
