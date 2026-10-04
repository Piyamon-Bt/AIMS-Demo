import { AlertTriangle, Camera, CircleHelp, Eye, Undo2, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { findingStatusLabels } from '../../content/labels'
import type { FeedbackEntry, Finding, FindingStatus } from '../../types/assessment'
import { Button } from '../ui/Button'

const statusIcons: Record<FindingStatus, LucideIcon> = {
  damage_found: AlertTriangle,
  no_visible_damage: Eye,
  more_views_needed: Camera,
  unable_to_assess: CircleHelp,
}

interface FindingsListProps {
  findings: Finding[]
  feedback: FeedbackEntry[]
  onToggleFeedback(findingId: string): void
}

/** Accessible list of findings. Feedback is stored separately and never edits a finding. */
export function FindingsList({ findings, feedback, onToggleFeedback }: FindingsListProps) {
  const rejected = new Set(feedback.map((f) => f.findingId))
  return (
    <ol className="divide-y divide-line border-y border-line">
      {findings.map((f, i) => {
        const Icon = statusIcons[f.status]
        const isRejected = rejected.has(f.id)
        return (
          <li key={f.id} className="py-5">
            <div className={isRejected ? 'opacity-50' : ''}>
              <p className="flex flex-wrap items-baseline gap-x-2 text-[16px] text-ink">
                <span className="text-[13px] text-muted tabular-nums">{i + 1}.</span>
                <span className="font-medium">{f.damageType}</span>
                <span className="text-muted">· {f.part}</span>
              </p>
              <p className="mt-1 flex items-center gap-2 text-[14px] text-ink">
                <Icon aria-hidden className="size-4" />
                {findingStatusLabels[f.status]}
              </p>
              <p className="prose-width mt-2 text-[15px] text-muted">{f.observation}</p>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {isRejected && (
                <span className="text-[14px] text-ink">
                  Marked as incorrect — excluded from results.
                </span>
              )}
              <Button
                variant="quiet"
                className="-ml-3"
                aria-pressed={isRejected}
                aria-label={
                  isRejected
                    ? `Undo “incorrect” mark for ${f.damageType}, ${f.part}`
                    : `Mark ${f.damageType}, ${f.part} as incorrect`
                }
                onClick={() => onToggleFeedback(f.id)}
              >
                {isRejected ? (
                  <>
                    <Undo2 aria-hidden className="size-4" /> Undo
                  </>
                ) : (
                  <>
                    <XCircle aria-hidden className="size-4" /> Mark as incorrect
                  </>
                )}
              </Button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
