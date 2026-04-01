// ─────────────────────────────────────────────────────────────────────────────
// FACTION — Core Type Definitions
// All data is stored as JSON files in /content/fact-files/
// ─────────────────────────────────────────────────────────────────────────────

export type TopicStatus = 'open' | 'developing' | 'resolved'

export type SourceTier = 1 | 3
// Tier 1: Verified official — government, court, peer-reviewed, institutional
// Tier 3: Community-verified — citizen footage, official social posts,
//          released-but-unverified documents. Clearly labelled as Tier 3.

export type SourceType =
  | 'government_document'
  | 'court_filing'
  | 'body_cam_footage'
  | 'official_statement'
  | 'peer_reviewed_study'
  | 'statistical_dataset'
  | 'financial_filing'
  | 'official_testimony'
  | 'surveillance_footage'
  | 'press_conference'
  | 'legislative_record'
  | 'autopsy_report'
  | 'investigation_report'
  | 'other_tier3'

export type MediaType = 'document' | 'video' | 'dataset' | 'webpage' | 'audio'

// ─── Evidence ─────────────────────────────────────────────────────────────────
// Atomic unit. Every claim on FACTION traces back here.
// Rule: url must be a live link to an official domain — no file uploads.
export interface Evidence {
  id: string
  title: string
  source_type: SourceType
  tier: SourceTier
  url: string                   // Direct URL to original official source
  issuing_authority: string     // e.g. "Hennepin County Medical Examiner"
  date_issued: string           // ISO date: YYYY-MM-DD
  description: string           // Neutral, ≤100 words, no interpretation
  added_date: string            // When added to FACTION
  verified: boolean             // Editorial team has confirmed source authenticity
  media_type?: MediaType        // Format of the source (document, video, etc.)
  archive_url?: string          // Wayback Machine archive URL — set automatically on add
}

// ─── Submissions ──────────────────────────────────────────────────────────────
// Public submissions queue — stored in content/submissions.json
// Reviewed by editorial team in /admin/submissions
export type SubmissionType = 'new_topic' | 'new_evidence' | 'correction'

export interface Submission {
  id: string
  type: SubmissionType
  submitted_at: string          // ISO datetime
  status: 'pending' | 'accepted' | 'rejected'
  topic_title?: string
  topic_description?: string
  existing_slug?: string        // Which fact file this is for
  evidence_title?: string
  evidence_url?: string
  evidence_source?: string
  correction_detail?: string
  submitter_note: string
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
export interface TimelineEvent {
  id: string
  date: string                  // ISO date: YYYY-MM-DD
  time?: string                 // HH:MM if known
  title: string                 // Short label
  description: string           // Neutral, factual, sourced
  evidence_ids: string[]        // References Evidence.id
}

// ─── Contested Claims ─────────────────────────────────────────────────────────
// Only present when two primary sources directly contradict each other
// on a specific factual point. Never manufactured to create false balance.
export interface ContestedClaimSide {
  position: string              // The factual position this side supports
  evidence_ids: string[]        // Primary sources supporting this position
}

export interface ContestedClaim {
  id: string
  claim: string                 // The specific factual question in dispute
  context: string               // Brief neutral background
  side_a: ContestedClaimSide
  side_b: ContestedClaimSide
}

// ─── Data Panels ──────────────────────────────────────────────────────────────
export interface DataSet {
  label: string
  data: number[]
  color?: string
}

export interface DataPanel {
  id: string
  title: string
  description: string
  data_source_url: string       // Primary source for the dataset
  methodology_note: string      // What data, what period, what is NOT shown
  chart_type: 'bar' | 'line' | 'table'
  labels: string[]              // X-axis labels or row headers
  datasets: DataSet[]
}

// ─── Changelog ────────────────────────────────────────────────────────────────
// Transparent edit history. Logged manually via admin panel.
export type ChangelogEntryType = 'correction' | 'addition' | 'update' | 'status-change'

export interface ChangelogEntry {
  id: string
  date: string                    // ISO date YYYY-MM-DD
  type: ChangelogEntryType
  description: string             // What changed and why (≤200 chars)
}

// ─── Fact File ────────────────────────────────────────────────────────────────
// The core document. One per topic/event/case.
export interface FactFile {
  id: string
  slug: string                  // URL-safe identifier, e.g. "derek-chauvin-george-floyd"
  title: string
  subtitle?: string
  category: string[]            // e.g. ["policing", "criminal justice", "usa"]
  status: TopicStatus
  priority_votes: number        // Community priority votes (Phase 1: stored in DB)
  created_date: string
  last_updated: string
  summary: string               // Neutral overview — facts only, sources cited inline
  situation_context: string     // Background: who, where, when. No adjectives.
  evidence: Evidence[]
  timeline: TimelineEvent[]
  contested_claims: ContestedClaim[]  // Empty array if no genuine factual dispute
  data_panels: DataPanel[]
  resolution_note?: string      // For resolved topics: what the record shows
  reopen_threshold: string      // What constitutes "damning new evidence" to reopen
  verdict_date?: string         // ISO date of key legal verdict/ruling — used to label evidence as pre/post
  related_slugs?: string[]      // Manually curated related fact files (overrides auto-suggestions)
  changelog?: ChangelogEntry[]  // Transparent edit history — logged by editorial team
  is_draft?: boolean            // If true: hidden from public pages, accessible at /fact/[slug]?preview=true
  conflict_of_interest?: string // Disclose any editorial conflicts — shown publicly on fact file page
}

// ─── Summary card (used on homepage + search index) ───────────────────────────
export interface FactFileSummary {
  slug: string
  title: string
  subtitle?: string
  summary: string           // First 200 chars of summary — used in search index
  category: string[]
  status: TopicStatus
  priority_votes: number
  last_updated: string
  evidence_count: number
  has_contested_claims: boolean
  has_data_panels: boolean
  is_draft: boolean
}
