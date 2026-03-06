import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { sendConfirmationEmail } from '@/lib/email'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

const DOWNLOAD_LIMIT = 5
const DOWNLOAD_DAYS  = 30

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET manquant')
    return NextResponse.json({ error: 'Config webhook manquante' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret)
  } catch (err) {
    console.error('[Webhook] Signature invalide:', err)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    try { await handleCheckoutCompleted(session) }
    catch (err) { console.error('[Webhook] handleCheckoutCompleted:', err) }
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    try { await handlePaymentIntentSucceeded(pi) }
    catch (err) { console.error('[Webhook] handlePaymentIntentSucceeded:', err) }
  }

  return NextResponse.json({ received: true })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeToken() {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
}
function expiresAt() {
  const d = new Date()
  d.setDate(d.getDate() + DOWNLOAD_DAYS)
  return d.toISOString()
}
function localizedTitle(title: unknown, locale: string): string {
  const t = title as Record<string, string>
  return t?.[locale] ?? t?.['fr'] ?? ''
}

// ─── checkout.session.completed ───────────────────────────────────────────────
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient()
  const productId     = session.metadata?.product_id
  const locale        = (session.metadata?.locale ?? 'fr') as 'fr' | 'en'
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? ''
  const customerName  = session.customer_details?.name ?? ''

  if (!productId) return

  // Idempotence
  const { data: existing } = await supabase
    .from('orders').select('id').eq('stripe_session_id', session.id).single()
  if (existing) { console.log('[Webhook] Session déjà traitée:', session.id); return }

  const { data: product } = await supabase
    .from('products').select('id, price, title, image_url, slug')
    .eq('id', productId).single()
  if (!product) { console.error('[Webhook] Produit introuvable:', productId); return }

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
    .select('id').single()

  if (orderError || !order) { console.error('[Webhook] Erreur order:', orderError); return }

  const downloadToken = makeToken()
  const expAt         = expiresAt()

  await supabase.from('order_items').insert({
    order_id:            order.id,
    product_id:          productId,
    price_paid:          product.price,
    download_count:      0,
    download_limit:      DOWNLOAD_LIMIT,
    download_expires_at: expAt,
    download_token:      downloadToken,
  })

  console.log(`[Webhook] ✅ Commande (checkout) créée: ${order.id} pour ${customerEmail}`)

  // Email de confirmation
  if (customerEmail) {
    const emailResult = await sendConfirmationEmail({
      to:                customerEmail,
      customerName,
      productTitle:      localizedTitle(product.title, locale),
      productImageUrl:   product.image_url ?? null,
      amountTotal:       session.amount_total ?? product.price,
      currency:          session.currency ?? 'eur',
      downloadToken,
      downloadLimit:     DOWNLOAD_LIMIT,
      downloadExpiresAt: expAt,
      locale,
      orderId:           order.id,
    }).catch((e) => { console.error('[Webhook] Email error:', e); return { success: false } })
    console.log('[Webhook] Email result:', JSON.stringify(emailResult))
  }
}

// ─── payment_intent.succeeded ─────────────────────────────────────────────────
async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  const supabase = createAdminClient()

  // Idempotence : déjà créé par /api/stripe/confirm ?
  const { data: existing } = await supabase
    .from('orders').select('id').eq('stripe_payment_intent', pi.id).single()
  if (existing) { console.log('[Webhook PI] Déjà traité par /confirm:', pi.id); return }

  const productId     = pi.metadata?.product_id
  const locale        = (pi.metadata?.locale ?? 'fr') as 'fr' | 'en'
  const customerEmail = pi.metadata?.customer_email ?? pi.receipt_email ?? ''

  if (!productId) return

  const { data: product } = await supabase
    .from('products').select('id, price, title, image_url, slug')
    .eq('id', productId).single()
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
    .select('id').single()

  if (orderError || !order) { console.error('[Webhook PI] Erreur order:', orderError); return }

  const downloadToken = makeToken()
  const expAt         = expiresAt()

  await supabase.from('order_items').insert({
    order_id:            order.id,
    product_id:          productId,
    price_paid:          product.price,
    download_count:      0,
    download_limit:      DOWNLOAD_LIMIT,
    download_expires_at: expAt,
    download_token:      downloadToken,
  })

  console.log(`[Webhook PI] ✅ Commande (PI) créée: ${order.id} pour ${customerEmail}`)

  // Email de confirmation (fallback — normalement déjà envoyé par /confirm)
  if (customerEmail) {
    const emailResult = await sendConfirmationEmail({
      to:                customerEmail,
      productTitle:      localizedTitle(product.title, locale),
      productImageUrl:   product.image_url ?? null,
      amountTotal:       pi.amount,
      currency:          pi.currency ?? 'eur',
      downloadToken,
      downloadLimit:     DOWNLOAD_LIMIT,
      downloadExpiresAt: expAt,
      locale,
      orderId:           order.id,
    }).catch((e) => { console.error('[Webhook PI] Email error:', e); return { success: false } })
    console.log('[Webhook PI] Email result:', JSON.stringify(emailResult))
  }
}
