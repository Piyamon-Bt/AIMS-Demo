// Mock analysis service. Returns fixed sample findings — it never inspects the photos.

import type { AnalysisResult, Finding } from '../types/assessment'
import type { AssessmentService } from './assessmentService'

const STAGE_MS = 650

/**
 * Sample findings for each supported category. A finding may carry a `box`
 * only when it refers to a real fixture image with the same id; uploaded photos
 * never match, so no boxes are ever drawn on them.
 */
export const sampleFindings: Finding[] = [
  {
    id: 'lap-1',
    category: 'laptop',
    damageType: 'Surface scratches',
    part: 'Top cover',
    observation: 'Several light scratches across the lid surface.',
    status: 'damage_found',
    severity: 'minor',
    localized: false,
  },
  {
    id: 'lap-2',
    category: 'laptop',
    damageType: 'Cracked casing',
    part: 'Left hinge cover',
    observation: 'A crack near the left hinge where the lid meets the base.',
    status: 'damage_found',
    severity: 'moderate',
    localized: true,
  },
  {
    id: 'lap-3',
    category: 'laptop',
    damageType: 'Screen damage',
    part: 'Display panel',
    observation: 'No cracks or marks visible on the display surface.',
    status: 'no_visible_damage',
  },
  {
    id: 'lap-4',
    category: 'laptop',
    damageType: 'Port damage',
    part: 'Side ports',
    observation: 'Ports are not visible in the available views.',
    status: 'more_views_needed',
  },
  {
    id: 'phone-1',
    category: 'smartphone',
    damageType: 'Cracked glass',
    part: 'Front screen',
    observation: 'A crack runs from the lower-right corner of the screen.',
    status: 'damage_found',
    severity: 'moderate',
    localized: true,
  },
  {
    id: 'phone-2',
    category: 'smartphone',
    damageType: 'Dents',
    part: 'Frame',
    observation: 'No dents visible along the frame edges.',
    status: 'no_visible_damage',
  },
  {
    id: 'phone-3',
    category: 'smartphone',
    damageType: 'Lens damage',
    part: 'Rear camera',
    observation: 'The camera lens is not clearly visible.',
    status: 'more_views_needed',
  },
  {
    id: 'phone-4',
    category: 'smartphone',
    damageType: 'Swelling',
    part: 'Back panel',
    observation: 'Battery swelling cannot be judged from a still photo.',
    status: 'unable_to_assess',
  },
  {
    id: 'tab-1',
    category: 'tablet',
    damageType: 'Scratched glass',
    part: 'Screen',
    observation: 'Fine scratches across the centre of the screen.',
    status: 'damage_found',
    severity: 'minor',
    localized: false,
  },
  {
    id: 'tab-2',
    category: 'tablet',
    damageType: 'Dented corner',
    part: 'Frame corner',
    observation: 'A small dent on the top-left corner of the frame.',
    status: 'damage_found',
    severity: 'minor',
    localized: true,
  },
  {
    id: 'tab-3',
    category: 'tablet',
    damageType: 'Port damage',
    part: 'Charging port',
    observation: 'No debris or bent contacts visible in the charging port.',
    status: 'no_visible_damage',
  },
  {
    id: 'tab-4',
    category: 'tablet',
    damageType: 'Swelling',
    part: 'Back panel',
    observation: 'Battery swelling cannot be judged from a still photo.',
    status: 'unable_to_assess',
  },
  {
    id: 'pc-1',
    category: 'computer',
    damageType: 'Yellowed casing',
    part: 'Monitor housing',
    observation: 'Plastic on the monitor housing is discoloured.',
    status: 'damage_found',
    severity: 'minor',
    localized: false,
  },
  {
    id: 'pc-2',
    category: 'computer',
    damageType: 'Missing cover',
    part: 'Drive bay',
    observation: 'One drive bay cover appears to be missing.',
    status: 'damage_found',
    severity: 'minor',
    localized: true,
  },
  {
    id: 'pc-3',
    category: 'computer',
    damageType: 'Screen damage',
    part: 'Monitor glass',
    observation: 'No cracks or burns visible on the screen surface.',
    status: 'no_visible_damage',
  },
  {
    id: 'pc-4',
    category: 'computer',
    damageType: 'Port damage',
    part: 'Rear ports',
    observation: 'The rear of the unit is not shown.',
    status: 'more_views_needed',
  },
  {
    id: 'kb-1',
    category: 'keyboard',
    damageType: 'Missing keycap',
    part: 'Key row',
    observation: 'One keycap appears to be missing from the top row.',
    status: 'damage_found',
    severity: 'minor',
    localized: true,
  },
  {
    id: 'kb-2',
    category: 'keyboard',
    damageType: 'Worn legends',
    part: 'Keycaps',
    observation: 'No worn or faded key legends visible.',
    status: 'no_visible_damage',
  },
  {
    id: 'kb-3',
    category: 'keyboard',
    damageType: 'Cable damage',
    part: 'Cable and connector',
    observation: 'The cable and connector are not visible.',
    status: 'more_views_needed',
  },
  {
    id: 'mouse-1',
    category: 'mouse',
    damageType: 'Scuffing',
    part: 'Top shell',
    observation: 'Light scuffs on the top shell.',
    status: 'damage_found',
    severity: 'minor',
    localized: false,
  },
  {
    id: 'mouse-2',
    category: 'mouse',
    damageType: 'Sensor damage',
    part: 'Underside sensor',
    observation: 'The underside is not shown.',
    status: 'more_views_needed',
  },
  {
    id: 'printer-1',
    category: 'printer',
    damageType: 'Cracked tray',
    part: 'Paper tray',
    observation: 'A crack along the edge of the paper tray.',
    status: 'damage_found',
    severity: 'moderate',
    localized: true,
  },
  {
    id: 'printer-2',
    category: 'printer',
    damageType: 'Casing damage',
    part: 'Top cover',
    observation: 'No dents or cracks visible on the top cover.',
    status: 'no_visible_damage',
  },
  {
    id: 'printer-3',
    category: 'printer',
    damageType: 'Ink or toner leak',
    part: 'Cartridge area',
    observation: 'The cartridge area cannot be seen from outside.',
    status: 'unable_to_assess',
  },
  {
    id: 'router-1',
    category: 'router',
    damageType: 'Bent antenna',
    part: 'Antenna',
    observation: 'One antenna appears slightly bent.',
    status: 'damage_found',
    severity: 'minor',
    localized: true,
  },
  {
    id: 'router-2',
    category: 'router',
    damageType: 'Casing damage',
    part: 'Housing',
    observation: 'No cracks visible on the housing.',
    status: 'no_visible_damage',
  },
  {
    id: 'router-3',
    category: 'router',
    damageType: 'Port damage',
    part: 'LAN / WAN ports',
    observation: 'The rear ports are not visible.',
    status: 'more_views_needed',
  },
]

