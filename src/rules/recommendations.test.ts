import { describe, expect, it } from 'vitest'
import { sampleFindings } from '../services/mockAssessmentService'
import { emptyAnswers } from '../state/assessmentReducer'
import type { Finding, FunctionalityAnswers } from '../types/assessment'
import { missingAnswers, recommend } from './recommendations'

const laptop = sampleFindings.filter((f) => f.category === 'laptop')
const noDamage: Finding[] = laptop.filter((f) => f.status !== 'damage_found')
const severe: Finding[] = [
  {
    id: 's1',
    category: 'laptop',
    damageType: 'Shattered display',
    part: 'Display',
    observation: '',
    status: 'damage_found',
    severity: 'severe',
  },
]

const answers = (patch: Partial<FunctionalityAnswers>): FunctionalityAnswers => ({
  ...emptyAnswers,
  powersOn: 'yes',
  display: 'yes',
  controls: 'yes',
  otherIssues: 'no',
  keepUsing: 'yes',
  ...patch,
})

describe('recommend', () => {
  it('working and wanted → Reuse, with repair offered for damage', () => {
    const r = recommend({ findings: laptop, feedback: [], answers: answers({}) })
    expect(r.primary).toBe('reuse')
    expect(r.alternatives).toContain('repair')
  })

  it('working and not wanted → Resell with condition disclosure', () => {
    const r = recommend({ findings: laptop, feedback: [], answers: answers({ keepUsing: 'no' }) })
    expect(r.primary).toBe('resell')
    expect(r.nextActions.join(' ')).toMatch(/damage/i)
  })

  it('unknown power state → Further Assessment', () => {
    const r = recommend({ findings: noDamage, feedback: [], answers: answers({ powersOn: 'unknown' }) })
    expect(r.primary).toBe('further_assessment')
  })

  it('does not infer functionality from absence of damage', () => {
    const r = recommend({
      findings: noDamage,
      feedback: [],
      answers: answers({ display: 'unknown', controls: 'unknown' }),
    })
    expect(r.primary).toBe('further_assessment')
  })

  it('severe visible damage alone never implies Recycle', () => {
    const r = recommend({ findings: severe, feedback: [], answers: answers({ keepUsing: 'no' }) })
    expect(r.primary).not.toBe('recycle')
  })

  it('not powering on → Repair assessment, not Recycle', () => {
    const r = recommend({ findings: severe, feedback: [], answers: answers({ powersOn: 'no' }) })
    expect(r.primary).toBe('repair')
  })

  it('findings marked incorrect are excluded', () => {
    const feedback = laptop
      .filter((f) => f.status === 'damage_found')
      .map((f) => ({ findingId: f.id, kind: 'incorrect' as const, createdAt: 0 }))
    const r = recommend({ findings: laptop, feedback, answers: answers({}) })
    expect(r.alternatives).not.toContain('repair')
  })

  it('never invents a price', () => {
    const r = recommend({ findings: laptop, feedback: [], answers: answers({}) })
    expect(r.priceEstimate).toBeNull()
  })

  it('primary never repeats in alternatives', () => {
    for (const keepUsing of ['yes', 'no', 'unknown'] as const) {
      for (const powersOn of ['yes', 'partial', 'no', 'unknown'] as const) {
        const r = recommend({ findings: laptop, feedback: [], answers: answers({ keepUsing, powersOn, otherIssues: 'yes' }) })
        expect(r.alternatives).not.toContain(r.primary)
      }
    }
  })
})

describe('devices without a display', () => {
  it('does not require or use the display answer', () => {
    const a = answers({ display: null })
    expect(missingAnswers(a, false)).toEqual([])
    expect(missingAnswers(a, true)).toEqual(['display'])
    const r = recommend({ findings: [], feedback: [], answers: a, hasDisplay: false })
    expect(r.primary).toBe('reuse')
  })
})

describe('missingAnswers', () => {
  it('treats "Not sure" as answered', () => {
    expect(missingAnswers(answers({ display: 'unknown' }))).toEqual([])
    expect(missingAnswers(emptyAnswers)).toHaveLength(5)
  })
})
