import { describe, expect, it } from 'vitest'
import { sampleFindings } from '../services/mockAssessmentService'
import type { AnalysisResult, UploadedPhoto } from '../types/assessment'
import { assessmentReducer as reduce, initialState, type AssessmentState } from './assessmentReducer'
import { selectCompleted, selectRecommendation } from './selectors'

const photo = (id: string): UploadedPhoto => ({
  id,
  file: {} as File,
  url: `blob:${id}`,
  view: 'overall',
  width: 100,
  height: 100,
})

const result: AnalysisResult = {
  origin: 'sample',
  suggestedCategory: 'laptop',
  findings: sampleFindings,
  unassessed: {} as AnalysisResult['unassessed'],
}

function analyzed(): AssessmentState {
  let s = reduce(initialState, { type: 'photos/add', photos: [photo('a')] })
  s = reduce(s, { type: 'analysis/start', requestId: 1, source: 'photos' })
  s = reduce(s, { type: 'analysis/success', requestId: 1, result })
  s = reduce(s, { type: 'review/setCategory', category: 'laptop' })
  s = reduce(s, { type: 'review/confirm' })
  s = reduce(s, {
    type: 'answers/set',
    patch: { powersOn: 'yes', display: 'yes', controls: 'yes', otherIssues: 'no', keepUsing: 'yes' },
  })
  return reduce(s, { type: 'answers/submit' })
}

describe('assessmentReducer', () => {
  it('produces a recommendation once every step is done', () => {
    const s = analyzed()
    expect(selectCompleted(s).results).toBe(true)
    expect(selectRecommendation(s)?.primary).toBe('reuse')
  })

  it('ignores stale analysis responses', () => {
    let s = reduce(initialState, { type: 'analysis/start', requestId: 2, source: 'demo' })
    s = reduce(s, { type: 'analysis/success', requestId: 1, result })
    expect(s.analysis.status).toBe('processing')
  })

  it('changing photos invalidates analysis and results but keeps answers', () => {
    const s = reduce(analyzed(), { type: 'photos/add', photos: [photo('b')] })
    expect(s.analysis.status).toBe('idle')
    expect(s.reviewConfirmed).toBe(false)
    expect(selectRecommendation(s)).toBeNull()
    expect(s.answers.powersOn).toBe('yes')
  })

  it('changing category drops incompatible feedback and the controls answer', () => {
    let s = reduce(analyzed(), { type: 'review/toggleFeedback', findingId: 'lap-1' })
    s = reduce(s, { type: 'review/setCategory', category: 'smartphone' })
    expect(s.feedback).toHaveLength(0)
    expect(s.answers.controls).toBeNull()
  })

  it('a screenless device completes without a display answer', () => {
    let s = reduce(analyzed(), { type: 'review/setCategory', category: 'router' })
    s = reduce(s, { type: 'answers/set', patch: { controls: 'yes' } })
    expect(s.answers.display).toBeNull()
    expect(selectCompleted(s).results).toBe(true)
    expect(selectRecommendation(s)?.primary).toBe('reuse')
  })

  it('changing answers recalculates the recommendation', () => {
    const s = reduce(analyzed(), { type: 'answers/set', patch: { keepUsing: 'no' } })
    expect(selectRecommendation(s)?.primary).toBe('resell')
  })

  it('reset clears everything', () => {
    expect(reduce(analyzed(), { type: 'reset' })).toEqual(initialState)
  })
})