const sampleResult: AnalysisResult = {
  origin: 'sample',
  suggestedCategory: 'laptop',
  findings: sampleFindings,
  unassessed: {
    laptop: ['Battery health', 'Internal components', 'Storage condition', 'Keyboard response'],
    smartphone: ['Battery health', 'Water exposure', 'Internal components', 'Touch response'],
    tablet: ['Battery health', 'Touch response', 'Internal components', 'Speakers and microphone'],
    computer: ['Internal components', 'Storage condition', 'Power supply', 'Display brightness'],
    keyboard: ['Key response', 'Internal circuit board'],
    mouse: ['Button response', 'Sensor tracking'],
    printer: ['Print quality', 'Paper feed mechanism', 'Ink or toner level'],
    router: ['Wi-Fi signal strength', 'Firmware state', 'Power adapter'],
  },
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const t = window.setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(t)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

export const mockAssessmentService: AssessmentService = {
  stages: ['Preparing inputs', 'Loading sample findings', 'Preparing review'],
  isLive: false,
  async analyze(request, { signal, onStage, simulateFailure }) {
    if (request.source === 'photos' && request.photos.length === 0) {
      throw new Error('Add at least one photo before analyzing.')
    }
    for (let i = 0; i < this.stages.length; i++) {
      onStage?.(i)
      await wait(STAGE_MS, signal)
      if (simulateFailure && i === 1) {
        throw new Error('The sample findings could not be loaded.')
      }
    }
    return structuredClone(sampleResult)
  },
}
