import type {
  AnalysisResult,
  AnalysisStatus,
  DeviceCategory,
  FeedbackEntry,
  FunctionalityAnswers,
  InputSource,
  UploadedPhoto,
  ViewLabel,
} from '../types/assessment'

export interface AnalysisState {
  status: AnalysisStatus
  /** Index of the current simulated stage while processing. */
  stage: number
  error: string | null
  result: AnalysisResult | null
  /** Responses carrying a different id are stale and ignored. */
  requestId: number
  source: InputSource | null
  cancelled: boolean
}

export interface AssessmentState {
  photos: UploadedPhoto[]
  analysis: AnalysisState
  confirmedCategory: DeviceCategory | null
  reviewConfirmed: boolean
  feedback: FeedbackEntry[]
  answers: FunctionalityAnswers
  functionalitySubmitted: boolean
  simulateFailure: boolean
}

export const emptyAnswers: FunctionalityAnswers = {
  powersOn: null,
  display: null,
  controls: null,
  otherIssues: null,
  otherIssuesDetail: '',
  keepUsing: null,
  brand: '',
  model: '',
  notes: '',
}

const idleAnalysis: AnalysisState = {
  status: 'idle',
  stage: 0,
  error: null,
  result: null,
  requestId: -1,
  source: null,
  cancelled: false,
}

/** Pre-selected so the device picker and its 3D model are never empty. */
export const DEFAULT_CATEGORY = 'laptop' as const

export const initialState: AssessmentState = {
  photos: [],
  analysis: idleAnalysis,
  confirmedCategory: DEFAULT_CATEGORY,
  reviewConfirmed: false,
  feedback: [],
  answers: emptyAnswers,
  functionalitySubmitted: false,
  simulateFailure: false,
}

export type Action =
  | { type: 'photos/add'; photos: UploadedPhoto[] }
  | { type: 'photos/remove'; id: string }
  | { type: 'photos/replace'; id: string; photo: UploadedPhoto }
  | { type: 'photos/setView'; id: string; view: ViewLabel }
  | { type: 'analysis/start'; requestId: number; source: InputSource }
  | { type: 'analysis/stage'; requestId: number; stage: number }
  | { type: 'analysis/success'; requestId: number; result: AnalysisResult }
  | { type: 'analysis/failure'; requestId: number; error: string }
  | { type: 'analysis/cancel' }
  | { type: 'review/setCategory'; category: DeviceCategory }
  | { type: 'review/toggleFeedback'; findingId: string }
  | { type: 'review/confirm' }
  | { type: 'answers/set'; patch: Partial<FunctionalityAnswers> }
  | { type: 'answers/submit' }
  | { type: 'demo/simulateFailure'; value: boolean }
  | { type: 'reset' }

/** New inputs make any previous analysis, feedback and results stale. */
function invalidateAnalysis(state: AssessmentState): AssessmentState {
  return { ...state, analysis: idleAnalysis, reviewConfirmed: false, feedback: [] }
}

export function assessmentReducer(state: AssessmentState, action: Action): AssessmentState {
  switch (action.type) {
    case 'photos/add':
      return invalidateAnalysis({ ...state, photos: [...state.photos, ...action.photos] })
    case 'photos/remove':
      return invalidateAnalysis({ ...state, photos: state.photos.filter((p) => p.id !== action.id) })
    case 'photos/replace':
      return invalidateAnalysis({
        ...state,
        photos: state.photos.map((p) =>
          p.id === action.id ? { ...action.photo, view: p.view } : p,
        ),
      })
    case 'photos/setView':
      return {
        ...state,
        photos: state.photos.map((p) => (p.id === action.id ? { ...p, view: action.view } : p)),
      }

    case 'analysis/start':
      return {
        ...invalidateAnalysis(state),
        analysis: {
          ...idleAnalysis,
          status: 'processing',
          requestId: action.requestId,
          source: action.source,
        },
      }
    case 'analysis/stage':
      if (action.requestId !== state.analysis.requestId) return state
      return { ...state, analysis: { ...state.analysis, stage: action.stage } }
    case 'analysis/success': {
      if (action.requestId !== state.analysis.requestId) return state
      return {
        ...state,
        analysis: { ...state.analysis, status: 'complete', result: action.result, error: null },
      }
    }
    case 'analysis/failure':
      if (action.requestId !== state.analysis.requestId) return state
      return { ...state, analysis: { ...state.analysis, status: 'failed', error: action.error } }
    case 'analysis/cancel':
      if (state.analysis.status !== 'processing') return state
      return { ...state, analysis: { ...idleAnalysis, cancelled: true } }

    case 'review/setCategory': {
      if (state.confirmedCategory === action.category) return state
      const compatible = new Set(
        state.analysis.result?.findings
          .filter((f) => f.category === action.category)
          .map((f) => f.id) ?? [],
      )
      return {
        ...state,
        confirmedCategory: action.category,
        // Feedback on findings that no longer apply is discarded.
        feedback: state.feedback.filter((f) => compatible.has(f.findingId)),
        // Device-specific questions differ per category, so those answers no longer apply.
        answers: state.confirmedCategory
          ? { ...state.answers, controls: null, display: null }
          : state.answers,
      }
    }
    case 'review/toggleFeedback': {
      const exists = state.feedback.some((f) => f.findingId === action.findingId)
      return {
        ...state,
        feedback: exists
          ? state.feedback.filter((f) => f.findingId !== action.findingId)
          : [...state.feedback, { findingId: action.findingId, kind: 'incorrect', createdAt: Date.now() }],
      }
    }
    case 'review/confirm':
      if (!state.confirmedCategory || state.analysis.status !== 'complete') return state
      return { ...state, reviewConfirmed: true }

    case 'answers/set':
      return { ...state, answers: { ...state.answers, ...action.patch } }
    case 'answers/submit':
      return { ...state, functionalitySubmitted: true }

    case 'demo/simulateFailure':
      return { ...state, simulateFailure: action.value }
    case 'reset':
      return initialState
  }
}
