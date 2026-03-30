'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import {
  saveFactFile, deleteFactFile, getFactFile,
  getSubmissions, saveSubmissions,
  addSubmission as saveSubmission,
  updateSubmissionStatus as persistSubmissionStatus,
} from './content'
import type {
  FactFile, Evidence, TimelineEvent,
  ContestedClaim, DataPanel, SourceType, SourceTier,
  Submission, SubmissionType,
  ChangelogEntry, ChangelogEntryType,
} from '@/types'

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── Create Fact File ─────────────────────────────────────────────────────────
export async function createFactFile(formData: FormData) {
  const title = formData.get('title') as string
  const subtitle = formData.get('subtitle') as string
  const summary = formData.get('summary') as string
  const situation_context = formData.get('situation_context') as string
  const reopen_threshold = formData.get('reopen_threshold') as string
  const categoryRaw = formData.get('category') as string

  const slug = slugify(title)
  const now = today()

  const ff: FactFile = {
    id: generateId(),
    slug,
    title,
    subtitle: subtitle || undefined,
    category: categoryRaw.split(',').map(c => c.trim()).filter(Boolean),
    status: 'open',
    priority_votes: 0,
    created_date: now,
    last_updated: now,
    summary,
    situation_context,
    evidence: [],
    timeline: [],
    contested_claims: [],
    data_panels: [],
    reopen_threshold,
  }

  await saveFactFile(ff)
  revalidatePath('/admin')
  redirect(`/admin/${slug}`)
}

// ─── Update Fact File meta ─────────────────────────────────────────────────────
export async function updateFactFileMeta(slug: string, formData: FormData) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  ff.title = formData.get('title') as string
  ff.subtitle = (formData.get('subtitle') as string) || undefined
  ff.summary = formData.get('summary') as string
  ff.situation_context = formData.get('situation_context') as string
  ff.reopen_threshold = formData.get('reopen_threshold') as string
  ff.status = formData.get('status') as FactFile['status']
  ff.category = (formData.get('category') as string)
    .split(',').map(c => c.trim()).filter(Boolean)
  if (ff.status === 'resolved') {
    ff.resolution_note = formData.get('resolution_note') as string
  }
  ff.last_updated = today()

  await saveFactFile(ff)
  revalidatePath(`/admin/${slug}`)
  revalidatePath(`/fact/${slug}`)
  revalidatePath('/')
}

// ─── Add Evidence ──────────────────────────────────────────────────────────────
export async function addEvidence(slug: string, formData: FormData) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  const evidence: Evidence = {
    id: generateId(),
    title: formData.get('title') as string,
    source_type: formData.get('source_type') as SourceType,
    tier: Number(formData.get('tier')) as SourceTier,
    url: formData.get('url') as string,
    issuing_authority: formData.get('issuing_authority') as string,
    date_issued: formData.get('date_issued') as string,
    description: formData.get('description') as string,
    added_date: today(),
    verified: formData.get('verified') === 'true',
  }

  ff.evidence.push(evidence)
  ff.last_updated = today()
  await saveFactFile(ff)

  revalidatePath(`/admin/${slug}`)
  revalidatePath(`/fact/${slug}`)
  redirect(`/admin/${slug}`)
}

// ─── Remove Evidence ───────────────────────────────────────────────────────────
export async function removeEvidence(slug: string, evidenceId: string) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  ff.evidence = ff.evidence.filter(e => e.id !== evidenceId)
  ff.last_updated = today()
  await saveFactFile(ff)

  revalidatePath(`/admin/${slug}`)
  revalidatePath(`/fact/${slug}`)
}

// ─── Toggle Evidence Verified ─────────────────────────────────────────────────
export async function toggleEvidenceVerified(slug: string, evidenceId: string) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  const ev = ff.evidence.find(e => e.id === evidenceId)
  if (ev) ev.verified = !ev.verified
  ff.last_updated = today()
  await saveFactFile(ff)

  revalidatePath(`/admin/${slug}`)
  revalidatePath(`/fact/${slug}`)
}

// ─── Add Timeline Event ───────────────────────────────────────────────────────
export async function addTimelineEvent(slug: string, formData: FormData) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  const evidenceIdsRaw = formData.get('evidence_ids') as string
  const event: TimelineEvent = {
    id: generateId(),
    date: formData.get('date') as string,
    time: (formData.get('time') as string) || undefined,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    evidence_ids: evidenceIdsRaw
      ? evidenceIdsRaw.split(',').map(s => s.trim()).filter(Boolean)
      : [],
  }

  ff.timeline.push(event)
  ff.timeline.sort((a, b) => a.date.localeCompare(b.date))
  ff.last_updated = today()
  await saveFactFile(ff)

  revalidatePath(`/admin/${slug}`)
  revalidatePath(`/fact/${slug}`)
  redirect(`/admin/${slug}`)
}

