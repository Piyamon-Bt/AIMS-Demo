// Core domain types for the ReLoop assessment workflow.

export type SectionId = 'upload' | 'analyze' | 'review' | 'functionality' | 'results'

export type DeviceCategory =
  | 'laptop'
  | 'smartphone'
  | 'tablet'
  | 'computer'
  | 'keyboard'
  | 'mouse'
  | 'printer'
  | 'router'

export type ViewLabel = 'overall' | 'front' | 'back' | 'side' | 'damage' | 'other'

/** A device photo supplied by the user. Never mixed with editorial assets. */
export interface UploadedPhoto {
  id: string
  file: File
  /** Temporary object URL — revoked when the photo is removed or replaced. */
  url: string
  view: ViewLabel
  width: number
  height: number
}

/** Where the analysis inputs came from. */
export type InputSource = 'photos' | 'demo'

export type AnalysisStatus = 'idle' | 'processing' | 'complete' | 'failed'

export type FindingStatus =
  | 'damage_found'
  | 'no_visible_damage'
  | 'more_views_needed'
  | 'unable_to_assess'

export type Severity = 'minor' | 'moderate' | 'severe'

/** Normalized (0–1) box relative to the natural image size. */
export interface BoundingBox {
  imageId: string
  x: number
  y: number
  width: number
  height: number
}

export interface Finding {
  id: string
  category: DeviceCategory
  damageType: string
  part: string
  observation: string
  status: FindingStatus
  severity?: Severity
  /** Damage confined to one replaceable area (e.g. a screen corner). */
  localized?: boolean
  /** Only rendered when an image with this exact id is on screen. */
  box?: BoundingBox
}

export interface AnalysisResult {
  /** 'sample' = fixture data, not derived from the user's photos. */
  origin: 'sample' | 'model'
  suggestedCategory: DeviceCategory | null
  findings: Finding[]
  unassessed: Record<DeviceCategory, string[]>
}

export type Answer = 'yes' | 'partial' | 'no' | 'unknown'
export type YesNoUnknown = 'yes' | 'no' | 'unknown'

export interface FunctionalityAnswers {
  powersOn: Answer | null
  display: Answer | null
  controls: Answer | null
  otherIssues: YesNoUnknown | null
  otherIssuesDetail: string
  keepUsing: YesNoUnknown | null
  brand: string
  model: string
  notes: string
}

export type RequiredAnswerKey = 'powersOn' | 'display' | 'controls' | 'otherIssues' | 'keepUsing'

export interface FeedbackEntry {
  findingId: string
  kind: 'incorrect'
  createdAt: number
}

export type Outcome = 'reuse' | 'repair' | 'resell' | 'recycle' | 'further_assessment'

export interface Recommendation {
  primary: Outcome
  alternatives: Outcome[]
  /** Plain-English, rule-derived reasons. */
  reasons: string[]
  nextActions: string[]
  /** null = "Estimate unavailable". Never invented. */
  priceEstimate: { amount: number; currency: string; illustrative: true } | null
}
