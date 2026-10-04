import { categoryLabels, viewLabels } from '../../content/labels'
import { useAssessment } from '../../state/AssessmentContext'
import { useNavigation } from '../../state/Navigation'
import { selectActiveFindings, selectUnassessed } from '../../state/selectors'
import type { DeviceCategory } from '../../types/assessment'
import { Button } from '../ui/Button'
import { ChoiceGroup } from '../ui/ChoiceGroup'
import { FadeSwap } from '../ui/FadeSwap'
import { Notice } from '../ui/Notice'
import { EvidenceViewer } from './EvidenceViewer'
import { FindingsList } from './FindingsList'

const categoryOptions = (Object.keys(categoryLabels) as DeviceCategory[]).map((value) => ({
  value,
  label: categoryLabels[value],
}))

export function ReviewPanel() {
  const { state, actions } = useAssessment()
  const { goToSection } = useNavigation()
  const { analysis, photos, confirmedCategory } = state
  const result = analysis.result

  if (analysis.status !== 'complete' || !result) {
    return (
      <div className="space-y-5">
        <Notice>Findings appear here once an analysis has completed.</Notice>
        <Button
          variant="secondary"
          onClick={() => goToSection(analysis.status === 'idle' && !photos.length ? 'upload' : 'analyze')}
        >
          {analysis.status === 'idle' && !photos.length ? 'Go to Upload' : 'Go to Analyze'}
        </Button>
      </div>
    )
  }

  const findings = selectActiveFindings(state)
  const unassessed = selectUnassessed(state)
  const usedPhotos = analysis.source === 'photos' ? photos : []

  return (
    <FadeSwap swapKey={`ready-${confirmedCategory}`} className="space-y-14">
      <ChoiceGroup
        legend="Device category"
        hint={
          confirmedCategory
            ? 'Selected in step 01. Change it here if needed.'
            : result.suggestedCategory
              ? `Sample suggestion: ${categoryLabels[result.suggestedCategory]}. Confirm or correct it.`
              : 'Select the type of device.'
        }
        name="device-category"
        value={confirmedCategory}
        options={categoryOptions}
        onChange={actions.setCategory}
      />

      {!confirmedCategory ? (
        <Notice>Confirm the device category to see the findings for that device type.</Notice>
      ) : (
        <>
          {/* Uploaded evidence */}
          <div>
            <h3 className="mb-4 text-[17px] font-medium text-ink">Your photos</h3>
            {usedPhotos.length ? (
              <EvidenceViewer photos={usedPhotos} findings={findings} />
            ) : (
              <p className="text-[15px] text-muted">
                Demo data was used, so no photos are attached to this assessment.
              </p>
            )}
          </div>

          {/* Sample findings — clearly separated */}
          <div>
            <h3 className="text-[17px] font-medium text-ink">Visual findings</h3>
            <p className="mt-2 mb-5 inline-block rounded-sm border border-line px-3 py-1.5 text-[14px] text-ink">
              Sample findings — not derived from your uploaded photos.
            </p>
            <FindingsList
              findings={findings}
              feedback={state.feedback}
              onToggleFeedback={actions.toggleFeedback}
            />
            <p className="mt-3 text-[14px] text-muted">
              “No visible damage detected” does not mean the device is fully functional.
            </p>
          </div>

          {/* User-provided */}
          <div>
            <h3 className="text-[17px] font-medium text-ink">Information you provided</h3>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[15px]">
              <dt className="text-muted">Category</dt>
              <dd className="text-ink">{categoryLabels[confirmedCategory]}</dd>
              <dt className="text-muted">Photos</dt>
              <dd className="text-ink">
                {usedPhotos.length
                  ? usedPhotos.map((p) => viewLabels[p.view]).join(', ')
                  : 'None (demo data)'}
              </dd>
            </dl>
          </div>

          {/* Unassessed */}
          <div>
            <h3 className="text-[17px] font-medium text-ink">Not assessed</h3>
            <p className="mt-1 text-[15px] text-muted">These cannot be judged from photos.</p>
            <ul className="mt-3 space-y-1 text-[15px] text-ink">
              {unassessed.map((u) => (
                <li key={u} className="flex gap-2">
                  <span aria-hidden className="text-muted">
                    –
                  </span>
                  {u}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Button
              onClick={() => {
                actions.confirmReview()
                goToSection('functionality')
              }}
            >
              Continue to Functionality
            </Button>
          </div>
        </>
      )}
    </FadeSwap>
  )
}
