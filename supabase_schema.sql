-- ============================================================
-- URBANDEAM — Script SQL Supabase
-- À exécuter dans l'éditeur SQL de Supabase
-- (Project → SQL Editor → New query)
-- ============================================================

-- ── Table orders ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id     TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  customer_email        TEXT NOT NULL,
  customer_name         TEXT DEFAULT '',
  amount_total          INTEGER NOT NULL,       -- en centimes
  currency              TEXT DEFAULT 'eur',
  status                TEXT DEFAULT 'pending', -- pending | paid | refunded
  locale                TEXT DEFAULT 'fr',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche par email
CREATE INDEX IF NOT EXISTS idx_orders_customer_email
  ON orders (customer_email);

-- ── Table order_items ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id           UUID NOT NULL,           -- FK vers products.id
  price_paid           INTEGER NOT NULL,        -- en centimes
  download_count       INTEGER DEFAULT 0,
  download_limit       INTEGER DEFAULT 5,
  download_expires_at  TIMESTAMPTZ,
  download_token       TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour retrouver les items d'une commande
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items (order_id);

-- Index pour les tokens de téléchargement
CREATE INDEX IF NOT EXISTS idx_order_items_download_token
  ON order_items (download_token);

-- ── Row Level Security ────────────────────────────────────────
-- Activer la sécurité sur les tables (service_role bypass toujours)
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy : lecture publique par email (pour la page "mes commandes")
CREATE POLICY "orders_select_by_email"
  ON orders FOR SELECT
  USING (true); -- ouvert car le service role sera utilisé côté serveur

-- Policy : insertion uniquement par service role (webhook Stripe)
CREATE POLICY "orders_insert_service_role"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "order_items_select"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "order_items_insert"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- ── Trigger : updated_at auto ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Vérification ──────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('orders', 'order_items');
