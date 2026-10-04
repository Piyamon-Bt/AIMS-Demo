import { useId, useState, type FormEvent } from 'react'
import { deviceById } from '../../content/devices'
import { answerLabels, yesNoUnknownLabels } from '../../content/labels'
import { missingAnswers } from '../../rules/recommendations'
import { useAssessment } from '../../state/AssessmentContext'
import { useNavigation } from '../../state/Navigation'
import type { Answer, RequiredAnswerKey, YesNoUnknown } from '../../types/assessment'
import { Button } from '../ui/Button'
import { ChoiceGroup } from '../ui/ChoiceGroup'

const answerOptions = (['yes', 'partial', 'no', 'unknown'] as Answer[]).map((value) => ({
  value,
  label: answerLabels[value],
}))
const ynuOptions = (['yes', 'no', 'unknown'] as YesNoUnknown[]).map((value) => ({
  value,
  label: yesNoUnknownLabels[value],
}))

const REQUIRED_MSG = 'Choose an answer. “Not sure” is fine.'

const inputClass =
  'mt-1 min-h-11 w-full rounded-md border border-line bg-white px-3 text-[16px] text-ink focus:border-ink'

/** Stationary form — never animated or parallaxed. */
export function FunctionalityForm() {
  const { state, actions } = useAssessment()
  const { goToSection } = useNavigation()
  const uid = useId()
  const [errors, setErrors] = useState<RequiredAnswerKey[]>([])
  const { answers, confirmedCategory } = state
  const fid = (k: string) => `${uid}-${k}`

  const device = confirmedCategory ? deviceById[confirmedCategory] : null
  const hasDisplay = device?.hasDisplay ?? true
  const controlsLegend = device?.controlsQuestion ?? 'Do the keyboard or touchscreen controls work?'

  const err = (k: RequiredAnswerKey) => (errors.includes(k) ? REQUIRED_MSG : undefined)

  function set<K extends keyof typeof answers>(key: K, value: (typeof answers)[K]) {
    actions.setAnswers({ [key]: value })
    if (errors.includes(key as RequiredAnswerKey)) {
      setErrors((e) => e.filter((x) => x !== key))
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const missing = missingAnswers(answers, hasDisplay)
    setErrors(missing)
    if (missing.length) {
      document.getElementById(fid(missing[0]))?.querySelector('input')?.focus()
      return
    }
    actions.submitFunctionality()
    goToSection('results')
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-10">
      <ChoiceGroup
        id={fid('powersOn')}
        legend="Does the device power on?"
        hint={device?.powerHint}
        name="powersOn"
        value={answers.powersOn}
        options={answerOptions}
        onChange={(v) => set('powersOn', v)}
        error={err('powersOn')}
      />
      {hasDisplay && (
        <ChoiceGroup
          id={fid('display')}
          legend={device?.displayQuestion ?? 'Does the display work?'}
          hint="No dead areas, lines or flicker."
          name="display"
          value={answers.display}
          options={answerOptions}
          onChange={(v) => set('display', v)}
          error={err('display')}
        />
      )}
      <ChoiceGroup
        id={fid('controls')}
        legend={controlsLegend}
        name="controls"
        value={answers.controls}
        options={answerOptions}
        onChange={(v) => set('controls', v)}
        error={err('controls')}
      />
      <div className="space-y-4">
        <ChoiceGroup
          id={fid('otherIssues')}
          legend="Have you noticed any other issues?"
          hint="For example battery, speakers, camera, charging or overheating."
          name="otherIssues"
          value={answers.otherIssues}
          options={ynuOptions}
          onChange={(v) => set('otherIssues', v)}
          error={err('otherIssues')}
        />
        {answers.otherIssues === 'yes' && (
          <div>
            <label htmlFor={fid('otherDetail')} className="text-[15px] text-ink">
              Describe the issues <span className="text-muted">(optional)</span>
            </label>
            <textarea
              id={fid('otherDetail')}
              rows={3}
              value={answers.otherIssuesDetail}
              onChange={(e) => set('otherIssuesDetail', e.target.value)}
              className={`${inputClass} py-2`}
            />
          </div>
        )}
      </div>
      <ChoiceGroup
        id={fid('keepUsing')}
        legend="Would you like to continue using this device?"
        name="keepUsing"
        value={answers.keepUsing}
        options={ynuOptions}
        onChange={(v) => set('keepUsing', v)}
        error={err('keepUsing')}
      />

      <fieldset className="space-y-4">
        <legend className="mb-3 text-[16px] font-medium text-ink">
          Device details <span className="font-normal text-muted">(optional)</span>
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={fid('brand')} className="text-[15px] text-ink">
              Brand
            </label>
            <input
              id={fid('brand')}
              value={answers.brand}
              onChange={(e) => set('brand', e.target.value)}
              autoComplete="off"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={fid('model')} className="text-[15px] text-ink">
              Model
            </label>
            <input
              id={fid('model')}
              value={answers.model}
              onChange={(e) => set('model', e.target.value)}
              autoComplete="off"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor={fid('notes')} className="text-[15px] text-ink">
            Additional notes
          </label>
          <textarea
            id={fid('notes')}
            rows={3}
            value={answers.notes}
            onChange={(e) => set('notes', e.target.value)}
            className={`${inputClass} py-2`}
          />
        </div>
      </fieldset>

      <div className="space-y-3">
        <Button type="submit">View Results</Button>
        {errors.length > 0 && (
          <p role="alert" className="text-[15px] text-danger">
            {errors.length === 1
              ? 'One question still needs an answer.'
              : `${errors.length} questions still need an answer.`}
          </p>
        )}
      </div>
    </form>
  )
}
