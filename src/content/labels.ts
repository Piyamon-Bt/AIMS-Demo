// Functional English labels shared across components.

import type {
  Answer,
  DeviceCategory,
  FindingStatus,
  Outcome,
  ViewLabel,
  YesNoUnknown,
} from '../types/assessment'

export const categoryLabels: Record<DeviceCategory, string> = {
  laptop: 'Laptop',
  smartphone: 'Smartphone',
  tablet: 'Tablet',
  computer: 'Desktop computer',
  keyboard: 'Keyboard',
  mouse: 'Mouse',
  printer: 'Printer',
  router: 'Router',
}

export const viewLabels: Record<ViewLabel, string> = {
  overall: 'Overall',
  front: 'Front',
  back: 'Back',
  side: 'Side',
  damage: 'Damage close-up',
  other: 'Other',
}

export const findingStatusLabels: Record<FindingStatus, string> = {
  damage_found: 'Visible damage found',
  no_visible_damage: 'No visible damage detected',
  more_views_needed: 'More views needed',
  unable_to_assess: 'Unable to assess',
}

export const answerLabels: Record<Answer, string> = {
  yes: 'Yes',
  partial: 'Partially',
  no: 'No',
  unknown: 'Not sure / Not tested',
}

export const yesNoUnknownLabels: Record<YesNoUnknown, string> = {
  yes: 'Yes',
  no: 'No',
  unknown: 'Not sure',
}

export const outcomeLabels: Record<Outcome, string> = {
  reuse: 'Reuse',
  repair: 'Repair',
  resell: 'Resell',
  recycle: 'Recycle',
  further_assessment: 'Further Assessment Needed',
}

export const outcomeSummaries: Record<Outcome, string> = {
  reuse: 'Keep using the device, or pass it on to someone who will.',
  repair: 'Have a technician assess and quote the specific issues.',
  resell: 'Sell the device with an honest description of its condition.',
  recycle: 'Hand the device to a certified e-waste recycler.',
  further_assessment: 'Test the device or get a hands-on check before deciding.',
}
