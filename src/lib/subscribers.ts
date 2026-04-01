/**
 * Subscriber management — stored in Upstash Redis.
 * KV schema:
 *   faction:subs:{slug}  → Redis Set of email addresses
 *   faction:sub:{email}  → Redis Set of slugs (for unsubscribe all)
 */

import { kv, isKvConfigured } from './kv'

export async function addSubscriber(slug: string, email: string): Promise<void> {
  if (!isKvConfigured()) return
  const normalised = email.toLowerCase().trim()
  await Promise.all([
    kv.sadd(`faction:subs:${slug}`, normalised),
    kv.sadd(`faction:sub:${normalised}`, slug),
  ])
}

export async function removeSubscriber(slug: string, email: string): Promise<void> {
  if (!isKvConfigured()) return
  const normalised = email.toLowerCase().trim()
  await Promise.all([
    kv.srem(`faction:subs:${slug}`, normalised),
    kv.srem(`faction:sub:${normalised}`, slug),
  ])
}

export async function getSubscribers(slug: string): Promise<string[]> {
  if (!isKvConfigured()) return []
  return kv.smembers(`faction:subs:${slug}`)
}

/** Generate a signed unsubscribe token using Web Crypto HMAC-SHA256 */
export async function generateUnsubToken(email: string, slug: string): Promise<string> {
  const secret = process.env.AUTH_SECRET ?? 'fallback-secret'
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const payload = `${email}:${slug}`
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return Buffer.from(`${payload}:${hex}`).toString('base64url')
}

/** Verify and decode an unsubscribe token. Returns { email, slug } or null. */
export async function verifyUnsubToken(token: string): Promise<{ email: string; slug: string } | null> {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const parts = decoded.split(':')
    if (parts.length < 3) return null
    const hex = parts.pop()!
    const slug = parts.pop()!
    const email = parts.join(':') // handle email addresses (no colons normally, but safe)

    const secret = process.env.AUTH_SECRET ?? 'fallback-secret'
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const payload = `${email}:${slug}`
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
    const expectedHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')

    if (hex !== expectedHex) return null
    return { email, slug }
  } catch {
    return null
  }
}
