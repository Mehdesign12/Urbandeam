// ─────────────────────────────────────────────────────────────
// URBANDEAM — Client Supabase
// Deux clients : browser (RLS) + server (service role)
// ─────────────────────────────────────────────────────────────
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client navigateur (utilise le anon key — soumis au RLS)
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
