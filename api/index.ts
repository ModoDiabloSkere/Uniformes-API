import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleRequest } from '../src/router/router'
import { registerRoutes } from '../src/router/routes'

// Registrar todas las rutas una sola vez
registerRoutes()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await handleRequest(req, res)
}
