import fs from 'fs'
import path from 'path'
import type { FactFile, FactFileSummary, Submission } from '@/types'
import { kv, isKvConfigured } from './kv'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'fact-files')
const SUBMISSIONS_PATH = path.join(process.cwd(), 'content', 'submissions.json')
const LINK_CHECK_PATH = path.join(process.cwd(), 'content', 'link-check-results.json')

// ─── KV helpers ───────────────────────────────────────────────────────────────

/** Seed KV from filesystem on first boot if KV has no slugs yet. */
async function maybeBootstrapKv(): Promise<void> {
  const seeded = await kv.exists('ff:bootstrapped')
  if (seeded) return

  if (!fs.existsSync(CONTENT_DIR)) return
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'))
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8')
    const ff: FactFile = JSON.parse(raw)
    await kv.set(`ff:${ff.slug}`, raw)
    await kv.sadd('ff:slugs', ff.slug)
  }
  await kv.set('ff:bootstrapped', '1')
}

async function kvGetFactFile(slug: string): Promise<FactFile | null> {
  await maybeBootstrapKv()
  const raw = await kv.get(`ff:${slug}`)
  if (!raw) return null
  return JSON.parse(raw) as FactFile
}

async function kvGetAllSlugs(): Promise<string[]> {
  await maybeBootstrapKv()
  return kv.smembers('ff:slugs')
}

async function kvSaveFactFile(ff: FactFile): Promise<void> {
  await kv.set(`ff:${ff.slug}`, JSON.stringify(ff))
  await kv.sadd('ff:slugs', ff.slug)
}

async function kvDeleteFactFile(slug: string): Promise<void> {
  await kv.del(`ff:${slug}`)
  await kv.srem('ff:slugs', slug)
}

// ─── FS helpers ───────────────────────────────────────────────────────────────

