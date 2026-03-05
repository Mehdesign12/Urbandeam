import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { productId, locale, email } = await req.json() as {
      productId: string
      locale: string
      email: string
    }

    if (!productId) {
      return NextResponse.json({ error: 'productId requis' }, { status: 400 })
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: product, error } = await supabase
      .from('products')
      .select('id, price, title, description, image_url, slug')
      .eq('id', productId)
      .eq('is_published', true)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    const loc = locale ?? 'fr'
    const title =
      (product.title as Record<string, string>)?.[loc] ??
      (product.title as Record<string, string>)?.['fr'] ??
      product.slug

    // Créer ou récupérer le customer Stripe
    const customers = await stripe.customers.list({ email, limit: 1 })
    let customerId: string
    if (customers.data.length > 0) {
      customerId = customers.data[0].id
    } else {
      const customer = await stripe.customers.create({ email })
      customerId = customer.id
    }

    // Créer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.price,
      currency: 'eur',
      customer: customerId,
      receipt_email: email,
      metadata: {
        product_id: product.id,
        product_slug: product.slug,
        locale: loc,
        customer_email: email,
      },
      automatic_payment_methods: { enabled: true },
      description: title,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      product: {
        id: product.id,
        title,
        price: product.price,
        image_url: product.image_url,
        slug: product.slug,
      },
    })
  } catch (err) {
    console.error('[PaymentIntent]', err)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}
