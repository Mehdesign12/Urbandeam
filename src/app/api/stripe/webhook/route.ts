import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

// Désactiver le body parser Next.js — Stripe a besoin du raw body
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET manquant')
    return NextResponse.json({ error: 'Config webhook manquante' }, { status: 500 })
  }

  let event: Stripe.Event

  // Vérification de la signature Stripe
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret)
  } catch (err) {
    console.error('[Webhook] Signature invalide:', err)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  // Traiter uniquement checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      await handleCheckoutCompleted(session)
    } catch (err) {
      console.error('[Webhook] Erreur handleCheckoutCompleted:', err)
      // On retourne 200 quand même pour éviter les retries Stripe
      return NextResponse.json({ received: true, error: 'Erreur interne' })
    }
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient()

  const productId    = session.metadata?.product_id
  const productSlug  = session.metadata?.product_slug
  const locale       = session.metadata?.locale ?? 'fr'
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? ''
  const customerName  = session.customer_details?.name ?? ''

  if (!productId) {
    console.error('[Webhook] product_id manquant dans les métadonnées')
    return
  }

  // ── 1. Vérifier idempotence (session déjà traitée ?) ──────────
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .single()

  if (existing) {
    console.log('[Webhook] Session déjà traitée:', session.id)
    return
  }

  // ── 2. Récupérer le produit ────────────────────────────────────
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, price, title')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    console.error('[Webhook] Produit introuvable:', productId)
    return
  }

  // ── 3. Créer la commande ───────────────────────────────────────
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      stripe_session_id:     session.id,
      stripe_payment_intent: session.payment_intent as string ?? null,
      customer_email:        customerEmail,
      customer_name:         customerName,
      amount_total:          session.amount_total ?? product.price,
      currency:              session.currency ?? 'eur',
      status:                'paid',
      locale,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('[Webhook] Erreur création commande:', orderError)
    return
  }

  // ── 4. Créer l'order_item ──────────────────────────────────────
  const downloadExpiresAt = new Date()
  downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 30)

  const { error: itemError } = await supabase
    .from('order_items')
    .insert({
      order_id:           order.id,
      product_id:         productId,
      price_paid:         product.price,
      download_count:     0,
      download_limit:     5,
      download_expires_at: downloadExpiresAt.toISOString(),
    })

  if (itemError) {
    console.error('[Webhook] Erreur création order_item:', itemError)
  }

  // ── 5. Email de confirmation (Phase 3b — Resend) ───────────────
  // TODO: envoyer l'email avec le lien de téléchargement signé
  // await sendConfirmationEmail({ customerEmail, customerName, order, product, locale })

  console.log(`[Webhook] ✅ Commande créée: ${order.id} pour ${customerEmail}`)
}
