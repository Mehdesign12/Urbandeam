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

  // ─── Traiter les événements ──────────────────────────────────────────────

  // Checkout Session (ancien flux ou fallback)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    try {
      await handleCheckoutCompleted(session)
    } catch (err) {
      console.error('[Webhook] Erreur handleCheckoutCompleted:', err)
    }
  }

  // PaymentIntent (nouveau flux inline — Modal)
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    try {
      await handlePaymentIntentSucceeded(pi)
    } catch (err) {
      console.error('[Webhook] Erreur handlePaymentIntentSucceeded:', err)
    }
  }

  // Retourner 200 dans tous les cas pour éviter les retries Stripe
  return NextResponse.json({ received: true })
}

// ─── checkout.session.completed (ancien flux) ────────────────────────────────
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient()

  const productId    = session.metadata?.product_id
  const locale       = session.metadata?.locale ?? 'fr'
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? ''
  const customerName  = session.customer_details?.name ?? ''

  if (!productId) {
    console.error('[Webhook] product_id manquant dans les métadonnées')
    return
  }

  // Idempotence
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .single()

  if (existing) {
    console.log('[Webhook] Session déjà traitée:', session.id)
    return
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, price, title')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    console.error('[Webhook] Produit introuvable:', productId)
    return
  }

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

  const downloadExpiresAt = new Date()
  downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 30)

  const downloadToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')

  const { error: itemError } = await supabase
    .from('order_items')
    .insert({
      order_id:            order.id,
      product_id:          productId,
      price_paid:          product.price,
      download_count:      0,
      download_limit:      5,
      download_expires_at: downloadExpiresAt.toISOString(),
      download_token:      downloadToken,
    })

  if (itemError) {
    console.error('[Webhook] Erreur création order_item:', itemError)
  }

  console.log(`[Webhook] ✅ Commande (checkout) créée: ${order.id} pour ${customerEmail}`)
}

// ─── payment_intent.succeeded (nouveau flux Modal) ───────────────────────────
async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  const supabase = createAdminClient()

  // Vérifier idempotence — l'ordre a peut-être déjà été créé par /api/stripe/confirm
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent', pi.id)
    .single()

  if (existing) {
    console.log('[Webhook PI] Déjà traité par /confirm:', pi.id)
    return
  }

  const productId    = pi.metadata?.product_id
  const locale       = pi.metadata?.locale ?? 'fr'
  const customerEmail = pi.metadata?.customer_email ?? pi.receipt_email ?? ''

  if (!productId) {
    // PaymentIntent sans metadata produit (externe) — ignorer
    return
  }

  const { data: product } = await supabase
    .from('products')
    .select('id, price, title')
    .eq('id', productId)
    .single()

  if (!product) return

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      stripe_session_id:     `pi_${pi.id}`,
      stripe_payment_intent: pi.id,
      customer_email:        customerEmail,
      customer_name:         '',
      amount_total:          pi.amount,
      currency:              pi.currency ?? 'eur',
      status:                'paid',
      locale,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('[Webhook PI] Erreur order:', orderError)
    return
  }

  const downloadExpiresAt = new Date()
  downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 30)
  const downloadToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')

  await supabase.from('order_items').insert({
    order_id:            order.id,
    product_id:          productId,
    price_paid:          product.price,
    download_count:      0,
    download_limit:      5,
    download_expires_at: downloadExpiresAt.toISOString(),
    download_token:      downloadToken,
  })

  console.log(`[Webhook PI] ✅ Commande (PI) créée: ${order.id} pour ${customerEmail}`)
}
