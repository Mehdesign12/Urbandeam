// ─────────────────────────────────────────────────────────────
// URBANDEAM — Client Supabase côté serveur (Next.js Server Components)
// Utilise le service role key pour bypasser le RLS dans les API routes
// ─────────────────────────────────────────────────────────────
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl       = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client Server Component (lecture/écriture avec RLS — contexte utilisateur)
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

// Client Admin (service role — bypass RLS — pour les API routes internes)
// ⚠️ Ne JAMAIS exposer ce client côté navigateur
export function createAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
