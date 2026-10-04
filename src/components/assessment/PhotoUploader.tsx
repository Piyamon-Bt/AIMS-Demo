import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react'
import { useId, useRef, useState, type DragEvent } from 'react'
import { viewLabels } from '../../content/labels'
import { ACCEPT_ATTR, MAX_PHOTOS, preparePhotos } from '../../lib/photos'
import { useAssessment } from '../../state/AssessmentContext'
import { useNavigation } from '../../state/Navigation'
import type { ViewLabel } from '../../types/assessment'
import { Button } from '../ui/Button'
import { Notice } from '../ui/Notice'

const GUIDANCE = [
  'Use good lighting.',
  'Keep the device in focus.',
  'Include close-ups of visible damage.',
]

export function PhotoUploader() {
  const { state, actions } = useAssessment()
  const { goToSection } = useNavigation()
  const uid = useId()
  const addInput = useRef<HTMLInputElement>(null)
  const replaceInput = useRef<HTMLInputElement>(null)
  const replacingId = useRef<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { photos } = state
  const processing = state.analysis.status === 'processing'
  const slots = MAX_PHOTOS - photos.length
  const errorId = `${uid}-errors`
  const submitErrorId = `${uid}-submit-error`

  async function addFiles(files: File[]) {
    if (!files.length) return
    setSubmitError(null)
    if (slots <= 0) {
      setErrors([`You already have ${MAX_PHOTOS} photos. Remove one to add another.`])
      return
    }
    setBusy(true)
    const { accepted, errors } = await preparePhotos(
      files,
      slots,
      photos.map((p) => p.view),
    )
    setBusy(false)
    setErrors(errors)
    if (accepted.length) actions.addPhotos(accepted)
  }

  async function replaceFile(file: File | undefined) {
    const id = replacingId.current
    replacingId.current = null
    if (!file || !id) return
    const current = photos.find((p) => p.id === id)
    if (!current) return
    setBusy(true)
    const { accepted, errors } = await preparePhotos([file], 1, [])
    setBusy(false)
    setErrors(errors)
    if (accepted[0]) actions.replacePhoto(id, { ...accepted[0], view: current.view })
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    void addFiles(Array.from(e.dataTransfer.files))
  }

  function analyze() {
    if (!photos.length) {
      setSubmitError('Add at least one photo to analyze.')
      return
    }
    if (actions.startAnalysis('photos')) goToSection('analyze')
  }

  function tryDemo() {
    setSubmitError(null)
    if (actions.startAnalysis('demo')) goToSection('analyze')
  }

  return (
    <div className="space-y-10">
      <p className="text-[15px] text-muted">
        Add up to {MAX_PHOTOS} photos from different angles — JPG, PNG or
        WebP, 10 MB max each.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-start gap-4 rounded-lg border px-6 py-8 transition-colors sm:flex-row sm:items-center sm:justify-between ${
          dragging ? 'border-ink bg-faint' : 'border-line'
        }`}
      >
        <div>
          <p className="text-[16px] text-ink">Drag photos here</p>
          <p className="text-[14px] text-muted">
            {photos.length} of {MAX_PHOTOS} added
            {busy && ' · Checking photos…'}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => addInput.current?.click()}
          disabled={slots <= 0 || busy}
          aria-describedby={errors.length ? errorId : undefined}
        >
          <ImagePlus aria-hidden className="size-4" /> Choose Photos
        </Button>
        <input
          ref={addInput}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            void addFiles(Array.from(e.target.files ?? []))
            e.target.value = ''
          }}
        />
        <input
          ref={replaceInput}
          type="file"
          accept={ACCEPT_ATTR}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            void replaceFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>

      <div id={errorId} aria-live="polite">
        {errors.length > 0 && (
          <ul className="space-y-1 text-[15px] text-danger">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 0 && (
        <ul className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3" aria-label="Uploaded photos">
          {photos.map((photo, i) => {
            const selectId = `${uid}-view-${photo.id}`
            return (
              <li key={photo.id} className="min-w-0">
                <div className="aspect-[4/3] overflow-hidden rounded-md border border-line bg-faint">
                  <img
                    src={photo.url}
                    alt={`Photo ${i + 1}: ${viewLabels[photo.view]} view`}
                    className="size-full object-contain"
                  />
                </div>
                <p className="mt-2 truncate text-[13px] text-muted" title={photo.file.name}>
                  {photo.file.name}
                </p>
                <label htmlFor={selectId} className="mt-2 block text-[13px] text-muted">
                  View
                </label>
                <select
                  id={selectId}
                  value={photo.view}
                  onChange={(e) => actions.setView(photo.id, e.target.value as ViewLabel)}
                  className="mt-1 min-h-11 w-full rounded-md border border-line bg-white px-3 text-[15px]"
                >
                  {(Object.keys(viewLabels) as ViewLabel[]).map((v) => (
                    <option key={v} value={v}>
                      {viewLabels[v]}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex gap-1">
                  <Button
                    variant="quiet"
                    className="-ml-3"
                    disabled={busy}
                    aria-label={`Replace photo ${i + 1}`}
                    onClick={() => {
                      replacingId.current = photo.id
                      replaceInput.current?.click()
                    }}
                  >
                    <RefreshCw aria-hidden className="size-4" /> Replace
                  </Button>
                  <Button
                    variant="quiet"
                    aria-label={`Remove photo ${i + 1}`}
                    onClick={() => actions.removePhoto(photo.id)}
                  >
                    <Trash2 aria-hidden className="size-4" /> Remove
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* Guidance */}
      <div>
        <h3 className="text-[15px] font-medium text-ink">Capture tips</h3>
        <ul className="mt-2 space-y-1 text-[15px] text-muted">
          {GUIDANCE.map((g) => (
            <li key={g} className="flex gap-2">
              <span aria-hidden>–</span>
              {g}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={analyze}
            disabled={processing || busy}
            aria-describedby={submitError ? submitErrorId : undefined}
          >
            {processing ? 'Analyzing…' : 'Analyze Photos'}
          </Button>
          <Button variant="secondary" onClick={tryDemo} disabled={processing}>
            Try Demo Data
          </Button>
        </div>
        {submitError && (
          <p id={submitErrorId} role="alert" className="text-[15px] text-danger">
            {submitError}
          </p>
        )}
        <Notice>Demo mode: uploaded photos are not analyzed by a live AI model.</Notice>
      </div>
    </div>
  )
}
