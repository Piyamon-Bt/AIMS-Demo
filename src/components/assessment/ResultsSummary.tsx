import { Check, Circle, Pencil, Printer } from 'lucide-react'
import {
  answerLabels,
  categoryLabels,
  findingStatusLabels,
  outcomeLabels,
  outcomeSummaries,
  yesNoUnknownLabels,
} from '../../content/labels'
import { resultsCopy } from '../../content/sections'
import { useAssessment } from '../../state/AssessmentContext'
import { useNavigation } from '../../state/Navigation'
import {
  selectActiveFindings,
  selectCompleted,
  selectFunctionalityDone,
  selectHasDisplay,
  selectRecommendation,
  selectUnassessed,
} from '../../state/selectors'
import type { Answer, SectionId } from '../../types/assessment'
import { StartOverDialog } from '../layout/StartOverDialog'
import { Button } from '../ui/Button'
import { FadeSwap } from '../ui/FadeSwap'

const DISCLOSURE =
  'Demo mode: findings are sample data, not an analysis of your photos. This report is not a professional inspection.'

export function ResultsSummary() {
  const { state } = useAssessment()
  const { goToSection } = useNavigation()
  const recommendation = selectRecommendation(state)

  if (!recommendation) {
    const done = selectCompleted(state)
    const steps: { label: string; ok: boolean; target: SectionId; action: string }[] = [
      { label: 'Analysis complete', ok: done.analyze, target: done.upload ? 'analyze' : 'upload', action: done.upload ? 'Go to Analyze' : 'Go to Upload' },
      { label: 'Category confirmed and findings reviewed', ok: done.review, target: 'review', action: 'Go to Review' },
      { label: 'Functionality questions answered', ok: selectFunctionalityDone(state), target: 'functionality', action: 'Go to Functionality' },
    ]
    return (
      <FadeSwap swapKey="pending" className="space-y-6">
        <p className="text-[16px] text-muted">Your results appear here once these steps are done:</p>
        <ul className="space-y-3">
          {steps.map((s) => (
            <li key={s.label} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[16px]">
              {s.ok ? <Check aria-hidden className="size-4" /> : <Circle aria-hidden className="size-4 text-neutral-300" />}
              <span className={s.ok ? 'text-ink' : 'text-muted'}>
                {s.label}
                <span className="sr-only">{s.ok ? ' — done' : ' — not done yet'}</span>
              </span>
              {!s.ok && (
                <Button variant="quiet" onClick={() => goToSection(s.target)}>
                  {s.action}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </FadeSwap>
    )
  }

  const { answers, confirmedCategory } = state
  const hasDisplay = selectHasDisplay(state)
  const rejected = new Set(state.feedback.map((f) => f.findingId))
  const findings = selectActiveFindings(state)
  const damage = findings.filter((f) => f.status === 'damage_found' && !rejected.has(f.id))
  const unknownItems = [
    ...findings
      .filter((f) => (f.status === 'more_views_needed' || f.status === 'unable_to_assess') && !rejected.has(f.id))
      .map((f) => `${f.part} — ${findingStatusLabels[f.status].toLowerCase()}`),
    ...selectUnassessed(state),
    ...(
      [
        ['Power', answers.powersOn],
        ...(hasDisplay ? [['Display', answers.display]] : []),
        ['Controls', answers.controls],
      ] as [string, Answer | null][]
    )
      .filter(([, a]) => a === 'unknown')
      .map(([label]) => `${label} — not tested`),
  ]
  const deviceName = [answers.brand, answers.model].filter(Boolean).join(' ')

  return (
    <FadeSwap swapKey={`result-${recommendation.primary}`}>
      <article aria-label="Assessment report" className="space-y-14">
        <p className="rounded-sm border border-line px-4 py-3 text-[14px] text-ink">{DISCLOSURE}</p>

        {/* Recommendation */}
        <div className="print-break-avoid">
          <p className="text-[13px] tracking-[0.08em] text-muted uppercase">Recommended next step</p>
          <p className="mt-2 text-[clamp(1.75rem,1.4rem+1.6vw,2.5rem)] leading-tight font-medium text-ink">
            {outcomeLabels[recommendation.primary]}
          </p>
          <p className="mt-2 text-[16px] text-ink">{outcomeSummaries[recommendation.primary]}</p>
          <p className="prose-width mt-4 text-[16px] text-muted">{resultsCopy.explanation}</p>
          <h3 className="mt-8 text-[15px] font-medium text-ink">Why</h3>
          <ul className="mt-2 space-y-1.5 text-[15px] text-ink">
            {recommendation.reasons.map((r) => (
              <li key={r} className="flex gap-2">
                <span aria-hidden className="text-muted">–</span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Next actions */}
        <div className="print-break-avoid">
          <h3 className="text-[17px] font-medium text-ink">What to do next</h3>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px] text-ink marker:text-muted">
            {recommendation.nextActions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
        </div>

        {/* Alternatives */}
        {recommendation.alternatives.length > 0 && (
          <div className="print-break-avoid">
            <h3 className="text-[17px] font-medium text-ink">Alternative options</h3>
            <p className="prose-width mt-2 text-[15px] text-muted">{resultsCopy.alternativesIntro}</p>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {recommendation.alternatives.map((o) => (
                <div key={o} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-6">
                  <dt className="text-[15px] font-medium text-ink">{outcomeLabels[o]}</dt>
                  <dd className="text-[15px] text-muted">{outcomeSummaries[o]}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Summary */}
        <div className="print-break-avoid">
          <h3 className="text-[17px] font-medium text-ink">Summary</h3>
          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 text-[15px] sm:grid-cols-[200px_1fr]">
            <dt className="text-muted">Device</dt>
            <dd className="text-ink">
              {confirmedCategory && categoryLabels[confirmedCategory]}
              {deviceName && ` · ${deviceName}`}
            </dd>

            <dt className="text-muted">Visible findings (sample)</dt>
            <dd className="text-ink">
              {damage.length ? (
                <ul className="space-y-1">
                  {damage.map((f) => (
                    <li key={f.id}>
                      {f.damageType} — {f.part}
                    </li>
                  ))}
                </ul>
              ) : (
                'No visible damage recorded'
              )}
              {rejected.size > 0 && (
                <p className="mt-1 text-muted">
                  {rejected.size} finding{rejected.size > 1 ? 's' : ''} marked as incorrect and excluded.
                </p>
              )}
            </dd>

            <dt className="text-muted">Reported functionality</dt>
            <dd className="text-ink">
              <ul className="space-y-1">
                <li>Powers on: {answerLabels[answers.powersOn!]}</li>
                {hasDisplay && <li>Display: {answerLabels[answers.display!]}</li>}
                <li>Controls: {answerLabels[answers.controls!]}</li>
                <li>
                  Other issues: {yesNoUnknownLabels[answers.otherIssues!]}
                  {answers.otherIssuesDetail && ` — ${answers.otherIssuesDetail}`}
                </li>
                <li>Wants to keep using: {yesNoUnknownLabels[answers.keepUsing!]}</li>
              </ul>
            </dd>

            <dt className="text-muted">Unknown information</dt>
            <dd className="text-ink">
              {unknownItems.length ? (
                <ul className="space-y-1">
                  {unknownItems.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              ) : (
                'None'
              )}
            </dd>

            <dt className="text-muted">Estimated value</dt>
            <dd className="text-ink">Estimate unavailable</dd>

            {answers.notes && (
              <>
                <dt className="text-muted">Your notes</dt>
                <dd className="text-ink whitespace-pre-line">{answers.notes}</dd>
              </>
            )}
          </dl>
        </div>

        <div data-print="hide" className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => goToSection('functionality')}>
            <Pencil aria-hidden className="size-4" /> Edit Details
          </Button>
          <StartOverDialog trigger={<Button variant="secondary">Start New Assessment</Button>} />
          <Button onClick={() => window.print()}>
            <Printer aria-hidden className="size-4" /> Print / Save as PDF
          </Button>
        </div>
      </article>
    </FadeSwap>
  )
}
