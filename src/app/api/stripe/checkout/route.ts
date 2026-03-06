import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, locale } = body as { productId: string; locale: string }

    if (!productId) {
      return NextResponse.json({ error: '[checkout] productId requis — utilisez /api/stripe/payment-intent' }, { status: 400 })
    }

    // Récupérer le produit depuis Supabase
    const supabase = createAdminClient()
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_published', true)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.urbandeam.com'
    const loc = locale ?? 'fr'

    // Titre localisé
    const title =
      (product.title as Record<string, string>)?.[loc] ??
      (product.title as Record<string, string>)?.['fr'] ??
      product.slug

    // Créer la Checkout Session Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: product.price, // déjà en centimes
            product_data: {
              name: title,
              description: ((product.description as Record<string, string>)?.[loc] ?? '').slice(0, 500),
              images: product.image_url ? [product.image_url] : [],
              metadata: {
                product_id: product.id,
                product_slug: product.slug,
              },
            },
          },
          quantity: 1,
        },
      ],
      // Infos client récupérées automatiquement
      customer_creation: 'always',
      // URLs de retour
      success_url: `${appUrl}/${loc}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/${loc}/products/${product.slug}`,
      // Métadonnées pour le webhook
      metadata: {
        product_id: product.id,
        product_slug: product.slug,
        locale: loc,
      },
      // Permettre codes promo Stripe plus tard
      allow_promotion_codes: true,
      // Collecte l'adresse email
      billing_address_collection: 'auto',
      // Localisation de la page Stripe
      locale: loc === 'fr' ? 'fr' : 'en',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Stripe Checkout]', err)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    )
  }
}
