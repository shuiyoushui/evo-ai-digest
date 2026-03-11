
-- Banner slides table
CREATE TABLE banner_slides (
  id text PRIMARY KEY,
  title text NOT NULL,
  cta text NOT NULL DEFAULT '立即体验',
  link text NOT NULL DEFAULT '#',
  active boolean NOT NULL DEFAULT true,
  gradient text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE banner_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view banner_slides" ON banner_slides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage banner_slides" ON banner_slides FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Ranking weights table (single-row config)
CREATE TABLE ranking_weights (
  id text PRIMARY KEY DEFAULT 'default',
  upvotes int NOT NULL DEFAULT 40,
  views int NOT NULL DEFAULT 25,
  comments int NOT NULL DEFAULT 20,
  decay int NOT NULL DEFAULT 15,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ranking_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ranking_weights" ON ranking_weights FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage ranking_weights" ON ranking_weights FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed default banner data
INSERT INTO banner_slides (id, title, cta, link, active, gradient, sort_order) VALUES
  ('b1', '上架 Agent Hunt 即可免费瓜分万亿曝光', '立即体验', '#', true, 'from-blue-600/90 via-indigo-600/80 to-violet-700/90', 0),
  ('b2', 'CSDN 创作者计划 — 加入 AI 流量扶持计划', '了解详情', '#', true, 'from-emerald-600/90 via-teal-600/80 to-cyan-700/90', 1),
  ('b3', 'Vibe Coding 时代 — 非程序员的顶级工具推荐', '查看推荐', '#', true, 'from-amber-600/90 via-orange-600/80 to-rose-700/90', 2);

-- Seed default ranking weights
INSERT INTO ranking_weights (id, upvotes, views, comments, decay) VALUES ('default', 40, 25, 20, 15);
