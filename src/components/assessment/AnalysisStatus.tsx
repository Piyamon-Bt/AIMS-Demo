import { Check, Circle, Loader2 } from 'lucide-react'
import { assessmentService } from '../../services/assessmentService'
import { useAssessment } from '../../state/AssessmentContext'
import { useNavigation } from '../../state/Navigation'
import { Button } from '../ui/Button'
import { FadeSwap } from '../ui/FadeSwap'
import { Notice } from '../ui/Notice'

export function AnalysisStatus() {
  const { state, actions } = useAssessment()
  const { goToSection } = useNavigation()
  const { analysis, photos } = state
  const stages = assessmentService.stages

  const statusLabel = {
    idle: 'Not started',
    processing: 'Processing',
    complete: 'Complete',
    failed: 'Failed',
  }[analysis.status]

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="text-[13px] tracking-[0.08em] text-muted uppercase">Status</span>
        <span className="text-[16px] font-medium text-ink">{statusLabel}</span>
      </div>

      <FadeSwap swapKey={analysis.status} className="space-y-8">
        {analysis.status === 'idle' && (
          <div className="space-y-5">
            <p className="text-[16px] text-muted">
              {analysis.cancelled
                ? 'Analysis was cancelled. Nothing was changed.'
                : photos.length
                  ? `${photos.length} photo${photos.length > 1 ? 's' : ''} ready. Analysis starts only when you choose to.`
                  : 'Add photos of your device first, or try the demo data.'}
            </p>
            <div className="flex flex-wrap gap-3">
              {photos.length > 0 ? (
                <Button onClick={() => actions.startAnalysis('photos')}>Analyze Photos</Button>
              ) : (
                <Button variant="secondary" onClick={() => goToSection('upload')}>
                  Go to Upload
                </Button>
              )}
            </div>
          </div>
        )}

        {analysis.status !== 'idle' && (
          <ol className="space-y-3" aria-label="Analysis stages">
            {stages.map((label, i) => {
              const done = analysis.status === 'complete' || i < analysis.stage
              const active = analysis.status === 'processing' && i === analysis.stage
              const failedHere = analysis.status === 'failed' && i === analysis.stage
              return (
                <li key={label} className="flex items-center gap-3 text-[16px]">
                  {done ? (
                    <Check aria-hidden className="size-4 text-ink" />
                  ) : active ? (
                    <Loader2 aria-hidden className="size-4 animate-spin text-ink motion-reduce:animate-none" />
                  ) : (
                    <Circle aria-hidden className="size-4 text-neutral-300" />
                  )}
                  <span className={done || active ? 'text-ink' : 'text-muted'}>{label}</span>
                  <span className="text-[13px] text-muted">
                    {done ? 'Done' : active ? 'In progress' : failedHere ? 'Stopped' : ''}
                  </span>
                </li>
              )
            })}
          </ol>
        )}

        {analysis.status === 'processing' && (
          <div className="space-y-4">
            <p className="text-[16px] text-muted">
              {analysis.source === 'demo' ? 'Loading demo data…' : 'Preparing sample findings…'}
            </p>
            <Button variant="secondary" onClick={actions.cancelAnalysis}>
              Cancel
            </Button>
          </div>
        )}

        {analysis.status === 'complete' && (
          <div className="space-y-4">
            <p className="text-[16px] text-ink">Sample findings are ready to review.</p>
            <Button onClick={() => goToSection('review')}>Review Findings</Button>
          </div>
        )}

        {analysis.status === 'failed' && (
          <div className="space-y-4">
            <p role="alert" className="text-[16px] text-danger">
              Analysis failed. {analysis.error}
            </p>
            <Button onClick={() => actions.startAnalysis(analysis.source ?? 'photos')}>Retry</Button>
          </div>
        )}

      </FadeSwap>
      <Notice>
        Demo mode: no image is inspected. Results are fixed sample data for testing the workflow.
      </Notice>

      <details className="text-[14px] text-muted">
        <summary className="inline-flex min-h-11 cursor-pointer items-center">Demo controls</summary>
        <label className="mt-2 flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            className="size-4 accent-[var(--color-ink)]"
            checked={state.simulateFailure}
            onChange={(e) => actions.setSimulateFailure(e.target.checked)}
          />
          Simulate an analysis failure on the next run
        </label>
      </details>
    </div>
  )
}
