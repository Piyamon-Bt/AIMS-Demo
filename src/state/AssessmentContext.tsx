import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import { assessmentService } from '../services/assessmentService'
import type {
  DeviceCategory,
  FunctionalityAnswers,
  InputSource,
  UploadedPhoto,
  ViewLabel,
} from '../types/assessment'
import { useAnnouncer } from './Announcer'
import { assessmentReducer, initialState, type AssessmentState } from './assessmentReducer'

interface AssessmentActions {
  addPhotos(photos: UploadedPhoto[]): void
  removePhoto(id: string): void
  replacePhoto(id: string, photo: UploadedPhoto): void
  setView(id: string, view: ViewLabel): void
  /** Returns false if a request is already running or there is nothing to analyze. */
  startAnalysis(source: InputSource): boolean
  cancelAnalysis(): void
  setCategory(category: DeviceCategory): void
  toggleFeedback(findingId: string): void
  confirmReview(): void
  setAnswers(patch: Partial<FunctionalityAnswers>): void
  submitFunctionality(): void
  setSimulateFailure(value: boolean): void
  reset(): void
}

interface AssessmentContextValue {
  state: AssessmentState
  actions: AssessmentActions
}

const Ctx = createContext<AssessmentContextValue | null>(null)

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState)
  const { announce } = useAnnouncer()
  const stateRef = useRef(state)
  const controllerRef = useRef<AbortController | null>(null)
  const requestSeq = useRef(0)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Release every object URL when the app unmounts.
  useEffect(
    () => () => {
      controllerRef.current?.abort()
      stateRef.current.photos.forEach((p) => URL.revokeObjectURL(p.url))
    },
    [],
  )

  const abortInFlight = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
  }, [])

  const actions = useMemo<AssessmentActions>(
    () => ({
      addPhotos(photos) {
        abortInFlight()
        dispatch({ type: 'photos/add', photos })
      },
      removePhoto(id) {
        const photo = stateRef.current.photos.find((p) => p.id === id)
        abortInFlight()
        dispatch({ type: 'photos/remove', id })
        if (photo) URL.revokeObjectURL(photo.url)
      },
      replacePhoto(id, next) {
        const prev = stateRef.current.photos.find((p) => p.id === id)
        abortInFlight()
        dispatch({ type: 'photos/replace', id, photo: next })
        if (prev) URL.revokeObjectURL(prev.url)
      },
      setView(id, view) {
        dispatch({ type: 'photos/setView', id, view })
      },
      startAnalysis(source) {
        const s = stateRef.current
        if (s.analysis.status === 'processing') return false
        if (source === 'photos' && s.photos.length === 0) return false

        const requestId = ++requestSeq.current
        const controller = new AbortController()
        controllerRef.current = controller
        dispatch({ type: 'analysis/start', requestId, source })
        // Mark processing synchronously so a double-click cannot start a second request.
        stateRef.current = {
          ...s,
          analysis: { ...s.analysis, status: 'processing', requestId },
        }
        announce('Analysis started.')

        assessmentService
          .analyze(
            { source, photos: source === 'photos' ? s.photos : [] },
            {
              signal: controller.signal,
              simulateFailure: s.simulateFailure,
              onStage: (stage) => dispatch({ type: 'analysis/stage', requestId, stage }),
            },
          )
          .then((result) => {
            if (controller.signal.aborted) return
            dispatch({ type: 'analysis/success', requestId, result })
            announce('Analysis complete. Sample findings are ready to review.')
          })
          .catch((err: unknown) => {
            if (controller.signal.aborted) return
            const message = err instanceof Error ? err.message : 'Something went wrong.'
            dispatch({ type: 'analysis/failure', requestId, error: message })
            announce(`Analysis failed. ${message}`)
          })
          .finally(() => {
            if (controllerRef.current === controller) controllerRef.current = null
          })
        return true
      },
      cancelAnalysis() {
        abortInFlight()
        dispatch({ type: 'analysis/cancel' })
        announce('Analysis cancelled.')
      },
      setCategory(category) {
        dispatch({ type: 'review/setCategory', category })
      },
      toggleFeedback(findingId) {
        dispatch({ type: 'review/toggleFeedback', findingId })
      },
      confirmReview() {
        dispatch({ type: 'review/confirm' })
      },
      setAnswers(patch) {
        dispatch({ type: 'answers/set', patch })
      },
      submitFunctionality() {
        dispatch({ type: 'answers/submit' })
      },
      setSimulateFailure(value) {
        dispatch({ type: 'demo/simulateFailure', value })
      },
      reset() {
        abortInFlight()
        stateRef.current.photos.forEach((p) => URL.revokeObjectURL(p.url))
        dispatch({ type: 'reset' })
        announce('Assessment cleared.')
      },
    }),
    [abortInFlight, announce],
  )

  const value = useMemo(() => ({ state, actions }), [state, actions])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAssessment() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAssessment must be used within AssessmentProvider')
  return ctx
}
