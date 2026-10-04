import { deviceById } from '../content/devices'
import { missingAnswers, recommend } from '../rules/recommendations'
import type { Finding, Recommendation, SectionId } from '../types/assessment'
import type { AssessmentState } from './assessmentReducer'

export function selectActiveFindings(s: AssessmentState): Finding[] {
  const result = s.analysis.result
  if (!result || !s.confirmedCategory) return []
  return result.findings.filter((f) => f.category === s.confirmedCategory)
}

export function selectUnassessed(s: AssessmentState): string[] {
  const result = s.analysis.result
  if (!result || !s.confirmedCategory) return []
  return result.unassessed[s.confirmedCategory]
}

/** Whether the display question applies to the chosen device. */
export function selectHasDisplay(s: AssessmentState) {
  return s.confirmedCategory ? deviceById[s.confirmedCategory].hasDisplay : true
}

export function selectFunctionalityDone(s: AssessmentState) {
  return s.functionalitySubmitted && missingAnswers(s.answers, selectHasDisplay(s)).length === 0
}

/** Workflow completion — driven only by user actions, never by scrolling. */
export function selectCompleted(s: AssessmentState): Record<SectionId, boolean> {
  const analysisRequested = s.analysis.status !== 'idle'
  const analysisDone = s.analysis.status === 'complete'
  const reviewDone = analysisDone && s.reviewConfirmed && s.confirmedCategory !== null
  const functionalityDone = selectFunctionalityDone(s)
  return {
    upload: analysisRequested,
    analyze: analysisDone,
    review: reviewDone,
    functionality: functionalityDone,
    results: reviewDone && functionalityDone,
  }
}

/** Short note shown when a section's required data is missing. */
export function selectPrerequisites(s: AssessmentState): Partial<Record<SectionId, string>> {
  const done = selectCompleted(s)
  const notes: Partial<Record<SectionId, string>> = {}
  if (s.analysis.status === 'idle') {
    notes.analyze = s.photos.length ? 'Ready to start' : 'Needs photos'
  }
  if (!done.analyze) notes.review = 'After analysis'
  if (!done.results) notes.results = !done.review ? 'Needs review' : 'Needs answers'
  return notes
}

export function selectRecommendation(s: AssessmentState): Recommendation | null {
  if (!selectCompleted(s).results) return null
  return recommend({
    findings: selectActiveFindings(s),
    feedback: s.feedback,
    answers: s.answers,
    hasDisplay: selectHasDisplay(s),
  })
}
