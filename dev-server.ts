import http from 'http'
import { URL } from 'url'
import type { IncomingMessage, ServerResponse } from 'http'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { registerRoutes } from './src/router/routes'
import { handleRequest } from './src/router/router'

registerRoutes()

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString()
      if (!raw) return resolve(undefined)
      const contentType = req.headers['content-type'] || ''
      if (contentType.includes('application/json')) {
        try {
          resolve(JSON.parse(raw))
        } catch {
          resolve(raw)
        }
      } else {
        resolve(raw)
      }
    })
    req.on('error', reject)
  })
}

function parseCookies(raw = ''): Record<string, string> {
  const cookies: Record<string, string> = {}
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k) cookies[k.trim()] = decodeURIComponent(v.join('='))
  }
  return cookies
}

const PORT = Number(process.env.PORT) || 3000

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const base = `http://localhost:${PORT}`
  const url = new URL(req.url || '/', base)

  const query: Record<string, string | string[]> = {}
  url.searchParams.forEach((value, key) => {
    const existing = query[key]
    if (existing !== undefined) {
      query[key] = Array.isArray(existing) ? [...existing, value] : [existing, value]
    } else {
      query[key] = value
    }
  })

  const body = await readBody(req)
  const cookies = parseCookies(req.headers.cookie)

  const vercelReq = req as unknown as VercelRequest
  ;(vercelReq as any).query = query
  ;(vercelReq as any).body = body
  ;(vercelReq as any).cookies = cookies
  ;(vercelReq as any).params = {}

  const vercelRes = res as unknown as VercelResponse
  ;(vercelRes as any).status = function (code: number) {
    res.statusCode = code
    return vercelRes
  }
  ;(vercelRes as any).json = function (data: unknown) {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
    return vercelRes
  }
  ;(vercelRes as any).send = function (data: unknown) {
    if (Buffer.isBuffer(data)) {
      res.end(data)
    } else if (typeof data === 'string') {
      res.end(data)
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(data))
    }
    return vercelRes
  }
  ;(vercelRes as any).redirect = function (urlOrStatus: string | number, urlArg?: string) {
    const location = typeof urlOrStatus === 'string' ? urlOrStatus : (urlArg as string)
    const status = typeof urlOrStatus === 'number' ? urlOrStatus : 302
    res.statusCode = status
    res.setHeader('Location', location)
    res.end()
    return vercelRes
  }

  try {
    await handleRequest(vercelReq, vercelRes)
  } catch (err) {
    console.error('Unhandled error:', err)
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Error interno del servidor' }))
  }
})

server.listen(PORT, () => {
  console.log(`Uniformes API corriendo en http://localhost:${PORT}`)
})