function fsGetFactFile(slug: string): FactFile | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.json`)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as FactFile
}

function fsGetAllSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''))
}

function fsSaveFactFile(ff: FactFile): void {
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true })
  fs.writeFileSync(path.join(CONTENT_DIR, `${ff.slug}.json`), JSON.stringify(ff, null, 2), 'utf-8')
}

function fsDeleteFactFile(slug: string): void {
  const filePath = path.join(CONTENT_DIR, `${slug}.json`)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
}

function toSummary(ff: FactFile): FactFileSummary {
  return {
    slug: ff.slug,
    title: ff.title,
    subtitle: ff.subtitle,
    summary: ff.summary.slice(0, 200),
    category: ff.category,
    status: ff.status,
    priority_votes: ff.priority_votes,
    last_updated: ff.last_updated,
    evidence_count: ff.evidence.length,
    has_contested_claims: ff.contested_claims.length > 0,
    has_data_panels: ff.data_panels.length > 0,
    is_draft: ff.is_draft ?? false,
  } satisfies FactFileSummary
}

// ─── Public API (all async) ────────────────────────────────────────────────────

export async function getFactFile(slug: string): Promise<FactFile | null> {
  if (isKvConfigured()) return kvGetFactFile(slug)
  return fsGetFactFile(slug)
}

export async function getAllSlugs(): Promise<string[]> {
  if (isKvConfigured()) return kvGetAllSlugs()
  return fsGetAllSlugs()
}

export async function getAllFactFiles(): Promise<FactFileSummary[]> {
  const slugs = await getAllSlugs()
  const files = await Promise.all(slugs.map(s => getFactFile(s)))
  return files
    .filter((ff): ff is FactFile => ff !== null && !(ff.is_draft ?? false))
    .map(toSummary)
    .sort((a, b) => b.priority_votes - a.priority_votes)
}

export async function getAllFactFilesIncludingDrafts(): Promise<FactFileSummary[]> {
  const slugs = await getAllSlugs()
  const files = await Promise.all(slugs.map(s => getFactFile(s)))
  return files
    .filter((ff): ff is FactFile => ff !== null)
    .map(toSummary)
    .sort((a, b) => b.priority_votes - a.priority_votes)
}

export async function getAllFactFilesRaw(): Promise<FactFile[]> {
  const slugs = await getAllSlugs()
  const files = await Promise.all(slugs.map(s => getFactFile(s)))
  return files.filter((ff): ff is FactFile => ff !== null)
}

export async function saveFactFile(ff: FactFile): Promise<void> {
  if (isKvConfigured()) return kvSaveFactFile(ff)
  fsSaveFactFile(ff)
}

export async function deleteFactFile(slug: string): Promise<void> {
  if (isKvConfigured()) return kvDeleteFactFile(slug)
  fsDeleteFactFile(slug)
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export async function getSubmissions(): Promise<Submission[]> {
  if (isKvConfigured()) {
    const raw = await kv.get('faction:submissions')
    if (!raw) return []
    return JSON.parse(raw) as Submission[]
  }
  if (!fs.existsSync(SUBMISSIONS_PATH)) return []
  try { return JSON.parse(fs.readFileSync(SUBMISSIONS_PATH, 'utf-8')) as Submission[] }
  catch { return [] }
}

export async function saveSubmissions(submissions: Submission[]): Promise<void> {
  if (isKvConfigured()) {
    await kv.set('faction:submissions', JSON.stringify(submissions))
    return
  }
  const dir = path.dirname(SUBMISSIONS_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(SUBMISSIONS_PATH, JSON.stringify(submissions, null, 2), 'utf-8')
}

export async function addSubmission(sub: Submission): Promise<void> {
  const all = await getSubmissions()
  all.push(sub)
  await saveSubmissions(all)
}

export async function updateSubmissionStatus(
  id: string,
  status: Submission['status'],
): Promise<void> {
  const all = await getSubmissions()
  const sub = all.find(s => s.id === id)
  if (sub) sub.status = status
  await saveSubmissions(all)
}

// ─── Link check results ───────────────────────────────────────────────────────

export interface LinkCheckSnapshot {
  checkedAt: string
  results: LinkCheckResult[]
}

export interface LinkCheckResult {
  slug: string
  evidenceId: string
  title: string
  url: string
  status: number | null
  ok: boolean
  error?: string
}

/**
 * Returns a map of slug → view count.
 * Only works when KV is configured — returns empty object otherwise (dev mode).
 */
export async function getViewCounts(slugs: string[]): Promise<Record<string, number>> {
  if (!isKvConfigured() || slugs.length === 0) return {}
  const counts: Record<string, number> = {}
  await Promise.all(
    slugs.map(async slug => {
      const raw = await kv.get(`faction:views:${slug}`)
      counts[slug] = raw ? parseInt(raw, 10) : 0
    })
  )
  return counts
}

export async function getLinkCheckResults(): Promise<LinkCheckSnapshot | null> {
  if (isKvConfigured()) {
    const raw = await kv.get('faction:link-check')
    if (!raw) return null
    return JSON.parse(raw) as LinkCheckSnapshot
  }
  if (!fs.existsSync(LINK_CHECK_PATH)) return null
  try { return JSON.parse(fs.readFileSync(LINK_CHECK_PATH, 'utf-8')) as LinkCheckSnapshot }
  catch { return null }
}

export async function saveLinkCheckResults(snapshot: LinkCheckSnapshot): Promise<void> {
  if (isKvConfigured()) {
    await kv.set('faction:link-check', JSON.stringify(snapshot))
    return
  }
  const dir = path.dirname(LINK_CHECK_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(LINK_CHECK_PATH, JSON.stringify(snapshot, null, 2), 'utf-8')
}

// ─── Link checker ─────────────────────────────────────────────────────────────

export async function checkAllLinks(): Promise<LinkCheckResult[]> {
  const allFiles = await getAllFactFilesRaw()
  const checks: Promise<LinkCheckResult>[] = []

  for (const ff of allFiles) {
    for (const ev of ff.evidence) {
      checks.push(
        (async (): Promise<LinkCheckResult> => {
          const base: LinkCheckResult = {
            slug: ff.slug,
            evidenceId: ev.id,
            title: ev.title,
            url: ev.url,
            status: null,
            ok: false,
          }
          try {
            const controller = new AbortController()
            const timer = setTimeout(() => controller.abort(), 8000)
            const res = await fetch(ev.url, {
              method: 'HEAD',
              signal: controller.signal,
              redirect: 'follow',
              headers: { 'User-Agent': 'FACTION-LinkChecker/1.0' },
            })
            clearTimeout(timer)
            return { ...base, status: res.status, ok: res.ok }
          } catch (err: unknown) {
            return {
              ...base,
              error: err instanceof Error ? err.message : 'Unknown error',
            }
          }
        })(),
      )
    }
  }

  const results = await Promise.allSettled(checks)
  return results.map(r =>
    r.status === 'fulfilled' ? r.value : { slug: '', evidenceId: '', title: '', url: '', status: null, ok: false, error: 'Promise rejected' },
  )
}
