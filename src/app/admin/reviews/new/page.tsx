import Link from 'next/link'
import ReviewForm from '@/components/admin/ReviewForm'
import { requireAdmin } from '@/lib/admin-auth'
import AdminShell from '@/components/admin/AdminShell'

export default async function NewReviewPage() {
  await requireAdmin()

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
          <span style={{ fontSize: '14px', color: '#0A0A0A', fontWeight: 500 }}>Nouvel avis</span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '28px' }}>
          Créer un avis
        </h1>

        <ReviewForm mode="create" />
      </div>
    </AdminShell>
  )
}
