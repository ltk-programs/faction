import type { SourceType } from '@/types'

const LABELS: Record<SourceType, string> = {
  government_document:  'Government Document',
  court_filing:         'Court Filing',
  body_cam_footage:     'Body Camera Footage',
  official_statement:   'Official Statement',
  peer_reviewed_study:  'Peer-Reviewed Study',
  statistical_dataset:  'Statistical Dataset',
  financial_filing:     'Financial Filing',
  official_testimony:   'Official Testimony',
  surveillance_footage: 'Surveillance Footage',
  press_conference:     'Press Conference',
  legislative_record:   'Legislative Record',
  autopsy_report:       'Autopsy Report',
  investigation_report: 'Investigation Report',
  other_tier3:          'Community Source (Tier 3)',
}

export const SOURCE_TYPE_OPTIONS: SourceType[] = Object.keys(LABELS) as SourceType[]

export function SourceTypeLabel({ type }: { type: SourceType }) {
  return <span className="text-slate-500 text-xs">{LABELS[type]}</span>
}