// ─── Remove Timeline Event ────────────────────────────────────────────────────
export async function removeTimelineEvent(slug: string, eventId: string) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  ff.timeline = ff.timeline.filter(e => e.id !== eventId)
  ff.last_updated = today()
  await saveFactFile(ff)

  revalidatePath(`/admin/${slug}`)
  revalidatePath(`/fact/${slug}`)
}

// ─── Add Contested Claim ──────────────────────────────────────────────────────
export async function addContestedClaim(slug: string, formData: FormData) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  const parseIds = (raw: string) =>
    raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : []

  const claim: ContestedClaim = {
    id: generateId(),
    claim: formData.get('claim') as string,
    context: formData.get('context') as string,
    side_a: {
      position: formData.get('side_a_position') as string,
      evidence_ids: parseIds(formData.get('side_a_evidence_ids') as string),
    },
    side_b: {
      position: formData.get('side_b_position') as string,
      evidence_ids: parseIds(formData.get('side_b_evidence_ids') as string),
    },
  }

  ff.contested_claims.push(claim)
  ff.last_updated = today()
  await saveFactFile(ff)

  revalidatePath(`/admin/${slug}`)
  revalidatePath(`/fact/${slug}`)
  redirect(`/admin/${slug}`)
}

// ─── Remove Contested Claim ───────────────────────────────────────────────────
export async function removeContestedClaim(slug: string, claimId: string) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  ff.contested_claims = ff.contested_claims.filter(c => c.id !== claimId)
  ff.last_updated = today()
  await saveFactFile(ff)

  revalidatePath(`/admin/${slug}`)
  revalidatePath(`/fact/${slug}`)
}

// ─── Add Data Panel ───────────────────────────────────────────────────────────
export async function addDataPanel(slug: string, formData: FormData) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  const labelsRaw = formData.get('labels') as string
  const dataRaw = formData.get('data') as string
  const dataLabel = formData.get('data_label') as string

  const panel: DataPanel = {
    id: generateId(),
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    data_source_url: formData.get('data_source_url') as string,
    methodology_note: formData.get('methodology_note') as string,
    chart_type: formData.get('chart_type') as DataPanel['chart_type'],
    labels: labelsRaw.split(',').map(s => s.trim()).filter(Boolean),
    datasets: [{
      label: dataLabel,
      data: dataRaw.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n)),
    }],
  }

  ff.data_panels.push(panel)
  ff.last_updated = today()
  await saveFactFile(ff)

  revalidatePath(`/admin/${slug}`)
  revalidatePath(`/fact/${slug}`)
  redirect(`/admin/${slug}`)
}

// ─── Remove Data Panel ─────────────────────────────────────────────────────────
export async function removeDataPanel(slug: string, panelId: string) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  ff.data_panels = ff.data_panels.filter(p => p.id !== panelId)
  ff.last_updated = today()
  await saveFactFile(ff)

  revalidatePath(`/admin/${slug}`)
  revalidatePath(`/fact/${slug}`)
}

// ─── Update Evidence ──────────────────────────────────────────────────────────
export async function updateEvidence(slug: string, evidenceId: string, formData: FormData) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  const ev = ff.evidence.find(e => e.id === evidenceId)
  if (!ev) throw new Error(`Evidence not found: ${evidenceId}`)

  ev.title = formData.get('title') as string
  ev.source_type = formData.get('source_type') as SourceType
  ev.tier = Number(formData.get('tier')) as SourceTier
  ev.url = formData.get('url') as string
  ev.issuing_authority = formData.get('issuing_authority') as string
  ev.date_issued = formData.get('date_issued') as string
  ev.description = formData.get('description') as string
  const mediaType = formData.get('media_type') as string
  if (mediaType) ev.media_type = mediaType as Evidence['media_type']

  ff.last_updated = today()
  await saveFactFile(ff)

  revalidatePath(`/admin/${slug}`)
  revalidatePath(`/fact/${slug}`)
  redirect(`/admin/${slug}`)
}

// ─── Update Timeline Event ────────────────────────────────────────────────────
export async function updateTimelineEvent(slug: string, eventId: string, formData: FormData) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  const ev = ff.timeline.find(e => e.id === eventId)
  if (!ev) throw new Error(`Timeline event not found: ${eventId}`)

  ev.date = formData.get('date') as string
  ev.time = (formData.get('time') as string) || undefined
  ev.title = formData.get('title') as string
  ev.description = formData.get('description') as string
  const evidenceIdsRaw = formData.get('evidence_ids') as string
  ev.evidence_ids = evidenceIdsRaw
    ? evidenceIdsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : []

  ff.timeline.sort((a, b) => a.date.localeCompare(b.date))
  ff.last_updated = today()
  await saveFactFile(ff)

  revalidatePath(`/admin/${slug}`)
  revalidatePath(`/fact/${slug}`)
  redirect(`/admin/${slug}`)
}

