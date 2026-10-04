import { useState } from 'react'
import { viewLabels } from '../../content/labels'
import type { Finding, UploadedPhoto } from '../../types/assessment'
import { DamageOverlay } from './DamageOverlay'

interface EvidenceViewerProps {
  photos: UploadedPhoto[]
  /** Findings with boxes; only those matching a shown image id are drawn. */
  findings: Finding[]
}

/** Viewer for the user's own uploaded photos. Stationary — no parallax. */
export function EvidenceViewer({ photos, findings }: EvidenceViewerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = photos.find((p) => p.id === selectedId) ?? photos[0]
  if (!selected) return null
  const index = photos.indexOf(selected)

  return (
    <figure className="space-y-3">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-md border border-line bg-faint">
        <DamageOverlay
          imageId={selected.id}
          naturalWidth={selected.width}
          naturalHeight={selected.height}
          findings={findings}
        >
          <img
            src={selected.url}
            alt={`Your photo ${index + 1} of ${photos.length}: ${viewLabels[selected.view]} view`}
            className="size-full object-contain"
          />
        </DamageOverlay>
      </div>
      <figcaption className="text-[14px] text-muted">
        Your photo {index + 1} of {photos.length} · {viewLabels[selected.view]}
      </figcaption>
      {photos.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a photo to view">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={p.id === selected.id}
              aria-label={`Show photo ${i + 1}: ${viewLabels[p.view]}`}
              onClick={() => setSelectedId(p.id)}
              className={`size-14 overflow-hidden rounded-md border-2 ${
                p.id === selected.id ? 'border-ink' : 'border-transparent'
              }`}
            >
              <img src={p.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </figure>
  )
}
