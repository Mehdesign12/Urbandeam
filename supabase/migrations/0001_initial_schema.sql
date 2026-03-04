-- ═══════════════════════════════════════════════════════════════
-- URBANDEAM — Migration initiale v1.0
-- Tables : products, orders, order_items, users (profiles)
-- ═══════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Types ENUM ──────────────────────────────────────────────────
create type product_category as enum ('excel', 'pdf', 'notion');
create type order_status      as enum ('pending', 'paid', 'failed', 'refunded');

-- ═══════════════════════════════════════════════════════════════
-- TABLE : profiles
-- Extension de auth.users (Supabase Auth)
-- ═══════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id                  uuid        primary key references auth.users(id) on delete cascade,
  email               text        not null,
  name                text,
  stripe_customer_id  text        unique,
  locale              text        not null default 'fr',
  is_admin            boolean     not null default false,
  newsletter_opt_in   boolean     not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Index email pour les lookups Stripe webhook
create index if not exists profiles_email_idx on public.profiles(email);

-- Trigger : mise à jour automatique de updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Trigger : créer automatiquement le profil à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- TABLE : products
-- ═══════════════════════════════════════════════════════════════
create table if not exists public.products (
  id                  uuid              primary key default uuid_generate_v4(),
  slug                text              not null unique,
  stripe_product_id   text              unique,
  stripe_price_id     text              unique,
  -- Titres et descriptions multilingues (jsonb i18n)
  -- Format : {"fr": "...", "en": "...", "es": "..."}
  title               jsonb             not null default '{}',
  description         jsonb             not null default '{}',
  -- Prix en centimes d'euro (ex: 1900 = 19,00 €)
  price               integer           not null check (price >= 0),
  price_original      integer           check (price_original >= 0),
  category            product_category  not null,
  image_url           text,
  -- Chemin du fichier dans Supabase Storage (bucket : products-files)
  file_path           text,
  is_published        boolean           not null default false,
  sort_order          integer           not null default 0,
  created_at          timestamptz       not null default now(),
  updated_at          timestamptz       not null default now()
);

-- Index pour le catalogue
create index if not exists products_slug_idx        on public.products(slug);
create index if not exists products_category_idx    on public.products(category);
create index if not exists products_published_idx   on public.products(is_published);
create index if not exists products_sort_idx        on public.products(sort_order);

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- TABLE : orders
-- ═══════════════════════════════════════════════════════════════
create table if not exists public.orders (
  id                      uuid          primary key default uuid_generate_v4(),
  stripe_session_id       text          not null unique,
  stripe_payment_intent   text          unique,
  customer_email          text          not null,
  customer_name           text,
  -- FK vers profiles (nullable : achat sans compte)
  user_id                 uuid          references public.profiles(id) on delete set null,
  -- Montant total en centimes
  amount_total            integer       not null check (amount_total >= 0),
  currency                text          not null default 'eur',
  status                  order_status  not null default 'pending',
  locale                  text          not null default 'fr',
  -- Métadonnées Stripe (stockage brut pour audit)
  stripe_metadata         jsonb         default '{}',
  created_at              timestamptz   not null default now(),
  updated_at              timestamptz   not null default now()
);

-- Index pour les lookups post-webhook et dashboard admin
create index if not exists orders_stripe_session_idx    on public.orders(stripe_session_id);
create index if not exists orders_customer_email_idx    on public.orders(customer_email);
create index if not exists orders_user_id_idx           on public.orders(user_id);
create index if not exists orders_status_idx            on public.orders(status);
create index if not exists orders_created_at_idx        on public.orders(created_at desc);

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- TABLE : order_items
-- ═══════════════════════════════════════════════════════════════
create table if not exists public.order_items (
  id                    uuid          primary key default uuid_generate_v4(),
  order_id              uuid          not null references public.orders(id) on delete cascade,
  product_id            uuid          not null references public.products(id) on delete restrict,
  price_paid            integer       not null check (price_paid >= 0),
  download_count        integer       not null default 0,
  download_limit        integer       not null default 5,
  -- Expiration : 30 jours après achat (modifiable selon politique)
  download_expires_at   timestamptz   not null default (now() + interval '30 days'),
  created_at            timestamptz   not null default now()
);

