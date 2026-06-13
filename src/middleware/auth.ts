import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../db/supabase'
import { error } from '../utils/response'
import { parseCookies } from '../utils/cookies'

export type UserRole = 'admin' | 'ventas' | 'almacen' | 'confeccion'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

export interface AuthenticatedRequest extends VercelRequest {
  user: AuthUser
}

export async function authenticate(
  req: VercelRequest,
  res: VercelResponse
): Promise<AuthUser | null> {
  const cookieToken = parseCookies(req.headers.cookie || '')['access_token']
  const header = req.headers.authorization
  const headerToken = header?.startsWith('Bearer ') ? header.slice(7) : null
  const token = cookieToken || headerToken

  if (!token) {
    error(res, 'Token requerido', 401)
    return null
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token)

  if (authError || !user) {
    error(res, 'Token invalido', 401)
    return null
  }

  // Obtener rol del usuario desde la tabla app_users
  const { data: appUser } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!appUser) {
    error(res, 'Usuario no registrado en el sistema', 403)
    return null
  }

  return {
    id: user.id,
    email: user.email!,
    role: appUser.role as UserRole,
  }
}
