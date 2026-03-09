import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticate } from '../../middleware/auth'
import { json } from '../../utils/response'

export async function me(req: VercelRequest, res: VercelResponse) {
  const user = await authenticate(req, res)
  if (!user) return

  return json(res, { user })
}
