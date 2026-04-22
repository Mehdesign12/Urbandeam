# Urbandeam

> Boutique de produits digitaux pour le développement personnel  
> Templates Excel · PDF · Notion

## Stack technique

| Technologie | Rôle |
|---|---|
| **Next.js 16** (App Router) | Frontend + SSR + API routes |
| **Supabase** | PostgreSQL + Auth + Storage |
| **Stripe** | Paiements + Webhooks + Tax |
| **Resend** | Emails transactionnels |
| **Vercel** | Déploiement + CDN |
| **Tailwind CSS v4** | Styling (tokens design system) |
| **next-intl** | i18n FR / EN |

## Design System

- **Palette** : Monochromatique noir/blanc + accent amber `#F59E0B`
- **Typographie** : `Syne 800` (titres) · `DM Sans 400/500` (corps)
- **Espacement** : Base 4px (xs→6xl)
- **Tokens CSS** : définis dans `src/app/globals.css` via `@theme inline`

## Structure du projet

```
src/
├── app/
│   ├── [locale]/          # App Router i18n (fr, en)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── globals.css        # Design system tokens
│   └── layout.tsx         # Root layout (fonts Syne + DM Sans)
├── i18n/
│   ├── routing.ts         # Config locales
│   └── request.ts         # Config next-intl
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Client browser (RLS)
│   │   └── server.ts      # Client server + admin
│   └── utils.ts           # formatPrice, getLocalizedField, cn...
├── messages/
│   ├── fr.json            # Traductions français
│   └── en.json            # Traductions anglais
├── types/
│   └── index.ts           # TypeScript types (Product, Order, etc.)
└── proxy.ts               # Middleware i18n routing
supabase/
└── migrations/
    └── 0001_initial_schema.sql  # Tables + RLS + Storage
```

## Base de données (Supabase)

### Tables
| Table | Description |
|---|---|
| `profiles` | Extension auth.users (stripe_customer_id, is_admin) |
| `products` | Produits avec titres/descriptions i18n (jsonb) |
| `orders` | Commandes Stripe |
| `order_items` | Lignes de commande + download_count/limit |

### Storage
- Bucket **`products-files`** (privé) — accès via URL signées uniquement

## Setup local

```bash
# 1. Cloner et installer
git clone https://github.com/Mehdesign12/Urbandeam.git
cd Urbandeam
npm install

# 2. Variables d'environnement
cp .env.example .env.local
# Remplir .env.local avec vos clés Supabase, Stripe, Resend

# 3. Migrations Supabase
# Exécuter supabase/migrations/0001_initial_schema.sql dans le SQL Editor Supabase

# 4. Lancer le dev
npm run dev
```

## Architecture — Décisions techniques

### Système de catégories (implémenté : Option A)

**Option A — Catégories dynamiques simples** ✅ *Implémenté*
- Table `categories` (slug, name i18n, color, position, is_active)
- 1 catégorie par produit (champ `category text` dans `products`)
- CRUD admin complet avec réordonnancement
- Idéal pour un catalogue < 100 produits

**Option B — Catégories multi-select** *(à implémenter si besoin)*
- Table `categories` + table de jonction `product_categories`
- Un produit peut appartenir à plusieurs catégories
- Nécessite : migration `products.category` → suppression du champ, création de `product_categories(product_id, category_id)`, mise à jour des filtres et requêtes

**Option C — Catégories + sous-catégories** *(à implémenter si besoin)*
- Hiérarchie à deux niveaux via `categories.parent_id uuid references categories(id)`
- Filtres à deux niveaux sur le front (catégorie parente → sous-catégorie)
- Recommandé si le catalogue dépasse 50 produits avec chevauchements thématiques

---

## Roadmap

- [x] **Phase 1** — Setup (Next.js 16, Tailwind v4, Supabase, next-intl)
- [ ] **Phase 2** — Frontend boutique (Navbar, ProductCard, Homepage, Catalogue)
- [ ] **Phase 3** — Paiement & livraison (Stripe, Webhook, Download)
- [ ] **Phase 4** — Admin, SEO & Lancement
- [ ] **Phase 5** — Croissance & Multi-pays

## Déploiement

- **Platform** : Vercel
- **Status** : 🚧 En développement (Phase 2)
- **Marché** : FR (principal) · EN
- **Date** : Mars 2026
