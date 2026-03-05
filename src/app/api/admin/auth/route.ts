import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(ADMIN_COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete(ADMIN_COOKIE_NAME)
  return res
}
