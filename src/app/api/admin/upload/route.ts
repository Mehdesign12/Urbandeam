import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get('ud_admin_session')
  return session?.value === 'authenticated'
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = formData.get('type') as string | null // 'image' | 'product'

  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

  const supabase = createAdminClient()

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase()
  const fileName = `${timestamp}_${safeName}`

  const bucket = type === 'image' ? 'product-images' : 'product-files'
  const folder = type === 'image' ? 'products' : 'downloads'
  const filePath = `${folder}/${fileName}`

  // Vérifications de type MIME
  const allowedImages = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  const allowedFiles  = ['pdf', 'zip', 'xlsx', 'xls', 'docx', 'doc', 'pptx', 'notion']

  if (type === 'image' && !allowedImages.includes(ext)) {
    return NextResponse.json({ error: 'Format image non supporté (jpg, png, webp, gif)' }, { status: 400 })
  }
  if (type === 'product' && !allowedFiles.includes(ext)) {
    return NextResponse.json({ error: 'Format fichier non supporté (pdf, zip, xlsx, docx, pptx)' }, { status: 400 })
  }

  // Taille max : 50 MB pour images, 500 MB pour fichiers
  const maxSize = type === 'image' ? 50 * 1024 * 1024 : 500 * 1024 * 1024
  if (file.size > maxSize) {
    return NextResponse.json({ error: `Fichier trop volumineux (max ${type === 'image' ? '50MB' : '500MB'})` }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: type === 'image' ? '3600' : '0',
      upsert: false,
    })

  if (uploadError) {
    // Si le bucket n'existe pas, essayer de le créer
    if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
      return NextResponse.json({
        error: `Bucket "${bucket}" introuvable. Crée-le dans Supabase Storage.`
      }, { status: 500 })
    }
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Récupérer l'URL publique pour les images
  let publicUrl: string | null = null
  if (type === 'image') {
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
    publicUrl = urlData.publicUrl
  }

  return NextResponse.json({
    success: true,
    path: filePath,
    url: publicUrl,
    bucket,
  })
}
