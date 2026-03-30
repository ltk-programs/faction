/**
 * Minimal Upstash Redis REST API client.
 * Used when KV_REST_API_URL and KV_REST_API_TOKEN env vars are set.
 * Falls back to filesystem storage when not configured.
 */

const BASE_URL = () => process.env.KV_REST_API_URL
const TOKEN = () => process.env.KV_REST_API_TOKEN

export function isKvConfigured(): boolean {
  return !!(BASE_URL() && TOKEN())
}

async function kvCmd<T>(command: unknown[]): Promise<T> {
  const url = BASE_URL()
  const token = TOKEN()
  if (!url || !token) throw new Error('KV not configured')

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`KV error ${res.status}: ${text}`)
  }
  const data = await res.json() as { result: T }
  return data.result
}

export const kv = {
  async get(key: string): Promise<string | null> {
    return kvCmd<string | null>(['GET', key])
  },
  async set(key: string, value: string): Promise<void> {
    await kvCmd(['SET', key, value])
  },
  async del(key: string): Promise<void> {
    await kvCmd(['DEL', key])
  },
  async sadd(key: string, ...members: string[]): Promise<void> {
    await kvCmd(['SADD', key, ...members])
  },
  async smembers(key: string): Promise<string[]> {
    return kvCmd<string[]>(['SMEMBERS', key])
  },
  async srem(key: string, member: string): Promise<void> {
    await kvCmd(['SREM', key, member])
  },
  async exists(key: string): Promise<boolean> {
    const result = await kvCmd<number>(['EXISTS', key])
    return result > 0
  },
  /** Atomically increment a counter by 1. Returns the new value. */
  async incr(key: string): Promise<number> {
    return kvCmd<number>(['INCR', key])
  },
  /** Get all field/value pairs from a hash. */
  async hgetall(key: string): Promise<Record<string, string> | null> {
    return kvCmd<Record<string, string> | null>(['HGETALL', key])
  },
}
