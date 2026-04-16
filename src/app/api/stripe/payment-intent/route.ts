import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// Type d'un item de cart envoyé depuis le front
type CartItemPayload = {
  id: string
  title: string
  price: number       // centimes
  image_url?: string | null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      // Mode produit unique (Buy Now sur la fiche produit)
      productId?: string
      // Mode panier (plusieurs produits)
      cartItems?: CartItemPayload[]
      locale: string
      email: string
    }

    const { locale, email } = body
    const loc = locale ?? 'fr'

    // Log pour débogage
    console.log('[PaymentIntent] body reçu:', JSON.stringify({
      hasProductId: !!body.productId,
      cartItemsLength: body.cartItems?.length ?? 0,
      cartItemsIds: body.cartItems?.map(i => i.id),
      email: email ? email.slice(0, 5) + '***' : 'absent',
      locale: loc,
    }))

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // ── Résoudre la liste de produits ────────────────────────────────────────
    let products: Array<{
      id: string
      title: string
      price: number
      image_url: string | null
      slug: string
    }> = []

    if (body.cartItems && body.cartItems.length > 0) {
      // Mode panier : on vérifie chaque produit en base pour avoir les vraies données
      const ids = body.cartItems.map(i => i.id)
      const { data, error } = await supabase
        .from('products')
        .select('id, price, title, image_url, slug')
        .in('id', ids)
        .eq('is_published', true)

      if (error || !data || data.length === 0) {
        return NextResponse.json({ error: 'Produits introuvables' }, { status: 404 })
      }

      // Conserver l'ordre du cart
      products = ids
        .map(id => data.find(p => p.id === id))
        .filter(Boolean)
        .map(p => ({
          id: p!.id,
          title: (p!.title as Record<string, string>)?.[loc]
            || (p!.title as Record<string, string>)?.['fr']
            || (p!.title as Record<string, string>)?.['en']
            || p!.slug,
          price: p!.price,
          image_url: p!.image_url ?? null,
          slug: p!.slug,
        }))

    } else if (body.productId) {
      // Mode produit unique
      const { data: p, error } = await supabase
        .from('products')
        .select('id, price, title, image_url, slug')
        .eq('id', body.productId)
        .eq('is_published', true)
        .single()

      if (error || !p) {
        return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
      }

      products = [{
        id: p.id,
        title: (p.title as Record<string, string>)?.[loc]
          || (p.title as Record<string, string>)?.['fr']
          || (p.title as Record<string, string>)?.['en']
          || p.slug,
        price: p.price,
        image_url: p.image_url ?? null,
        slug: p.slug,
      }]

    } else {
      return NextResponse.json({ error: 'productId ou cartItems requis' }, { status: 400 })
    }

    // ── Calculer le montant total ─────────────────────────────────────────────
    const totalAmount = products.reduce((sum, p) => sum + p.price, 0)

    // ── Créer ou récupérer le customer Stripe ─────────────────────────────────
    const customers = await stripe.customers.list({ email, limit: 1 })
    let customerId: string
    if (customers.data.length > 0) {
      customerId = customers.data[0].id
    } else {
      const customer = await stripe.customers.create({ email })
      customerId = customer.id
    }

    // ── Description pour Stripe ───────────────────────────────────────────────
    const description = products.length === 1
      ? products[0].title
      : `${products.length} produits — ${products.map(p => p.title).join(', ')}`

    // ── Créer le PaymentIntent ────────────────────────────────────────────────
    // On stocke les product_ids séparés par virgule dans les métadonnées
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      customer: customerId,
      receipt_email: email,
      metadata: {
        product_ids:   products.map(p => p.id).join(','),
        product_slugs: products.map(p => p.slug).join(','),
        locale:        loc,
        customer_email: email,
        // Rétrocompat champ unique
        product_id:   products[0].id,
        product_slug: products[0].slug,
      },
      automatic_payment_methods: { enabled: true },
      description,
    })

    return NextResponse.json({
      clientSecret:    paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      // Retourner tous les produits pour l'affichage dans le modal
      products,
      // Rétrocompat : premier produit sous la clé "product"
      product: products[0],
    })

  } catch (err) {
    console.error('[PaymentIntent]', err)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}
