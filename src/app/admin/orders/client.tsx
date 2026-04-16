'use client'

import { useState, useEffect, useCallback } from 'react'

type OrderItem = {
  id: string
  price_paid: number
  download_count: number
  download_limit: number
  product_id: string
}

type Order = {
  id: string
  customer_email: string
  customer_name: string
  amount_total: number
  currency: string
  status: string
  locale: string
  created_at: string
  stripe_session_id: string
  order_items: OrderItem[]
}

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  paid:     { label: 'Payée',    bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  pending:  { label: 'En attente', bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  refunded: { label: 'Remboursée', bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' },
  failed:   { label: 'Échouée',  bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444' },
}

export default function AdminOrdersClient() {
  const [orders, setOrders]     = useState<Order[]>([])
  const [loading, setLoading]   = useState(true)
  const [search,  setSearch]    = useState('')
  const [filter,  setFilter]    = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/orders')
    const data = await res.json()
    setOrders(data.orders ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const fmt     = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const filtered = orders.filter(o => {
    const matchSearch = o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.stripe_session_id?.includes(search)
    const matchFilter = filter === 'all' || o.status === filter
    return matchSearch && matchFilter
  })

  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.amount_total, 0)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '2px' }}>Commandes</h1>
          <p style={{ fontSize: '13px', color: '#A3A3A3' }}>
            {orders.length} commande{orders.length > 1 ? 's' : ''} · CA total : <strong style={{ color: '#0A0A0A' }}>{fmt(totalRevenue)}</strong>
          </p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '360px' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A3A3A3' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input className="input" style={{ paddingLeft: '34px' }} placeholder="Rechercher email, nom…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {['all', 'paid', 'pending', 'refunded'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
              background: filter === f ? '#0A0A0A' : 'white',
              color: filter === f ? 'white' : '#525252',
              border: `1px solid ${filter === f ? '#0A0A0A' : '#E5E5E5'}`,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
            }}
          >
            {f === 'all' ? 'Toutes' : STATUS_LABELS[f]?.label ?? f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E5E5', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#A3A3A3' }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#A3A3A3', fontSize: '14px' }}>
            Aucune commande {filter !== 'all' ? `avec le statut "${STATUS_LABELS[filter]?.label}"` : ''}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E5E5' }}>
                {['', 'Client', 'Montant', 'Articles', 'Statut', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const s = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending
                const isOpen = expanded === order.id
                return (
                  <>
                    <tr key={order.id} style={{ borderTop: i > 0 ? '1px solid #F5F5F5' : 'none', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : order.id)}>
                      <td style={{ padding: '14px 20px', width: '40px' }}>
                        <svg style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', color: '#A3A3A3' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '2px' }}>{order.customer_email}</p>
                        <p style={{ fontSize: '12px', color: '#A3A3A3' }}>{order.customer_name || '—'}</p>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '15px', fontWeight: 700, color: '#0A0A0A' }}>{fmt(order.amount_total)}</td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: '#525252' }}>{order.order_items?.length ?? 0} article{(order.order_items?.length ?? 0) > 1 ? 's' : ''}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, background: s.bg, color: s.color }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot }} />
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '12px', color: '#A3A3A3' }}>{fmtDate(order.created_at)}</td>
                    </tr>

                    {/* Ligne expandée */}
                    {isOpen && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={6} style={{ padding: '0 20px 16px 20px', background: '#FAFAFA' }}>
                          <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #F0F0F0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                              <div>
                                <p style={{ fontSize: '11px', fontWeight: 600, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Session Stripe</p>
                                <p style={{ fontSize: '12px', color: '#0A0A0A', fontFamily: 'monospace', wordBreak: 'break-all' }}>{order.stripe_session_id}</p>
                              </div>
                              <div>
                                <p style={{ fontSize: '11px', fontWeight: 600, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Langue</p>
                                <p style={{ fontSize: '13px', color: '#0A0A0A' }}>{order.locale?.toUpperCase()}</p>
                              </div>
                              <div>
                                <p style={{ fontSize: '11px', fontWeight: 600, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Devise</p>
                                <p style={{ fontSize: '13px', color: '#0A0A0A' }}>{order.currency?.toUpperCase()}</p>
                              </div>
                            </div>

                            {order.order_items?.length > 0 && (
                              <div>
                                <p style={{ fontSize: '11px', fontWeight: 600, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Articles</p>
                                {order.order_items.map(item => (
                                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#F9FAFB', borderRadius: '6px', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '13px', color: '#525252', fontFamily: 'monospace' }}>{item.product_id}</span>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                      <span style={{ fontSize: '13px', color: '#A3A3A3' }}>
                                        Téléchargements : {item.download_count}/{item.download_limit}
                                      </span>
                                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#0A0A0A' }}>{fmt(item.price_paid)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
