-- ═══════════════════════════════════════════════════════════════
-- URBANDEAM — Migration 0004 : catégories dynamiques
-- ═══════════════════════════════════════════════════════════════

-- 1. Créer la table categories
create table if not exists public.categories (
  id          uuid        primary key default gen_random_uuid(),
  slug        text        unique not null,
  name        jsonb       not null default '{"fr":"","en":""}',
  color       text        not null default '#6B7280',
  position    int         not null default 0,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger categories_updated_at
  before update on public.categories
  for each row execute procedure public.set_updated_at();

create index if not exists categories_position_idx on public.categories(position);
create index if not exists categories_active_idx   on public.categories(is_active);

-- 2. Migrer products.category : passer de l'enum product_category à text
alter table public.products
  alter column category type text using category::text;

-- 3. Supprimer l'ancien type ENUM
drop type if exists product_category;

-- 4. Insérer les 3 catégories par défaut
insert into public.categories (slug, name, color, position) values
  ('excel',  '{"fr":"Excel","en":"Excel"}',   '#217346', 0),
  ('pdf',    '{"fr":"PDF","en":"PDF"}',         '#FF4B4B', 1),
  ('notion', '{"fr":"Notion","en":"Notion"}',   '#191919', 2)
on conflict (slug) do nothing;

-- 5. RLS
alter table public.categories enable row level security;

create policy "Public read active categories"
  on public.categories for select
  using (is_active = true);

create policy "Admin full access categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );
