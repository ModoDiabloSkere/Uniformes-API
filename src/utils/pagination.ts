import type { VercelRequest } from '@vercel/node'

const DEFAULT_LIMIT = 200
const MAX_LIMIT = 500

export function parsePagination(req: VercelRequest) {
  const limit = Math.min(Math.max(Number(req.query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT)
  const offset = Math.max(Number(req.query.offset) || 0, 0)
  return { limit, offset }
}
