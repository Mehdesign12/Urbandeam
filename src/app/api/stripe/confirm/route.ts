import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { sendOrderConfirmationEmail } from '@/lib/email'

export const runtime = 'nodejs'

const DOWNLOAD_LIMIT = 5
const DOWNLOAD_DAYS  = 30

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId } = await req.json() as { paymentIntentId: string }

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'paymentIntentId requis' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // ── Récupérer le PaymentIntent depuis Stripe ──────────────────────────────
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: 'Paiement non confirmé', status: pi.status }, { status: 402 })
    }

    const locale        = (pi.metadata?.locale ?? 'fr') as 'fr' | 'en'
    const customerEmail = pi.metadata?.customer_email ?? pi.receipt_email ?? ''

    // ── LOG CRITIQUE — voir ce que Stripe a réellement stocké ────────────────
    console.log('[Confirm] metadata Stripe:', JSON.stringify(pi.metadata))
    console.log('[Confirm] amount:', pi.amount, '| currency:', pi.currency)

    // ── Idempotence : commande déjà créée ? ───────────────────────────────────
    const { data: existing } = await supabase
      .from('orders')
      .select('id, order_items(download_token, download_limit, download_expires_at, product_id)')
      .eq('stripe_payment_intent', paymentIntentId)
      .single()

    if (existing) {
      const items = existing.order_items as Array<{
        download_token: string
        download_limit: number
        download_expires_at: string
        product_id: string
      }>
      const downloadTokens = items.map(i => ({
        productId: i.product_id,
        token:     i.download_token,
      }))
      console.log('[Confirm] Idempotence — commande existante, tokens:', downloadTokens.length)
      return NextResponse.json({
        success:          true,
        downloadToken:    items[0]?.download_token,
        downloadTokens,
        alreadyProcessed: true,
      })
    }

    // ── Résoudre les product_ids depuis les métadonnées ───────────────────────
    // product_ids = "id1,id2,..." (multi) ou product_id = "id1" (mono)
    const productIdsRaw = pi.metadata?.product_ids ?? pi.metadata?.product_id ?? ''
    const productIds    = productIdsRaw.split(',').map((s: string) => s.trim()).filter(Boolean)

    console.log('[Confirm] productIdsRaw:', productIdsRaw)
    console.log('[Confirm] productIds parsés:', productIds)

    if (productIds.length === 0) {
      return NextResponse.json({ error: 'Métadonnées produit manquantes' }, { status: 400 })
    }

    // ── Récupérer tous les produits ───────────────────────────────────────────
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, price, title, image_url, file_path, slug')
      .in('id', productIds)

    console.log('[Confirm] productsError:', productsError)
    console.log('[Confirm] produits trouvés:', productsData?.map(p => ({ id: p.id, slug: p.slug })))

    if (!productsData || productsData.length === 0) {
      return NextResponse.json({ error: 'Produits introuvables' }, { status: 404 })
    }

    // ── Créer la commande principale ──────────────────────────────────────────
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

    // ── Créer un order_item + download_token par produit ─────────────────────
    const downloadTokens: Array<{ productId: string; token: string }> = []
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + DOWNLOAD_DAYS)
    const expiresAtISO = expiresAt.toISOString()

    for (const productId of productIds) {
      const product = productsData.find(p => p.id === productId)
      console.log(`[Confirm] Traitement ${productId} — trouvé: ${!!product}`)
      if (!product) continue

      const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')

      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id:            order.id,
          product_id:          productId,
          price_paid:          product.price,
          download_count:      0,
          download_limit:      DOWNLOAD_LIMIT,
          download_expires_at: expiresAtISO,
          download_token:      token,
        })

      if (itemError) {
        console.error(`[Confirm] Erreur order_item pour ${productId}:`, itemError)
      } else {
        downloadTokens.push({ productId, token })
      }
    }

    if (downloadTokens.length === 0) {
      return NextResponse.json({ error: 'Erreur création liens de téléchargement' }, { status: 500 })
    }

    console.log(`[Confirm] Commande ${order.id} — ${downloadTokens.length} produit(s) sur ${productIds.length} attendus`)

    // ── Un seul email récapitulatif avec TOUS les produits ────────────────────
    if (customerEmail && downloadTokens.length > 0) {
      const emailItems = downloadTokens.map(({ productId, token }) => {
        const product = productsData.find(p => p.id === productId)
        const productTitle =
          (product?.title as Record<string, string>)?.[locale] ??
          (product?.title as Record<string, string>)?.['fr'] ??
          product?.slug ?? ''
        return {
          productTitle,
          productImageUrl:   product?.image_url ?? null,
          price:             product?.price ?? 0,
          downloadToken:     token,
          downloadLimit:     DOWNLOAD_LIMIT,
          downloadExpiresAt: expiresAtISO,
        }
      })

      sendOrderConfirmationEmail({
        to:          customerEmail,
        items:       emailItems,
        amountTotal: pi.amount,
        currency:    pi.currency ?? 'eur',
        locale,
        orderId:     order.id,
      }).catch(err => console.error('[Confirm] Email error:', err))
    }

    // ── Réponse : tous les tokens ─────────────────────────────────────────────
    return NextResponse.json({
      success:       true,
      downloadToken: downloadTokens[0].token,   // rétrocompat Buy Now
      downloadTokens,                           // multi-produits
      orderId:       order.id,
      locale,
    })

  } catch (err) {
    console.error('[Confirm]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
