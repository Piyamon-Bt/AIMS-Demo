// Deterministic recommendation rules.
//
// Principles:
// - Functionality is never inferred from the absence of visible damage.
// - Visible damage (even severe) or missing parts never imply Recycle on their own.
// - A photo alone never establishes that repair is impossible.

import type {
  RequiredAnswerKey,
  FeedbackEntry,
  Finding,
  FunctionalityAnswers,
  Outcome,
  Recommendation,
} from '../types/assessment'

export interface RecommendationInput {
  findings: Finding[]
  feedback: FeedbackEntry[]
  answers: FunctionalityAnswers
  /** False for devices without a screen (keyboard, mouse, printer, router). */
  hasDisplay?: boolean
}

const unique = (items: Outcome[], exclude: Outcome): Outcome[] =>
  [...new Set(items)].filter((o) => o !== exclude)

const REQUIRED: RequiredAnswerKey[] = ['powersOn', 'display', 'controls', 'otherIssues', 'keepUsing']

/** Required questions not yet answered ("Not sure" counts as an answer). */
export function missingAnswers(answers: FunctionalityAnswers, hasDisplay = true): RequiredAnswerKey[] {
  return REQUIRED.filter((k) => (k !== 'display' || hasDisplay) && answers[k] === null)
}

export function recommend({
  findings,
  feedback,
  answers,
  hasDisplay = true,
}: RecommendationInput): Recommendation {
  const rejected = new Set(feedback.filter((f) => f.kind === 'incorrect').map((f) => f.findingId))
  const accepted = findings.filter((f) => !rejected.has(f.id))
  const damage = accepted.filter((f) => f.status === 'damage_found')
  const localizedDamage = damage.some((f) => f.localized)
  const hasDamage = damage.length > 0
  const needsViews = accepted.some(
    (f) => f.status === 'more_views_needed' || f.status === 'unable_to_assess',
  )

  const core = hasDisplay
    ? [answers.powersOn, answers.display, answers.controls]
    : [answers.powersOn, answers.controls]
  const coreUnknown = core.some((a) => a === null || a === 'unknown')
  const allWorking = core.every((a) => a === 'yes')
  const anyFault = core.some((a) => a === 'no' || a === 'partial')
  const allDead = core.every((a) => a === 'no')
  const otherIssues = answers.otherIssues === 'yes'
  const keep = answers.keepUsing

  const reasons: string[] = []
  const nextActions: string[] = []
  let primary: Outcome
  let alternatives: Outcome[] = []

  if (answers.powersOn === 'unknown' || answers.powersOn === null) {
    primary = 'further_assessment'
    reasons.push('It is not yet known whether the device powers on.')
    nextActions.push('Charge the device and try to power it on.')
    alternatives = hasDamage ? ['repair', 'resell'] : ['reuse', 'resell']
  } else if (allWorking) {
    if (keep === 'no') {
      primary = 'resell'
      reasons.push('The device is reported as working and is no longer wanted.')
      nextActions.push('Back up and factory-reset the device before selling.')
      if (hasDamage) {
        reasons.push('Reported visible damage should be disclosed to buyers.')
        nextActions.push('Describe and photograph any visible damage in the listing.')
      }
      alternatives = ['reuse', ...(hasDamage ? (['repair'] as Outcome[]) : []), 'recycle']
    } else {
      primary = 'reuse'
      reasons.push(
        keep === 'yes'
          ? 'The device is reported as working and you would like to keep using it.'
          : 'The device is reported as working.',
      )
      if (hasDamage) {
        reasons.push(
          localizedDamage
            ? 'Localized visible damage could be repaired to extend its life.'
            : 'Visible damage was noted; a repair quote may be worthwhile.',
        )
        nextActions.push('Request a repair quote for the visible damage.')
        alternatives = ['repair', 'resell']
      } else {
        alternatives = ['resell']
      }
    }
  } else if (coreUnknown) {
    primary = 'further_assessment'
    reasons.push('Some core functions have not been tested yet.')
    nextActions.push('Test the remaining functions, then update your answers.')
    alternatives = ['repair', 'resell']
  } else if (allDead && keep === 'no') {
    // Functional evidence (not visual damage) drives this outcome.
    primary = 'recycle'
    reasons.push('The device is reported as not powering on, and nothing else works.')
    reasons.push('You no longer want to use it.')
    reasons.push('A repair assessment remains possible if you would like a second opinion.')
    nextActions.push('Find a certified e-waste recycler or manufacturer take-back program.')
    nextActions.push('Remove any SIM or memory cards first.')
    alternatives = ['repair', 'resell']
  } else {
    primary = 'repair'
    if (answers.powersOn === 'no') {
      reasons.push('The device is reported as not powering on. This is often repairable.')
    } else if (anyFault) {
      reasons.push('Some functions are reported as not working or only partially working.')
    }
    if (localizedDamage) reasons.push('Visible damage appears to be localized to specific parts.')
    nextActions.push('Request a repair assessment from a qualified technician.')
    alternatives = ['resell', 'further_assessment', 'recycle']
  }

  if (otherIssues) {
    reasons.push('You reported other issues that should be checked.')
    nextActions.push('Mention the other issues you noticed to whoever inspects the device.')
    if (primary !== 'repair') alternatives = ['repair', ...alternatives]
  }
  if (needsViews) {
    nextActions.push('Add more photos of the areas marked “More views needed” or “Unable to assess”.')
  }
  if (rejected.size > 0) {
    reasons.push('Findings you marked as incorrect were excluded.')
  }
  nextActions.push('Back up your personal data before handing the device to anyone.')

  return {
    primary,
    alternatives: unique(alternatives, primary),
    reasons,
    nextActions: [...new Set(nextActions)],
    priceEstimate: null,
  }
}
