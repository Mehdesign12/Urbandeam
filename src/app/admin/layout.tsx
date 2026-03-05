import { requireAdmin } from '@/lib/admin-auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Admin — Urban Deam',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5' }}>
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
