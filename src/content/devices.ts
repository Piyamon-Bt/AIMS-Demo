// Supported device types, their 3D models and device-specific questions.
//
// To add a device: add its id to `DeviceCategory` in types/assessment.ts,
// drop the .glb into /public/assets/models, add an entry below, and add
// sample findings in services/mockAssessmentService.ts.

import type { DeviceCategory } from '../types/assessment'
import type { MediaAsset } from './assets'

export interface DeviceConfig {
  id: DeviceCategory
  label: string
  model: MediaAsset
  /** Whether the "Does the display work?" question applies. */
  hasDisplay: boolean
  displayQuestion?: string
  controlsQuestion: string
  powerHint?: string
}

const model = (id: DeviceCategory, file: string, alt: string, cameraOrbit = '30deg 72deg auto'): MediaAsset => ({
  id: `device-${id}`,
  type: 'model',
  src: `/assets/models/${file}`,
  alt,
  aspectRatio: '1 / 1',
  objectFit: 'contain',
  parallaxStrength: 32,
  cameraOrbit,
})

export const devices: DeviceConfig[] = [
  {
    id: 'laptop',
    label: 'Laptop',
    model: model('laptop', 'retro-laptop.glb', '3D model of a laptop'),
    hasDisplay: true,
    controlsQuestion: 'Do the keyboard and trackpad work?',
  },
  {
    id: 'smartphone',
    label: 'Smartphone',
    model: model('smartphone', 'retro-smartphone.glb', '3D model of a smartphone', '25deg 80deg auto'),
    hasDisplay: true,
    controlsQuestion: 'Does the touchscreen respond correctly?',
  },
  {
    id: 'tablet',
    label: 'Tablet',
    model: model('tablet', 'retro-tablet.glb', '3D model of a tablet', '25deg 80deg auto'),
    hasDisplay: true,
    controlsQuestion: 'Does the touchscreen respond correctly?',
  },
  {
    id: 'computer',
    label: 'Desktop computer',
    model: model('computer', 'retro-computer.glb', '3D model of a desktop computer with monitor, keyboard and mouse'),
    hasDisplay: true,
    displayQuestion: 'Does the monitor show an image?',
    controlsQuestion: 'Do the connected keyboard and mouse work?',
  },
  {
    id: 'keyboard',
    label: 'Keyboard',
    model: model('keyboard', 'retro-keyboard.glb', '3D model of a keyboard', '20deg 55deg auto'),
    hasDisplay: false,
    controlsQuestion: 'Do all keys register when pressed?',
    powerHint: 'For wired keyboards: is it detected when connected?',
  },
  {
    id: 'mouse',
    label: 'Mouse',
    model: model('mouse', 'retro-mouse.glb', '3D model of a computer mouse', '-35deg 55deg auto'),
    hasDisplay: false,
    controlsQuestion: 'Do the buttons and cursor tracking work?',
    powerHint: 'For wired mice: is it detected when connected?',
  },
  {
    id: 'printer',
    label: 'Printer',
    model: model('printer', 'retro-printer.glb', '3D model of a printer', '25deg 60deg auto'),
    hasDisplay: false,
    controlsQuestion: 'Does it feed paper and print correctly?',
  },
  {
    id: 'router',
    label: 'Router',
    model: model('router', 'retro-router.glb', '3D model of a Wi-Fi router', '-20deg 58deg auto'),
    hasDisplay: false,
    controlsQuestion: 'Do the network and Wi-Fi connections work?',
  },
]

export const deviceById = Object.fromEntries(devices.map((d) => [d.id, d])) as Record<
  DeviceCategory,
  DeviceConfig
>
