import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, MapPin } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Page not found')

  return (
    <div className="page-shell flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface text-ink-muted shadow-card">
          <Compass aria-hidden="true" size={24} strokeWidth={1.8} />
        </span>
        <p className="eyebrow mt-6">Error 404</p>
        <h1 className="display-lg mt-2">This page isn&apos;t on the map.</h1>
        <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-6 text-ink-muted">
          The link may be broken, or this report may have been removed from the demo board.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link to="/" className="btn-primary justify-center">
            <ArrowLeft aria-hidden="true" size={15} />
            Back to Discover
          </Link>
          <Link to="/activity" className="btn-secondary justify-center">
            <MapPin aria-hidden="true" size={15} />
            My activity
          </Link>
        </div>
      </div>
    </div>
  )
}
