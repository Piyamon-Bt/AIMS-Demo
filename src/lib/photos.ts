import type { UploadedPhoto, ViewLabel } from '../types/assessment'

export const MAX_PHOTOS = 6
export const MAX_BYTES = 10 * 1024 * 1024
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'

const EXT = /\.(jpe?g|png|webp)$/i
const VIEW_ORDER: ViewLabel[] = ['overall', 'front', 'back', 'side', 'damage']

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function decode(url: string): Promise<{ width: number; height: number }> {
  const img = new Image()
  img.src = url
  return img.decode().then(() => ({ width: img.naturalWidth, height: img.naturalHeight }))
}

/** Picks the first view label not already in use. */
export function nextView(used: ViewLabel[]): ViewLabel {
  return VIEW_ORDER.find((v) => !used.includes(v)) ?? 'other'
}

export interface PhotoValidation {
  accepted: UploadedPhoto[]
  errors: string[]
}

/**
 * Validates type, size and decodability. Rejected files never keep an object URL.
 * `slots` is how many more photos may be added.
 */
export async function preparePhotos(
  files: File[],
  slots: number,
  usedViews: ViewLabel[],
): Promise<PhotoValidation> {
  const errors: string[] = []
  const accepted: UploadedPhoto[] = []
  const views = [...usedViews]

  for (const file of files) {
    const typeOk = ACCEPTED_TYPES.includes(file.type) || (!file.type && EXT.test(file.name))
    if (!typeOk) {
      errors.push(`“${file.name}” is not a supported format. Use JPG, PNG, or WebP.`)
      continue
    }
    if (file.size > MAX_BYTES) {
      errors.push(`“${file.name}” is ${formatSize(file.size)}. The maximum is 10 MB per photo.`)
      continue
    }
    if (accepted.length >= slots) {
      errors.push(`“${file.name}” was not added. You can upload up to ${MAX_PHOTOS} photos.`)
      continue
    }
    const url = URL.createObjectURL(file)
    try {
      const { width, height } = await decode(url)
      const view = nextView(views)
      views.push(view)
      accepted.push({ id: crypto.randomUUID(), file, url, view, width, height })
    } catch {
      URL.revokeObjectURL(url)
      errors.push(`“${file.name}” could not be read as an image. Try another file.`)
    }
  }
  return { accepted, errors }
}