// ─── Update Contested Claim ───────────────────────────────────────────────────
export async function updateContestedClaim(slug: string, claimId: string, formData: FormData) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  const claim = ff.contested_claims.find(c => c.id === claimId)
  if (!claim) throw new Error(`Claim not found: ${claimId}`)

  claim.claim = formData.get('claim') as string
  claim.context = formData.get('context') as string
  claim.side_a = { position: formData.get('side_a') as string, evidence_ids: [] }
  claim.side_b = { position: formData.get('side_b') as string, evidence_ids: [] }

  ff.last_updated = today()
  await saveFactFile(ff)

  revalidatePath(`/admin/${slug}`)
  revalidatePath(`/fact/${slug}`)
  redirect(`/admin/${slug}`)
}

// ─── Increment Priority Vote ──────────────────────────────────────────────────
// Phase 0: cookie-based throttle — one vote per topic per 24 hours per browser.
// Phase 1: replace with user-account-tied vote stored in database.
export async function incrementPriorityVote(slug: string) {
  const cookieStore = await cookies()
  const cookieName = `voted_${slug}`

  // If the user has voted on this topic in the last 24 hours, do nothing
  if (cookieStore.has(cookieName)) {
    return
  }

  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  ff.priority_votes += 1
  await saveFactFile(ff)

  // Set a 24-hour cookie to prevent repeat voting
  cookieStore.set(cookieName, '1', {
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  revalidatePath('/')
  revalidatePath(`/fact/${slug}`)
}

// ─── Public Submission ────────────────────────────────────────────────────────
export async function submitSuggestion(formData: FormData) {
  const type = formData.get('type') as SubmissionType

  const sub: Submission = {
    id: generateId(),
    type,
    submitted_at: new Date().toISOString(),
    status: 'pending',
    submitter_note: (formData.get('submitter_note') as string) || '',
    // new_topic
    topic_title: (formData.get('topic_title') as string) || undefined,
    topic_description: (formData.get('topic_description') as string) || undefined,
    // new_evidence
    existing_slug: (formData.get('existing_slug') as string) || undefined,
    evidence_title: (formData.get('evidence_title') as string) || undefined,
    evidence_url: (formData.get('evidence_url') as string) || undefined,
    evidence_source: (formData.get('evidence_source') as string) || undefined,
    // correction
    correction_detail: (formData.get('correction_detail') as string) || undefined,
  }

  await saveSubmission(sub)
  revalidatePath('/admin/submissions')
  redirect('/submit/thanks')
}

// ─── Update Submission Status (admin) ────────────────────────────────────────
export async function updateSubmissionStatus(id: string, status: Submission['status']) {
  await persistSubmissionStatus(id, status)
  revalidatePath('/admin/submissions')
}

// ─── Bulk Evidence Import ─────────────────────────────────────────────────────
export async function bulkImportEvidence(
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const slug = formData.get('slug') as string
  const rowsJson = formData.get('rows') as string

  if (!slug || !rowsJson) return { ok: false, message: 'Missing slug or rows.' }

  const ff = await getFactFile(slug)
  if (!ff) return { ok: false, message: `Fact file not found: ${slug}` }

  let rows: Array<Record<string, string>>
  try {
    rows = JSON.parse(rowsJson)
  } catch {
    return { ok: false, message: 'Invalid JSON in rows.' }
  }

  const importDate = new Date().toISOString().slice(0, 10)
  let added = 0

  for (const row of rows) {
    const tier = parseInt(row.tier, 10)
    if (tier !== 1 && tier !== 3) continue

    const evidence: Evidence = {
      id: `ev-import-${generateId()}`,
      title: row.title,
      source_type: (row.source_type as Evidence['source_type']) || 'government_document',
      tier: tier as SourceTier,
      url: row.url,
      issuing_authority: row.issuing_authority,
      date_issued: row.date_issued,
      description: row.description || '',
      added_date: importDate,
      verified: false,  // always unverified until reviewed
    }
    ff.evidence.push(evidence)
    added++
  }

  if (added === 0) return { ok: false, message: 'No valid rows to import.' }

  ff.last_updated = importDate
  await saveFactFile(ff)
  revalidatePath(`/fact/${slug}`)
  revalidatePath(`/admin/${slug}`)

  return { ok: true, message: `Successfully imported ${added} evidence item${added !== 1 ? 's' : ''} into "${ff.title}". All marked as unverified — review in the admin editor.` }
}

// ─── Toggle Draft Mode ────────────────────────────────────────────────────────
export async function toggleDraftMode(slug: string, isDraft: boolean) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)
  ff.is_draft = isDraft
  await saveFactFile(ff)
  revalidatePath('/')
  revalidatePath('/search')
  revalidatePath(`/fact/${slug}`)
  revalidatePath(`/admin/${slug}`)
  revalidatePath('/admin')
}

