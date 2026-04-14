-- ═══════════════════════════════════════════════════════════════
-- TABLE : product_reviews
-- Avis clients rattachés à un produit (gérés par l'admin)
-- ═══════════════════════════════════════════════════════════════
create table if not exists public.product_reviews (
  id            uuid         primary key default uuid_generate_v4(),
  product_id    uuid         not null references public.products(id) on delete cascade,
  author_name   text         not null,
  is_verified   boolean      not null default true,
  rating        integer      not null check (rating between 1 and 5),
  title         text,
  text          text,
  photo_url     text,
  review_date   date         not null default current_date,
  is_published  boolean      not null default true,
  sort_order    integer      not null default 0,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

create index if not exists product_reviews_product_id_idx on public.product_reviews(product_id);
create index if not exists product_reviews_published_idx  on public.product_reviews(is_published) where is_published = true;

alter table public.product_reviews enable row level security;

-- Lecture publique des avis publiés
create policy "product_reviews: lecture publique publiés"
  on public.product_reviews for select
  using (is_published = true);

-- Admin : lecture totale
create policy "product_reviews: admin lecture totale"
  on public.product_reviews for select
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

-- Admin : écriture totale
create policy "product_reviews: admin écriture"
  on public.product_reviews for all
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  )
  with check (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

-- Trigger pour updated_at
create trigger product_reviews_updated_at
  before update on public.product_reviews
  for each row execute procedure public.set_updated_at();
