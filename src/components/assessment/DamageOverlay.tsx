import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Finding } from '../../types/assessment'

interface DamageOverlayProps {
  imageId: string
  naturalWidth: number
  naturalHeight: number
  findings: Finding[]
  children: ReactNode
}

/**
 * Positions normalized (0–1) bounding boxes over an image rendered with
 * object-fit: contain, accounting for letterboxing and resizes.
 * Boxes render only for findings whose `box.imageId` matches this image.
 */
export function DamageOverlay({ imageId, naturalWidth, naturalHeight, findings, children }: DamageOverlayProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const boxes = findings.filter((f) => f.box?.imageId === imageId)

  useEffect(() => {
    const el = ref.current
    if (!el || boxes.length === 0) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [boxes.length])

  const scale = Math.min(size.w / naturalWidth, size.h / naturalHeight) || 0
  const rendered = {
    width: naturalWidth * scale,
    height: naturalHeight * scale,
    left: (size.w - naturalWidth * scale) / 2,
    top: (size.h - naturalHeight * scale) / 2,
  }

  return (
    <div ref={ref} className="relative size-full">
      {children}
      {boxes.length > 0 && scale > 0 && (
        <div aria-hidden className="pointer-events-none absolute" style={rendered}>
          {boxes.map((f, i) => {
            const b = f.box!
            return (
              <div
                key={f.id}
                className="absolute border-2 border-ink"
                style={{
                  left: `${b.x * 100}%`,
                  top: `${b.y * 100}%`,
                  width: `${b.width * 100}%`,
                  height: `${b.height * 100}%`,
                }}
              >
                <span className="absolute -top-6 left-0 rounded-sm bg-ink px-1.5 text-[12px] text-white">
                  {i + 1}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
