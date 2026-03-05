import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Récupérer l'order_item + produit associé
  const { data: item, error } = await supabase
    .from('order_items')
    .select(`
      id,
      download_count,
      download_limit,
      download_expires_at,
      product_id,
      products (
        title,
        file_path,
        slug
      )
    `)
    .eq('download_token', token)
    .single()

  if (error || !item) {
    return NextResponse.json({ error: 'Lien de téléchargement invalide' }, { status: 404 })
  }

  // Vérifier l'expiration
  if (item.download_expires_at && new Date(item.download_expires_at) < new Date()) {
    return NextResponse.json({ error: 'Lien expiré' }, { status: 410 })
  }

  // Vérifier la limite de téléchargements
  if (item.download_count >= item.download_limit) {
    return NextResponse.json(
      { error: `Limite de ${item.download_limit} téléchargements atteinte` },
      { status: 429 }
    )
  }

  const product = (item.products as unknown) as { title: Record<string, string>; file_path: string; slug: string } | null

  if (!product?.file_path) {
    return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
  }

  // Incrémenter le compteur de téléchargements
  await supabase
    .from('order_items')
    .update({ download_count: item.download_count + 1 })
    .eq('id', item.id)

  // Générer un URL signé (1 heure) depuis Supabase Storage (bucket privé)
  const { data: signedData, error: signError } = await supabase
    .storage
    .from('product-files')
    .createSignedUrl(product.file_path, 3600) // 1h

  if (signError || !signedData?.signedUrl) {
    console.error('[Download] Erreur URL signé:', signError)
    return NextResponse.json({ error: 'Impossible de générer le lien de téléchargement' }, { status: 500 })
  }

  // Rediriger vers l'URL signé Supabase
  return NextResponse.redirect(signedData.signedUrl, { status: 302 })
}
