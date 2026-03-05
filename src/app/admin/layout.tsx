import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Admin — Urban Deam',
  robots: { index: false, follow: false },
}

async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get('ud_admin_session')?.value === 'authenticated'
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
