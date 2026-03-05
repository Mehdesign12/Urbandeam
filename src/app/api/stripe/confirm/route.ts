import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { sendConfirmationEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId } = await req.json() as { paymentIntentId: string }

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'paymentIntentId requis' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Récupérer le PaymentIntent depuis Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: 'Paiement non confirmé', status: pi.status }, { status: 402 })
    }

    const productId     = pi.metadata?.product_id
    const productSlug   = pi.metadata?.product_slug
    const locale        = (pi.metadata?.locale ?? 'fr') as 'fr' | 'en'
    const customerEmail = pi.metadata?.customer_email ?? pi.receipt_email ?? ''

    if (!productId) {
      return NextResponse.json({ error: 'Métadonnées manquantes' }, { status: 400 })
    }

    // ── Idempotence : commande déjà créée ? ──────────────────────────────────
    const { data: existing } = await supabase
      .from('orders')
      .select('id, order_items(download_token, download_limit, download_expires_at)')
      .eq('stripe_payment_intent', paymentIntentId)
      .single()

    if (existing) {
      const item  = (existing.order_items as { download_token: string; download_limit: number; download_expires_at: string }[])?.[0]
      const token = item?.download_token

      // Email déjà envoyé ? On renvoie quand même le token au front sans re-envoyer l'email
      console.log('[Confirm] Déjà traité — token renvoyé:', token?.slice(0, 8))
      return NextResponse.json({ success: true, downloadToken: token, alreadyProcessed: true })
    }

    // ── Récupérer le produit ─────────────────────────────────────────────────
    const { data: product } = await supabase
      .from('products')
      .select('id, price, title, image_url, file_path, slug')
      .eq('id', productId)
      .single()

    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    // ── Créer la commande ────────────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        stripe_session_id:     `pi_${paymentIntentId}`,
        stripe_payment_intent: paymentIntentId,
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
      console.error('[Confirm] Erreur order:', orderError)
      return NextResponse.json({ error: 'Erreur création commande' }, { status: 500 })
    }

    // ── Créer l'order_item avec download_token ───────────────────────────────
    const downloadToken     = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
    const downloadExpiresAt = new Date()
    downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 30)
    const DOWNLOAD_LIMIT = 5

    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id:            order.id,
        product_id:          productId,
        price_paid:          product.price,
        download_count:      0,
        download_limit:      DOWNLOAD_LIMIT,
        download_expires_at: downloadExpiresAt.toISOString(),
        download_token:      downloadToken,
      })

    if (itemError) {
      console.error('[Confirm] Erreur order_item:', itemError)
    }

    console.log(`[Confirm] ✅ Commande créée: ${order.id} — token: ${downloadToken.slice(0, 8)}…`)

    // ── Titre localisé ───────────────────────────────────────────────────────
    const productTitle =
      (product.title as Record<string, string>)?.[locale] ??
      (product.title as Record<string, string>)?.['fr'] ??
      (product.slug as string)

    // ── Envoyer l'email de confirmation (non-bloquant) ───────────────────────
    if (customerEmail) {
      sendConfirmationEmail({
        to:                customerEmail,
        productTitle,
        productImageUrl:   product.image_url ?? null,
        amountTotal:       pi.amount,
        currency:          pi.currency ?? 'eur',
        downloadToken,
        downloadLimit:     DOWNLOAD_LIMIT,
        downloadExpiresAt: downloadExpiresAt.toISOString(),
        locale,
        orderId:           order.id,
      }).catch((err) => console.error('[Confirm] Email error:', err))
    }

    return NextResponse.json({
      success: true,
      downloadToken,
      orderId:      order.id,
      productSlug,
      locale,
    })
  } catch (err) {
    console.error('[Confirm]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
