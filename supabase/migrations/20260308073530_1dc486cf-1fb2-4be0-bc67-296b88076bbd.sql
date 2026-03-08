
-- Create app_role enum
create type public.app_role as enum ('admin', 'moderator', 'user');

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default '',
  phone text default '',
  email text default '',
  avatar_url text default '',
  csdn_bound boolean default false,
  csdn_username text default '',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Public can view profiles" on public.profiles for select to anon using (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nickname', '用户'), coalesce(new.email, ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Categories table
create table public.categories (
  id text primary key,
  label text not null,
  icon text not null default '',
  sort_order int default 0
);

alter table public.categories enable row level security;
create policy "Anyone can view categories" on public.categories for select to anon, authenticated using (true);

-- Seed categories
insert into public.categories (id, label, icon, sort_order) values
  ('devcode', '开发与编程', '💻', 1),
  ('agents', '智能体与自动化', '🤖', 2),
  ('efficiency', '效率与办公', '⚡', 3),
  ('visual', '视觉与创意', '🎨', 4),
  ('writing', '写作营销', '✍️', 5),
  ('infra', '模型与基建', '🧠', 6);

-- Products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slogan text default '',
  description text default '',
  logo_url text default '',
  category_id text references public.categories(id),
  tags text[] default '{}',
  website text default '',
  video_url text default '',
  verified boolean default false,
  featured boolean default false,
  status text default 'pending',
  maker_name text default '',
  maker_title text default '',
  maker_avatar text default '',
  company_name text default '',
  company_founded text default '',
  company_location text default '',
  company_funding text default '',
  benefits text[] default '{}',
  views int default 0,
  user_id uuid references auth.users(id) on delete set null,
  launch_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products enable row level security;
create policy "Anyone can view approved products" on public.products for select to anon, authenticated using (status = 'approved');
create policy "Users can view own products" on public.products for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert products" on public.products for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own products" on public.products for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own products" on public.products for delete to authenticated using (auth.uid() = user_id);

-- Upvotes table
create table public.upvotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table public.upvotes enable row level security;
create policy "Anyone can view upvotes" on public.upvotes for select to anon, authenticated using (true);
create policy "Users can insert own upvotes" on public.upvotes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete own upvotes" on public.upvotes for delete to authenticated using (auth.uid() = user_id);

-- User roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique(user_id, role)
);

alter table public.user_roles enable row level security;
create policy "Users can view own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

-- has_role function
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

-- Admin policies for products
create policy "Admins can view all products" on public.products for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update all products" on public.products for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete all products" on public.products for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Function to get product with upvote count
create or replace function public.get_products_with_upvotes(filter_status text default 'approved', filter_category text default null)
returns table (
  id uuid, name text, slogan text, description text, logo_url text, category_id text,
  tags text[], website text, video_url text, verified boolean, featured boolean,
  status text, maker_name text, maker_title text, maker_avatar text,
  company_name text, company_founded text, company_location text, company_funding text,
  benefits text[], views int, user_id uuid, launch_date date, created_at timestamptz,
  updated_at timestamptz, upvote_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select p.*, coalesce(u.cnt, 0) as upvote_count
  from public.products p
  left join (select product_id, count(*) as cnt from public.upvotes group by product_id) u
  on p.id = u.product_id
  where p.status = filter_status
  and (filter_category is null or p.category_id = filter_category)
  order by upvote_count desc, p.created_at desc;
$$;
