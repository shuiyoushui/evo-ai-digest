ALTER TABLE ai_config
  ADD COLUMN ai_endpoint text NOT NULL DEFAULT 'https://ai.gateway.lovable.dev/v1/chat/completions',
  ADD COLUMN scraper_endpoint text NOT NULL DEFAULT 'https://api.firecrawl.dev/v1/scrape',
  ADD COLUMN ai_api_key_name text NOT NULL DEFAULT 'LOVABLE_API_KEY',
  ADD COLUMN scraper_api_key_name text NOT NULL DEFAULT 'FIRECRAWL_API_KEY';