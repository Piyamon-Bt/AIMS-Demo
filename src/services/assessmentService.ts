// Analysis service contract.
//
// The UI only depends on this interface. To connect a real analysis API,
// implement `AssessmentService` (e.g. `httpAssessmentService.ts` that POSTs the
// photos as multipart/form-data and maps the response to `AnalysisResult`),
// then swap the export at the bottom of this file.

import type { AnalysisResult, InputSource, UploadedPhoto } from '../types/assessment'
import { mockAssessmentService } from './mockAssessmentService'

export interface AnalysisRequest {
  source: InputSource
  photos: Pick<UploadedPhoto, 'id' | 'file' | 'view'>[]
}

export interface AnalysisOptions {
  signal: AbortSignal
  /** Called with the index of the stage that has started. */
  onStage?: (index: number) => void
  /** Demo-only switch used to exercise the failure/retry path. */
  simulateFailure?: boolean
}

export interface AssessmentService {
  /** Human-readable stage names shown while processing. */
  readonly stages: readonly string[]
  /** Whether results are derived from the submitted photos. */
  readonly isLive: boolean
  analyze(request: AnalysisRequest, options: AnalysisOptions): Promise<AnalysisResult>
}

export const assessmentService: AssessmentService = mockAssessmentService
