import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_COOKIE = 'ud_admin_session'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'urbandeam-admin-2024'

export async function requireAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_COOKIE)
  if (session?.value !== 'authenticated') {
    redirect('/admin/login')
  }
}

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE
