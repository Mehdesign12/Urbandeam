import { requireAdmin } from '@/lib/admin-auth'
import AdminShell from '@/components/admin/AdminShell'
import AdminReviewsClient from './client'

export default async function AdminReviewsPage() {
  await requireAdmin()
  return (
    <AdminShell>
      <AdminReviewsClient />
    </AdminShell>
  )
}
