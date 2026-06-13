-- =============================================
-- 005: Catálogo de productos + campos de pedido
-- =============================================

-- Categorías de productos (Blusas, Pantalones, Chalecos, etc.)
create table product_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table product_categories enable row level security;
create policy "Authenticated access product_categories"
  on product_categories for all to authenticated using (true);

-- Catálogo de productos
create table products (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references product_categories(id) on delete cascade not null,
  name text not null,
  model_ref text,        -- Ej: "#3", "#5", "Camisera"
  description text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

alter table products enable row level security;
create policy "Authenticated access products"
  on products for all to authenticated using (true);

create index idx_products_category on products(category_id);
create index idx_products_active on products(active);

-- Campos adicionales en orders
alter table orders
  add column if not exists season text,
  add column if not exists delivery_days integer default 45,
  add column if not exists measurements_date date,
  add column if not exists apply_iva boolean not null default true,
  add column if not exists additional_info text;

-- Vinculación opcional de order_items con catálogo
alter table order_items
  add column if not exists product_id uuid references products(id) on delete set null;

-- Categorías iniciales
insert into product_categories (name, sort_order) values
  ('Blusas', 1),
  ('Pantalones', 2),
  ('Chalecos', 3),
  ('Camisas', 4),
  ('Faldas', 5),
  ('Uniformes completos', 6)
on conflict (name) do nothing;
