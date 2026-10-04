// Single source of truth for section order, anchors, sidebar labels,
// editorial copy and media placement.
//
// Replace the Lorem ipsum strings below with final copy. Functional labels,
// validation and disclosures live in the components and are already final English.

import type { SectionId } from '../types/assessment'
import type { EditorialAssetId } from './assets'

export interface SectionConfig {
  id: SectionId
  number: string
  navLabel: string
  heading: string
  intro: string
  mediaId?: EditorialAssetId
  /** Which side the editorial media sits on at desktop widths. */
  mediaSide: 'left' | 'right'
  /** Give the media half the row and let it extend into the outer margin (for wide scenes). */
  mediaWide?: boolean
}

export const sections: SectionConfig[] = [
  {
    id: 'upload',
    number: '01',
    navLabel: 'Upload',
    heading: 'Upload your device',
    intro:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    // Side media is the selected device's 3D model (see DevicePicker / App.tsx).
    mediaSide: 'right',
  },
  {
    id: 'analyze',
    number: '02',
    navLabel: 'Analyze',
    heading: 'Assessing visible condition',
    intro:
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    mediaId: 'analyze-visual',
    mediaSide: 'left',
    mediaWide: true,
  },
  {
    id: 'review',
    number: '03',
    navLabel: 'Review',
    heading: 'Review the findings',
    intro:
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    mediaId: 'review-visual',
    mediaSide: 'right',
  },
  {
    id: 'functionality',
    number: '04',
    navLabel: 'Functionality',
    heading: 'Tell us how it works',
    intro:
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    mediaId: 'functionality-visual',
    mediaSide: 'left',
  },
  {
    id: 'results',
    number: '05',
    navLabel: 'Results',
    heading: 'Explore your next step',
    intro:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
    mediaId: 'results-visual',
    mediaSide: 'right',
  },
]

export const sectionById = Object.fromEntries(sections.map((s) => [s.id, s])) as Record<
  SectionId,
  SectionConfig
>

/** Placeholder editorial paragraphs used inside the results report. */
export const resultsCopy = {
  explanation:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cras mattis consectetur purus sit amet fermentum.',
  alternativesIntro:
    'Nulla vitae elit libero, a pharetra augue. Maecenas sed diam eget risus varius blandit sit amet non magna.',
}
