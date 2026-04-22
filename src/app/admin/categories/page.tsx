import { requireAdmin } from '@/lib/admin-auth'
import AdminShell from '@/components/admin/AdminShell'
import AdminCategoriesClient from './client'
import { createAdminClient } from '@/lib/supabase/server'

async function getCategories() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('position', { ascending: true })
  return data ?? []
}

export default async function AdminCategoriesPage() {
  await requireAdmin()
  const categories = await getCategories()
  return (
    <AdminShell>
      <AdminCategoriesClient initial={categories} />
    </AdminShell>
  )
}
