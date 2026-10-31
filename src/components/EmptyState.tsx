import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  children?: ReactNode
  className?: string
  headingLevel?: 1 | 2
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className = '',
  headingLevel = 2,
}: EmptyStateProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#DDD5C7] bg-[#FBF8F2]/70 px-6 py-14 text-center sm:px-10 ${className}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface text-ink-muted shadow-sm">
        <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
      </span>
      <Heading className="mt-4 text-[17px] font-semibold text-ink">{title}</Heading>
      <p className="mt-2 max-w-md text-[13.5px] leading-6 text-ink-muted">{description}</p>
      {children && <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">{children}</div>}
    </div>
  )
}
