import { requireAdmin } from '@/lib/admin-auth'
import AdminShell from '@/components/admin/AdminShell'
import AdminOrdersClient from './client'

export default async function AdminOrdersPage() {
  await requireAdmin()
  return (
    <AdminShell>
      <AdminOrdersClient />
    </AdminShell>
  )
}
