import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { json, error } from '../../utils/response'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function login(req: VercelRequest, res: VercelResponse) {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return error(res, 'Email y password requeridos', 400)
  }

  const client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  const { data, error: authError } = await client.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (authError || !data.session) {
    return error(res, 'Credenciales invalidas', 401)
  }

  // Obtener rol
  const { createClient: createAdmin } = await import('@supabase/supabase-js')
  const admin = createAdmin(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: appUser } = await admin
    .from('app_users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  return json(res, {
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: appUser?.role || 'ventas',
    },
  })
}