-- Index pour les vérifications de droit de téléchargement
create index if not exists order_items_order_id_idx    on public.order_items(order_id);
create index if not exists order_items_product_id_idx  on public.order_items(product_id);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

-- Activer RLS sur toutes les tables
alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- ── profiles ────────────────────────────────────────────────────
-- Un utilisateur voit/modifie uniquement son propre profil
create policy "profiles: lecture propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: modification propre profil"
  on public.profiles for update
  using (auth.uid() = id);

-- Les admins voient tous les profils
create policy "profiles: admin lecture totale"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ── products ────────────────────────────────────────────────────
-- Lecture publique des produits publiés
create policy "products: lecture publique publiés"
  on public.products for select
  using (is_published = true);

-- Admin : lecture totale + écriture
create policy "products: admin lecture totale"
  on public.products for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "products: admin écriture"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ── orders ──────────────────────────────────────────────────────
-- Un utilisateur voit ses propres commandes
create policy "orders: lecture propres commandes"
  on public.orders for select
  using (
    auth.uid() = user_id
    or customer_email = (select email from public.profiles where id = auth.uid())
  );

-- Admin : lecture totale
create policy "orders: admin lecture totale"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Webhook (service role) : écriture via API route Next.js
-- (Les API routes utilisent le service role key — pas de RLS appliqué)

-- ── order_items ─────────────────────────────────────────────────
create policy "order_items: lecture via order"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
      and (
        o.user_id = auth.uid()
        or o.customer_email = (select email from public.profiles where id = auth.uid())
      )
    )
  );

create policy "order_items: admin lecture totale"
  on public.order_items for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- SUPABASE STORAGE — Bucket products-files (privé)
-- ═══════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('products-files', 'products-files', false)
on conflict (id) do nothing;

-- Seul l'admin peut uploader des fichiers produit
create policy "storage: admin upload"
  on storage.objects for insert
  with check (
    bucket_id = 'products-files'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Lecture via URL signée uniquement (générée par l'API /api/download)
-- Aucune lecture publique directe
create policy "storage: pas de lecture publique"
  on storage.objects for select
  using (
    bucket_id = 'products-files'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- DONNÉES DE TEST (seed optionnel)
-- ═══════════════════════════════════════════════════════════════

-- Produit de démonstration
insert into public.products (
  slug,
  title,
  description,
  price,
  price_original,
  category,
  image_url,
  is_published,
  sort_order
) values (
  'budget-tracker-excel-2025',
  '{"fr": "Budget Tracker Excel 2025", "en": "Excel Budget Tracker 2025", "es": "Seguimiento de Presupuesto Excel 2025"}',
  '{"fr": "Un template Excel complet pour gérer votre budget mensuel, suivre vos dépenses et atteindre vos objectifs financiers. 12 onglets mensuels, tableau de bord automatique, graphiques inclus.", "en": "A complete Excel template to manage your monthly budget, track expenses and reach your financial goals.", "es": "Una plantilla Excel completa para gestionar tu presupuesto mensual."}',
  1900,
  3400,
  'excel',
  null,
  true,
  1
),
(
  'planner-notion-productivite',
  '{"fr": "Planner Notion — Productivité 2025", "en": "Notion Planner — Productivity 2025", "es": "Planificador Notion — Productividad 2025"}',
  '{"fr": "Un système Notion complet pour organiser votre vie, vos projets et vos objectifs. Inclut un journal quotidien, un tracker d'\''habitudes et un planner hebdomadaire.", "en": "A complete Notion system to organize your life, projects and goals.", "es": "Un sistema Notion completo para organizar tu vida."}',
  2400,
  null,
  'notion',
  null,
  true,
  2
),
(
  'guide-pdf-finances-personnelles',
  '{"fr": "Guide PDF — Maîtriser ses Finances Personnelles", "en": "PDF Guide — Mastering Personal Finance", "es": "Guía PDF — Dominar las Finanzas Personales"}',
  '{"fr": "Un guide PDF de 45 pages pour comprendre et maîtriser vos finances personnelles. Méthodes éprouvées, exercices pratiques, templates inclus.", "en": "A 45-page PDF guide to understand and master your personal finances.", "es": "Una guía PDF de 45 páginas para dominar tus finanzas personales."}',
  1200,
  null,
  'pdf',
  null,
  true,
  3
)
on conflict (slug) do nothing;
