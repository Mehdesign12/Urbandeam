import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// Extensions → MIME types
const MIME: Record<string, string> = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls:  'application/vnd.ms-excel',
  pdf:  'application/pdf',
  zip:  'application/zip',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc:  'application/msword',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  png:  'image/png',
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
}

function getMime(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  return MIME[ext] ?? 'application/octet-stream'
}

// Nettoie le nom du fichier : supprime le préfixe timestamp et les underscores
function cleanFileName(filePath: string, slug: string): string {
  const raw = filePath.split('/').pop() ?? `${slug}.xlsx`
  // Supprimer les préfixes timestamp type "1772713468603_copie_de_"
  const cleaned = raw.replace(/^\d+_(?:copie_de_)?/i, '')
  // Remplacer les underscores restants par des tirets, sauf l'extension
  const parts = cleaned.split('.')
  const ext = parts.pop() ?? 'xlsx'
  const name = parts.join('.').replace(/_/g, '-')
  return `${name}.${ext}`
}

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

  const product = (item.products as unknown) as {
    title: Record<string, string>
    file_path: string
    slug: string
  } | null

  if (!product?.file_path) {
    return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
  }

  // Incrémenter le compteur de téléchargements
  await supabase
    .from('order_items')
    .update({ download_count: item.download_count + 1 })
    .eq('id', item.id)

  // Générer un URL signé court (5 min) depuis Supabase Storage
  const { data: signedData, error: signError } = await supabase
    .storage
    .from('product-files')
    .createSignedUrl(product.file_path, 300) // 5 min

  if (signError || !signedData?.signedUrl) {
    console.error('[Download] Erreur URL signé:', signError)
    return NextResponse.json({ error: 'Impossible de générer le lien de téléchargement' }, { status: 500 })
  }

  // ── Proxy : on stream le fichier directement depuis notre domaine ─────────
  // L'utilisateur voit l'URL urbandeam.com/api/download?token=... et jamais Supabase
  try {
    const fileRes = await fetch(signedData.signedUrl)
    if (!fileRes.ok) {
      console.error('[Download] Fetch Supabase échoué:', fileRes.status)
      return NextResponse.json({ error: 'Erreur récupération fichier' }, { status: 502 })
    }

    const fileName  = cleanFileName(product.file_path, product.slug)
    const mimeType  = getMime(product.file_path)

    return new NextResponse(fileRes.body, {
      status: 200,
      headers: {
        'Content-Type':        mimeType,
        // attachment → force le téléchargement avec le bon nom de fichier
        'Content-Disposition': `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Cache-Control':       'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err) {
    console.error('[Download] Proxy error:', err)
    return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
  }
}
