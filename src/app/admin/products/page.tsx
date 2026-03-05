import { requireAdmin } from '@/lib/admin-auth'
import AdminShell from '@/components/admin/AdminShell'
import AdminProductsClient from './client'

export default async function AdminProductsPage() {
  await requireAdmin()
  return (
    <AdminShell>
      <AdminProductsClient />
    </AdminShell>
  )
}
