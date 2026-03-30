export const SESSION_COOKIE = 'faction_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getSecret(): string {
  const s = process.env.AUTH_SECRET
  if (!s && process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET env var is required in production')
  }
  return s ?? 'dev-secret-change-me-in-production'
}

export async function generateSessionToken(): Promise<string> {
  const encoder = new TextEncoder()
  const secret = getSecret()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode('faction-admin-v1'))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifySession(token: string): Promise<boolean> {
  if (!token) return false
  const expected = await generateSessionToken()
  if (token.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0
}
