import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente con service_role para operaciones del backend
export const supabase = createClient(url, serviceKey)

// Cliente con el token del usuario para operaciones autenticadas
export function supabaseWithAuth(token: string) {
  return createClient(url, process.env.SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}
