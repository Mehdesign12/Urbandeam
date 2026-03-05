import AdminSidebar from './AdminSidebar'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5' }}>
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
