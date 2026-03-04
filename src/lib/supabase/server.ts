// ─────────────────────────────────────────────────────────────
// URBANDEAM — Client Supabase côté serveur (Next.js Server Components)
// ─────────────────────────────────────────────────────────────
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl        = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client Server Component (RLS actif — contexte utilisateur)
export async function createServerComponentClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignoré dans les Server Components (lecture seule)
        }
      },
    },
  })
}

// Client Admin (service role — bypass RLS)
// ⚠️ Ne JAMAIS exposer côté navigateur
export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
