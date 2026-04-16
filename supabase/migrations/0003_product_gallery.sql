-- ═══════════════════════════════════════════════════════════════
-- Add gallery_urls to products
-- Liste d'images supplémentaires affichées dans la galerie de la fiche produit.
-- L'image principale reste image_url (utilisée pour les cartes, l'OG, etc).
-- ═══════════════════════════════════════════════════════════════
alter table public.products
  add column if not exists gallery_urls text[] not null default '{}';
