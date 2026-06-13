export function parseCookies(header: string): Record<string, string> {
  return header.split(';').reduce((acc, pair) => {
    const idx = pair.indexOf('=')
    if (idx < 0) return acc
    acc[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim()
    return acc
  }, {} as Record<string, string>)
}

// Max-Age=0 clears the cookie; pass the desired lifetime in seconds otherwise.
export function cookieAttrs(maxAge: number): string {
  const isSecure = !!process.env.VERCEL
  const samesite = isSecure ? 'SameSite=None; Secure' : 'SameSite=Lax'
  return `HttpOnly; ${samesite}; Path=/; Max-Age=${maxAge}`
}
