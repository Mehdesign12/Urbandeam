import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import ReviewForm from '@/components/admin/ReviewForm'
import { requireAdmin } from '@/lib/admin-auth'
import AdminShell from '@/components/admin/AdminShell'

type Props = { params: Promise<{ id: string }> }

export default async function EditReviewPage({ params }: Props) {
  await requireAdmin()
  const { id } = await params
  const supabase = createAdminClient()

  const { data: review, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !review) notFound()

  return (
    <AdminShell>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <Link href="/admin/reviews" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#A3A3A3', textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Avis
          </Link>
          <span style={{ color: '#E5E5E5' }}>/</span>
          <span style={{ fontSize: '14px', color: '#0A0A0A', fontWeight: 500 }}>{review.author_name}</span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '28px' }}>
          Éditer l&apos;avis
        </h1>

        <ReviewForm mode="edit" initial={review} />
      </div>
    </AdminShell>
  )
}
