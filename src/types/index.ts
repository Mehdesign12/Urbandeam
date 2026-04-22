// ─────────────────────────────────────────────────────────────
// URBANDEAM — Types TypeScript (Supabase)
// ─────────────────────────────────────────────────────────────

export type ProductCategory = string
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type Locale = 'fr' | 'en' | 'es'

// ── Traductions i18n ──────────────────────────────────────────
export type I18nField = {
  [key in Locale]?: string
}

// ── Database types ────────────────────────────────────────────

export type Category = {
  id: string
  slug: string
  name: I18nField
  color: string
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  email: string
  name: string | null
  stripe_customer_id: string | null
  locale: Locale
  is_admin: boolean
  newsletter_opt_in: boolean
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  slug: string
  stripe_product_id: string | null
  stripe_price_id: string | null
  title: I18nField
  description: I18nField
  price: number           // en centimes (ex: 1900 = 19,00 €)
  price_original: number | null
  category: ProductCategory
  image_url: string | null
  gallery_urls: string[]
  file_path: string | null
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  stripe_session_id: string
  stripe_payment_intent: string | null
  customer_email: string
  customer_name: string | null
  user_id: string | null
  amount_total: number    // en centimes
  currency: string
  status: OrderStatus
  locale: Locale
  stripe_metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  price_paid: number
  download_count: number
  download_limit: number
  download_expires_at: string
  created_at: string
}

export type ProductReview = {
  id: string
  product_id: string
  author_name: string
  is_verified: boolean
  rating: number
  title: string | null
  text: string | null
  photo_url: string | null
  review_date: string      // ISO date (YYYY-MM-DD)
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Types composés (JOIN) ─────────────────────────────────────

export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    product: Pick<Product, 'id' | 'slug' | 'title' | 'image_url' | 'category'>
  })[]
}

export type ProductWithLocalizedFields = Omit<Product, 'title' | 'description'> & {
  title: string
  description: string
}

// ── Utilitaires prix ──────────────────────────────────────────

export type Currency = 'eur' | 'usd' | 'gbp'

export type PriceDisplay = {
  amount: string       // ex: "19,00"
  currency: string     // ex: "€"
  full: string         // ex: "19,00 €"
  isOnSale: boolean
  originalFull?: string
  discountPercent?: number
}

// ── Panier (state côté client) ────────────────────────────────

export type CartItem = {
  product: ProductWithLocalizedFields
  quantity: 1          // produits digitaux = toujours 1
}

export type Cart = {
  items: CartItem[]
  total: number        // en centimes
  currency: Currency
}
