// ─────────────────────────────────────────────────────────────
// URBANDEAM — Utilitaires globaux
// ─────────────────────────────────────────────────────────────
import type { Currency, I18nField, Locale, PriceDisplay } from '@/types'

// ── Formatage des prix ────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  eur: '€',
  usd: '$',
  gbp: '£',
}

/**
 * Convertit un montant en centimes en string affichable
 * Ex: formatPrice(1900, 'eur') → "19,00 €"
 */
export function formatPrice(
  amountInCents: number,
  currency: Currency = 'usd',
  locale: string = 'en-US'
): string {
  const amount = amountInCents / 100
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Génère un objet PriceDisplay complet pour l'affichage d'un produit
 */
export function getPriceDisplay(
  price: number,
  priceOriginal: number | null,
  currency: Currency = 'usd'
): PriceDisplay {
  const symbol = CURRENCY_SYMBOLS[currency]
  const amount = (price / 100).toFixed(2)
  const full = `${symbol}${amount}`
  const isOnSale = priceOriginal !== null && priceOriginal > price

  if (!isOnSale || !priceOriginal) {
    return { amount, currency: symbol, full, isOnSale: false }
  }

  const originalAmount = (priceOriginal / 100).toFixed(2)
  const discountPercent = Math.round((1 - price / priceOriginal) * 100)

  return {
    amount,
    currency: symbol,
    full,
    isOnSale: true,
    originalFull: `${symbol}${originalAmount}`,
    discountPercent,
  }
}

// ── i18n helpers ──────────────────────────────────────────────

/**
 * Récupère la valeur d'un champ i18n selon la locale
 * Fallback : fr → en → première valeur disponible
 */
export function getLocalizedField(
  field: I18nField,
  locale: Locale,
  fallback: string = ''
): string {
  return (
    field[locale] ??
    field['fr'] ??
    field['en'] ??
    Object.values(field).find(Boolean) ??
    fallback
  )
}

// ── Slugs ─────────────────────────────────────────────────────

/**
 * Convertit un titre en slug URL-safe
 * Ex: "Budget Tracker Excel 2025" → "budget-tracker-excel-2025"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ── Classes CSS conditionnelles ───────────────────────────────

/**
 * Concatène des classes CSS conditionnellement
 * Ex: cn('btn', isActive && 'active', undefined) → 'btn active'
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ── Dates ─────────────────────────────────────────────────────

/**
 * Formate une date ISO en date lisible
 * Ex: "2026-03-04T..." → "4 mars 2026"
 */
export function formatDate(
  isoDate: string,
  locale: string = 'fr-FR',
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(isoDate))
}

// ── Catégories produit ────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  excel:  'Excel',
  notion: 'Notion',
  pdf:    'PDF',
}

export const CATEGORY_COLORS: Record<string, string> = {
  excel:  'badge-excel',
  notion: 'badge-notion',
  pdf:    'badge-pdf',
}
