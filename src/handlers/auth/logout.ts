import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../db/supabase'
import { json } from '../../utils/response'
import { parseCookies, cookieAttrs } from '../../utils/cookies'

export async function logout(req: VercelRequest, res: VercelResponse) {
  const token = parseCookies(req.headers.cookie || '')['access_token']
  if (token) {
    await supabase.auth.admin.signOut(token).catch(() => {})
  }

  res.setHeader('Set-Cookie', [
    `access_token=; ${cookieAttrs(0)}`,
    `refresh_token=; ${cookieAttrs(0)}`,
  ])

  return json(res, { success: true })
}
