import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'

export function InlineLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2.5 py-10 text-ink-muted">
      <Loader2 aria-hidden="true" size={18} className="animate-spin text-accent" />
      <span className="text-[13px]">{label}</span>
    </div>
  )
}

export function PageLoading({ label = 'Loading the board…' }: { label?: string }) {
  return (
    <div className="page-shell py-16 sm:py-24">
      <InlineLoading label={label} />
    </div>
  )
}

export function PageError({
  title = 'The board could not load',
  message,
  onRetry,
}: {
  title?: string
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="page-shell py-16 sm:py-20">
      <div className="mx-auto max-w-lg rounded-3xl border border-line bg-surface p-6 text-center shadow-card sm:p-8">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#EBD9B6] bg-[#FBF3E2] text-[#8A5A0A]">
          <AlertTriangle aria-hidden="true" size={22} />
        </span>
        <h1 className="display-md mt-5">{title}</h1>
        <p className="mt-3 text-[13px] leading-6 text-ink-muted">{message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary mt-6 justify-center">
            <RefreshCw aria-hidden="true" size={15} />
            Try again
          </button>
        )}
        <p className="mt-5 border-t border-line pt-4 text-[11.5px] leading-5 text-ink-faint">
          The FoundIt demo API should be running at{' '}
          <code className="rounded bg-[#F5F0E7] px-1 py-0.5">http://127.0.0.1:8000</code>. Start it
          with <code className="rounded bg-[#F5F0E7] px-1 py-0.5">uvicorn app.main:app</code> inside{' '}
          <code className="rounded bg-[#F5F0E7] px-1 py-0.5">backend/</code>.
        </p>
      </div>
    </div>
  )
}
