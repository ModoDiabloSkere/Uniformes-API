import type { VercelResponse } from '@vercel/node'

export function json(res: VercelResponse, data: unknown, status = 200) {
  return res.status(status).json(data)
}

export function error(res: VercelResponse, message: string, status = 400) {
  return res.status(status).json({ error: message })
}
