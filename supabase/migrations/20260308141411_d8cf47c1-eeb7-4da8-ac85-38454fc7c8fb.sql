DROP FUNCTION IF EXISTS public.get_products_with_upvotes(text, text);

CREATE FUNCTION public.get_products_with_upvotes(filter_status text DEFAULT 'approved'::text, filter_category text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, name text, slogan text, description text, logo_url text, category_id text, tags text[], website text, video_url text, verified boolean, featured boolean, status text, maker_name text, maker_title text, maker_avatar text, company_name text, company_founded text, company_location text, company_funding text, benefits text[], views integer, user_id uuid, launch_date date, created_at timestamp with time zone, updated_at timestamp with time zone, upvote_count bigint, skills jsonb, prompts jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  select p.id, p.name, p.slogan, p.description, p.logo_url, p.category_id, p.tags, p.website, p.video_url, p.verified, p.featured, p.status, p.maker_name, p.maker_title, p.maker_avatar, p.company_name, p.company_founded, p.company_location, p.company_funding, p.benefits, p.views, p.user_id, p.launch_date, p.created_at, p.updated_at, coalesce(u.cnt, 0) as upvote_count, p.skills, p.prompts
  from public.products p
  left join (select product_id, count(*) as cnt from public.upvotes group by product_id) u
  on p.id = u.product_id
  where p.status = filter_status
  and (filter_category is null or p.category_id = filter_category)
  order by upvote_count desc, p.created_at desc;
$$;