import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL!

// Cliente con service_role para operaciones del backend (bypassa RLS)
export const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Cliente con anon key para autenticación de usuarios (singleton)
export const supabaseAnon = createClient(url, process.env.SUPABASE_ANON_KEY!)
