import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = createAdminClient()

  const fallbackCount = { count: 0, data: null, error: null }
  const fallbackData  = { data: [], error: null }

  // Requêtes protégées — les tables peuvent ne pas encore exister
  const [r1, r2, r3, r4] = await Promise.all([
    Promise.resolve(supabase.from('products').select('*', { count: 'exact', head: true })).catch(() => fallbackCount),
    Promise.resolve(supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_published', true)).catch(() => fallbackCount),
    Promise.resolve(supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'paid')).catch(() => fallbackCount),
    Promise.resolve(supabase.from('orders').select('id, customer_email, amount_total, currency, status, created_at').eq('status', 'paid').order('created_at', { ascending: false }).limit(5)).catch(() => fallbackData),
  ])

  const totalProducts    = r1.count ?? 0
  const publishedProducts = r2.count ?? 0
  const totalOrders      = r3.count ?? 0
  const recentOrders     = (r4.data ?? []) as { id: string; customer_email: string; amount_total: number; currency: string; status: string; created_at: string }[]

  // Calcul du CA total
  const revenueResult = await Promise.resolve(
    supabase.from('orders').select('amount_total').eq('status', 'paid')
  ).catch(() => fallbackData)

  const totalRevenue = ((revenueResult.data ?? []) as { amount_total: number }[])
    .reduce((s, o) => s + (o.amount_total ?? 0), 0)

  const fmt = (cents: number) => `€${(cents / 100).toFixed(2)}`
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

  const stats = [
    {
      label: 'Produits publiés',
      value: `${publishedProducts ?? 0} / ${totalProducts ?? 0}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      ),
      href: '/admin/products',
      color: '#F2F2F2',
    },
    {
      label: 'Commandes payées',
      value: String(totalOrders ?? 0),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        </svg>
      ),
      href: '/admin/orders',
      color: '#F2F2F2',
    },
    {
      label: 'Chiffre d\'affaires',
      value: fmt(totalRevenue),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      href: '/admin/orders',
      color: '#DCFCE7',
    },
  ]

  return (
    <AdminShell>
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: '#A3A3A3' }}>
          Bienvenue dans votre espace d&apos;administration
        </p>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {stats.map(({ label, value, icon, href, color }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white', borderRadius: '12px',
              border: '1px solid #E5E5E5', padding: '24px',
              transition: 'box-shadow 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '16px',
              }}>
                {icon}
              </div>
              <p style={{ fontSize: '13px', color: '#A3A3A3', marginBottom: '4px' }}>{label}</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A' }}>{value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
        <Link href="/admin/products/new" className="btn-primary" style={{ fontSize: '14px', padding: '10px 20px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nouveau produit
        </Link>
        <Link href="/admin/orders" className="btn-secondary" style={{ fontSize: '14px', padding: '10px 20px' }}>
          Voir les commandes
        </Link>
      </div>

      {/* Recent orders */}
      <div style={{
        background: 'white', borderRadius: '12px',
        border: '1px solid #E5E5E5', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E5E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0A0A0A' }}>Dernières commandes</h2>
          <Link href="/admin/orders" style={{ fontSize: '13px', color: '#A3A3A3', textDecoration: 'none' }}>
            Voir tout →
          </Link>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A3A3A3', fontSize: '14px' }}>
            Aucune commande pour l&apos;instant
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA' }}>
                {['Email', 'Montant', 'Statut', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => (
                <tr key={order.id} style={{ borderTop: i > 0 ? '1px solid #F5F5F5' : 'none' }}>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#0A0A0A' }}>{order.customer_email}</td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: 600, color: '#0A0A0A' }}>{fmt(order.amount_total)}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                      background: order.status === 'paid' ? '#DCFCE7' : '#F3F4F6',
                      color: order.status === 'paid' ? '#166534' : '#374151',
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: order.status === 'paid' ? '#22C55E' : '#9CA3AF' }} />
                      {order.status === 'paid' ? 'Payée' : order.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#A3A3A3' }}>{fmtDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </AdminShell>
  )
}