// ─── Log Changelog Entry ──────────────────────────────────────────────────────
export async function addChangelogEntry(slug: string, formData: FormData) {
  const ff = await getFactFile(slug)
  if (!ff) throw new Error(`Fact file not found: ${slug}`)

  const entry: ChangelogEntry = {
    id: generateId(),
    date: (formData.get('date') as string) || new Date().toISOString().slice(0, 10),
    type: (formData.get('entry_type') as ChangelogEntryType) || 'update',
    description: (formData.get('description') as string) || '',
  }

  ff.changelog = [entry, ...(ff.changelog ?? [])]
  ff.last_updated = entry.date

  await saveFactFile(ff)
  revalidatePath(`/fact/${slug}`)
  revalidatePath(`/admin/${slug}`)
  redirect(`/admin/${slug}`)
}

// ─── Approve submission + merge into fact file ────────────────────────────────
/**
 * For `new_evidence` submissions: creates an Evidence object, adds it to the
 * target fact file, logs a changelog entry, then marks the submission accepted.
 *
 * For `correction` and `new_topic`: just marks accepted (requires manual
 * editorial follow-up — no automatic merge because corrections need judgment
 * and new topics need a full fact file to be created from scratch).
 */
export async function approveAndMerge(
  submissionId: string
): Promise<{ ok: boolean; message: string }> {
  const submissions = await getSubmissions()
  const sub = submissions.find(s => s.id === submissionId)
  if (!sub) return { ok: false, message: 'Submission not found.' }
  if (sub.status === 'accepted') return { ok: false, message: 'Already accepted.' }

  // For correction / new_topic: just accept, no auto-merge
  if (sub.type !== 'new_evidence') {
    await persistSubmissionStatus(submissionId, 'accepted')
    revalidatePath('/admin/submissions')
    return {
      ok: true,
      message: sub.type === 'correction'
        ? 'Marked accepted. Apply the correction manually in the fact file editor.'
        : 'Marked accepted. Create the new fact file using the admin editor.',
    }
  }

  // new_evidence: auto-merge into the target fact file
  if (!sub.existing_slug) return { ok: false, message: 'No target fact file specified.' }
  if (!sub.evidence_url)  return { ok: false, message: 'No evidence URL in submission.' }
  if (!sub.evidence_title) return { ok: false, message: 'No evidence title in submission.' }

  const ff = await getFactFile(sub.existing_slug)
  if (!ff) return { ok: false, message: `Fact file not found: ${sub.existing_slug}` }

  // Prevent duplicates
  if (ff.evidence.some(e => e.url === sub.evidence_url)) {
    await persistSubmissionStatus(submissionId, 'accepted')
    revalidatePath('/admin/submissions')
    return { ok: false, message: 'A source with this URL already exists in the fact file.' }
  }

  const mergeDate = today()
  const newEvidence: Evidence = {
    id: `ev-sub-${generateId()}`,
    title: sub.evidence_title,
    source_type: 'government_document',   // default — editor can adjust
    tier: 3,                               // community-submitted defaults to Tier 3
    url: sub.evidence_url,
    issuing_authority: sub.evidence_source ?? 'Unknown',
    date_issued: mergeDate,
    description: sub.submitter_note ?? '',
    added_date: mergeDate,
    verified: false,                       // must be reviewed before publishing
  }

  ff.evidence.push(newEvidence)
  ff.changelog = [
    {
      id: generateId(),
      date: mergeDate,
      type: 'addition',
      description: `Community submission merged: "${sub.evidence_title}" — pending editorial verification (Tier 3).`,
    },
    ...(ff.changelog ?? []),
  ]
  ff.last_updated = mergeDate

  await saveFactFile(ff)
  await persistSubmissionStatus(submissionId, 'accepted')

  revalidatePath('/admin/submissions')
  revalidatePath(`/admin/${sub.existing_slug}`)
  revalidatePath(`/fact/${sub.existing_slug}`)
  revalidatePath('/')

  return {
    ok: true,
    message: `Evidence merged into "${ff.title}" as Tier 3 (unverified). Review it in the fact file editor before publishing.`,
  }
}
