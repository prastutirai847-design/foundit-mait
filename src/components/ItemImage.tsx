import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import type { CategoryId } from '../types'
import { CATEGORY_MAP } from '../data/constants'

interface ItemImageProps {
  src?: string
  alt?: string
  category: CategoryId
  className?: string
  imageClassName?: string
  priority?: boolean
}

export function ItemImage({
  src,
  alt,
  category,
  className = '',
  imageClassName = '',
  priority = false,
}: ItemImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const categoryDef = CATEGORY_MAP[category]
  const Icon = categoryDef.icon
  const failed = Boolean(src) && failedSrc === src

  if (!src || failed) {
    return (
      <div
        className={`texture-paper relative flex flex-col items-center justify-center gap-2 bg-sand text-ink-muted ${className}`}
        role="img"
        aria-label={`${categoryDef.label} item — no photo available`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#DCD2C2] bg-canvas/80">
          <Icon aria-hidden="true" size={22} strokeWidth={1.7} />
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-faint">
          <ImageOff aria-hidden="true" size={11} />
          No photo added
        </span>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden bg-sand ${className}`}>
      <img
        src={src}
        alt={alt || `${categoryDef.label} item reported on FoundIt`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`h-full w-full object-cover ${imageClassName}`}
        onError={() => setFailedSrc(src)}
      />
    </div>
  )
}
